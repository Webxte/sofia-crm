
import { Order } from "@/types";

export const getOrderById = (orders: Order[], id: string): Order | undefined => {
  return orders.find(order => order.id === id);
};

export const getOrdersByContactId = (orders: Order[], contactId: string): Order[] => {
  return orders.filter(order => order.contactId === contactId);
};

// Generate a new order reference based on agent email and a sequential number
export const generateOrderReference = (orders: Order[], userEmail?: string | null, userId?: string): string => {
  if (!userEmail) {
    return `ORD${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
  }
  
  // Extract first three letters from email (uppercase)
  const prefix = userEmail.substring(0, 3).toUpperCase();
  
  // Count existing orders from this agent to determine the sequence number
  const agentOrders = orders.filter(order => 
    order.agentId === userId || 
    (order.reference && order.reference.startsWith(prefix))
  );
  
  // Generate a 5-digit sequence number, padded with leading zeros
  const sequenceNumber = (agentOrders.length + 1).toString().padStart(5, '0');
  
  return `${prefix}${sequenceNumber}`;
};

// Simulate sending an order by email
export const sendOrderEmail = async (
  orderId: string, 
  recipient: string, 
  subject: string, 
  message: string
): Promise<boolean> => {
  // This is a mock function - in a real application you would connect to an email service
  console.log(`Sending order ${orderId} to ${recipient}`);
  console.log(`Subject: ${subject}`);
  console.log(`Message: ${message}`);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return success (true) to simulate successful delivery
  return true;
};
