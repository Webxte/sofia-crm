
import { useCallback } from "react";
import { Contact } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useOrganizations } from "@/context/organizations/OrganizationsContext";
import { contactToDbRecord, processContacts } from "../utils/contactDataProcessing";

export const useContactCRUD = (setContacts: React.Dispatch<React.SetStateAction<Contact[]>>) => {
  const { toast } = useToast();
  const { currentOrganization } = useOrganizations();

  const addContact = useCallback(async (contactData: Omit<Contact, "id" | "createdAt" | "updatedAt">) => {
    try {
      // Ensure organization_id is set
      const dataWithOrg = {
        ...contactData,
        organizationId: currentOrganization?.id
      };
      
      const dbRecord = contactToDbRecord(dataWithOrg);
      
      const { data, error } = await supabase
        .from('contacts')
        .insert([dbRecord])
        .select()
        .single();

      if (error) {
        console.error('Error creating contact:', error);
        throw error;
      }

      if (!data) return null;
      
      const newContact = processContacts([data])[0];
      setContacts(prev => [newContact, ...prev]);
      
      return newContact;
    } catch (error) {
      console.error('Error adding contact:', error);
      toast({
        title: "Error",
        description: "Failed to add contact",
        variant: "destructive",
      });
      return null;
    }
  }, [toast, currentOrganization, setContacts]);

  const updateContact = useCallback(async (id: string, contactData: Partial<Contact>) => {
    try {
      const updates = contactToDbRecord(contactData);

      const { data, error } = await supabase
        .from('contacts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating contact:', error);
        throw error;
      }

      if (!data) return null;

      const updatedContact = processContacts([data])[0];
      setContacts(prev => prev.map(contact => 
        contact.id === id ? { ...contact, ...updatedContact } : contact
      ));
      
      return updatedContact;
    } catch (error) {
      console.error('Error updating contact:', error);
      toast({
        title: "Error",
        description: "Failed to update contact",
        variant: "destructive",
      });
      return null;
    }
  }, [toast, setContacts]);

  const deleteContact = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.from('contacts').delete().eq('id', id);
      
      if (error) {
        console.error('Error deleting contact:', error);
        throw error;
      }
      
      setContacts(prev => prev.filter(contact => contact.id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast({
        title: "Error",
        description: "Failed to delete contact",
        variant: "destructive",
      });
      return false;
    }
  }, [toast, setContacts]);

  return {
    addContact,
    updateContact,
    deleteContact
  };
};
