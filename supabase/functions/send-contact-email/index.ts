
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
  contactCompany?: string;
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
    console.log("Received contact email request");
    
    // Get request body
    const body: ContactEmailRequest = await req.json();
    
    // Log the request for debugging
    console.log("Contact email request details:", {
      to: body.to,
      subject: body.subject,
      contactId: body.contactId,
      contactName: body.contactName,
      contactCompany: body.contactCompany,
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
    
    // Replace placeholders in message
    let processedMessage = body.message;
    if (body.contactName) {
      processedMessage = processedMessage.replace(/\{name\}/g, body.contactName);
    }
    if (body.contactCompany) {
      processedMessage = processedMessage.replace(/\{company\}/g, body.contactCompany);
    }
    
    // Format message with proper line breaks for HTML
    const htmlMessage = processedMessage.replace(/\n/g, "<br />");
    
    console.log("Sending contact email with Resend API");
    
    // Prepare email config
    const emailConfig: any = {
      to: body.to,
      subject: body.subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          ${htmlMessage}
        </div>
      `,
      cc: body.cc,
    };
    
    // Use custom from email if provided and allowed by Resend
    // For this to work, the domain must be verified in Resend
    if (body.fromEmail && body.fromName) {
      emailConfig.from = `${body.fromName} <${body.fromEmail}>`;
      console.log(`Using custom from address: ${emailConfig.from}`);
    } else {
      // Default to the Resend onboarding email
      emailConfig.from = "CRM System <onboarding@resend.dev>";
      console.log(`Using default from address: ${emailConfig.from}`);
    }
    
    // Send email using Resend
    const { data, error } = await resend.emails.send(emailConfig);
    
    if (error) {
      console.error("Resend API error:", error);
      
      // Check if the error is related to domain verification
      if (error.message && error.message.includes("domain") && error.message.includes("verify")) {
        console.log("Falling back to default Resend email address due to domain verification issue");
        
        // Fall back to using the Resend onboarding email
        emailConfig.from = "CRM System <onboarding@resend.dev>";
        
        // Try again with the default email
        const fallbackResult = await resend.emails.send(emailConfig);
        
        if (fallbackResult.error) {
          console.error("Fallback send also failed:", fallbackResult.error);
          throw new Error(`Failed to send email: ${fallbackResult.error.message}`);
        }
        
        console.log("Email sent successfully with fallback email:", fallbackResult.data);
        
        return new Response(JSON.stringify({ 
          success: true, 
          data: fallbackResult.data,
          warning: "Used fallback email address. To use your own domain, please verify it in Resend."
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
      
      throw new Error(`Failed to send email: ${error.message}`);
    }
    
    console.log("Contact email sent successfully:", data);
    
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
