
import React, { createContext, useContext, ReactNode, useEffect } from "react";
import { useOrdersOperations } from "./useOrdersOperations";
import { OrdersContextType } from "./types";

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

export const OrdersProvider = ({ children }: { children: ReactNode }) => {
  const operations = useOrdersOperations();

  // Auto-fetch orders when the provider mounts
  useEffect(() => {
    console.log("OrdersProvider: Initializing, fetching orders");
    operations.fetchOrders();
  }, []);

  const contextValue: OrdersContextType = {
    ...operations,
    getOrderById: (id: string) => operations.orders.find(order => order.id === id),
    getOrdersByContactId: (contactId: string) => operations.orders.filter(order => order.contactId === contactId),
    createOrderItem: async (orderItem: any) => {
      console.log("OrdersContext: createOrderItem placeholder", orderItem);
      return orderItem;
    },
    sendOrderEmail: async (orderId: string, emailData: any): Promise<boolean> => {
      console.log("OrdersContext: sendOrderEmail placeholder", orderId, emailData);
      return true;
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
