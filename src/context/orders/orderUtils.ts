
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
  // Get prefix from email (first 3 letters) or use ORD as default
  let prefix = 'ORD';
  if (userEmail) {
    const emailName = userEmail.split('@')[0];
    if (emailName.length >= 3) {
      prefix = emailName.substring(0, 3).toUpperCase();
    }
  }

  // Find the highest sequence number for this prefix
  let maxSequence = 0;
  
  orders.forEach(order => {
    if (order.reference && order.reference.startsWith(prefix)) {
      const parts = order.reference.split('-');
      if (parts.length === 2) {
        const sequenceStr = parts[1];
        const sequence = parseInt(sequenceStr, 10);
        if (!isNaN(sequence) && sequence > maxSequence) {
          maxSequence = sequence;
        }
      }
    }
  });
  
  // Format the new sequence number with leading zeros (5 digits)
  const nextSequence = maxSequence + 1;
  const sequenceStr = nextSequence.toString().padStart(5, '0');
  
  return `${prefix}-${sequenceStr}`;
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
