
import { createContext, useContext, useEffect, ReactNode } from "react";
import { Order, OrderItem } from "@/types";
import { OrdersContextType } from "./types";
import { useOrdersOperations } from "./useOrdersOperations";
import { getOrderById, getOrdersByContactId, generateOrderReference, sendOrderEmail } from "./orderUtils";
import { useAuth } from "@/context/AuthContext";

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

export const OrdersProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, user } = useAuth();
  const { 
    orders, 
    loading, 
    refreshOrders, 
    addOrder, 
    updateOrder, 
    deleteOrder, 
    createOrderItem 
  } = useOrdersOperations();

  // Fetch orders when the component mounts or when user auth state changes
  useEffect(() => {
    if (isAuthenticated) {
      refreshOrders();
    }
  }, [isAuthenticated]);

  // Create a function that passes user data from the component level
  const generateOrderReferenceWithUserInfo = () => {
    return generateOrderReference(orders, user?.email, user?.id);
  };

  return (
    <OrdersContext.Provider
      value={{
        orders,
        loading,
        addOrder,
        updateOrder,
        deleteOrder,
        getOrderById: (id: string) => getOrderById(orders, id),
        getOrdersByContactId: (contactId: string) => getOrdersByContactId(orders, contactId),
        createOrderItem,
        sendOrderEmail,
        generateOrderReference: generateOrderReferenceWithUserInfo,
        refreshOrders,
      }}
    >
      {children}
    </OrdersContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrdersContext);
  if (context === undefined) {
    throw new Error("useOrders must be used within an OrdersProvider");
  }
  return context;
};
