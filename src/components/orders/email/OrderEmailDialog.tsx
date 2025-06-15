import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmailForm } from "./EmailForm";
import { useOrderEmail } from "./useOrderEmail";
import { useContacts } from "@/context/ContactsContext";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { getEmailPlaceholders, fillEmailTemplate } from "./emailUtils";

interface OrderEmailDialogProps {
  orderId: string;
  reference?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerEmail?: string;
}

export const OrderEmailDialog = ({ orderId, reference, open, onOpenChange, customerEmail }: OrderEmailDialogProps) => {
  const { 
    formValues, 
    handleSubmit,
    isSending,
    loadingCustomerEmail,
    order,
    contact
  } = useOrderEmail({ 
    orderId, 
    orderReference: reference,
    customerEmail
  });

  const handleFormSubmit = async (values: any) => {
    const contactName = contact?.fullName || contact?.company || "Customer";
    const companyName = contact?.company || "";
    const orderRef = reference || order?.reference || orderId.slice(0, 8);
    
    // Fill any template placeholders in the message
    const processedMessage = fillEmailTemplate(
      values.message,
      order!,
      contactName,
      companyName,
      orderRef
    );
    
    const success = await handleSubmit({
      ...values,
      message: processedMessage
    });
    
    if (success) {
      onOpenChange(false);
    }
    
    return success;
  };
  
  const placeholders = getEmailPlaceholders();
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Send Order Email</DialogTitle>
        </DialogHeader>
        
        {loadingCustomerEmail ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            <EmailForm
              defaultValues={formValues}
              onSubmit={handleFormSubmit}
              isSending={isSending}
            />
            
            <div className="border-t pt-4 space-y-2">
              <h4 className="font-medium text-sm">Available placeholders:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                {placeholders.map((placeholder) => (
                  <div key={placeholder.name} className="text-xs">
                    <span className="font-mono bg-muted p-1 rounded">{placeholder.name}</span>
                    <span className="text-muted-foreground ml-2">{placeholder.description}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
