
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Contact } from "@/types";
import { useContacts } from "@/context/ContactsContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";

// Define the schema for contact validation
const contactSchema = z.object({
  fullName: z.string().optional(),
  company: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  address: z.string().optional(),
  position: z.string().optional(),
  notes: z.string().optional(),
  source: z.string().optional(),
}).refine(data => data.fullName || data.company, {
  message: "Either full name or company is required",
  path: ["fullName"],
});

type ContactFormValues = z.infer<typeof contactSchema>;

interface ContactFormProps {
  contact?: Contact;
  isEditing?: boolean;
}

const ContactForm = ({ contact, isEditing = false }: ContactFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addContact, updateContact } = useContacts();
  const { toast } = useToast();
  const navigate = useNavigate();

  const defaultValues: ContactFormValues = {
    fullName: contact?.fullName || "",
    company: contact?.company || "",
    email: contact?.email || "",
    phone: contact?.phone || "",
    mobile: contact?.mobile || "",
    address: contact?.address || "",
    position: contact?.position || "",
    notes: contact?.notes || "",
    source: contact?.source || "",
  };

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues,
  });

  const onSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true);
    
    try {
      if (isEditing && contact) {
        updateContact(contact.id, data);
        toast({
          title: "Success",
          description: "Contact updated successfully",
        });
      } else {
        addContact(data);
        toast({
          title: "Success",
          description: "Contact created successfully",
        });
      }
      navigate("/contacts");
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button 
          variant="outline" 
          size="icon" 
          className="mr-2"
          onClick={() => navigate("/contacts")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">
          {isEditing ? "Edit Contact" : "Add Contact"}
        </h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <Input placeholder="Acme Inc." {...field} />
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
                    <Input type="email" placeholder="john@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="+1 (555) 123-4567" {...field} />
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
                    <Input placeholder="+1 (555) 987-6543" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Position</FormLabel>
                  <FormControl>
                    <Input placeholder="Sales Manager" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="source"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Source/Tag</FormLabel>
                <FormControl>
                  <Input placeholder="Office1, Agent Name, etc." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input placeholder="123 Main St, City, Country" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Add any additional notes..." 
                    className="min-h-32" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate("/contacts")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : isEditing ? "Update Contact" : "Add Contact"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ContactForm;
