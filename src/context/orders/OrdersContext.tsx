
import React, { createContext, useContext, ReactNode } from "react";
import { useOrdersOperations } from "./useOrdersOperations";
import { OrdersContextType } from "./types";

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

export const OrdersProvider = ({ children }: { children: ReactNode }) => {
  const operations = useOrdersOperations();
  
  // Add the missing createOrderItem method
  const contextValue: OrdersContextType = {
    ...operations,
    createOrderItem: async (orderItem: any) => {
      // This is a placeholder implementation since order items are typically created with orders
      console.log("Creating order item:", orderItem);
      return orderItem;
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
