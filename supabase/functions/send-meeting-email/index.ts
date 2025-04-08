
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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
    
    // Format message with proper line breaks for HTML
    const htmlMessage = body.message.replace(/\n/g, "<br />");
    
    console.log("Sending meeting email with Resend API");
    
    // Prepare email config - using the same verified domain as in orders
    const emailConfig = {
      to: body.to,
      subject: body.subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>${body.subject}</h2>
          <p>Meeting Type: ${body.meetingType}</p>
          <p>Date: ${body.meetingDate}</p>
          <div style="margin-top: 20px;">
            ${htmlMessage}
          </div>
        </div>
      `,
      cc: body.cc,
    };
    
    // Use custom from email if provided
    if (body.fromEmail && body.fromName) {
      emailConfig.from = `${body.fromName} <${body.fromEmail}>`;
      console.log(`Using custom from address: ${emailConfig.from}`);
    } else {
      // Use the same verified domain as in the orders email
      emailConfig.from = "CRM System <info@belmorso.eu>";
      console.log(`Using default from address: ${emailConfig.from}`);
    }
    
    // Send email using Resend
    const { data, error } = await resend.emails.send(emailConfig);
    
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
