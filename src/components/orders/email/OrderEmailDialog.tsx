
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useOrderEmail } from "./useOrderEmail";
import { EmailForm } from "./EmailForm";

interface OrderEmailDialogProps {
  orderId: string;
  customerEmail?: string;
  orderReference?: string;
  trigger?: React.ReactNode;
}

export const OrderEmailDialog = ({ 
  orderId, 
  customerEmail, 
  orderReference,
  trigger 
}: OrderEmailDialogProps) => {
  const {
    open,
    setOpen,
    isSending,
    loadingCustomerEmail,
    formValues,
    handleSubmit
  } = useOrderEmail({
    orderId,
    customerEmail,
    orderReference
  });
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Mail className="mr-2 h-4 w-4" /> Send Order Email
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Send Order Email</DialogTitle>
          <DialogDescription>
            Send the order details to the customer or your office.
          </DialogDescription>
        </DialogHeader>
        <EmailForm 
          defaultValues={formValues}
          onSubmit={handleSubmit}
          onCancel={() => setOpen(false)}
          isSending={isSending}
          loadingCustomerEmail={loadingCustomerEmail}
        />
      </DialogContent>
    </Dialog>
  );
};

// Helper imports
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
