
import { Order } from "@/types";

export const getOrderById = (orders: Order[], id: string): Order | undefined => {
  return orders.find(order => order.id === id);
};

export const getOrdersByContactId = (orders: Order[], contactId: string): Order[] => {
  return orders.filter(order => order.contactId === contactId);
};
