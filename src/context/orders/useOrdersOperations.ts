
import { useOrdersFetch } from "./hooks/useOrdersFetch";
import { useOrderCRUD } from "./hooks/useOrderCRUD";

export const useOrdersOperations = () => {
  const { orders, loading, fetchOrders } = useOrdersFetch();
  const { createOrder, updateOrder, deleteOrder, loading: crudLoading } = useOrderCRUD();

  const refreshOrders = async () => {
    await fetchOrders();
  };

  const addOrder = async (orderData: Parameters<typeof createOrder>[0]) => {
    const result = await createOrder(orderData);
    await refreshOrders();
    return result;
  };

  const updateOrderWithRefresh = async (orderId: string, orderData: Parameters<typeof updateOrder>[1]) => {
    const result = await updateOrder(orderId, orderData);
    await refreshOrders();
    return result;
  };

  const deleteOrderWithRefresh = async (orderId: string) => {
    const result = await deleteOrder(orderId);
    await refreshOrders();
    return result;
  };

  return {
    orders,
    loading: loading || crudLoading,
    addOrder,
    updateOrder: updateOrderWithRefresh,
    deleteOrder: deleteOrderWithRefresh,
    refreshOrders,
    fetchOrders,
  };
};
