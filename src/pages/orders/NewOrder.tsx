
import { useLocation } from "react-router-dom";
import OrderForm from "@/components/orders/OrderForm";

const NewOrder = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const contactId = queryParams.get("contactId");
  
  return <OrderForm contactId={contactId || undefined} />;
};

export default NewOrder;
