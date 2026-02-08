import { Order, OrderItem, Contact, Settings } from "./types.ts";

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export const formatEmailContent = (
  order: Order,
  contact: Contact | null,
  settings: Settings | null,
  subject: string,
  message: string,
  includeOrderDetails: boolean
): string => {
  // Process message and subject with contact company placeholder
  const processedSubject = escapeHtml(subject.replace(/\[Company\]/g, contact?.company || ""));
  const processedMessage = escapeHtml(message.replace(/\[Company\]/g, contact?.company || ""));
  
  // Get email settings with defaults
  const emailSenderName = settings?.email_sender_name || "CRM System";
  const emailFooter = settings?.email_footer || "This is an automated message from your CRM system.";
  const showFooterInEmails = settings?.show_footer_in_emails !== false; // Default to true if not set
  
  // Generate order details HTML if requested
  let orderDetailsHtml = "";
  if (includeOrderDetails) {
    orderDetailsHtml = generateOrderDetailsHtml(order);
  }

  // Create the complete email HTML
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${processedSubject}</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto;">
      <div style="padding: 20px;">
        <h1 style="color: #0EA5E9;">${processedSubject}</h1>
        
        <div style="margin-bottom: 20px;">
          ${processedMessage.replace(/\n/g, '<br>')}
        </div>
        
        ${orderDetailsHtml}
        
        ${showFooterInEmails ? `
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #888;">
          <p>${emailFooter}</p>
        </div>
        ` : ''}
      </div>
    </body>
    </html>
  `;
};

const generateOrderDetailsHtml = (order: Order): string => {
  // Generate order items table
  let itemsHtml = "";
  let totalVat = 0;
  
  for (const item of order.order_items) {
    const vatAmount = item.vat ? (item.subtotal * item.vat / 100) : 0;
    totalVat += vatAmount;
    
    itemsHtml += `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">${escapeHtml(item.code)}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${escapeHtml(item.description)}</td>
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
  
  return `
    <div style="margin-top: 20px; margin-bottom: 20px;">
      <h2 style="color: #333;">Order Details</h2>
      <p><strong>Order Reference:</strong> ${escapeHtml(order.reference || order.id.slice(0, 8).toUpperCase())}</p>
      <p><strong>Date:</strong> ${orderDate}</p>
      <p><strong>Status:</strong> ${escapeHtml(order.status)}</p>
      
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
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>€${(order.total - (order.vat_total || totalVat)).toFixed(2)}</strong></td>
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
      
      ${order.notes ? `<h3>Notes</h3><p>${escapeHtml(order.notes)}</p>` : ''}
      
      ${order.terms_and_conditions ? 
        `<h3>Terms and Conditions</h3>
         <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px;">
           ${escapeHtml(order.terms_and_conditions)}
         </div>` : ''
      }
    </div>
  `;
};
