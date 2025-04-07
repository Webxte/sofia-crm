
import { useState } from "react";
import { Contact } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { Loader2, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSettings } from "@/context/SettingsContext";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

interface ContactEmailDialogProps {
  contact: Contact;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const emailFormSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(1, "Message is required"),
});

type EmailFormValues = z.infer<typeof emailFormSchema>;

export const ContactEmailDialog = ({ contact, open, onOpenChange }: ContactEmailDialogProps) => {
  const { settings } = useSettings();
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);
  
  const defaultSubject = "Follow-up from our meeting";
  const defaultMessage = settings.defaultContactEmailMessage || 
    `Dear ${contact.fullName || "valued customer"},

Thank you for your time during our recent meeting. As discussed, I've attached the links to our product catalog and price list.

Catalog: ${settings.catalogUrl || "[Catalog URL]"}
Price List: ${settings.priceListUrl || "[Price List URL]"}

Please don't hesitate to reach out if you have any questions.

Best regards,
${settings.companyName || "The Team"}`;
  
  const form = useForm<EmailFormValues>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: {
      subject: defaultSubject,
      message: defaultMessage,
    },
  });
  
  const handleSubmit = async (values: EmailFormValues) => {
    if (!contact.email) {
      toast({
        title: "Missing Email",
        description: "Contact does not have an email address.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSending(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("send-contact-email", {
        body: {
          to: contact.email,
          subject: values.subject,
          message: values.message,
          contactId: contact.id,
          contactName: contact.fullName || contact.company || "Customer"
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Email Sent",
        description: `Email successfully sent to ${contact.fullName || contact.email}`,
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error("Error sending email:", error);
      toast({
        title: "Failed to Send Email",
        description: "There was an error sending the email. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Email to {contact.fullName || contact.email}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormControl>
                    <Input placeholder="Email subject" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Your message"
                      className="min-h-[200px]"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={isSending}>
                {isSending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Email
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
