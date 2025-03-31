
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Define CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string | string[];
  from?: string;
  subject: string;
  html: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Received email request");
    
    // Get request body
    const body: EmailRequest = await req.json();
    
    // Log the request for debugging
    console.log("Email request details:", {
      to: body.to,
      subject: body.subject,
      cc: body.cc,
      bcc: body.bcc,
    });
    
    // Check for Resend API key
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("Missing RESEND_API_KEY environment variable");
      throw new Error("Email service is not properly configured. Please set the RESEND_API_KEY.");
    }
    
    console.log("Using RESEND_API_KEY:", resendApiKey.substring(0, 5) + "...");
    
    // Validate required fields
    if (!body.to || !body.subject || !body.html) {
      throw new Error("Missing required fields: to, subject, html");
    }
    
    // Set default from email if not provided
    const from = body.from || "CRM System <onboarding@resend.dev>";
    
    console.log("Sending email with Resend API:", {
      from,
      to: body.to,
      subject: body.subject,
      cc: body.cc,
      bcc: body.bcc,
    });
    
    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from,
      to: body.to,
      subject: body.subject,
      html: body.html,
      cc: body.cc,
      bcc: body.bcc,
      reply_to: body.replyTo,
    });
    
    if (error) {
      console.error("Resend API error:", error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
    
    console.log("Email sent successfully:", data);
    
    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
    
  } catch (error) {
    console.error("Error in send-email function:", error);
    
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
