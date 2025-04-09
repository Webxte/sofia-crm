
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useContacts } from "@/context/ContactsContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { contactFormSchema, ContactFormValues, ContactFormProps } from "./types";
import { Contact } from "@/types";

export const useContactForm = ({ initialData, contact, isEditing = false }: ContactFormProps) => {
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
      source: contact?.source || initialData?.source || (user?.name ? user.name : ""),
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
        source: contact.source || (user?.name ? user.name : ""),
        notes: contact.notes || "",
      });
    } else if (initialData) {
      // For new contacts, ensure source is set to user's name if available
      form.reset({
        ...initialData,
        source: initialData.source || (user?.name ? user.name : "")
      });
    }
  }, [initialData, contact, form, user?.name]);

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
      
      // Ensure source is set if not provided
      if (!values.source && user?.name) {
        values.source = user.name;
      }
      
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
        const newContact: Omit<Contact, "id"> = {
          ...values,
          ...agentData,
          createdAt: now,
          updatedAt: now
        };
        await addContact(newContact);
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
  
  return { form, onSubmit };
};
