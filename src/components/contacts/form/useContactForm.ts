
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useContacts } from "@/context/ContactsContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useOrganizations } from "@/context/organizations/OrganizationsContext";
import { contactFormSchema, ContactFormValues, ContactFormProps } from "./types";
import { Contact } from "@/types";

export const useContactForm = ({ initialData, contact, isEditing = false }: ContactFormProps) => {
  const { addContact, updateContact } = useContacts();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentOrganization } = useOrganizations();
  
  console.log("useContactForm: Initializing with", {
    isEditing,
    hasUser: !!user,
    hasOrganization: !!currentOrganization,
    organizationId: currentOrganization?.id,
    organizationName: currentOrganization?.name
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
      console.log("Contact form submission started", {
        isEditing,
        hasUser: !!user,
        userId: user?.id,
        hasOrganization: !!currentOrganization,
        organizationId: currentOrganization?.id,
        organizationName: currentOrganization?.name,
        formValues: values
      });

      if (!user) {
        console.error("No user found for contact form submission");
        toast({
          title: "Error",
          description: "You must be logged in to add contacts",
          variant: "destructive",
        });
        return;
      }
      
      if (!currentOrganization) {
        console.error("No organization found for contact form submission");
        toast({
          title: "Error",
          description: "No organization selected. Please select an organization first.",
          variant: "destructive",
        });
        return;
      }
      
      // Add agent and organization information
      const contactData = {
        ...values,
        agentId: user.id,
        agentName: user.name || user.email || '',
        organizationId: currentOrganization.id
      };
      
      console.log("Contact data prepared for submission:", contactData);
      
      // Ensure source is set if not provided
      if (!values.source && user?.name) {
        contactData.source = user.name;
      }
      
      if (isEditing && contact) {
        // Update existing contact
        console.log("Updating existing contact:", contact.id);
        const result = await updateContact(contact.id, contactData);
        console.log("Contact update result:", result);
        
        toast({
          title: "Success",
          description: "Contact updated successfully!",
        });
      } else {
        // Create new contact with current timestamp
        console.log("Creating new contact");
        const now = new Date();
        const newContact: Omit<Contact, "id"> = {
          ...contactData,
          createdAt: now,
          updatedAt: now
        };
        
        console.log("Final contact data for creation:", newContact);
        
        const result = await addContact(newContact);
        console.log("Contact creation result:", result);
        
        if (result) {
          console.log("Contact created successfully with ID:", result.id);
          toast({
            title: "Success",
            description: "Contact created successfully!",
          });
        } else {
          console.error("Contact creation returned null result");
          toast({
            title: "Warning",
            description: "Contact may not have been created properly. Please check the contacts list.",
            variant: "destructive",
          });
        }
      }
      
      // Navigate back to contacts page
      console.log("Navigating to contacts page");
      navigate("/contacts");
      
    } catch (error) {
      console.error("Contact form submission error:", error);
      toast({
        title: "Error",
        description: isEditing ? "Failed to update contact." : "Failed to create contact.",
        variant: "destructive",
      });
    }
  };
  
  return { form, onSubmit };
};
