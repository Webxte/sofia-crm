
import { createContext, useContext, useState, ReactNode } from "react";
import { Order, OrderItem, Product } from "@/types";
import { useProducts } from "./ProductsContext";

interface OrdersContextType {
  orders: Order[];
  addOrder: (order: Omit<Order, "id" | "createdAt" | "updatedAt">) => void;
  updateOrder: (id: string, order: Partial<Order>) => void;
  deleteOrder: (id: string) => void;
  getOrderById: (id: string) => Order | undefined;
  getOrdersByContactId: (contactId: string) => Order[];
  createOrderItem: (productId: string, quantity: number) => OrderItem | undefined;
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

export const OrdersProvider = ({ children }: { children: ReactNode }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const { getProductById } = useProducts();

  const addOrder = (orderData: Omit<Order, "id" | "createdAt" | "updatedAt">) => {
    const newOrder: Order = {
      ...orderData,
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
      productId: product.id,
      code: product.code,
      description: product.description,
      price: product.price,
      quantity,
      subtotal: product.price * quantity,
      // Add the id and product properties to match the updated interface
      id: Math.random().toString(36).substring(2, 9),
      product,
    };
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
