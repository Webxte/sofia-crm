
import { useState, useCallback } from "react";
import { Contact } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Define function to process contacts from Supabase response
const processContacts = (data: any[]): Contact[] => {
  return data.map(item => ({
    id: item.id,
    fullName: item.full_name,
    email: item.email,
    phone: item.phone,
    mobile: item.mobile,
    address: item.address,
    company: item.company,
    position: item.position,
    source: item.source,
    agentId: item.agent_id,
    agentName: item.agent_name,
    notes: item.notes,
    createdAt: new Date(item.created_at),
    updatedAt: new Date(item.updated_at)
  }));
};

// Create, Update, Delete functions for contacts
const createContact = async (contactData: Omit<Contact, "id">): Promise<Contact | null> => {
  const { data, error } = await supabase.from('contacts').insert([{
    full_name: contactData.fullName,
    email: contactData.email,
    phone: contactData.phone,
    mobile: contactData.mobile,
    address: contactData.address,
    company: contactData.company,
    position: contactData.position,
    source: contactData.source,
    agent_id: contactData.agentId,
    agent_name: contactData.agentName,
    notes: contactData.notes
  }]).select().single();

  if (error) {
    console.error('Error creating contact:', error);
    throw error;
  }

  if (!data) return null;

  return {
    id: data.id,
    fullName: data.full_name,
    email: data.email,
    phone: data.phone,
    mobile: data.mobile,
    address: data.address,
    company: data.company,
    position: data.position,
    source: data.source,
    agentId: data.agent_id,
    agentName: data.agent_name,
    notes: data.notes,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at)
  };
};

const updateContact = async (id: string, contactData: Partial<Contact>): Promise<Contact | null> => {
  const updates: any = {};
  
  // Map frontend model to database columns
  if (contactData.fullName !== undefined) updates.full_name = contactData.fullName;
  if (contactData.email !== undefined) updates.email = contactData.email;
  if (contactData.phone !== undefined) updates.phone = contactData.phone;
  if (contactData.mobile !== undefined) updates.mobile = contactData.mobile;
  if (contactData.address !== undefined) updates.address = contactData.address;
  if (contactData.company !== undefined) updates.company = contactData.company;
  if (contactData.position !== undefined) updates.position = contactData.position;
  if (contactData.source !== undefined) updates.source = contactData.source;
  if (contactData.agentId !== undefined) updates.agent_id = contactData.agentId;
  if (contactData.agentName !== undefined) updates.agent_name = contactData.agentName;
  if (contactData.notes !== undefined) updates.notes = contactData.notes;

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

  return {
    id: data.id,
    fullName: data.full_name,
    email: data.email,
    phone: data.phone,
    mobile: data.mobile,
    address: data.address,
    company: data.company,
    position: data.position,
    source: data.source,
    agentId: data.agent_id,
    agentName: data.agent_name,
    notes: data.notes,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at)
  };
};

const deleteContact = async (id: string): Promise<boolean> => {
  const { error } = await supabase.from('contacts').delete().eq('id', id);
  
  if (error) {
    console.error('Error deleting contact:', error);
    throw error;
  }
  
  return true;
};

// Import contacts from CSV
const importContactsFromCsv = async (file: File, mappings?: Record<string, string>): Promise<void> => {
  // This would be implemented with CSV parsing and batch insert
  console.log("Import functionality to be implemented", file, mappings);
};

export const useContactsOperations = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      const processedContacts = processContacts(data || []);
      setContacts(processedContacts);
      
      return data;
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast({
        title: "Error",
        description: "Failed to load contacts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);
  
  const refreshContacts = useCallback(async () => {
    return await fetchContacts();
  }, [fetchContacts]);
  
  const addContact = useCallback(async (contactData: Omit<Contact, "id">) => {
    try {
      const newContact = await createContact(contactData);
      if (newContact) {
        setContacts(prev => [newContact, ...prev]);
      }
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
  }, [toast]);
  
  const updateContactImpl = useCallback(async (id: string, contactData: Partial<Contact>) => {
    try {
      const updatedContact = await updateContact(id, contactData);
      if (updatedContact) {
        setContacts(prev => prev.map(contact => 
          contact.id === id ? { ...contact, ...updatedContact } : contact
        ));
      }
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
  }, [toast]);
  
  const deleteContactImpl = useCallback(async (id: string) => {
    try {
      const success = await deleteContact(id);
      if (success) {
        setContacts(prev => prev.filter(contact => contact.id !== id));
      }
      return success;
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast({
        title: "Error",
        description: "Failed to delete contact",
        variant: "destructive",
      });
      return false;
    }
  }, [toast]);
  
  const importContactsFromCsvImpl = useCallback(async (file: File) => {
    try {
      await importContactsFromCsv(file);
      await refreshContacts();
    } catch (error) {
      console.error('Error importing contacts:', error);
      toast({
        title: "Error",
        description: "Failed to import contacts",
        variant: "destructive",
      });
    }
  }, [refreshContacts, toast]);

  return {
    contacts,
    loading,
    fetchContacts,
    refreshContacts,
    addContact,
    updateContact: updateContactImpl,
    deleteContact: deleteContactImpl,
    importContactsFromCsv: importContactsFromCsvImpl
  };
};
