
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
        
        // With our new RLS policies, we can simply query the contacts table
        // The policies will automatically filter to only show contacts from the user's organization
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
      
      // If no current organization is set, try to find the Belmorso organization
      if (contactData.length === 0 && !organizationId) {
        console.log("No organization set, trying to find Belmorso organization");
        
        const { data: belmorsoOrg, error: belmorsoOrgError } = await supabase
          .from('organizations')
          .select('id')
          .eq('name', 'Belmorso')
          .single();
        
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
      
      // If we still don't have contacts and there's no organization,
      // create or ensure the Belmorso organization exists
      if (!organizationId) {
        let belmorsoOrgId = await ensureBelmorsoOrganization();
        
        if (belmorsoOrgId) {
          // Try to fetch contacts for the newly ensured Belmorso org
          const { data: updatedContacts, error } = await supabase
            .from('contacts')
            .select('*')
            .eq('organization_id', belmorsoOrgId);
          
          if (error) {
            console.error("Error fetching contacts after ensuring Belmorso:", error);
          } else if (updatedContacts && updatedContacts.length > 0) {
            console.log(`Found ${updatedContacts.length} contacts for Belmorso after ensuring it exists`);
            const processedContacts = processContacts(updatedContacts);
            setContacts(processedContacts);
            setLoading(false);
            return processedContacts;
          } else {
            console.log("No contacts found after ensuring Belmorso exists");
          }
        }
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

  // Helper function to ensure Belmorso organization exists
  const ensureBelmorsoOrganization = async () => {
    try {
      // First check if Belmorso org already exists
      const { data: existingOrg } = await supabase
        .from('organizations')
        .select('id')
        .eq('name', 'Belmorso')
        .maybeSingle();
      
      if (existingOrg?.id) {
        console.log("Found existing Belmorso organization:", existingOrg.id);
        
        // Ensure user is a member of the organization
        await ensureUserMembership(existingOrg.id);
        
        return existingOrg.id;
      }
      
      // Create Belmorso organization if it doesn't exist
      console.log("Creating Belmorso organization");
      const { data: newOrg, error: createError } = await supabase
        .from('organizations')
        .insert([{
          name: 'Belmorso',
          slug: 'belmorso',
          password: 'Belmorso2024!' // Adding default password for consistency
        }])
        .select()
        .single();
      
      if (createError) {
        console.error('Error creating Belmorso organization:', createError);
        return null;
      }
      
      if (newOrg) {
        // Ensure user is a member of the organization
        await ensureUserMembership(newOrg.id);
        console.log("Created Belmorso organization with ID:", newOrg.id);
        return newOrg.id;
      }
      
      return null;
    } catch (err) {
      console.error("Error ensuring Belmorso organization:", err);
      return null;
    }
  };
  
  // Helper function to ensure the current user is a member of the organization
  const ensureUserMembership = async (orgId: string) => {
    if (!user?.id) return;
    
    try {
      // Check if the user is already a member
      const { data: existingMembership, error: membershipError } = await supabase
        .from('organization_members')
        .select('id')
        .eq('organization_id', orgId)
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (membershipError) {
        console.error('Error checking organization membership:', membershipError);
        return;
      }
      
      // If not a member, add them
      if (!existingMembership) {
        const { error: addMemberError } = await supabase
          .from('organization_members')
          .insert([{
            organization_id: orgId,
            user_id: user.id,
            role: 'owner'
          }]);
          
        if (addMemberError) {
          console.error('Error creating organization member:', addMemberError);
        } else {
          console.log(`Created organization member for user ${user.id} in organization ${orgId}`);
        }
      }
    } catch (err) {
      console.error("Error ensuring user membership:", err);
    }
  };

  return {
    contacts,
    loading,
    fetchContacts,
    setContacts
  };
};
