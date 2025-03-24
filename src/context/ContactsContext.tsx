
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Contact } from "@/types";
import { useAuth } from "./AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ContactsContextType {
  contacts: Contact[];
  loading: boolean;
  addContact: (contact: Omit<Contact, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  updateContact: (id: string, contact: Partial<Contact>) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;
  getContactById: (id: string) => Contact | undefined;
  getContactsByAgentId: (agentId: string) => Contact[];
  searchContacts: (query: string) => Contact[];
  refreshContacts: () => Promise<void>;
}

const ContactsContext = createContext<ContactsContextType | undefined>(undefined);

export const ContactsProvider = ({ children }: { children: ReactNode }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Fetch contacts when the component mounts or when user auth state changes
  useEffect(() => {
    if (isAuthenticated) {
      refreshContacts();
    } else {
      setContacts([]);
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Function to fetch contacts from Supabase
  const refreshContacts = async () => {
    try {
      setLoading(true);
      
      if (!isAuthenticated) {
        setContacts([]);
        return;
      }
      
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching contacts:', error);
        toast({
          title: "Error",
          description: "Failed to load contacts",
          variant: "destructive",
        });
        return;
      }
      
      // Transform the Supabase data to match our Contact type
      const formattedContacts: Contact[] = data.map(contact => ({
        id: contact.id,
        fullName: contact.full_name,
        company: contact.company,
        email: contact.email,
        phone: contact.phone,
        mobile: contact.mobile,
        address: contact.address,
        notes: contact.notes,
        position: contact.position,
        agentId: contact.agent_id,
        agentName: contact.agent_name,
        createdAt: new Date(contact.created_at),
        updatedAt: new Date(contact.updated_at),
      }));
      
      setContacts(formattedContacts);
    } catch (err) {
      console.error('Unexpected error fetching contacts:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred while loading contacts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addContact = async (contactData: Omit<Contact, "id" | "createdAt" | "updatedAt">) => {
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
        agent_id: user.id,
        agent_name: user.name || ''
      };
      
      // Convert Contact type to Supabase table format (snake_case)
      const newContactData = {
        full_name: contactData.fullName,
        company: contactData.company,
        email: contactData.email,
        phone: contactData.phone,
        mobile: contactData.mobile,
        address: contactData.address,
        notes: contactData.notes,
        position: contactData.position,
        ...agentData
      };
      
      const { data, error } = await supabase
        .from('contacts')
        .insert(newContactData)
        .select('*')
        .single();
      
      if (error) {
        console.error('Error adding contact:', error);
        toast({
          title: "Error",
          description: "Failed to add contact",
          variant: "destructive",
        });
        return;
      }
      
      // Transform and add the new contact to state
      const newContact: Contact = {
        id: data.id,
        fullName: data.full_name,
        company: data.company,
        email: data.email,
        phone: data.phone,
        mobile: data.mobile,
        address: data.address,
        notes: data.notes,
        position: data.position,
        agentId: data.agent_id,
        agentName: data.agent_name,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };
      
      setContacts(prevContacts => [newContact, ...prevContacts]);
      
      toast({
        title: "Success",
        description: "Contact added successfully",
      });
    } catch (err) {
      console.error('Unexpected error adding contact:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const updateContact = async (id: string, contactData: Partial<Contact>) => {
    try {
      // Convert Contact type to Supabase table format (snake_case)
      const updateData: any = {};
      
      if (contactData.fullName !== undefined) updateData.full_name = contactData.fullName;
      if (contactData.company !== undefined) updateData.company = contactData.company;
      if (contactData.email !== undefined) updateData.email = contactData.email;
      if (contactData.phone !== undefined) updateData.phone = contactData.phone;
      if (contactData.mobile !== undefined) updateData.mobile = contactData.mobile;
      if (contactData.address !== undefined) updateData.address = contactData.address;
      if (contactData.notes !== undefined) updateData.notes = contactData.notes;
      if (contactData.position !== undefined) updateData.position = contactData.position;
      
      // Add updated_at
      updateData.updated_at = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('contacts')
        .update(updateData)
        .eq('id', id)
        .select('*')
        .single();
      
      if (error) {
        console.error('Error updating contact:', error);
        toast({
          title: "Error",
          description: "Failed to update contact",
          variant: "destructive",
        });
        return;
      }
      
      // Update the contact in state
      setContacts(prevContacts => 
        prevContacts.map(contact => 
          contact.id === id 
            ? {
                ...contact,
                fullName: data.full_name,
                company: data.company,
                email: data.email,
                phone: data.phone,
                mobile: data.mobile,
                address: data.address,
                notes: data.notes,
                position: data.position,
                updatedAt: new Date(data.updated_at)
              }
            : contact
        )
      );
      
      toast({
        title: "Success",
        description: "Contact updated successfully",
      });
    } catch (err) {
      console.error('Unexpected error updating contact:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const deleteContact = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting contact:', error);
        toast({
          title: "Error",
          description: "Failed to delete contact",
          variant: "destructive",
        });
        return;
      }
      
      // Remove the contact from state
      setContacts(prevContacts => prevContacts.filter(contact => contact.id !== id));
      
      toast({
        title: "Success",
        description: "Contact deleted successfully",
      });
    } catch (err) {
      console.error('Unexpected error deleting contact:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const getContactById = (id: string) => {
    return contacts.find(contact => contact.id === id);
  };

  const getContactsByAgentId = (agentId: string) => {
    return contacts.filter(contact => contact.agentId === agentId);
  };

  const searchContacts = (query: string) => {
    if (!query) return contacts;
    
    const searchLower = query.toLowerCase();
    return contacts.filter(contact => {
      const fullName = contact.fullName?.toLowerCase() || '';
      const company = contact.company?.toLowerCase() || '';
      const email = contact.email?.toLowerCase() || '';
      const phone = contact.phone?.toLowerCase() || '';
      
      return fullName.includes(searchLower) || 
             company.includes(searchLower) || 
             email.includes(searchLower) || 
             phone.includes(searchLower);
    });
  };

  return (
    <ContactsContext.Provider
      value={{
        contacts,
        loading,
        addContact,
        updateContact,
        deleteContact,
        getContactById,
        getContactsByAgentId,
        searchContacts,
        refreshContacts,
      }}
    >
      {children}
    </ContactsContext.Provider>
  );
};

export const useContacts = () => {
  const context = useContext(ContactsContext);
  if (context === undefined) {
    throw new Error("useContacts must be used within a ContactsProvider");
  }
  return context;
};
