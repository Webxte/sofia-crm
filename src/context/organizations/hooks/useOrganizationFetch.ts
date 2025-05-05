
import { useState } from "react";
import { Organization } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

// Define the Toast type locally
type ToastFunction = typeof toast;

interface Props {
  setOrganizations: React.Dispatch<React.SetStateAction<Organization[]>>;
  setCurrentOrganization: React.Dispatch<React.SetStateAction<Organization | null>>;
  setOrganization: React.Dispatch<React.SetStateAction<Organization | null>>;
  toast: ToastFunction;
}

export const useOrganizationFetch = ({ 
  setOrganizations, 
  setCurrentOrganization, 
  setOrganization,
  toast 
}: Props) => {
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  // Fetch user's organizations
  const fetchOrganizations = async () => {
    try {
      if (!user) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      console.log("Fetching organizations for user:", user.id);
      
      // Get organizations the user is a member of
      const { data: memberData, error: memberError } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id);
      
      if (memberError) {
        console.error("Error fetching organization memberships:", memberError);
        throw memberError;
      }
      
      console.log("Found organization memberships:", memberData?.length || 0);
      
      if (memberData && memberData.length > 0) {
        const organizationIds = memberData.map(m => m.organization_id);
        
        const { data: orgsData, error: orgsError } = await supabase
          .from('organizations')
          .select('*')
          .in('id', organizationIds);
        
        if (orgsError) throw orgsError;
        
        // Format the organizations
        const formattedOrgs: Organization[] = orgsData.map(org => ({
          id: org.id,
          name: org.name,
          slug: org.slug,
          logoUrl: org.logo_url || undefined,
          primaryColor: org.primary_color || undefined,
          secondaryColor: org.secondary_color || undefined,
          createdAt: new Date(org.created_at),
          updatedAt: new Date(org.updated_at)
        }));
        
        console.log("Formatted organizations:", formattedOrgs.length);
        setOrganizations(formattedOrgs);
        
        // If there's an organization ID in local storage, set that as current
        const savedOrgId = localStorage.getItem('currentOrganizationId');
        const currentOrg = savedOrgId ? 
          formattedOrgs.find(org => org.id === savedOrgId) : 
          formattedOrgs[0] || null;
        
        console.log("Current organization set to:", currentOrg?.name || "none");
        
        if (currentOrg) {
          setCurrentOrganization(currentOrg);
          setOrganization(currentOrg);
          localStorage.setItem('currentOrganizationId', currentOrg.id);
        }
      } else {
        console.log("User has no organization memberships");
        setOrganizations([]);
        setCurrentOrganization(null);
        setOrganization(null);
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your organizations',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Get organization by slug
  const getOrganizationBySlug = async (slug: string): Promise<Organization | null> => {
    try {
      console.log("Getting organization by slug:", slug);
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('slug', slug)
        .single();
      
      if (error) {
        console.error("Error getting organization by slug:", error);
        throw error;
      }
      
      console.log("Found organization:", data?.name || "none");
      
      if (data) {
        const formattedOrg: Organization = {
          id: data.id,
          name: data.name,
          slug: data.slug,
          logoUrl: data.logo_url || undefined,
          primaryColor: data.primary_color || undefined,
          secondaryColor: data.secondary_color || undefined,
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at)
        };
        
        setOrganization(formattedOrg);
        return formattedOrg;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching organization by slug:', error);
      return null;
    }
  };
  
  return {
    fetchOrganizations,
    getOrganizationBySlug,
    loading
  };
};
