
import * as React from "react";
import { Organization, OrganizationInvite } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ToastActionElement } from "@/components/ui/toast";

// Define the Toast type locally
type ToastFunction = typeof toast;

interface Props {
  currentOrganization: Organization | null;
  toast: ToastFunction;
}

export const useOrganizationInvites = ({ 
  currentOrganization, 
  toast 
}: Props) => {
  const [invites, setInvites] = React.useState<OrganizationInvite[]>([]);
  
  // Fetch pending invites for the current organization
  const fetchOrganizationInvites = React.useCallback(async (organizationId: string) => {
    try {
      const { data, error } = await supabase
        .from('organization_invites')
        .select('*')
        .eq('organization_id', organizationId);
      
      if (error) throw error;
      
      // Format the invites
      const formattedInvites: OrganizationInvite[] = data.map(invite => ({
        id: invite.id,
        organizationId: invite.organization_id,
        email: invite.email,
        role: invite.role as OrganizationInvite['role'],
        token: invite.token,
        expiresAt: new Date(invite.expires_at),
        createdAt: new Date(invite.created_at),
        updatedAt: new Date(invite.updated_at)
      }));
      
      setInvites(formattedInvites);
    } catch (error) {
      console.error('Error fetching organization invites:', error);
    }
  }, []);
  
  return {
    invites,
    setInvites,
    fetchOrganizationInvites
  };
};
