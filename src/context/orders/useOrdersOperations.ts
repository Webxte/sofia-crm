
import { useOrdersFetch } from "./hooks/useOrdersFetch";
import { useOrderCRUD } from "./hooks/useOrderCRUD";
import { useOrderCreate } from "./hooks/useOrderCreate";
import { generateOrderReference } from "./orderUtils";

export const useOrdersOperations = () => {
  const { orders, setOrders, loading, fetchOrders } = useOrdersFetch();
  const { createOrder, updateOrder: crudUpdateOrder, deleteOrder: crudDeleteOrder, loading: crudLoading } = useOrderCRUD();
  const { addOrder: createOrderHook } = useOrderCreate(fetchOrders);

  const addOrder = async (orderData: any) => {
    await createOrderHook(orderData);
  };

  const updateOrder = async (id: string, orderData: any) => {
    await crudUpdateOrder(id, orderData);
    await fetchOrders(); // Refresh orders after update
  };

  const deleteOrder = async (id: string) => {
    await crudDeleteOrder(id);
    await fetchOrders(); // Refresh orders after delete
  };

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
