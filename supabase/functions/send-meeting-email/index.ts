
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.1";
import { Resend } from "npm:resend@2.0.0";

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_CC_RECIPIENTS = 10;
const MAX_SUBJECT_LENGTH = 200;
const MAX_MESSAGE_LENGTH = 50000;

interface MeetingEmailRequest {
  to: string;
  subject: string;
  message: string;
  meetingId: string;
  meetingType: string;
  meetingDate: string;
  cc?: string[];
  fromName?: string;
  fromEmail?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate the user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    }

    const supabaseAuth = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY") || "", {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    }
    const userId = user.id;

    const body: MeetingEmailRequest = await req.json();

    // Input validation
    if (!body.to || !body.subject || !body.message) {
      throw new Error("Missing required fields: to, subject, message");
    }
    if (!emailRegex.test(body.to)) {
      throw new Error("Invalid recipient email format");
    }
    if (body.subject.length > MAX_SUBJECT_LENGTH) {
      throw new Error(`Subject must be less than ${MAX_SUBJECT_LENGTH} characters`);
    }
    if (body.message.length > MAX_MESSAGE_LENGTH) {
      throw new Error(`Message must be less than ${MAX_MESSAGE_LENGTH} characters`);
    }
    if (body.cc && body.cc.length > MAX_CC_RECIPIENTS) {
      throw new Error(`Maximum ${MAX_CC_RECIPIENTS} CC recipients allowed`);
    }
    for (const email of (body.cc || [])) {
      if (!emailRegex.test(email)) {
        throw new Error(`Invalid CC email format: ${email}`);
      }
    }

    // Use service role client for data access
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify ownership: user must own the meeting or be admin
    if (body.meetingId) {
      const { data: meeting } = await supabase
        .from("meetings")
        .select("agent_id")
        .eq("id", body.meetingId)
        .single();

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();

      const isAdmin = profile?.role === 'admin';
      if (meeting && meeting.agent_id !== userId && !isAdmin) {
        return new Response(JSON.stringify({ error: 'Forbidden: You do not own this meeting' }), { status: 403, headers: corsHeaders });
      }
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("Email service is not properly configured. Please set the RESEND_API_KEY.");
    }

    // Fetch settings
    const { data: settings } = await supabase
      .from("settings")
      .select("*")
      .limit(1)
      .maybeSingle();

    const emailSenderName = settings?.email_sender_name || "CRM System";
    const emailFooter = settings?.email_footer || "This is an automated message from your CRM system.";
    const showFooterInEmails = settings?.show_footer_in_emails !== false;

    const htmlMessage = escapeHtml(body.message).replace(/\n/g, "<br />");

    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>${escapeHtml(body.subject)}</h2>
        <p>Meeting Type: ${escapeHtml(body.meetingType)}</p>
        <p>Date: ${escapeHtml(body.meetingDate)}</p>
        <div style="margin-top: 20px;">${htmlMessage}</div>
        ${showFooterInEmails ? `
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #888;">
          <p>${escapeHtml(emailFooter)}</p>
        </div>` : ''}
      </div>
    `;

    const fromAddress = `${emailSenderName} <info@belmorso.eu>`;

    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: body.to,
      subject: body.subject,
      html: emailContent,
      cc: body.cc,
      reply_to: "info@belmorso.eu",
    });

    if (error) {
      throw new Error(`Failed to send email: ${error.message}`);
    }

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200,
    });
  } catch (error: any) {
    console.error("Error in send-meeting-email function:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500,
    });
  }
});
