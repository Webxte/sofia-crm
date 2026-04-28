
import { Order, OrderItem } from "@/types";

export interface OrdersContextType {
  orders: Order[];
  setOrders: (orders: Order[]) => void;
  loading: boolean;
  addOrder: (orderData: Omit<Order, "id" | "createdAt" | "updatedAt">) => Promise<string | undefined>;
  updateOrder: (id: string, orderData: Partial<Order>) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  refreshOrders: () => Promise<void>;
  fetchOrders: () => Promise<void>;
  getOrderById: (id: string) => Order | undefined;
  getOrdersByContactId: (contactId: string) => Order[];
  createOrderItem: (orderItem: any) => Promise<any>;
  sendOrderEmail: (orderId: string, emailData: any) => Promise<boolean>;
  generateOrderReference: () => string;
}
