
import { Order } from "@/types";
import { formatCurrency } from "@/utils/formatting";
import { format } from "date-fns";

/**
 * Generates a default email message with order details
 */
export const generateDefaultEmailContent = (order: Order | undefined, contactName: string, reference: string): string => {
  if (!order) return "Please find attached the details of your order. Thank you for your business.";
  
  const orderDate = format(new Date(order.date), 'MMMM do, yyyy');
  
  let message = `Dear ${contactName},\n\n`;
  message += `Your order (Ref: ${reference}) from ${orderDate} has been processed.\n\n`;
  
  // Generate formatted order details
  message += "Order Details:\n";
  
  // Calculate totals
  let subtotal = 0;
  let vatTotal = 0;
  
  if (order.items && order.items.length > 0) {
    order.items.forEach(item => {
      const itemSubtotal = item.price * item.quantity;
      const itemVat = item.vat ? (itemSubtotal * item.vat / 100) : 0;
      
      message += `${item.quantity} x ${item.description} (${item.code})\n`;
      message += `  Price: ${formatCurrency(item.price)} each\n`;
      if (item.vat) {
        message += `  VAT: ${item.vat}%\n`;
      }
      message += `  Subtotal: ${formatCurrency(itemSubtotal)}\n\n`;
      
      subtotal += itemSubtotal;
      vatTotal += itemVat;
    });
  }
  
  // Add summary
  message += "Summary:\n";
  message += `Subtotal: ${formatCurrency(subtotal)}\n`;
  message += `VAT: ${formatCurrency(vatTotal)}\n`;
  message += `Total: ${formatCurrency(subtotal + vatTotal)}\n\n`;
  
  message += "Thank you for your business.";
  
  return message;
};

/**
 * Generates a default email subject line for an order
 */
export const generateDefaultEmailSubject = (reference: string): string => {
  return `Order Confirmation - Ref: ${reference}`;
};
