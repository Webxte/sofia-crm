
import { useState } from "react";
import { Contact } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { getContactsBySource } from "./contactUtils";
import Papa from "papaparse";

export const useContactsOperations = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

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
        source: contact.source,
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
        source: contactData.source,
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
        source: data.source,
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
      if (contactData.source !== undefined) updateData.source = contactData.source;
      
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
                source: data.source,
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

  // Import contacts from CSV file
  const importContactsFromCsv = async (file: File) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to import contacts",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      // Parse the CSV file
      const results = await new Promise<Papa.ParseResult<any>>((resolve, reject) => {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: resolve,
          error: reject,
        });
      });
      
      if (!results.data || results.data.length === 0) {
        toast({
          title: "Error",
          description: "The CSV file is empty or invalid",
          variant: "destructive",
        });
        return;
      }
      
      // Map CSV fields to contact fields
      const mappedContacts = results.data.map((row: any) => {
        // Get source from file if it exists or use filename as default
        const source = row.source || row.Source || file.name.split('.')[0];
        
        return {
          full_name: row.name || row.fullName || row.full_name || row["full name"] || row.Name || row["Full Name"] || '',
          company: row.company || row.Company || row.organization || row.Organization || '',
          email: row.email || row.Email || '',
          phone: row.phone || row.Phone || row.telephone || row.Telephone || '',
          mobile: row.mobile || row.Mobile || row.cell || row.Cell || '',
          address: row.address || row.Address || '',
          notes: row.notes || row.Notes || '',
          position: row.position || row.Position || row.title || row.Title || '',
          source: source,
          agent_id: user.id,
          agent_name: user.name || '',
        };
      });
      
      // Insert the contacts into Supabase
      const { data, error } = await supabase
        .from('contacts')
        .insert(mappedContacts)
        .select('*');
      
      if (error) {
        console.error('Error importing contacts:', error);
        toast({
          title: "Error",
          description: "Failed to import contacts",
          variant: "destructive",
        });
        return;
      }
      
      // Transform and add the new contacts to state
      const newContacts: Contact[] = data.map(contact => ({
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
        source: contact.source,
        createdAt: new Date(contact.created_at),
        updatedAt: new Date(contact.updated_at),
      }));
      
      setContacts(prevContacts => [...newContacts, ...prevContacts]);
      
      toast({
        title: "Success",
        description: `${newContacts.length} contacts imported successfully`,
      });
    } catch (err) {
      console.error('Unexpected error importing contacts:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred while importing contacts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    contacts,
    setContacts,
    loading,
    setLoading,
    refreshContacts,
    addContact,
    updateContact,
    deleteContact,
    importContactsFromCsv,
    getContactsBySource
  };
};
