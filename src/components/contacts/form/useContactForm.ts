import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useContacts } from "@/context/ContactsContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { contactFormSchema, ContactFormValues, ContactFormProps } from "./types";
import { Contact } from "@/types";

export const useContactForm = ({ initialData, contact, isEditing = false }: ContactFormProps) => {
  const { addContact, updateContact } = useContacts();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  console.log("useContactForm: Initializing with", {
    isEditing,
    hasUser: !!user,
    userId: user?.id
  });
  
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
        category: contact.category || "",
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
      console.log("useContactForm: Contact form submission started", {
        isEditing,
        hasUser: !!user,
        userId: user?.id,
        formValues: values
      });

      if (!user) {
        console.error("useContactForm: No user found for contact form submission");
        toast.error("Error", {
          description: "You must be logged in to add contacts",
        });
        return;
      }
      
      // Add agent information
      const contactData = {
        ...values,
        agentId: user.id,
        agentName: user.name || user.email || '',
      };
      
      console.log("useContactForm: Contact data prepared for submission:", {
        agentId: contactData.agentId
      });
      
      // Ensure source is set if not provided
      if (!values.source && user?.name) {
        contactData.source = user.name;
      }
      
      if (isEditing && contact) {
        // Update existing contact
        console.log("useContactForm: Updating existing contact:", contact.id);
        const result = await updateContact(contact.id, contactData);
        console.log("useContactForm: Contact update result:", !!result);
        
        toast.success("Success", {
          description: "Contact updated successfully!",
        });
      } else {
        // Create new contact with current timestamp
        console.log("useContactForm: Creating new contact");
        const now = new Date();
        const newContact: Omit<Contact, "id"> = {
          ...contactData,
          createdAt: now,
          updatedAt: now
        };
        
        console.log("useContactForm: Final contact data for creation:", {
          agentId: newContact.agentId,
          fullName: newContact.fullName,
          email: newContact.email
        });
        
        const result = await addContact(newContact);
        console.log("useContactForm: Contact creation result:", !!result);
        
        if (result) {
          console.log("useContactForm: Contact created successfully with ID:", result.id);
          toast.success("Success", {
            description: "Contact created successfully!",
          });
        } else {
          console.error("useContactForm: Contact creation returned null result");
          toast.warning("Warning", {
            description: "Contact may not have been created properly. Please check the contacts list.",
          });
        }
      }
      
      // Navigate back to contacts page
      console.log("useContactForm: Navigating to contacts page");
      navigate("/contacts");
      
    } catch (error) {
      console.error("useContactForm: Contact form submission error:", error);
      
      // Check if it's an RLS policy error
      if (error instanceof Error && (error.message.includes('row-level security') || error.message.includes('permission'))) {
        toast.error("Permission Error", {
          description: "You don't have permission to perform this action.",
        });
      } else {
        toast.error("Error", {
          description: isEditing ? "Failed to update contact." : "Failed to create contact.",
        });
      }
    }
  };
  
  return { form, onSubmit };
};
