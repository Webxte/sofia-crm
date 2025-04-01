
import { Order } from "@/types";
import { formatCurrency } from "@/utils/formatting";
import { format } from "date-fns";

/**
 * Generates a default email message with order details
 */
export const generateDefaultEmailContent = (
  order: Order | undefined, 
  contactName: string, 
  reference: string,
  defaultTemplate?: string
): string => {
  if (defaultTemplate) {
    return defaultTemplate;
  }
  
  if (!order) return "Please find attached the details of your order. Thank you for your business.";
  
  const orderDate = format(new Date(order.date), 'MMMM do, yyyy');
  
  let message = `Dear ${contactName},\n\n`;
  message += `Your order (Ref: ${reference}) from ${orderDate} has been processed.\n\n`;
  
  // Added additional content based on order status
  switch (order.status) {
    case 'confirmed':
      message += "We're pleased to confirm your order. Our team is now preparing it.\n\n";
      break;
    case 'shipped':
      message += "Your order has been shipped and is on its way to you.\n\n";
      break;
    case 'delivered':
      message += "Your order has been delivered. We hope you're satisfied with our products.\n\n";
      break;
    case 'paid':
      message += "Thank you for your payment. Receipt is included in this email.\n\n";
      break;
    default:
      break;
  }
  
  message += "Thank you for your business.";
  
  return message;
};

/**
 * Generates a default email subject line for an order
 */
export const generateDefaultEmailSubject = (reference: string, defaultSubject?: string): string => {
  if (defaultSubject) {
    return defaultSubject.replace(/\[Reference\]/g, reference);
  }
  return `Order Confirmation - Ref: ${reference}`;
};

/**
 * Returns available template placeholders for emails
 */
export const getEmailPlaceholders = () => {
  return [
    { name: "[Name]", description: "Customer name" },
    { name: "[Company]", description: "Customer company name" },
    { name: "[Date]", description: "Order date" },
    { name: "[Reference]", description: "Order reference" },
    { name: "[Total]", description: "Order total amount" },
    { name: "[Status]", description: "Current order status" }
  ];
};

/**
 * Fills email template with actual data
 */
export const fillEmailTemplate = (template: string, order: Order, contactName: string, companyName: string, reference: string): string => {
  const orderDate = format(new Date(order.date), 'MMMM do, yyyy');
  const total = formatCurrency(order.total);
  
  return template
    .replace(/\[Name\]/g, contactName)
    .replace(/\[Company\]/g, companyName || "")
    .replace(/\[Date\]/g, orderDate)
    .replace(/\[Reference\]/g, reference)
    .replace(/\[Total\]/g, total)
    .replace(/\[Status\]/g, order.status);
};
