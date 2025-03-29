
import { useOrdersFetch } from "./hooks/useOrdersFetch";
import { useOrderItems } from "./hooks/useOrderItems";
import { useOrderCreate } from "./hooks/useOrderCreate";
import { useOrderUpdate } from "./hooks/useOrderUpdate";
import { useOrderDelete } from "./hooks/useOrderDelete";
import { sendOrderEmail } from "./orderUtils";
import { useAuth } from "@/context/AuthContext";

export const useOrdersOperations = () => {
  const { isAuthenticated } = useAuth();
  const { orders, setOrders, loading, refreshOrders } = useOrdersFetch();
  const { createOrderItem } = useOrderItems();
  const { addOrder } = useOrderCreate(refreshOrders);
  const { updateOrder } = useOrderUpdate(refreshOrders);
  const { deleteOrder } = useOrderDelete(setOrders);

  return {
    orders,
    loading,
    refreshOrders,
    addOrder,
    updateOrder,
    deleteOrder,
    createOrderItem,
    sendOrderEmail
  };
};
