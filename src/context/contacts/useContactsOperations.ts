import { useState, useCallback, useEffect } from "react";
import { Contact } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useOrganizations } from "@/context/organizations/OrganizationsContext";

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
    organizationId: item.organization_id,
    createdAt: new Date(item.created_at),
    updatedAt: new Date(item.updated_at)
  }));
};

// Create, Update, Delete functions for contacts
const createContact = async (contactData: Omit<Contact, "id" | "createdAt" | "updatedAt">): Promise<Contact | null> => {
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
    organization_id: contactData.organizationId,
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
    organizationId: data.organization_id,
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
    organizationId: data.organization_id,
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
const importContactsFromCsv = async (file: File): Promise<void> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        if (!event.target || !event.target.result) {
          reject(new Error("Failed to read file"));
          return;
        }
        
        const csvData = event.target.result as string;
        const lines = csvData.split("\n");
        
        // Extract headers and parse data
        const headers = lines[0].split(",").map(header => header.trim().toLowerCase());
        
        const contacts = [];
        
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          const values = line.split(",");
          const contact: Record<string, any> = {};
          
          for (let j = 0; j < headers.length; j++) {
            contact[headers[j]] = values[j]?.trim() || null;
          }
          
          // Map CSV fields to database columns
          const contactData = {
            full_name: contact.fullname || contact.full_name || contact.name || null,
            email: contact.email || null,
            phone: contact.phone || null,
            mobile: contact.mobile || contact.cell || null,
            address: contact.address || null,
            company: contact.company || contact.organization || null,
            position: contact.position || contact.title || contact.job_title || null,
            notes: contact.notes || null,
            source: contact.source || "CSV Import",
            // Will be added by RLS or the server function
          };
          
          contacts.push(contactData);
        }
        
        // Batch insert to Supabase
        if (contacts.length > 0) {
          const { error } = await supabase
            .from('contacts')
            .insert(contacts);
          
          if (error) {
            console.error('Error importing contacts:', error);
            reject(error);
            return;
          }
          
          resolve();
        } else {
          reject(new Error("No valid contacts found in CSV"));
        }
      } catch (error) {
        console.error('Error processing CSV:', error);
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error("Error reading file"));
    };
    
    reader.readAsText(file);
  });
};

export const useContactsOperations = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { currentOrganization } = useOrganizations();
  
  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      
      // Only fetch contacts if there's a current organization
      if (!currentOrganization) {
        setContacts([]);
        setLoading(false);
        return [];
      }
      
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('organization_id', currentOrganization.id)
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
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast, currentOrganization]);
  
  // Refetch contacts when the currentOrganization changes
  useEffect(() => {
    if (currentOrganization) {
      fetchContacts();
    }
  }, [currentOrganization, fetchContacts]);
  
  const refreshContacts = useCallback(async () => {
    return await fetchContacts();
  }, [fetchContacts]);
  
  const addContact = useCallback(async (contactData: Omit<Contact, "id" | "createdAt" | "updatedAt">) => {
    try {
      // Ensure organization_id is set
      const dataWithOrg = {
        ...contactData,
        organizationId: currentOrganization?.id
      };
      
      const newContact = await createContact(dataWithOrg);
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
  }, [toast, currentOrganization]);
  
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
