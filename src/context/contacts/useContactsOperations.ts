import { useState, useCallback } from "react";
import { Contact } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useOrganizations } from "@/context/organizations/OrganizationsContext";

export const useContactsOperations = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { currentOrganization } = useOrganizations();

  const fetchContacts = useCallback(async () => {
    if (!currentOrganization) {
      console.log("No current organization, skipping contacts fetch");
      return;
    }

    try {
      setLoading(true);
      console.log("Fetching contacts for organization:", currentOrganization.id);
      
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching contacts:', error);
        throw error;
      }

      const formattedContacts: Contact[] = (data || []).map(contact => ({
        id: contact.id,
        organizationId: contact.organization_id,
        fullName: contact.full_name || '',
        company: contact.company || '',
        email: contact.email || '',
        phone: contact.phone || '',
        mobile: contact.mobile || '',
        address: contact.address || '',
        notes: contact.notes || '',
        source: contact.source || '',
        position: contact.position || '',
        agentId: contact.agent_id || '',
        agentName: contact.agent_name || '',
        createdAt: new Date(contact.created_at),
        updatedAt: new Date(contact.updated_at),
      }));

      console.log("Fetched contacts:", formattedContacts.length);
      setContacts(formattedContacts);
    } catch (error) {
      console.error('Error in fetchContacts:', error);
      toast({
        title: "Error",
        description: "Failed to load contacts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [currentOrganization, toast]);

  const addContact = async (contactData: Omit<Contact, "id" | "createdAt" | "updatedAt">): Promise<Contact | null> => {
    if (!currentOrganization) {
      toast({
        title: "Error",
        description: "No organization selected",
        variant: "destructive",
      });
      return null;
    }

    try {
      const newContact = {
        full_name: contactData.fullName,
        company: contactData.company,
        email: contactData.email,
        phone: contactData.phone,
        mobile: contactData.mobile,
        address: contactData.address,
        notes: contactData.notes,
        source: contactData.source,
        position: contactData.position,
        agent_id: contactData.agentId || user?.id,
        agent_name: contactData.agentName || user?.user_metadata?.name || 'Unknown',
        organization_id: currentOrganization.id,
      };

      const { data, error } = await supabase
        .from('contacts')
        .insert([newContact])
        .select()
        .single();

      if (error) throw error;

      const formattedContact: Contact = {
        id: data.id,
        organizationId: data.organization_id,
        fullName: data.full_name || '',
        company: data.company || '',
        email: data.email || '',
        phone: data.phone || '',
        mobile: data.mobile || '',
        address: data.address || '',
        notes: data.notes || '',
        source: data.source || '',
        position: data.position || '',
        agentId: data.agent_id || '',
        agentName: data.agent_name || '',
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };

      setContacts(prev => [formattedContact, ...prev]);
      
      toast({
        title: "Success",
        description: "Contact added successfully",
      });

      return formattedContact;
    } catch (error) {
      console.error('Error adding contact:', error);
      toast({
        title: "Error",
        description: "Failed to add contact",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateContact = async (id: string, contactData: Partial<Contact>): Promise<Contact | null> => {
    try {
      const updateData = {
        full_name: contactData.fullName,
        company: contactData.company,
        email: contactData.email,
        phone: contactData.phone,
        mobile: contactData.mobile,
        address: contactData.address,
        notes: contactData.notes,
        source: contactData.source,
        position: contactData.position,
        agent_id: contactData.agentId,
        agent_name: contactData.agentName,
      };

      const { data, error } = await supabase
        .from('contacts')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const formattedContact: Contact = {
        id: data.id,
        organizationId: data.organization_id,
        fullName: data.full_name || '',
        company: data.company || '',
        email: data.email || '',
        phone: data.phone || '',
        mobile: data.mobile || '',
        address: data.address || '',
        notes: data.notes || '',
        source: data.source || '',
        position: data.position || '',
        agentId: data.agent_id || '',
        agentName: data.agent_name || '',
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };

      setContacts(prev => prev.map(contact => 
        contact.id === id ? formattedContact : contact
      ));

      toast({
        title: "Success",
        description: "Contact updated successfully",
      });

      return formattedContact;
    } catch (error) {
      console.error('Error updating contact:', error);
      toast({
        title: "Error",
        description: "Failed to update contact",
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteContact = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setContacts(prev => prev.filter(contact => contact.id !== id));
      
      toast({
        title: "Success",
        description: "Contact deleted successfully",
      });

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
  };

  const refreshContacts = async () => {
    await fetchContacts();
  };

  const importContactsFromCsv = async (file: File) => {
    // Implementation for CSV import would go here
    console.log("CSV import not yet implemented");
  };

  return {
    contacts,
    loading,
    fetchContacts,
    refreshContacts,
    addContact,
    updateContact,
    deleteContact,
    importContactsFromCsv,
  };
};
