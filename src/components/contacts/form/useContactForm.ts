import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useContacts } from "@/context/ContactsContext";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { contactFormSchema, ContactFormValues, ContactFormProps } from "./types";
import { Contact } from "@/types";

export const useContactForm = ({ initialData, contact, isEditing = false, onContactCreated }: ContactFormProps) => {
  const { addContact, updateContact } = useContacts();
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
      category: contact?.category || initialData?.category || "",
      notes: contact?.notes || initialData?.notes || "",
      contactType: contact?.contactType || initialData?.contactType || "lead",
    },
  });
  
  useEffect(() => {
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
        category: contact.category || "",
        notes: contact.notes || "",
        contactType: contact.contactType || "lead",
      });
    } else if (initialData) {
      form.reset({
        ...initialData,
        source: initialData.source || (user?.name ? user.name : "")
      });
    }
  }, [initialData, contact, form, user?.name]);

  const onSubmit = async (values: ContactFormValues) => {
    try {
      if (!user) {
        toast.error("Error", { description: "You must be logged in to add contacts" });
        return;
      }
      
      const contactData = {
        ...values,
        agentId: user.id,
        agentName: user.name || user.email || '',
        contactType: values.contactType || 'lead',
      };
      
      if (!values.source && user?.name) {
        contactData.source = user.name;
      }
      
      if (isEditing && contact) {
        await updateContact(contact.id, contactData);
        toast.success("Success", { description: "Contact updated successfully!" });
        // For editing, navigate is handled by the caller or we use onContactCreated
        if (onContactCreated) {
          onContactCreated({ ...contact, ...contactData });
        }
      } else {
        const now = new Date();
        const newContact: Omit<Contact, "id"> = {
          ...contactData,
          createdAt: now,
          updatedAt: now
        };
        
        const result = await addContact(newContact);
        
        if (result) {
          toast.success("Success", { description: "Contact created successfully!" });
          if (onContactCreated) {
            onContactCreated(result);
          }
        }
      }
    } catch (error) {
      console.error("Contact form submission error:", error);
      if (error instanceof Error && (error.message.includes('row-level security') || error.message.includes('permission'))) {
        toast.error("Permission Error", { description: "You don't have permission to perform this action." });
      } else {
        toast.error("Error", { description: isEditing ? "Failed to update contact." : "Failed to create contact." });
      }
    }
  };
  
  return { form, onSubmit };
};
