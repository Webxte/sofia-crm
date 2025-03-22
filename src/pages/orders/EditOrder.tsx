
import { useParams, Navigate } from "react-router-dom";
import { useOrders } from "@/context/OrdersContext";
import OrderForm from "@/components/orders/OrderForm";

const EditOrder = () => {
  const { id } = useParams();
  const { getOrderById } = useOrders();
  
  const order = id ? getOrderById(id) : undefined;
  
  if (!order) {
    return <Navigate to="/orders" replace />;
  }
  
  return <OrderForm order={order} isEditing />;
};

export default EditOrder;
