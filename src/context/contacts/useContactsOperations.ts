
import { useState, useEffect, useCallback } from "react";
import { Contact } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { 
  processContacts, 
  createContact, 
  updateContact, 
  deleteContact, 
  importContactsFromCsv as importContacts 
} from "./contactUtils";
import { useAuth } from "../AuthContext";

export const useContactsOperations = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAdmin } = useAuth();

  // Fetch contacts
  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      
      // If not logged in, return empty array
      if (!user) {
        setContacts([]);
        return [];
      }
      
      const query = supabase.from("contacts").select("*");
      
      // Only apply the filter for non-admin users
      // Admins can see all contacts
      if (!isAdmin) {
        query.eq("agent_name", user.name);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching contacts:", error);
        return [];
      }
      
      const processedContacts = processContacts(data || []);
      setContacts(processedContacts);
      return processedContacts;
    } catch (error) {
      console.error("Error in fetchContacts:", error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user, isAdmin]);

  // Refresh contacts on mount and when dependencies change
  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  // Add a new contact
  const addContact = async (contactData: Omit<Contact, "id">): Promise<Contact | null> => {
    try {
      const contact = await createContact(contactData);
      if (contact) {
        setContacts(prevContacts => [...prevContacts, contact]);
      }
      return contact;
    } catch (error) {
      console.error("Error adding contact:", error);
      return null;
    }
  };

  // Update an existing contact
  const updateContactById = async (id: string, contactData: Partial<Contact>): Promise<Contact | null> => {
    try {
      const updatedContact = await updateContact(id, contactData);
      if (updatedContact) {
        setContacts(prevContacts =>
          prevContacts.map(contact => (contact.id === id ? updatedContact : contact))
        );
      }
      return updatedContact;
    } catch (error) {
      console.error("Error updating contact:", error);
      return null;
    }
  };

  // Delete a contact
  const deleteContactById = async (id: string): Promise<boolean> => {
    try {
      const success = await deleteContact(id);
      if (success) {
        setContacts(prevContacts => prevContacts.filter(contact => contact.id !== id));
      }
      return success;
    } catch (error) {
      console.error("Error deleting contact:", error);
      return false;
    }
  };

  // Get a contact by ID
  const getContactById = useCallback((id: string): Contact | undefined => {
    return contacts.find(contact => contact.id === id);
  }, [contacts]);

  // Import contacts
  const importContactsFromCsv = async (file: File): Promise<number> => {
    try {
      const importedCount = await importContacts(file);
      
      // Refresh contacts after import
      await fetchContacts();
      
      return importedCount;
    } catch (error) {
      console.error("Error importing contacts:", error);
      return 0;
    }
  };

  return {
    contacts,
    loading,
    fetchContacts,
    refreshContacts: fetchContacts,
    addContact,
    updateContact: updateContactById,
    deleteContact: deleteContactById,
    getContactById,
    importContactsFromCsv,
  };
};
