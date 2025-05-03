
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
      console.log("Attempting to fetch contacts...");
      
      // Try to fetch ALL contacts regardless of organization
      // This ensures we get data even if organization relationships aren't set up correctly
      const { data: allContacts, error: allContactsError } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (allContactsError) {
        console.error('Error fetching all contacts:', allContactsError);
        throw allContactsError;
      }
      
      if (allContacts && allContacts.length > 0) {
        console.log(`Successfully fetched ${allContacts.length} contacts`);
        const processedContacts = processContacts(allContacts || []);
        setContacts(processedContacts);
        setLoading(false);
        return allContacts;
      }
      
      // If we couldn't get any contacts, create a Belmorso organization as fallback
      console.log("No contacts found, attempting to create Belmorso organization");
      const { data: existingBelmorso } = await supabase
        .from('organizations')
        .select('id')
        .eq('name', 'Belmorso')
        .single();
      
      let belmorsoOrgId = existingBelmorso?.id;
      
      if (!belmorsoOrgId) {
        // Create Belmorso organization if it doesn't exist
        console.log("Creating Belmorso organization");
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
        
        belmorsoOrgId = newOrg.id;
        console.log("Created Belmorso organization with ID:", belmorsoOrgId);
      }
      
      // Return empty contacts since we couldn't find any
      setContacts([]);
      return [];
    } catch (error) {
      console.error('Error in fetchContacts:', error);
      toast({
        title: "Error",
        description: "Failed to load contacts. Please check console for details.",
        variant: "destructive",
      });
      setContacts([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    contacts,
    loading,
    fetchContacts,
    setContacts
  };
};
