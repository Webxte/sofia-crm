
import { useLocation } from "react-router-dom";
import { SafeOrderForm } from "@/components/orders/SafeOrderForm";

const NewOrder = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const contactId = queryParams.get("contactId");
  
  return <SafeOrderForm contactId={contactId || undefined} />;
};

export default NewOrder;
