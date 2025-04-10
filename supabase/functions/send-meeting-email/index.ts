
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.1";
import { Resend } from "npm:resend@2.0.0";

// Initialize Resend with API key
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// Define CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Received meeting email request");
    
    // Get request body
    const body: MeetingEmailRequest = await req.json();
    
    // Log the request for debugging
    console.log("Meeting email request details:", {
      to: body.to,
      subject: body.subject,
      meetingId: body.meetingId,
      meetingType: body.meetingType,
      meetingDate: body.meetingDate,
      cc: body.cc || [],
      fromName: body.fromName,
      fromEmail: body.fromEmail
    });
    
    // Check for Resend API key
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("Missing RESEND_API_KEY environment variable");
      throw new Error("Email service is not properly configured. Please set the RESEND_API_KEY.");
    }
    
    // Validate required fields
    if (!body.to || !body.subject || !body.message) {
      throw new Error("Missing required fields: to, subject, message");
    }
    
    // Fetch settings for email customization
    const { data: settings, error: settingsError } = await supabase
      .from("settings")
      .select("*")
      .limit(1)
      .maybeSingle();
    
    if (settingsError) {
      console.error("Settings fetch error:", settingsError);
    }
    
    // Set up email configuration based on settings
    const emailSenderName = settings?.email_sender_name || "CRM System";
    const emailFooter = settings?.email_footer || "This is an automated message from your CRM system.";
    
    console.log("Using email settings:", {
      senderName: emailSenderName,
      footer: emailFooter
    });
    
    // Format message with proper line breaks for HTML
    const htmlMessage = body.message.replace(/\n/g, "<br />");
    
    console.log("Sending meeting email with Resend API");
    
    // Prepare email HTML with footer
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>${body.subject}</h2>
        <p>Meeting Type: ${body.meetingType}</p>
        <p>Date: ${body.meetingDate}</p>
        <div style="margin-top: 20px;">
          ${htmlMessage}
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #888;">
          <p>${emailFooter}</p>
        </div>
      </div>
    `;
    
    // Use settings for sender name
    const fromEmail = "info@belmorso.eu";
    const senderName = emailSenderName;
    const fromAddress = `${senderName} <${fromEmail}>`;
    
    console.log(`Using sender name: ${senderName}`);
    console.log(`Email from address: ${fromAddress}`);
    
    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: body.to,
      subject: body.subject,
      html: emailContent,
      cc: body.cc,
      reply_to: fromEmail,
    });
    
    if (error) {
      console.error("Resend API error:", error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
    
    console.log("Meeting email sent successfully:", data);
    
    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
    
  } catch (error: any) {
    console.error("Error in send-meeting-email function:", error);
    
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
