
import { useOrdersFetch } from "./hooks/useOrdersFetch";
import { useOrderCRUD } from "./hooks/useOrderCRUD";
import { useOrderCreate } from "./hooks/useOrderCreate";
import { generateOrderReference } from "./orderUtils";

export const useOrdersOperations = () => {
  const { orders, setOrders, loading, fetchOrders } = useOrdersFetch();
  const { createOrder, updateOrder, deleteOrder, loading: crudLoading } = useOrderCRUD();
  const { addOrder } = useOrderCreate(fetchOrders);

  const refreshOrders = async () => {
    await fetchOrders();
  };

  return {
    orders,
    setOrders,
    loading: loading || crudLoading,
    addOrder,
    updateOrder,
    deleteOrder,
    refreshOrders,
    fetchOrders,
    generateOrderReference: () => generateOrderReference(orders, '', ''),
  };
};
