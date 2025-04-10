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

interface BulkEmailDialogProps {
  contacts: { id: string; email: string }[];
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
    setIsSending(true);
    try {
      const emailPromises = contacts.map(async (contact) => {
        const apiUrl = `/functions/send-contact-email`;
        const emailData = {
          to: contact.email,
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
          console.error(`Failed to send email to ${contact.email}`);
          return false;
        }
        return true;
      });

      const results = await Promise.all(emailPromises);
      const successCount = results.filter(Boolean).length;
      const failureCount = contacts.length - successCount;

      toast({
        title: "Email Send Results",
        description: `Successfully sent to ${successCount} contacts. Failed to send to ${failureCount} contacts.`,
      });
    } catch (error) {
      console.error("Error sending emails:", error);
      toast({
        title: "Error",
        description: "Failed to send emails. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Send Bulk Email</DialogTitle>
          <DialogDescription>
            Send an email to {contacts.length} contacts.
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
          <Button type="button" onClick={handleSendEmails} disabled={isSending}>
            {isSending ? "Sending..." : "Send Emails"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
