
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/context/SettingsContext";
import { Contact } from "@/types";

interface BulkEmailDialogProps {
  contacts: Contact[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BulkEmailDialog: React.FC<BulkEmailDialogProps> = ({
  contacts,
  open,
  onOpenChange,
}) => {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const { toast } = useToast();
  const { settings } = useSettings();
  const [isSending, setIsSending] = useState(false);
  
  // Filter out contacts without email addresses
  const validContacts = contacts.filter(contact => contact.email);
  const contactCount = validContacts.length;

  useEffect(() => {
    if (settings) {
      const companyName = settings.companyName || 'Our Company';
      let defaultMessage = settings.bulkEmailTemplate || 
        "Dear Customers,\n\nWe would like to inform you about [Subject].\n\n[Message]\n\nBest regards,\n[Company Name]";
      
      // Replace placeholders
      defaultMessage = defaultMessage
        .replace(/\[Company Name\]/g, companyName)
        .replace(/\[Subject\]/g, subject)
        .replace(/\[Message\]/g, '');
      
      setMessage(defaultMessage);
    }
  }, [settings, subject]);

  const handleSendEmails = async () => {
    if (contactCount === 0) {
      toast({
        title: "No Valid Recipients",
        description: "None of the selected contacts have email addresses.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      // Collect all valid email addresses
      const emailAddresses = validContacts.map(contact => contact.email as string);
      
      // Send a single email with all recipients in BCC
      const apiUrl = `/functions/send-contact-email`;
      const emailData = {
        to: settings?.companyEmail || emailAddresses[0], // Send to company email or first contact
        bcc: emailAddresses, // Add all contacts as BCC
        subject: subject,
        message: message,
      };

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailData),
      });

      if (!response.ok) {
        throw new Error("Failed to send bulk email");
      }

      toast({
        title: "Bulk Email Sent",
        description: `Successfully sent to ${contactCount} contacts as BCC.`,
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error("Error sending emails:", error);
      toast({
        title: "Error",
        description: "Failed to send bulk email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Send Bulk Email</DialogTitle>
          <DialogDescription>
            Send an email to {contactCount} contacts as BCC.
            {contactCount < contacts.length && (
              <p className="text-yellow-600 mt-1">
                Note: {contacts.length - contactCount} contacts without email addresses will be excluded.
              </p>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="subject" className="text-right">
              Subject
            </label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <label htmlFor="message" className="text-right mt-2">
              Message
            </label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="col-span-3 min-h-[100px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={handleSendEmails} 
            disabled={isSending || contactCount === 0}
          >
            {isSending ? "Sending..." : "Send Emails"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
