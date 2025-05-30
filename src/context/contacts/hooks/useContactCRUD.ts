
import { useCallback } from "react";
import { Contact } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useOrganizations } from "@/context/organizations/OrganizationsContext";
import { transformDatabaseContact, transformAppContact } from "../contactUtils";
import { useToast } from "@/hooks/use-toast";

export const useContactCRUD = (setContacts: React.Dispatch<React.SetStateAction<Contact[]>>) => {
  const { user } = useAuth();
  const { currentOrganization } = useOrganizations();
  const { toast } = useToast();

  const addContact = useCallback(async (contactData: Omit<Contact, "id" | "createdAt" | "updatedAt">): Promise<Contact | null> => {
    if (!user || !currentOrganization) {
      throw new Error("User or organization not found");
    }

    try {
      const dbContact = {
        ...transformAppContact(contactData),
        organization_id: currentOrganization.id,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("contacts")
        .insert([dbContact])
        .select()
        .single();

      if (error) throw error;

      const newContact = transformDatabaseContact(data);
      setContacts(prev => [newContact, ...prev]);
      
      console.log("Contact added successfully:", newContact.id);
      return newContact;
    } catch (error) {
      console.error("Error adding contact:", error);
      toast({
        title: "Error",
        description: "Failed to add contact. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  }, [user, currentOrganization, setContacts, toast]);

  const updateContact = useCallback(async (id: string, contactData: Partial<Contact>): Promise<Contact | null> => {
    if (!user || !currentOrganization) {
      throw new Error("User or organization not found");
    }

    try {
      const dbContact = transformAppContact(contactData);

      const { data, error } = await supabase
        .from("contacts")
        .update(dbContact)
        .eq("id", id)
        .eq("organization_id", currentOrganization.id)
        .select()
        .single();

      if (error) throw error;

      const updatedContact = transformDatabaseContact(data);
      setContacts(prev => prev.map(contact => 
        contact.id === id ? updatedContact : contact
      ));
      
      console.log("Contact updated successfully:", updatedContact.id);
      return updatedContact;
    } catch (error) {
      console.error("Error updating contact:", error);
      toast({
        title: "Error",
        description: "Failed to update contact. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  }, [user, currentOrganization, setContacts, toast]);

  const deleteContact = useCallback(async (id: string): Promise<boolean> => {
    if (!user || !currentOrganization) {
      throw new Error("User or organization not found");
    }

    try {
      const { error } = await supabase
        .from("contacts")
        .delete()
        .eq("id", id)
        .eq("organization_id", currentOrganization.id);

      if (error) throw error;

      setContacts(prev => prev.filter(contact => contact.id !== id));
      
      console.log("Contact deleted successfully:", id);
      return true;
    } catch (error) {
      console.error("Error deleting contact:", error);
      toast({
        title: "Error",
        description: "Failed to delete contact. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  }, [user, currentOrganization, setContacts, toast]);

  return {
    addContact,
    updateContact,
    deleteContact
  };
};
