
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Contact } from "@/types";
import { useContacts } from "@/context/ContactsContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

const contactFormSchema = z.object({
  fullName: z.string().min(2, {
    message: "Full name must be at least 2 characters.",
  }),
  company: z.string().optional(),
  position: z.string().optional(),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }).optional().nullable(),
  phone: z.string().optional().nullable(),
  mobile: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  source: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

interface ContactFormProps {
  initialData?: Partial<ContactFormValues>;
  contact?: Contact;
  isEditing?: boolean;
}

const ContactForm = ({ initialData, contact, isEditing = false }: ContactFormProps) => {
  const { addContact, updateContact } = useContacts();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      fullName: contact?.fullName || initialData?.fullName || "",
      company: contact?.company || initialData?.company || "",
      position: contact?.position || initialData?.position || "",
      email: contact?.email || initialData?.email || "",
      phone: contact?.phone || initialData?.phone || "",
      mobile: contact?.mobile || initialData?.mobile || "",
      address: contact?.address || initialData?.address || "",
      source: contact?.source || initialData?.source || "",
      notes: contact?.notes || initialData?.notes || "",
    },
  });
  
  useEffect(() => {
    // Update form values when initialData or contact changes
    if (contact) {
      form.reset({
        fullName: contact.fullName || "",
        company: contact.company || "",
        position: contact.position || "",
        email: contact.email || "",
        phone: contact.phone || "",
        mobile: contact.mobile || "",
        address: contact.address || "",
        source: contact.source || "",
        notes: contact.notes || "",
      });
    } else if (initialData) {
      form.reset(initialData);
    }
  }, [initialData, contact, form]);

  const onSubmit = async (values: ContactFormValues) => {
    try {
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to add contacts",
          variant: "destructive",
        });
        return;
      }
      
      // Add agent information
      const agentData = {
        agentId: user.id,
        agentName: user.name || ''
      };
      
      if (isEditing && contact) {
        // Update existing contact
        await updateContact(contact.id, { ...values, ...agentData });
        toast({
          title: "Success",
          description: "Contact updated successfully!",
        });
      } else {
        // Create new contact with current timestamp
        const now = new Date();
        await addContact({ 
          ...values, 
          ...agentData,
          createdAt: now,
          updatedAt: now
        });
        toast({
          title: "Success",
          description: "Contact created successfully!",
        });
      }
      navigate("/contacts");
    } catch (error) {
      toast({
        title: "Error",
        description: isEditing ? "Failed to update contact." : "Failed to create contact.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company</FormLabel>
                <FormControl>
                  <Input placeholder="Acme Corp" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="position"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Position</FormLabel>
                <FormControl>
                  <Input placeholder="Software Engineer" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="johndoe@example.com" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input placeholder="+1 (555) 123-4567" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="mobile"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mobile</FormLabel>
                <FormControl>
                  <Input placeholder="+1 (555) 987-6543" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input placeholder="123 Main St, Anytown, USA" {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="source"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Source</FormLabel>
                <FormControl>
                  <Input placeholder="LinkedIn, Referral, etc." {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Additional information" className="resize-none" {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">{isEditing ? "Update" : "Create"} Contact</Button>
      </form>
    </Form>
  );
};

export default ContactForm;
