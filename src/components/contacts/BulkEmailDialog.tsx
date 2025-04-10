
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { Loader2, Send } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Contact } from "@/types";
import { useSettings } from "@/context/SettingsContext";

// Schema definition
const bulkEmailFormSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(1, "Message is required"),
});

type BulkEmailFormValues = z.infer<typeof bulkEmailFormSchema>;

interface BulkEmailDialogProps {
  contacts: Contact[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BulkEmailDialog = ({ contacts, open, onOpenChange }: BulkEmailDialogProps) => {
  const { toast } = useToast();
  const { settings } = useSettings();
  const [isSending, setIsSending] = useState(false);
  const [validContacts, setValidContacts] = useState<Contact[]>([]);
  
  useEffect(() => {
    // Filter contacts that have email addresses
    const filtered = contacts.filter(contact => contact.email && contact.email.trim() !== "");
    setValidContacts(filtered);
  }, [contacts]);
  
  const form = useForm<BulkEmailFormValues>({
    resolver: zodResolver(bulkEmailFormSchema),
    defaultValues: {
      subject: "Important Announcement",
      message: `Dear Valued Customers,

We wanted to share some important information with you.

[Your message here]

Best regards,
${settings.companyName || "Our Company"}`,
    },
  });
  
  const handleSubmit = async (values: BulkEmailFormValues) => {
    if (validContacts.length === 0) {
      toast({
        title: "No Valid Recipients",
        description: "None of the selected contacts have email addresses.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSending(true);
    
    try {
      // Collect all email addresses
      const allEmails = validContacts.map(contact => contact.email as string);
      
      // Use the first email as the main recipient and the rest as BCC
      const mainRecipient = allEmails[0];
      const bccRecipients = allEmails.slice(1);
      
      const { data, error } = await supabase.functions.invoke("send-contact-email", {
        body: {
          to: mainRecipient,
          subject: values.subject,
          message: values.message,
          bcc: bccRecipients,
          contactId: validContacts[0].id,
          contactName: "All Customers",
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Bulk Email Sent",
        description: `Email successfully sent to ${validContacts.length} contacts`,
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error("Error sending bulk email:", error);
      toast({
        title: "Failed to Send Email",
        description: "There was an error sending the bulk email. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Send Bulk Email to Contacts</DialogTitle>
        </DialogHeader>
        
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            You're about to send an email to {validContacts.length} contacts with valid email addresses.
            {contacts.length !== validContacts.length && (
              <span className="text-amber-500"> Note: {contacts.length - validContacts.length} contacts were excluded because they don't have email addresses.</span>
            )}
          </p>
        </div>
        
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
                      placeholder="Your message to all contacts"
                      className="min-h-[200px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    All recipients will be added to BCC for privacy.
                  </FormDescription>
                </FormItem>
              )}
            />
            
            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={isSending || validContacts.length === 0}>
                {isSending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send to {validContacts.length} Contacts
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
