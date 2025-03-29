
import { Order } from "@/types";
import { supabase } from "@/integrations/supabase/client";

export const getOrderById = (orders: Order[], id: string): Order | undefined => {
  return orders.find(order => order.id === id);
};

export const getOrdersByContactId = (orders: Order[], contactId: string): Order[] => {
  return orders.filter(order => order.contactId === contactId);
};

export const generateOrderReference = (orders: Order[], userEmail?: string, userId?: string): string => {
  // Get the current date parts
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2); // Last 2 digits of year
  const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Month (01-12)
  
  // Use first 3 letters of user email or part of userId as agent code
  let agentCode = 'CRM';
  if (userEmail) {
    agentCode = userEmail.split('@')[0].substring(0, 3).toUpperCase();
  } else if (userId) {
    agentCode = userId.substring(0, 3).toUpperCase();
  }
  
  // Count how many orders already exist this month to generate a sequential number
  const thisMonthOrders = orders.filter(order => {
    const orderDate = new Date(order.date);
    return orderDate.getFullYear() === now.getFullYear() &&
           orderDate.getMonth() === now.getMonth();
  });
  
  const sequentialNumber = (thisMonthOrders.length + 1).toString().padStart(3, '0'); // 001, 002, etc.
  
  // Combine into reference: CRM-23-04-001
  return `${agentCode}-${year}-${month}-${sequentialNumber}`;
};

export const sendOrderEmail = async (
  orderId: string, 
  recipient: string, 
  subject: string, 
  message: string,
  cc?: string[]
): Promise<boolean> => {
  try {
    console.log("Sending order email with params:", {
      orderId,
      recipient,
      subject,
      cc: cc || []
    });
    
    // Make sure we have valid data
    if (!orderId || !recipient || !subject) {
      console.error("Missing required parameters for sending email");
      return false;
    }
    
    // Call the edge function to send the email
    const { data, error } = await supabase.functions.invoke("send-order-email", {
      body: {
        orderId,
        recipient,
        subject,
        message,
        includeOrderDetails: true,
        cc: cc || []
      }
    });

    if (error) {
      console.error("Error sending order email:", error);
      return false;
    }

    console.log("Email sent successfully:", data);
    return true;
  } catch (error) {
    console.error("Unexpected error sending order email:", error);
    return false;
  }
};
