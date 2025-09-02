
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { useState } from "react";
import { Order } from "@/types";
import { OrderEmailDialog } from "./email/OrderEmailDialog";
import { useContacts } from "@/context/contacts/ContactsContext";
import OrderEmailErrorBoundary from "./OrderEmailErrorBoundary";

interface EmailOrderButtonProps {
  order: Order;
  size?: "default" | "sm" | "lg" | "icon";
}

export const EmailOrderButton = ({ order, size }: EmailOrderButtonProps) => {
  const [open, setOpen] = useState(false);
  const { getContactById } = useContacts();
  const contact = getContactById(order.contactId);
  
  return (
    <>
      <Button
        variant="outline"
        size={size || (size === "icon" ? "icon" : "default")}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        title="Send Email"
        className={size === "sm" ? "h-7 w-7" : ""}
      >
        {size === "icon" || size === "sm" ? (
          <Mail className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} />
        ) : (
          <>
            <Mail className="mr-2 h-4 w-4" /> Send
          </>
        )}
      </Button>

      <OrderEmailErrorBoundary onRetry={() => setOpen(false)}>
        <OrderEmailDialog
          orderId={order.id}
          reference={order.reference}
          customerEmail={contact?.email}
          open={open}
          onOpenChange={setOpen}
        />
      </OrderEmailErrorBoundary>
    </>
  );
};
