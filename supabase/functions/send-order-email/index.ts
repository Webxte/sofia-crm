
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.1";
import { Resend } from "npm:resend@2.0.0";
import { formatEmailContent } from "./email-formatter.ts";
import { OrderEmailRequest } from "./types.ts";

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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Received order email request");
    
    const requestData: OrderEmailRequest = await req.json();
    const { orderId, recipient, subject, message, includeOrderDetails = true, cc = [] } = requestData;
    
    console.log("Order email details:", {
      orderId,
      recipient,
      subject,
      includeOrderDetails,
      cc
    });
    
    // Check for Resend API key
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("Missing RESEND_API_KEY environment variable");
      throw new Error("Email service is not properly configured. Please set the RESEND_API_KEY.");
    }
    
    // Validate required fields
    if (!orderId) {
      throw new Error("Missing required field: orderId");
    }
    
    if (!recipient) {
      throw new Error("Missing required field: recipient");
    }
    
    console.log("Fetching order with ID:", orderId);
    
    // Fetch order details
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (*)
      `)
      .eq("id", orderId)
      .single();
    
    if (orderError || !order) {
      console.error("Order not found:", orderId);
      throw new Error(`Order not found with ID: ${orderId}`);
    }
    
    // Fetch contact details
    const { data: contact, error: contactError } = await supabase
      .from("contacts")
      .select("*")
      .eq("id", order.contact_id)
      .single();
    
    if (contactError) {
      console.error("Contact fetch error:", contactError);
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
    
    // Format the email HTML content
    const emailContent = formatEmailContent(
      order,
      contact,
      settings,
      subject,
      message,
      includeOrderDetails
    );
    
    // Get sender name from settings
    const emailSenderName = settings?.email_sender_name || "CRM System";
    
    // Send email with the sender name from settings
    console.log("Sending email to:", recipient);
    console.log("CC recipients:", cc);
    console.log("Using sender name:", emailSenderName);
    
    try {
      const { data, error } = await resend.emails.send({
        from: `${emailSenderName} <info@belmorso.eu>`,
        to: recipient,
        subject: subject.replace(/\[Company\]/g, contact?.company || ""),
        html: emailContent,
        cc: cc.length > 0 ? cc : undefined,
        reply_to: "info@belmorso.eu",
      });
      
      if (error) {
        console.error("Resend API error:", error);
        throw new Error(`Failed to send email: ${error.message}`);
      }
      
      console.log("Email sent successfully:", data);
      
      return new Response(
        JSON.stringify({ success: true, message: "Email sent successfully", data }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } catch (sendError) {
      console.error("Error sending email:", sendError);
      throw new Error(`Failed to send email: ${sendError.message}`);
    }
    
  } catch (error: any) {
    console.error("Error in send-order-email function:", error);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
