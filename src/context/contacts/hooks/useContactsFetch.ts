
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
        
        // Check first if user is a member of the organization
        const { data: membershipData, error: membershipError } = await supabase
          .from('organization_members')
          .select('*')
          .eq('organization_id', organizationId)
          .eq('user_id', user.id)
          .single();
          
        if (membershipError) {
          console.error("Error checking organization membership:", membershipError);
          // If not a member, don't try to fetch contacts for this org
        } else if (membershipData) {
          console.log(`User is a member of organization ${organizationId}, role: ${membershipData.role}`);
          
          // Fetch contacts for organization
          const { data, error } = await supabase
            .from('contacts')
            .select('*')
            .eq('organization_id', organizationId);
            
          if (error) {
            console.error("Error fetching contacts by organization:", error);
          } else if (data && data.length > 0) {
            console.log(`Retrieved ${data.length} contacts for organization ${organizationId}`);
            contactData = data;
          } else {
            console.log(`No contacts found for organization ${organizationId}`);
          }
        } else {
          console.log(`User is not a member of organization ${organizationId}`);
        }
      }
      
      // If no contacts found with organization ID or no organization set,
      // try to find the Belmorso organization and fetch contacts for it
      if (contactData.length === 0) {
        console.log("No contacts found with organization ID, trying to find Belmorso organization");
        
        const { data: belmorsoOrg, error: belmorsoOrgError } = await supabase
          .from('organizations')
          .select('id')
          .eq('name', 'Belmorso')
          .single();
        
        if (belmorsoOrgError) {
          console.error("Error finding Belmorso organization:", belmorsoOrgError);
        } else if (belmorsoOrg) {
          console.log(`Found Belmorso organization: ${belmorsoOrg.id}`);
          
          // Check if user is a member of Belmorso
          const { data: membershipData, error: membershipError } = await supabase
            .from('organization_members')
            .select('*')
            .eq('organization_id', belmorsoOrg.id)
            .eq('user_id', user.id)
            .single();
            
          if (membershipError) {
            console.error("Error checking Belmorso membership:", membershipError);
          } else if (membershipData) {
            console.log(`User is a member of Belmorso, role: ${membershipData.role}`);
            
            // Fetch contacts for Belmorso
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
          } else {
            console.log("User is not a member of Belmorso organization");
          }
        }
      }
      
      // As a last resort, try to fetch all contacts without organization filter
      if (contactData.length === 0) {
        console.log("No contacts found for user organizations, trying to fetch all contacts");
        const { data: allContacts, error: allContactsError } = await supabase
          .from('contacts')
          .select('*');
        
        if (allContactsError) {
          console.error('Error fetching all contacts:', allContactsError);
        } else if (allContacts && allContacts.length > 0) {
          console.log(`Successfully fetched ${allContacts.length} contacts in total`);
          contactData = allContacts;
        } else {
          console.log("No contacts found in database");
        }
      }
      
      if (contactData.length > 0) {
        const processedContacts = processContacts(contactData || []);
        setContacts(processedContacts);
        setLoading(false);
        return processedContacts;
      }
      
      // If we still don't have contacts, create or get Belmorso organization
      let belmorsoOrgId = await ensureBelmorsoOrganization();
      
      // If we have a Belmorso ID, try to update contacts without org IDs
      if (belmorsoOrgId) {
        await assignContactsToOrg(belmorsoOrgId);
        
        // Try one more time to fetch contacts
        const { data: updatedContacts } = await supabase
          .from('contacts')
          .select('*')
          .eq('organization_id', belmorsoOrgId);
        
        if (updatedContacts && updatedContacts.length > 0) {
          console.log(`Found ${updatedContacts.length} contacts after assigning to Belmorso`);
          const processedContacts = processContacts(updatedContacts);
          setContacts(processedContacts);
          setLoading(false);
          return processedContacts;
        }
      }
      
      // Return empty array as last resort
      setContacts([]);
      return [];
    } catch (error) {
      console.error('Error in fetchContacts:', error);
      toast({
        title: "Error",
        description: "Failed to load contacts. Please try again later.",
        variant: "destructive",
      });
      setContacts([]);
      return [];
    } finally {
      setLoading(false);
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
        return existingOrg.id;
      }
      
      // Create Belmorso organization if it doesn't exist
      console.log("Creating Belmorso organization");
      const { data: newOrg, error: createError } = await supabase
        .from('organizations')
        .insert([{
          name: 'Belmorso',
          slug: 'belmorso'
        }])
        .select()
        .single();
      
      if (createError) {
        console.error('Error creating Belmorso organization:', createError);
        return null;
      }
      
      // Now create the organization member record to ensure access
      const userId = user?.id || (await supabase.auth.getUser()).data.user?.id;
      if (userId && newOrg) {
        const { error: memberError } = await supabase
          .from('organization_members')
          .insert([{
            organization_id: newOrg.id,
            user_id: userId,
            role: 'owner'
          }]);
          
        if (memberError) {
          console.error('Error creating organization member:', memberError);
        } else {
          console.log(`Created organization member for user ${userId} in organization ${newOrg.id}`);
        }
      }
      
      console.log("Created Belmorso organization with ID:", newOrg?.id);
      return newOrg?.id || null;
    } catch (err) {
      console.error("Error ensuring Belmorso organization:", err);
      return null;
    }
  };
  
  // Helper function to assign existing contacts to Belmorso organization
  const assignContactsToOrg = async (orgId: string) => {
    try {
      // Find contacts with no organization_id
      const { data: orphanedContacts } = await supabase
        .from('contacts')
        .select('id')
        .is('organization_id', null);
      
      if (!orphanedContacts || orphanedContacts.length === 0) {
        console.log("No orphaned contacts found");
        return;
      }
      
      console.log(`Found ${orphanedContacts.length} contacts without organization, assigning to Belmorso`);
      
      // Update each contact to assign to Belmorso
      const { error } = await supabase
        .from('contacts')
        .update({ organization_id: orgId })
        .is('organization_id', null);
      
      if (error) {
        console.error("Error assigning contacts to Belmorso:", error);
      } else {
        console.log("Successfully assigned orphaned contacts to Belmorso organization");
      }
    } catch (err) {
      console.error("Error assigning contacts to organization:", err);
    }
  };

  return {
    contacts,
    loading,
    fetchContacts,
    setContacts
  };
};
