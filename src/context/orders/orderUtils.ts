
import { Order } from "@/types";
import { supabase } from "@/integrations/supabase/client";

export const getOrderById = (orders: Order[], id: string): Order | undefined => {
  return orders.find(order => order.id === id);
};

export const getOrdersByContactId = (orders: Order[], contactId: string): Order[] => {
  return orders.filter(order => order.contactId === contactId);
};

export const generateOrderReference = (
  orders: Order[], 
  userEmail?: string | null, 
  userId?: string | null
): string => {
  const today = new Date();
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');
  
  // Try to extract initials from email or use first chars from userId
  let prefix = 'ORD';
  if (userEmail) {
    const emailParts = userEmail.split('@');
    if (emailParts.length > 0) {
      const namePart = emailParts[0];
      if (namePart.length >= 3) {
        prefix = namePart.substring(0, 3).toUpperCase();
      }
    }
  } else if (userId) {
    prefix = userId.substring(0, 3).toUpperCase();
  }
  
  // Count existing orders today to increment the number
  const todayString = `${today.getFullYear()}-${month}-${day}`;
  let orderNumber = 1;
  
  orders.forEach(order => {
    if (
      order.reference && 
      order.reference.includes(`${month}-${day}`) && 
      order.reference.startsWith(prefix)
    ) {
      const parts = order.reference.split('-');
      if (parts.length === 3) {
        const existingNumber = parseInt(parts[2]);
        if (!isNaN(existingNumber) && existingNumber >= orderNumber) {
          orderNumber = existingNumber + 1;
        }
      }
    }
  });
  
  return `${prefix}-${month}-${day}-${orderNumber.toString().padStart(3, '0')}`;
};

export const sendOrderEmail = async (
  orderId: string,
  recipient: string,
  subject: string,
  message: string,
  cc?: string[]
): Promise<boolean> => {
  try {
    const { error } = await supabase.functions.invoke('send-order-email', {
      body: {
        orderId,
        recipient,
        subject,
        message,
        includeOrderDetails: true,
        cc: cc || []
      }
    });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error sending order email:', error);
    return false;
  }
};
