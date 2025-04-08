
import { useState } from "react";
import { Contact, CustomLink } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { Loader2, Send, Plus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSettings } from "@/context/SettingsContext";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ContactEmailDialogProps {
  contact: Contact;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const emailFormSchema = z.object({
  to: z.string().email("Must be a valid email").min(1, "Required"),
  cc: z.array(z.string().email("Must be a valid email")),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(1, "Message is required"),
});

type EmailFormValues = z.infer<typeof emailFormSchema>;

export const ContactEmailDialog = ({ contact, open, onOpenChange }: ContactEmailDialogProps) => {
  const { settings } = useSettings();
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);
  const [newCc, setNewCc] = useState("");
  const [selectedCustomLink, setSelectedCustomLink] = useState<string | null>(null);
  
  const defaultSubject = "Follow-up from our meeting";
  
  // Create message with placeholders replaced
  const getDefaultMessage = () => {
    const defaultTemplate = settings.defaultContactEmailMessage || 
      `Dear [Name],

Thank you for your time during our recent meeting. As discussed, I've attached the links to our product catalog and price list.

Catalog: [Catalog URL]
Price List: [Price List URL]

Please don't hesitate to reach out if you have any questions.

Best regards,
[Company Name]`;
    
    // Replace placeholders with actual values
    return defaultTemplate
      .replace(/\[Name\]/g, contact.fullName || "valued customer")
      .replace(/\[Company Name\]/g, settings.companyName || "The Team")
      .replace(/\[Catalog URL\]/g, settings.catalogUrl || "[Catalog URL]")
      .replace(/\[Price List URL\]/g, settings.priceListUrl || "[Price List URL]");
  };
  
  const form = useForm<EmailFormValues>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: {
      to: contact.email || "",
      cc: [],
      subject: defaultSubject,
      message: getDefaultMessage(),
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
  
  const handleAddCustomLink = () => {
    if (!selectedCustomLink) return;
    
    const index = parseInt(selectedCustomLink, 10);
    const customLinks = settings.customLinks || [];
    
    if (index >= 0 && index < customLinks.length) {
      const link = customLinks[index];
      if (link.url && link.description) {
        const currentMessage = form.getValues("message");
        const newMessage = currentMessage + `\n\n${link.description}: ${link.url}`;
        form.setValue("message", newMessage);
      }
    }
    
    setSelectedCustomLink(null);
  };
  
  const handleSubmit = async (values: EmailFormValues) => {
    if (!values.to) {
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
  
  // Filter out empty custom links
  const availableCustomLinks = (settings.customLinks || [])
    .map((link, index) => ({ ...link, index }))
    .filter(link => link.url && link.description);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Email to {contact.fullName || contact.email}</DialogTitle>
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
            
            {availableCustomLinks.length > 0 && (
              <div className="flex items-end space-x-2">
                <div className="flex-1">
                  <FormLabel>Add Custom Link</FormLabel>
                  <Select value={selectedCustomLink || ""} onValueChange={setSelectedCustomLink}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a link to add" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCustomLinks.map((link, idx) => (
                        <SelectItem key={idx} value={String(link.index)}>
                          {link.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleAddCustomLink}
                  disabled={!selectedCustomLink}
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Link
                </Button>
              </div>
            )}
            
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
