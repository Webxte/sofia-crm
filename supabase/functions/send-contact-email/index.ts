
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Define CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContactEmailRequest {
  to: string;
  subject: string;
  message: string;
  contactId: string;
  contactName: string;
  cc?: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Received contact email request");
    
    // Get request body
    const body: ContactEmailRequest = await req.json();
    
    // Log the request for debugging
    console.log("Contact email request details:", {
      to: body.to,
      subject: body.subject,
      contactId: body.contactId,
      contactName: body.contactName,
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
    
    console.log("Sending contact email with Resend API");
    
    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: "CRM System <onboarding@resend.dev>",
      to: body.to,
      subject: body.subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          ${htmlMessage}
        </div>
      `,
      cc: body.cc,
    });
    
    if (error) {
      console.error("Resend API error:", error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
    
    console.log("Contact email sent successfully:", data);
    
    // After sending the email, log the contact activity (optional enhancement for later)
    
    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
    
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
