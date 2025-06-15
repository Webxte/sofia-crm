import { useState } from "react";
import { Contact } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { EmailForm, EmailFormValues } from "./EmailForm";

interface ContactEmailDialogProps {
  contact: Contact;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ContactEmailDialog = ({ contact, open, onOpenChange }: ContactEmailDialogProps) => {
  const [isSending, setIsSending] = useState(false);
  
  const handleSubmit = async (values: EmailFormValues) => {
    if (!values.to) {
      toast.error("Missing Email", {
        description: "Contact does not have an email address.",
      });
      return;
    }
    
    setIsSending(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("send-contact-email", {
        body: {
          to: values.to,
          cc: values.cc,
          subject: values.subject,
          message: values.message,
          contactId: contact.id,
          contactName: contact.fullName || contact.company || "Customer",
          contactCompany: contact.company,
          // Add fromName and fromEmail to match the order email configuration
          fromName: "CRM System",
          fromEmail: "info@belmorso.eu"
        }
      });
      
      if (error) throw error;
      
      toast.success("Email Sent", {
        description: `Email successfully sent to ${contact.fullName || contact.email}`,
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error("Failed to Send Email", {
        description: "There was an error sending the email. Please try again.",
      });
    } finally {
      setIsSending(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Email to {contact.fullName || contact.email}</DialogTitle>
        </DialogHeader>
        
        <EmailForm 
          contact={contact}
          onSubmit={handleSubmit}
          isSending={isSending}
        />
      </DialogContent>
    </Dialog>
  );
};
