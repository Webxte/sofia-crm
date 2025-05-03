
import { useState, useCallback } from "react";
import { Contact } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useOrganizations } from "@/context/organizations/OrganizationsContext";
import { processContacts } from "../utils/contactDataProcessing";

export const useContactsFetch = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { currentOrganization } = useOrganizations();
  
  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      
      // Only fetch contacts if there's a current organization
      if (!currentOrganization) {
        console.log("No current organization, not fetching contacts");
        setContacts([]);
        setLoading(false);
        return [];
      }
      
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
      
      console.log(`Fetched ${data?.length || 0} contacts`);
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

  return {
    contacts,
    loading,
    fetchContacts,
    setContacts
  };
};
