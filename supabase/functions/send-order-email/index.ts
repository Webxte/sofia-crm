
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.1";
import { Resend } from "npm:resend@2.0.0";
import { formatEmailContent } from "./email-formatter.ts";
import { OrderEmailRequest } from "./types.ts";

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

    const requestData: OrderEmailRequest = await req.json();
    const { orderId, recipient, subject, message, includeOrderDetails = true, cc = [] } = requestData;

    // Input validation
    if (!orderId || !recipient || !subject || !message) {
      throw new Error("Missing required fields: orderId, recipient, subject, message");
    }
    if (!emailRegex.test(recipient)) {
      throw new Error("Invalid recipient email format");
    }
    if (subject.length > MAX_SUBJECT_LENGTH) {
      throw new Error(`Subject must be less than ${MAX_SUBJECT_LENGTH} characters`);
    }
    if (message.length > MAX_MESSAGE_LENGTH) {
      throw new Error(`Message must be less than ${MAX_MESSAGE_LENGTH} characters`);
    }
    if (cc.length > MAX_CC_RECIPIENTS) {
      throw new Error(`Maximum ${MAX_CC_RECIPIENTS} CC recipients allowed`);
    }
    for (const ccEmail of cc) {
      if (!emailRegex.test(ccEmail)) {
        throw new Error(`Invalid CC email format: ${ccEmail}`);
      }
    }

    // Use service role client for data access
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify ownership: user must own the order or be admin
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(`*, order_items (*)`)
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      throw new Error(`Order not found with ID: ${orderId}`);
    }

    // Check ownership
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();
    
    const isAdmin = profile?.role === 'admin';
    if (order.agent_id !== userId && !isAdmin) {
      return new Response(JSON.stringify({ error: 'Forbidden: You do not own this order' }), { status: 403, headers: corsHeaders });
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("Email service is not properly configured. Please set the RESEND_API_KEY.");
    }

    // Fetch contact details
    const { data: contact } = await supabase
      .from("contacts")
      .select("*")
      .eq("id", order.contact_id)
      .single();

    // Fetch settings
    const { data: settings } = await supabase
      .from("settings")
      .select("*")
      .limit(1)
      .maybeSingle();

    const emailContent = formatEmailContent(order, contact, settings, subject, message, includeOrderDetails);
    const emailSenderName = settings?.email_sender_name || "CRM System";

    const { data, error } = await resend.emails.send({
      from: `${emailSenderName} <info@belmorso.eu>`,
      to: recipient,
      subject: subject.replace(/\[Company\]/g, contact?.company || ""),
      html: emailContent,
      cc: cc.length > 0 ? cc : undefined,
      reply_to: "info@belmorso.eu",
    });

    if (error) {
      throw new Error(`Failed to send email: ${error.message}`);
    }

    return new Response(
      JSON.stringify({ success: true, message: "Email sent successfully", data }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: any) {
    console.error("Error in send-order-email function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
