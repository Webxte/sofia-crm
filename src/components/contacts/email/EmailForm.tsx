
import { Contact } from "@/types";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send } from "lucide-react";
import { z } from "zod";
import { useSettings } from "@/context/settings";
import { useEmailForm } from "./hooks/useEmailForm";
import { CcSection } from "./components/CcSection";
import { CustomLinksSection } from "./components/CustomLinksSection";

// Schema definition
export const emailFormSchema = z.object({
  to: z.string().email("Must be a valid email").min(1, "Required"),
  cc: z.array(z.string().email("Must be a valid email")),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(1, "Message is required"),
});

export type EmailFormValues = z.infer<typeof emailFormSchema>;

interface EmailFormProps {
  contact: Contact;
  onSubmit: (values: EmailFormValues) => Promise<void>;
  isSending: boolean;
}

export const EmailForm = ({ contact, onSubmit, isSending }: EmailFormProps) => {
  const { settings } = useSettings();
  const {
    form,
    newCc,
    setNewCc,
    selectedCustomLink,
    setSelectedCustomLink,
  } = useEmailForm(contact);
  
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
  
  const handleAddCustomLink = () => {
    if (!selectedCustomLink) return;
    
    const index = parseInt(selectedCustomLink, 10);
    const customLinks = settings.customLinks || [];
    
    if (index >= 0 && index < customLinks.length) {
      const link = customLinks[index];
      if (link.url && (link.description || link.name)) {
        const currentMessage = form.getValues("message");
        const linkDescription = link.description || link.name || '';
        const newMessage = currentMessage + `\n\n${linkDescription}: ${link.url}`;
        form.setValue("message", newMessage);
      }
    }
    
    setSelectedCustomLink(null);
  };
  
  // Filter out empty custom links
  const availableCustomLinks = (settings.customLinks || [])
    .map((link, index) => ({ ...link, index }))
    .filter(link => link.url && (link.description || link.name));
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
        
        <CcSection
          newCc={newCc}
          setNewCc={setNewCc}
          ccEmails={form.getValues("cc")}
          onAddCc={handleAddCc}
          onRemoveCc={handleRemoveCc}
        />
        
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
        
        <CustomLinksSection
          availableCustomLinks={availableCustomLinks}
          selectedCustomLink={selectedCustomLink}
          setSelectedCustomLink={setSelectedCustomLink}
          onAddCustomLink={handleAddCustomLink}
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
  );
};
