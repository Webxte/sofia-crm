
import { Order } from "@/types";

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
