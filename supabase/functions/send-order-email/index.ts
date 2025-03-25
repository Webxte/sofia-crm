
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

// Define CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  orderId: string;
  recipient: string;
  subject: string;
  message: string;
  includeOrderDetails: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId, recipient, subject, message, includeOrderDetails } = await req.json() as EmailRequest;
    
    // Create a Supabase client with the auth context of the function
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    if (!orderId) {
      throw new Error("Order ID is required");
    }

    // Fetch order details
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", orderId)
      .single();
    
    if (orderError) {
      throw new Error(`Error fetching order: ${orderError.message}`);
    }
    
    // Fetch contact details
    const { data: contact, error: contactError } = await supabase
      .from("contacts")
      .select("*")
      .eq("id", order.contact_id)
      .single();
    
    if (contactError) {
      throw new Error(`Error fetching contact: ${contactError.message}`);
    }
    
    // Prepare email content
    let emailContent = `<h1>Order Information</h1>`;
    emailContent += `<p>${message}</p>`;
    
    if (includeOrderDetails) {
      // Format order details
      const orderDate = new Date(order.date).toLocaleDateString();
      const contactName = contact.company || contact.full_name || "Customer";
      
      emailContent += `
        <div style="margin-top: 20px; border: 1px solid #ddd; padding: 15px; border-radius: 5px;">
          <h2>Order Details</h2>
          <p><strong>Order Reference:</strong> ${order.reference || `Order #${orderId.slice(0, 8)}`}</p>
          <p><strong>Date:</strong> ${orderDate}</p>
          <p><strong>Customer:</strong> ${contactName}</p>
          <p><strong>Status:</strong> ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</p>
          
          <h3>Items</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f2f2f2;">
                <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Item</th>
                <th style="padding: 8px; text-align: right; border: 1px solid #ddd;">Qty</th>
                <th style="padding: 8px; text-align: right; border: 1px solid #ddd;">Price</th>
                <th style="padding: 8px; text-align: right; border: 1px solid #ddd;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
      `;
      
      // Add order items
      order.order_items.forEach(item => {
        emailContent += `
          <tr>
            <td style="padding: 8px; text-align: left; border: 1px solid #ddd;">
              <strong>${item.code}</strong><br>${item.description}
            </td>
            <td style="padding: 8px; text-align: right; border: 1px solid #ddd;">${item.quantity}</td>
            <td style="padding: 8px; text-align: right; border: 1px solid #ddd;">€${item.price.toFixed(2)}</td>
            <td style="padding: 8px; text-align: right; border: 1px solid #ddd;">€${item.subtotal.toFixed(2)}</td>
          </tr>
        `;
      });
      
      // Add order totals
      emailContent += `
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="padding: 8px; text-align: right; border: 1px solid #ddd;"><strong>Total:</strong></td>
                <td style="padding: 8px; text-align: right; border: 1px solid #ddd;"><strong>€${order.total.toFixed(2)}</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>
      `;
      
      // Add notes if any
      if (order.notes) {
        emailContent += `
          <div style="margin-top: 20px;">
            <h3>Notes</h3>
            <p>${order.notes}</p>
          </div>
        `;
      }
      
      // Add terms and conditions if any
      if (order.terms_and_conditions) {
        emailContent += `
          <div style="margin-top: 20px; font-size: 0.9em; color: #666;">
            <h3>Terms and Conditions</h3>
            <p>${order.terms_and_conditions}</p>
          </div>
        `;
      }
    }
    
    // Send email using Supabase Edge Function
    const { data: resendData, error: resendError } = await supabase.functions.invoke("send-email", {
      body: {
        to: recipient,
        subject: subject,
        html: emailContent,
      },
    });
    
    if (resendError) {
      throw new Error(`Error sending email: ${resendError.message}`);
    }
    
    return new Response(JSON.stringify({ success: true, message: "Email sent successfully" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
    
  } catch (error) {
    console.error("Error in send-order-email function:", error);
    
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
