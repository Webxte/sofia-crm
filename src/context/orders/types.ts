
import { Order, OrderItem, Product } from "@/types";

export interface OrdersContextType {
  orders: Order[];
  loading: boolean;
  addOrder: (order: Omit<Order, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  updateOrder: (id: string, order: Partial<Order>) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  getOrderById: (id: string) => Order | undefined;
  getOrdersByContactId: (contactId: string) => Order[];
  createOrderItem: (productId: string, quantity: number) => OrderItem | undefined;
  sendOrderEmail: (orderId: string, recipient: string, subject: string, message: string) => Promise<boolean>;
  generateOrderReference: () => string;
  refreshOrders: () => Promise<void>;
}
