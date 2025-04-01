
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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Received order email request");
    
    const { orderId, recipient, subject, message, includeOrderDetails = true, cc = [] } = await req.json();
    
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
    
    console.log("Using RESEND_API_KEY:", resendApiKey.substring(0, 5) + "...");
    
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
    
    // Generate order HTML
    let orderDetailsHtml = "";
    if (includeOrderDetails) {
      // Generate order items table
      let itemsHtml = "";
      let totalVat = 0;
      
      for (const item of order.order_items) {
        const vatAmount = item.vat ? (item.subtotal * item.vat / 100) : 0;
        totalVat += vatAmount;
        
        itemsHtml += `
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;">${item.code}</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${item.description}</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${item.quantity}</td>
            <td style="padding: 8px; border: 1px solid #ddd;">€${item.price.toFixed(2)}</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${item.vat ? `${item.vat}%` : '0%'}</td>
            <td style="padding: 8px; border: 1px solid #ddd;">€${item.subtotal.toFixed(2)}</td>
          </tr>
        `;
      }
      
      // Format the date
      const orderDate = new Date(order.date).toLocaleDateString("en-IE", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });
      
      orderDetailsHtml = `
        <div style="margin-top: 20px; margin-bottom: 20px;">
          <h2 style="color: #333;">Order Details</h2>
          <p><strong>Order Reference:</strong> ${order.reference || orderId.slice(0, 8).toUpperCase()}</p>
          <p><strong>Date:</strong> ${orderDate}</p>
          <p><strong>Status:</strong> ${order.status}</p>
          
          <h3>Items</h3>
          <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">
            <thead>
              <tr style="background-color: #f2f2f2;">
                <th style="padding: 8px; border: 1px solid #ddd;">Code</th>
                <th style="padding: 8px; border: 1px solid #ddd;">Description</th>
                <th style="padding: 8px; border: 1px solid #ddd;">Qty</th>
                <th style="padding: 8px; border: 1px solid #ddd;">Price</th>
                <th style="padding: 8px; border: 1px solid #ddd;">VAT %</th>
                <th style="padding: 8px; border: 1px solid #ddd;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr style="background-color: #f9f9f9;">
                <td colspan="5" style="padding: 8px; border: 1px solid #ddd; text-align: right;"><strong>Subtotal:</strong></td>
                <td style="padding: 8px; border: 1px solid #ddd;"><strong>€${(order.total - (order.vat_total || 0)).toFixed(2)}</strong></td>
              </tr>
              <tr style="background-color: #f9f9f9;">
                <td colspan="5" style="padding: 8px; border: 1px solid #ddd; text-align: right;"><strong>VAT:</strong></td>
                <td style="padding: 8px; border: 1px solid #ddd;"><strong>€${(order.vat_total || totalVat).toFixed(2)}</strong></td>
              </tr>
              <tr style="background-color: #f2f2f2;">
                <td colspan="5" style="padding: 8px; border: 1px solid #ddd; text-align: right;"><strong>Total:</strong></td>
                <td style="padding: 8px; border: 1px solid #ddd;"><strong>€${order.total.toFixed(2)}</strong></td>
              </tr>
            </tfoot>
          </table>
          
          ${order.notes ? `<h3>Notes</h3><p>${order.notes}</p>` : ''}
          
          ${order.terms_and_conditions ? 
            `<h3>Terms and Conditions</h3>
             <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px;">
               ${order.terms_and_conditions}
             </div>` : ''
          }
        </div>
      `;
    }
    
    // Prepare email HTML - don't include the message as unformatted text
    const emailContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${subject}</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto;">
        <div style="padding: 20px;">
          <h1 style="color: #0EA5E9;">${subject}</h1>
          
          <div style="margin-bottom: 20px;">
            ${message.replace(/\n/g, '<br>')}
          </div>
          
          ${orderDetailsHtml}
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #888;">
            <p>This is an automated message from your CRM system.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    // Send email
    console.log("Sending email to:", recipient);
    console.log("CC recipients:", cc);
    
    try {
      const { data, error } = await resend.emails.send({
        from: "CRM System <onboarding@resend.dev>",
        to: recipient,
        subject: subject,
        html: emailContent,
        cc: cc.length > 0 ? cc : undefined,
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
    
  } catch (error) {
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
