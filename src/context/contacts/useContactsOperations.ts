import { useState, useCallback } from "react";
import { Contact } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useOrganizations } from "@/context/organizations/OrganizationsContext";
import Papa from "papaparse";

export const useContactsOperations = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { currentOrganization } = useOrganizations();

  const fetchContacts = useCallback(async () => {
    if (!currentOrganization) {
      console.log("useContactsOperations: No current organization, skipping contacts fetch");
      return;
    }

    try {
      setLoading(true);
      console.log("useContactsOperations: Fetching contacts for organization:", currentOrganization.id, currentOrganization.name);
      
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('useContactsOperations: Error fetching contacts:', error);
        throw error;
      }

      console.log("useContactsOperations: Raw contacts data from Supabase:", data);

      const formattedContacts: Contact[] = (data || []).map(contact => {
        const formatted = {
          id: contact.id,
          organizationId: contact.organization_id,
          fullName: contact.full_name || '',
          company: contact.company || '',
          email: contact.email || '',
          phone: contact.phone || '',
          mobile: contact.mobile || '',
          position: contact.position || '',
          address: contact.address || '',
          source: contact.source || '',
          notes: contact.notes || '',
          agentId: contact.agent_id || '',
          agentName: contact.agent_name || '',
          createdAt: new Date(contact.created_at),
          updatedAt: new Date(contact.updated_at),
        };
        console.log("useContactsOperations: Formatted contact:", formatted);
        return formatted;
      });

      console.log(`useContactsOperations: Formatted ${formattedContacts.length} contacts for organization ${currentOrganization.name}`);
      setContacts(formattedContacts);
    } catch (error) {
      console.error('useContactsOperations: Error in fetchContacts:', error);
      toast({
        title: "Error",
        description: "Failed to load contacts. Please check your connection and try again.",
        variant: "destructive",
      });
      setContacts([]); // Set empty array on error
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
      console.log("useContactsOperations: Adding contact for organization:", currentOrganization.id);
      
      const newContact = {
        full_name: contactData.fullName,
        company: contactData.company,
        email: contactData.email,
        phone: contactData.phone,
        mobile: contactData.mobile,
        position: contactData.position,
        address: contactData.address,
        source: contactData.source,
        notes: contactData.notes,
        agent_id: contactData.agentId || user?.id,
        agent_name: contactData.agentName || user?.user_metadata?.name || 'Unknown',
        organization_id: currentOrganization.id,
      };

      console.log("useContactsOperations: Inserting contact data:", newContact);

      const { data, error } = await supabase
        .from('contacts')
        .insert([newContact])
        .select()
        .single();

      if (error) {
        console.error("useContactsOperations: Error inserting contact:", error);
        throw error;
      }

      console.log("useContactsOperations: Contact inserted successfully:", data);

      const formattedContact: Contact = {
        id: data.id,
        organizationId: data.organization_id,
        fullName: data.full_name || '',
        company: data.company || '',
        email: data.email || '',
        phone: data.phone || '',
        mobile: data.mobile || '',
        position: data.position || '',
        address: data.address || '',
        source: data.source || '',
        notes: data.notes || '',
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
      console.error('useContactsOperations: Error adding contact:', error);
      toast({
        title: "Error",
        description: "Failed to add contact. Please try again.",
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
        position: contactData.position,
        address: contactData.address,
        source: contactData.source,
        notes: contactData.notes,
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
        position: data.position || '',
        address: data.address || '',
        source: data.source || '',
        notes: data.notes || '',
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

  const sendContactEmail = async (contactId: string, emailData: any): Promise<boolean> => {
    // Implementation for sending contact emails would go here
    console.log("Contact email not yet implemented");
    return false;
  };

  const bulkUpdateContacts = async (contactIds: string[], updateData: Partial<Contact>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('contacts')
        .update({
          agent_id: updateData.agentId,
          agent_name: updateData.agentName,
          source: updateData.source,
        })
        .in('id', contactIds);

      if (error) throw error;

      // Refresh contacts to get updated data
      await refreshContacts();
      
      toast({
        title: "Success",
        description: `Updated ${contactIds.length} contacts`,
      });

      return true;
    } catch (error) {
      console.error('Error bulk updating contacts:', error);
      toast({
        title: "Error",
        description: "Failed to update contacts",
        variant: "destructive",
      });
      return false;
    }
  };

  const importContactsFromCsv = useCallback(async (file: File) => {
    if (!currentOrganization) {
      toast({
        title: "Error",
        description: "No organization selected",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("Starting CSV import for file:", file.name);
      
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          try {
            console.log("CSV parsed successfully, rows:", results.data.length);
            
            const contactsToInsert = (results.data as any[]).map(row => ({
              full_name: row.full_name || row.name || '',
              company: row.company || '',
              email: row.email || '',
              phone: row.phone || '',
              mobile: row.mobile || '',
              position: row.position || '',
              address: row.address || '',
              source: row.source || file.name.replace('.csv', ''),
              notes: row.notes || '',
              agent_id: user?.id,
              agent_name: user?.user_metadata?.name || 'Unknown',
              organization_id: currentOrganization.id,
            }));

            const { error } = await supabase
              .from('contacts')
              .insert(contactsToInsert);

            if (error) throw error;

            await refreshContacts();
            
            toast({
              title: "Import Successful",
              description: `Imported ${contactsToInsert.length} contacts from CSV.`,
            });
          } catch (error) {
            console.error("Error processing CSV data:", error);
            toast({
              title: "Import Error",
              description: "Failed to process CSV data. Please check the format.",
              variant: "destructive",
            });
          }
        },
        error: (error) => {
          console.error("CSV parsing error:", error);
          toast({
            title: "CSV Error",
            description: "Failed to parse CSV file. Please check the format.",
            variant: "destructive",
          });
        }
      });
    } catch (error) {
      console.error("Error importing contacts:", error);
      toast({
        title: "Import Error",
        description: "Failed to import contacts. Please try again.",
        variant: "destructive",
      });
    }
  }, [currentOrganization, user, toast, refreshContacts]);

  return {
    contacts,
    loading,
    addContact,
    updateContact,
    deleteContact,
    refreshContacts,
    fetchContacts,
    sendContactEmail,
    bulkUpdateContacts,
    importContactsFromCsv,
  };
};
