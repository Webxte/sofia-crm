
import { createContext, useContext, useState, ReactNode } from "react";
import { Order, OrderItem, Product } from "@/types";
import { useProducts } from "./ProductsContext";
import { useAuth } from "./AuthContext";

interface OrdersContextType {
  orders: Order[];
  addOrder: (order: Omit<Order, "id" | "createdAt" | "updatedAt">) => void;
  updateOrder: (id: string, order: Partial<Order>) => void;
  deleteOrder: (id: string) => void;
  getOrderById: (id: string) => Order | undefined;
  getOrdersByContactId: (contactId: string) => Order[];
  createOrderItem: (productId: string, quantity: number) => OrderItem | undefined;
  sendOrderEmail: (orderId: string, recipient: string, subject: string, message: string) => Promise<boolean>;
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

export const OrdersProvider = ({ children }: { children: ReactNode }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const { getProductById } = useProducts();
  const { user } = useAuth();

  const addOrder = (orderData: Omit<Order, "id" | "createdAt" | "updatedAt">) => {
    // Add agent information if available
    const agentData = user ? {
      agentId: user.id,
      agentName: user.name
    } : {};
    
    const newOrder: Order = {
      ...orderData,
      ...agentData,
      id: Math.random().toString(36).substring(2, 9),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setOrders(prevOrders => [...prevOrders, newOrder]);
  };

  const updateOrder = (id: string, orderData: Partial<Order>) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === id 
          ? { ...order, ...orderData, updatedAt: new Date() } 
          : order
      )
    );
  };

  const deleteOrder = (id: string) => {
    setOrders(prevOrders => prevOrders.filter(order => order.id !== id));
  };

  const getOrderById = (id: string) => {
    return orders.find(order => order.id === id);
  };

  const getOrdersByContactId = (contactId: string) => {
    return orders.filter(order => order.contactId === contactId);
  };

  const createOrderItem = (productId: string, quantity: number): OrderItem | undefined => {
    const product = getProductById(productId);
    
    if (!product) return undefined;
    
    return {
      id: Math.random().toString(36).substring(2, 9),
      productId: product.id,
      code: product.code,
      description: product.description,
      price: product.price,
      quantity,
      vat: product.vat || 0,
      subtotal: product.price * quantity,
      product,
    };
  };

  // Simulate sending an order by email
  const sendOrderEmail = async (
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

  return (
    <OrdersContext.Provider
      value={{
        orders,
        addOrder,
        updateOrder,
        deleteOrder,
        getOrderById,
        getOrdersByContactId,
        createOrderItem,
        sendOrderEmail,
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
