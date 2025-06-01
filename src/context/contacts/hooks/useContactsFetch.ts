
import { useState, useCallback } from "react";
import { Contact } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useOrganizations } from "@/context/organizations/OrganizationsContext";

export const useContactsFetch = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { currentOrganization } = useOrganizations();

  const fetchContacts = useCallback(async () => {
    if (!currentOrganization) {
      console.log("useContactsFetch: No current organization, skipping contacts fetch");
      setContacts([]);
      return;
    }

    try {
      setLoading(true);
      console.log("useContactsFetch: Fetching contacts for organization:", currentOrganization.id, currentOrganization.name);
      
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('useContactsFetch: Error fetching contacts:', error);
        throw error;
      }

      console.log("useContactsFetch: Raw contacts data from Supabase:", data);

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
        console.log("useContactsFetch: Formatted contact:", formatted);
        return formatted;
      });

      console.log(`useContactsFetch: Successfully formatted ${formattedContacts.length} contacts for organization ${currentOrganization.name}`);
      setContacts(formattedContacts);
    } catch (error) {
      console.error('useContactsFetch: Error in fetchContacts:', error);
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

  return {
    contacts,
    setContacts,
    loading,
    fetchContacts
  };
};
