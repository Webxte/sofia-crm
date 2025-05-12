
import { useState, useCallback } from "react";
import { Contact } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useOrganizations } from "@/context/organizations/OrganizationsContext";
import { processContacts } from "../utils/contactDataProcessing";
import { useAuth } from "@/context/AuthContext";

export const useContactsFetch = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { currentOrganization } = useOrganizations();
  const { user } = useAuth();
  
  const fetchContacts = useCallback(async () => {
    try {
      console.log("Starting contactsFetch...");
      console.log("Current user:", user?.id);
      console.log("Current organization:", currentOrganization?.id);
      
      setLoading(true);
      
      // Check if user is logged in
      if (!user?.id) {
        console.log("No user logged in, skipping contacts fetch");
        setContacts([]);
        setLoading(false);
        return [];
      }
      
      // First try to get contacts for current organization
      let contactData: any[] = [];
      let organizationId = currentOrganization?.id;
      
      if (organizationId) {
        console.log(`Fetching contacts for organization: ${organizationId}`);
        
        const { data, error } = await supabase
          .from('contacts')
          .select('*')
          .eq('organization_id', organizationId);
          
        if (error) {
          console.error("Error fetching contacts by organization:", error);
          throw error;
        } else if (data && data.length > 0) {
          console.log(`Retrieved ${data.length} contacts for organization ${organizationId}`);
          contactData = data;
        } else {
          console.log(`No contacts found for organization ${organizationId}`);
        }
      }
      
      // If we still don't have contacts, try to use agent_id as fallback
      if (contactData.length === 0) {
        console.log(`Trying fallback: Fetching contacts assigned to user ${user.id}`);
        
        const { data: agentData, error: agentError } = await supabase
          .from('contacts')
          .select('*')
          .eq('agent_id', user.id);
          
        if (agentError) {
          console.error("Error fetching contacts by agent ID:", agentError);
        } else if (agentData && agentData.length > 0) {
          console.log(`Retrieved ${agentData.length} contacts assigned to user ${user.id}`);
          contactData = agentData;
        } else {
          console.log(`No contacts found assigned to user ${user.id}`);
        }
      }
      
      // If we still don't have contacts and no organization, try to find the Belmorso organization
      if (contactData.length === 0 && !organizationId) {
        console.log("No organization set, trying to find Belmorso organization");
        
        const { data: belmorsoOrg, error: belmorsoOrgError } = await supabase
          .from('organizations')
          .select('id')
          .eq('name', 'Belmorso')
          .maybeSingle();
        
        if (belmorsoOrgError) {
          console.error("Error finding Belmorso organization:", belmorsoOrgError);
        } else if (belmorsoOrg) {
          console.log(`Found Belmorso organization: ${belmorsoOrg.id}`);
          
          // With our new RLS policies, try to fetch contacts for Belmorso
          const { data, error } = await supabase
            .from('contacts')
            .select('*')
            .eq('organization_id', belmorsoOrg.id);
            
          if (error) {
            console.error("Error fetching contacts for Belmorso:", error);
          } else if (data && data.length > 0) {
            console.log(`Retrieved ${data.length} contacts for Belmorso`);
            contactData = data;
          } else {
            console.log("No contacts found for Belmorso");
          }
        }
      }
      
      if (contactData.length > 0) {
        const processedContacts = processContacts(contactData || []);
        setContacts(processedContacts);
        setLoading(false);
        return processedContacts;
      }
      
      // Return empty array as last resort
      setContacts([]);
      setLoading(false);
      return [];
    } catch (error) {
      console.error('Error in fetchContacts:', error);
      toast({
        title: "Error",
        description: "Failed to load contacts. Please try again later.",
        variant: "destructive",
      });
      setContacts([]);
      setLoading(false);
      return [];
    }
  }, [currentOrganization, toast, user]);

  return {
    contacts,
    loading,
    fetchContacts,
    setContacts
  };
};
