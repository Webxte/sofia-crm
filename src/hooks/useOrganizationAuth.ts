
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useOrganizations } from "@/context/organizations/OrganizationsContext";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

export const useOrganizationAuth = (organizationId: string | undefined, organizationSlug: string | undefined) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const navigate = useNavigate();
  const { switchOrganization } = useOrganizations();
  const { isAuthenticated, user } = useAuth();
  const switchAttemptInProgress = useRef(false);
  const lastSuccessfulSwitch = useRef<string | null>(null);
  
  /**
   * Verify organization password
   */
  const verifyPassword = async (password: string): Promise<boolean> => {
    if (!organizationId) return false;
    
    try {
      console.log("Verifying password for organization:", organizationId);
      
      const { data: rpcResult, error: rpcError } = await supabase.rpc(
        'check_organization_password',
        {
          org_id: organizationId,
          password: password
        }
      );
      
      if (rpcError) {
        console.error("RPC error:", rpcError);
        return false;
      }
      
      console.log("Password verification result:", rpcResult);
      return rpcResult === true;
    } catch (error) {
      console.error("Error in verifyPassword:", error);
      return false;
    }
  };
  
  /**
   * Ensure user is a member of the organization
   */
  const ensureUserMembership = async (orgId: string) => {
    if (!user?.id) {
      console.log("No user ID available for membership check");
      return;
    }
    
    try {
      console.log(`Checking membership for user ${user.id} in organization ${orgId}`);
      
      // Check if the user is already a member
      const { data: existingMembership, error: membershipError } = await supabase
        .from('organization_members')
        .select('id, role')
        .eq('organization_id', orgId)
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (membershipError) {
        console.error('Error checking organization membership:', membershipError);
        return;
      }
      
      // If not a member, add them as owner
      if (!existingMembership) {
        console.log(`User ${user.id} is not a member of organization ${orgId}, adding as owner...`);
        
        const { error: addMemberError } = await supabase
          .from('organization_members')
          .insert({
            organization_id: orgId,
            user_id: user.id,
            role: 'owner'
          });
          
        if (addMemberError) {
          console.error('Error creating organization member:', addMemberError);
        } else {
          console.log(`Successfully created organization member for user ${user.id}`);
        }
      } else {
        console.log(`User ${user.id} is already a member with role: ${existingMembership.role}`);
      }
    } catch (err) {
      console.error("Error ensuring user membership:", err);
    }
  };
  
  /**
   * Handle organization login
   */
  const handleLogin = async (password: string, organizationName: string): Promise<boolean> => {
    if (!organizationId) {
      setError("Organization not found");
      return false;
    }
    
    // Prevent duplicate switches
    if (switchAttemptInProgress.current || lastSuccessfulSwitch.current === organizationId) {
      console.log("Switch attempt already in progress or recently completed");
      return lastSuccessfulSwitch.current === organizationId;
    }
    
    setIsSubmitting(true);
    setError(null);
    setAttempts(prev => prev + 1);
    switchAttemptInProgress.current = true;
    
    try {
      console.log(`Attempting to verify password for organization: ${organizationName} (ID: ${organizationId})`);
      
      const isPasswordCorrect = await verifyPassword(password);
      
      if (!isPasswordCorrect) {
        console.log("Password verification failed");
        setError("Incorrect password for this organization");
        return false;
      }
      
      console.log("Password verification successful");
      
      // Ensure the user is a member of this organization
      if (user?.id) {
        await ensureUserMembership(organizationId);
      }
      
      // Switch to the organization
      console.log(`Switching to organization: ${organizationId}`);
      
      const success = await switchOrganization(organizationId);
      
      if (success) {
        console.log("Successfully switched to organization");
        lastSuccessfulSwitch.current = organizationId;
        
        toast({
          title: "Success", 
          description: `Access granted to ${organizationName}`
        });
        
        return true;
      } else {
        console.error("Failed to switch to organization");
        setError("Failed to switch to organization");
        return false;
      }
    } catch (error: any) {
      console.error("Error logging into organization:", error);
      setError(error.message || "Failed to verify organization password");
      return false;
    } finally {
      setIsSubmitting(false);
      switchAttemptInProgress.current = false;
    }
  };

  /**
   * Handle successful login navigation
   */
  const handleSuccessfulLogin = (isAuthenticated: boolean, userId: string | undefined) => {
    if (isAuthenticated && userId) {
      console.log("User is authenticated, redirecting to dashboard");
      // Don't use setTimeout here as it's handled by the calling component
    } else {
      console.log("User is not authenticated, redirecting to login");
      navigate('/login', { replace: true });
    }
  };
  
  return {
    isSubmitting,
    error,
    setError,
    handleLogin,
    handleSuccessfulLogin,
    attempts
  };
};
