import { useState } from "react";
import { Meeting } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useContacts } from "@/context/contacts/ContactsContext";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { Loader2, Plus, Send, X } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Schema definition
const emailFormSchema = z.object({
  to: z.string().email("Must be a valid email").min(1, "Required"),
  cc: z.array(z.string().email("Must be a valid email")),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(1, "Message is required"),
});

type EmailFormValues = z.infer<typeof emailFormSchema>;

interface MeetingEmailDialogProps {
  meeting: Meeting;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MeetingEmailDialog = ({ meeting, open, onOpenChange }: MeetingEmailDialogProps) => {
  const { getContactById } = useContacts();
  const [isSending, setIsSending] = useState(false);
  const [newCc, setNewCc] = useState("");
  
  const contact = getContactById(meeting.contactId);
  
  const form = useForm<EmailFormValues>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: {
      to: contact?.email || "",
      cc: [],
      subject: `Follow-up: ${meeting.type} on ${format(new Date(meeting.date), 'MMMM d, yyyy')}`,
      message: `Dear ${contact?.fullName || "Customer"},

Thank you for the ${meeting.type} on ${format(new Date(meeting.date), 'MMMM d, yyyy')}.

${meeting.notes ? `We discussed: ${meeting.notes}\n\n` : ''}${meeting.followUpNotes ? `Next steps: ${meeting.followUpNotes}` : ''}

Please let me know if you have any questions.

Best regards,`,
    },
  });
  
  const handleAddCc = () => {
    if (newCc && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newCc)) {
      const currentCc = form.getValues("cc");
      if (!currentCc.includes(newCc)) {
        form.setValue("cc", [...currentCc, newCc]);
        setNewCc("");
      }
    }
  };
  
  const handleRemoveCc = (email: string) => {
    const currentCc = form.getValues("cc");
    form.setValue("cc", currentCc.filter(cc => cc !== email));
  };
  
  const handleSubmit = async (values: EmailFormValues) => {
    if (!values.to) {
      toast.error("Missing Email", {
        description: "Contact does not have an email address.",
      });
      return;
    }
    
    setIsSending(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("send-meeting-email", {
        body: {
          to: values.to,
          cc: values.cc,
          subject: values.subject,
          message: values.message,
          meetingId: meeting.id,
          meetingType: meeting.type,
          meetingDate: `${format(new Date(meeting.date), 'MMMM d, yyyy')} at ${meeting.time}`,
        }
      });
      
      if (error) throw error;
      
      toast.success("Email Sent", {
        description: `Email successfully sent to ${contact?.fullName || contact?.email || "contact"}`,
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
          <DialogTitle>Email about meeting with {contact?.fullName || contact?.company || "contact"}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="to"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>To</FormLabel>
                  <FormControl>
                    <Input placeholder="Email address" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <div>
              <FormLabel>CC</FormLabel>
              <div className="flex space-x-2 mb-2">
                <Input 
                  placeholder="Add CC email" 
                  value={newCc} 
                  onChange={(e) => setNewCc(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCc();
                    }
                  }}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleAddCc}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {form.getValues("cc").length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {form.getValues("cc").map((email) => (
                    <div 
                      key={email} 
                      className="bg-muted text-sm rounded-full px-3 py-1 flex items-center"
                    >
                      <span className="mr-1">{email}</span>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveCc(email)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
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
