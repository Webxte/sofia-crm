
import { Order, OrderItem } from "@/types";

export interface OrdersContextType {
  orders: Order[];
  loading: boolean;
  addOrder: (orderData: Omit<Order, "id" | "createdAt" | "updatedAt">) => Promise<Order | null>;
  updateOrder: (id: string, orderData: Partial<Order>) => Promise<Order | null>;
  deleteOrder: (id: string) => Promise<boolean>;
  getOrderById: (id: string) => Order | undefined;
  getOrdersByContactId: (contactId: string) => Order[];
  createOrderItem: (orderItem: Omit<OrderItem, "id">) => Promise<OrderItem | null>;
  sendOrderEmail: (orderId: string, emailData: any) => Promise<boolean>;
  generateOrderReference: () => string;
  refreshOrders: () => Promise<void>;
}
