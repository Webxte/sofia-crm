
import { Order } from "@/types";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { OrderEmailDialog } from "./email/OrderEmailDialog";
import { useContacts } from "@/context/ContactsContext";
import { useState } from "react";

interface EmailOrderButtonProps {
  order: Order;
}

export const EmailOrderButton = ({ order }: EmailOrderButtonProps) => {
  const { getContactById } = useContacts();
  const contact = getContactById(order.contactId);
  const [open, setOpen] = useState(false);
  
  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        className="w-full"
        onClick={() => setOpen(true)}
      >
        <Mail className="mr-2 h-4 w-4" /> Email
      </Button>
      
      <OrderEmailDialog 
        orderId={order.id} 
        reference={order.reference}
        customerEmail={contact?.email}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
};
