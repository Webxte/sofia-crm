
import { Order } from "@/types";

/**
 * Generates an order reference based on agent email and sequential numbering
 * Format: First 3 letters of agent email followed by 5 digits (e.g., TAS00001)
 */
export const generateOrderReference = (
  orders: Order[], 
  userEmail?: string | null, 
  userId?: string | null
): string => {
  // Get prefix from email (first 3 letters) or user ID
  let prefix = 'ORD';
  if (userEmail) {
    const emailName = userEmail.split('@')[0];
    prefix = emailName.substring(0, 3).toUpperCase();
  } else if (userId) {
    prefix = userId.substring(0, 3).toUpperCase();
  }

  // Find the highest sequential number for this prefix
  let maxNumber = 0;
  orders.forEach(order => {
    if (order.reference && order.reference.startsWith(prefix)) {
      // Extract the numeric part
      const numericPart = order.reference.substring(prefix.length);
      const number = parseInt(numericPart);
      if (!isNaN(number) && number > maxNumber) {
        maxNumber = number;
      }
    }
  });

  // Generate new reference with incremented number
  const newNumber = maxNumber + 1;
  return `${prefix}${newNumber.toString().padStart(5, '0')}`;
};
