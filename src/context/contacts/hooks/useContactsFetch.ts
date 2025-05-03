
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
      
      // First, try to fetch contacts with the current organization ID
      const { data: orgContacts, error: orgError } = await supabase
        .from('contacts')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .order('created_at', { ascending: false });
      
      // If there's an error or no contacts found, try fetching contacts with "Belmorso" organization
      if (orgError || (orgContacts && orgContacts.length === 0)) {
        console.log("No contacts found for current organization, checking for Belmorso organization");
        
        // First, find the Belmorso organization
        const { data: belmorsoOrg } = await supabase
          .from('organizations')
          .select('id')
          .eq('name', 'Belmorso')
          .single();
        
        if (belmorsoOrg) {
          console.log("Found Belmorso organization, fetching its contacts");
          
          const { data: belmorsoContacts, error: belmorsoError } = await supabase
            .from('contacts')
            .select('*')
            .eq('organization_id', belmorsoOrg.id)
            .order('created_at', { ascending: false });
          
          if (belmorsoError) {
            console.error('Error fetching Belmorso contacts:', belmorsoError);
            throw belmorsoError;
          }
          
          console.log(`Fetched ${belmorsoContacts?.length || 0} Belmorso contacts`);
          const processedContacts = processContacts(belmorsoContacts || []);
          setContacts(processedContacts);
          return belmorsoContacts;
        } else {
          console.log("Belmorso organization not found, creating it");
          
          // Create Belmorso organization if it doesn't exist
          const { data: newOrg, error: newOrgError } = await supabase
            .from('organizations')
            .insert([{
              name: 'Belmorso',
              slug: 'belmorso'
            }])
            .select()
            .single();
          
          if (newOrgError) {
            console.error('Error creating Belmorso organization:', newOrgError);
            throw newOrgError;
          }
          
          // Assign all unassigned contacts to Belmorso
          const { data: unassignedContacts } = await supabase
            .from('contacts')
            .select('*')
            .is('organization_id', null);
          
          if (unassignedContacts && unassignedContacts.length > 0) {
            const { error: updateError } = await supabase
              .from('contacts')
              .update({ organization_id: newOrg.id })
              .is('organization_id', null);
            
            if (updateError) {
              console.error('Error updating unassigned contacts:', updateError);
            } else {
              console.log(`Assigned ${unassignedContacts.length} contacts to Belmorso`);
              
              // Fetch the newly assigned contacts
              const { data: belmorsoContacts } = await supabase
                .from('contacts')
                .select('*')
                .eq('organization_id', newOrg.id)
                .order('created_at', { ascending: false });
              
              console.log(`Fetched ${belmorsoContacts?.length || 0} Belmorso contacts`);
              const processedContacts = processContacts(belmorsoContacts || []);
              setContacts(processedContacts);
              return belmorsoContacts;
            }
          }
        }
      } else {
        // Original organization contacts were found
        console.log(`Fetched ${orgContacts?.length || 0} contacts for current organization`);
        const processedContacts = processContacts(orgContacts || []);
        setContacts(processedContacts);
        return orgContacts;
      }
      
      // If we reach here, either there was an error or no contacts were found
      setContacts([]);
      return [];
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
