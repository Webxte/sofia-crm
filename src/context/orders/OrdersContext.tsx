
import React, { createContext, useContext, ReactNode } from "react";
import { useOrdersOperations } from "./useOrdersOperations";
import { OrdersContextType } from "./types";

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

export const OrdersProvider = ({ children }: { children: ReactNode }) => {
  const operations = useOrdersOperations();
  
  // Add all the missing methods to match the context type
  const contextValue: OrdersContextType = {
    ...operations,
    getOrderById: (id: string) => {
      return operations.orders.find(order => order.id === id);
    },
    getOrdersByContactId: (contactId: string) => {
      return operations.orders.filter(order => order.contactId === contactId);
    },
    createOrderItem: async (orderItem: any) => {
      // This is a placeholder implementation since order items are typically created with orders
      console.log("Creating order item:", orderItem);
      return orderItem;
    },
    sendOrderEmail: async (orderId: string, emailData: any): Promise<boolean> => {
      try {
        console.log("Sending order email:", orderId, emailData);
        // Placeholder implementation
        return true;
      } catch (error) {
        console.error("Error sending order email:", error);
        return false;
      }
    },
    generateOrderReference: (): string => {
      // Generate a simple order reference
      const timestamp = Date.now().toString().slice(-6);
      return `ORD-${timestamp}`;
    }
  };
  
  return (
    <OrdersContext.Provider value={contextValue}>
      {children}
    </OrdersContext.Provider>
  );
};

export const useOrders = (): OrdersContextType => {
  const context = useContext(OrdersContext);
  if (context === undefined) {
    throw new Error("useOrders must be used within an OrdersProvider");
  }
  return context;
};
