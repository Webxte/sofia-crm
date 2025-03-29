
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
  cc?: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Received order email request");
    const { orderId, recipient, subject, message, includeOrderDetails = true, cc = [] } = await req.json() as EmailRequest;
    
    console.log("Order email details:", {
      orderId,
      recipient,
      subject,
      includeOrderDetails,
      cc: cc || []
    });
    
    // Create a Supabase client with the auth context of the function
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    if (!orderId) {
      throw new Error("Order ID is required");
    }

    console.log("Fetching order with ID:", orderId);
    
    // Fetch order details - Using .maybeSingle() instead of .single() to avoid errors
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .maybeSingle();
    
    if (orderError) {
      console.error("Error fetching order:", orderError);
      throw new Error(`Error fetching order: ${orderError.message}`);
    }
    
    if (!order) {
      console.error("Order not found:", orderId);
      throw new Error(`Order not found with ID: ${orderId}`);
    }
    
    console.log("Order fetched successfully:", order.id);
    
    // Fetch order items
    const { data: orderItems, error: itemsError } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", orderId);
      
    if (itemsError) {
      console.error("Error fetching order items:", itemsError);
    }
    
    // Fetch contact details - Using .maybeSingle() instead of .single()
    const { data: contact, error: contactError } = await supabase
      .from("contacts")
      .select("*")
      .eq("id", order.contact_id)
      .maybeSingle();
    
    if (contactError) {
      console.error("Error fetching contact:", contactError);
      throw new Error(`Error fetching contact: ${contactError.message}`);
    }
    
    if (!contact) {
      console.error("Contact not found for order:", order.contact_id);
      throw new Error(`Contact not found for order with ID: ${order.contact_id}`);
    }
    
    console.log("Contact fetched successfully:", contact.id);
    
    // Fetch company settings to get office email
    const { data: settings, error: settingsError } = await supabase
      .from("settings")
      .select("company_email")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    
    // Office email to CC (if available)
    const officeEmail = settings?.company_email || null;
    console.log("Office email for CC:", officeEmail);
    
    // Prepare final CC list
    let ccList = [...cc]; // Start with any CCs provided in the request
    
    // Add office email to CC if it exists and isn't already in the list
    if (officeEmail && !ccList.includes(officeEmail)) {
      ccList.push(officeEmail);
    }
    
    console.log("Final CC list:", ccList);
    
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
      if (orderItems && Array.isArray(orderItems)) {
        orderItems.forEach(item => {
          emailContent += `
            <tr>
              <td style="padding: 8px; text-align: left; border: 1px solid #ddd;">
                <strong>${item.code || 'N/A'}</strong><br>${item.description || 'No description'}
              </td>
              <td style="padding: 8px; text-align: right; border: 1px solid #ddd;">${item.quantity}</td>
              <td style="padding: 8px; text-align: right; border: 1px solid #ddd;">€${item.price?.toFixed(2) || '0.00'}</td>
              <td style="padding: 8px; text-align: right; border: 1px solid #ddd;">€${item.subtotal?.toFixed(2) || '0.00'}</td>
            </tr>
          `;
        });
      }
      
      // Add order totals
      emailContent += `
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="padding: 8px; text-align: right; border: 1px solid #ddd;"><strong>Total:</strong></td>
                <td style="padding: 8px; text-align: right; border: 1px solid #ddd;"><strong>€${(order.total || 0).toFixed(2)}</strong></td>
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
    
    console.log("Preparing to send email via send-email function");
    
    // Send email using Supabase Edge Function
    const { data: resendData, error: resendError } = await supabase.functions.invoke("send-email", {
      body: {
        to: recipient,
        subject: subject,
        html: emailContent,
        cc: ccList.length > 0 ? ccList : undefined,
      },
    });
    
    if (resendError) {
      console.error("Error sending email:", resendError);
      throw new Error(`Error sending email: ${resendError.message}`);
    }
    
    console.log("Email sent successfully:", resendData);
    
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
