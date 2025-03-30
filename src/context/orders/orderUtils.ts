
import { supabase } from "@/integrations/supabase/client";
import { Order, OrderItem } from "@/types";

// Get an order by ID
export const getOrderById = (orders: Order[], orderId: string): Order | undefined => {
  return orders.find(order => order.id === orderId);
};

// Get orders by contact ID
export const getOrdersByContactId = (orders: Order[], contactId: string): Order[] => {
  return orders.filter(order => order.contactId === contactId);
};

// Generate a reference number for a new order
export const generateOrderReference = (
  orders: Order[], 
  userEmail?: string, 
  userId?: string
): string => {
  const today = new Date();
  const year = today.getFullYear().toString().substr(-2);
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  
  // Get initials from email or use "OR" as default
  let prefix = "OR";
  
  if (userEmail) {
    const parts = userEmail.split('@')[0];
    prefix = parts.slice(0, 3).toUpperCase();
  }
  
  // Count orders for today to determine sequence number
  const todayOrders = orders.filter(order => {
    const orderDate = new Date(order.date);
    return orderDate.getDate() === today.getDate() &&
           orderDate.getMonth() === today.getMonth() &&
           orderDate.getFullYear() === today.getFullYear();
  });
  
  const sequence = (todayOrders.length + 1).toString().padStart(3, '0');
  
  return `${prefix}-${year}-${month}-${sequence}`;
};

// Send order email
export const sendOrderEmail = async (
  orderId: string,
  recipient: string,
  subject: string,
  message: string,
  cc: string[] = []
): Promise<boolean> => {
  try {
    console.log("Sending order email with params:", {
      orderId,
      recipient,
      subject,
      cc
    });
    
    const { data, error } = await supabase.functions.invoke('send-order-email', {
      body: {
        orderId,
        recipient,
        subject,
        message,
        includeOrderDetails: true,
        cc
      },
    });
    
    if (error) {
      console.error("Error sending order email:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error sending order email:", error);
    return false;
  }
};
