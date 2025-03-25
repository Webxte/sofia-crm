
import { Order } from "@/types";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { OrderEmailDialog } from "./OrderEmailDialog";
import { useContacts } from "@/context/ContactsContext";

interface EmailOrderButtonProps {
  order: Order;
}

export const EmailOrderButton = ({ order }: EmailOrderButtonProps) => {
  const { getContactById } = useContacts();
  const contact = getContactById(order.contactId);
  
  return (
    <OrderEmailDialog 
      orderId={order.id} 
      customerEmail={contact?.email} 
      orderReference={order.reference}
    />
  );
};
