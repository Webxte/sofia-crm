
import { useState, useEffect } from "react";
import { useOrders } from "@/context/OrdersContext";
import { useContacts } from "@/context/ContactsContext";
import { useToast } from "@/hooks/use-toast";
import { EmailFormValues } from "./emailSchema";
import { generateDefaultEmailContent, generateDefaultEmailSubject } from "./emailUtils";
import { supabase } from "@/integrations/supabase/client";

interface UseOrderEmailProps {
  orderId: string;
  customerEmail?: string;
  orderReference?: string;
}

export const useOrderEmail = ({ orderId, customerEmail, orderReference }: UseOrderEmailProps) => {
  const [open, setOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [loadingCustomerEmail, setLoadingCustomerEmail] = useState(false);
  const { orders } = useOrders();
  const { getContactById } = useContacts();
  const { toast } = useToast();
  
  // Get order and contact information
  const order = orders.find(o => o.id === orderId);
  const reference = orderReference || order?.reference || orderId.slice(0, 8);
  const contact = order ? getContactById(order.contactId) : null;
  const contactName = contact?.fullName || contact?.company || "Customer";
  
  // Generate default values for the form
  const defaultValues = {
    recipient: customerEmail || "",
    cc: "",
    subject: generateDefaultEmailSubject(reference),
    message: generateDefaultEmailContent(order, contactName, reference),
  };
  
  // Fetch customer email if not provided
  useEffect(() => {
    const fetchCustomerEmail = async () => {
      if (!customerEmail && open) {
        setLoadingCustomerEmail(true);
        // If order exists and we have a contact with email
        if (order && order.contactId) {
          const contact = getContactById(order.contactId);
          if (contact && contact.email) {
            setDefaultValues(prev => ({
              ...prev,
              recipient: contact.email
            }));
          }
        }
        setLoadingCustomerEmail(false);
      }
    };
    
    fetchCustomerEmail();
  }, [orderId, customerEmail, open, order, getContactById]);
  
  // Set default values
  const [formValues, setDefaultValues] = useState(defaultValues);
  
  const handleSubmit = async (values: EmailFormValues) => {
    try {
      setIsSending(true);
      
      // Process CC email addresses
      const ccEmails = values.cc ? 
        values.cc.split(',').map(email => email.trim()).filter(email => email) : 
        [];
      
      console.log("Sending email with data:", {
        orderId,
        recipient: values.recipient,
        subject: values.subject,
        cc: ccEmails
      });
      
      const { data, error } = await supabase.functions.invoke('send-order-email', {
        body: {
          orderId,
          recipient: values.recipient,
          subject: values.subject,
          message: values.message,
          includeOrderDetails: true,
          cc: ccEmails
        }
      });
      
      if (error) {
        console.error("Error from edge function:", error);
        throw error;
      }
      
      console.log("Email function response:", data);
      
      toast({
        title: "Email Sent",
        description: `Order details sent to ${values.recipient}`,
      });
      
      setOpen(false);
      return true;
    } catch (error) {
      console.error("Error sending email:", error);
      toast({
        title: "Error",
        description: "An error occurred while sending the email. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSending(false);
    }
  };
  
  return {
    open,
    setOpen,
    isSending,
    loadingCustomerEmail,
    formValues,
    handleSubmit
  };
};
