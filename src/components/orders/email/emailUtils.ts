
import { Order } from "@/types";
import { formatCurrency } from "@/utils/formatting";
import { format } from "date-fns";

/**
 * Generates a default email message with order details
 */
export const generateDefaultEmailContent = (order: Order | undefined, contactName: string, reference: string): string => {
  if (!order) return "Please find attached the details of your order. Thank you for your business.";
    
  let message = `Dear ${contactName},\n\n`;
  message += `Your order (Ref: ${reference}) from ${format(new Date(order.date), 'MMMM do, yyyy')} has been processed.\n\n`;
  message += "Order Details:\n";
  
  if (order.items && order.items.length > 0) {
    order.items.forEach(item => {
      message += `${item.quantity} x ${item.code || ''} ${item.description}: ${formatCurrency(item.subtotal || 0)}\n`;
    });
  }
  
  message += `\nTotal: ${formatCurrency(order.total)}\n\n`;
  message += "Thank you for your business.";
  
  return message;
};

/**
 * Generates a default email subject line for an order
 */
export const generateDefaultEmailSubject = (reference: string): string => {
  return `Order Confirmation - Ref: ${reference}`;
};
