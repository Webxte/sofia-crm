
import { useOrdersFetch } from "./hooks/useOrdersFetch";
import { useOrderCRUD } from "./hooks/useOrderCRUD";

export const useOrdersOperations = () => {
  const { orders, setOrders, loading, fetchOrders } = useOrdersFetch();
  const { addOrder: addOrderBase, updateOrder: updateOrderBase, deleteOrder: deleteOrderBase, createOrderItem } = useOrderCRUD();

  // Wrap CRUD operations to pass setOrders
  const addOrder = (orderData: Parameters<typeof addOrderBase>[0]) => 
    addOrderBase(orderData, setOrders);

  const updateOrder = (id: string, orderData: Parameters<typeof updateOrderBase>[1]) => 
    updateOrderBase(id, orderData, setOrders, fetchOrders);

  const deleteOrder = (id: string) => 
    deleteOrderBase(id, setOrders);

  const refreshOrders = async () => {
    await fetchOrders();
  };

  return {
    orders,
    setOrders,
    loading,
    addOrder,
    updateOrder,
    deleteOrder,
    refreshOrders,
    fetchOrders,
    createOrderItem,
  };
};
