
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useOrganizations } from "@/context/organizations/OrganizationsContext";
import { toast } from "@/hooks/use-toast";

export const useOrganizationAuth = (organizationId: string | undefined, organizationSlug: string | undefined) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { switchOrganization } = useOrganizations();
  
  /**
   * Verify organization password
   */
  const verifyPassword = async (password: string): Promise<boolean> => {
    if (!organizationId) return false;
    
    // Special case for Belmorso
    if (organizationSlug === 'belmorso' && password === 'Belmorso2024!') {
      console.log("Using hardcoded password verification for Belmorso");
      return true;
    }
    
    // For non-Belmorso orgs, check password with database function
    try {
      const { data: passwordCorrect, error: passwordError } = await supabase.rpc(
        'check_organization_password',
        {
          org_id: organizationId,
          password: password
        }
      );
      
      if (passwordError) {
        console.error("Password verification error:", passwordError);
        throw passwordError;
      }
      
      return passwordCorrect === true;
    } catch (error) {
      console.error("Error in verifyPassword:", error);
      return false;
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
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      console.log(`Attempting to verify password for organization: ${organizationName} (ID: ${organizationId})`);
      
      const isPasswordCorrect = await verifyPassword(password);
      
      if (isPasswordCorrect) {
        toast({
          title: "Success", 
          description: `Access granted to ${organizationName}`
        });
        
        // Switch to the organization
        console.log(`Switching to organization: ${organizationId}`);
        const success = await switchOrganization(organizationId);
        
        if (!success) {
          console.error("Failed to switch to organization");
          throw new Error("Failed to switch to organization");
        }
        
        return true;
      } else {
        setError("Incorrect password for this organization");
        return false;
      }
    } catch (error) {
      console.error("Error logging into organization:", error);
      setError("Failed to verify organization password");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle successful login navigation
   */
  const handleSuccessfulLogin = (isAuthenticated: boolean, userId: string | undefined) => {
    // If the user is already authenticated, redirect to dashboard
    if (isAuthenticated && userId) {
      navigate('/dashboard', { replace: true });
    } else {
      // Otherwise redirect to login
      navigate('/login', { replace: true });
    }
  };
  
  return {
    isSubmitting,
    error,
    setError,
    handleLogin,
    handleSuccessfulLogin
  };
};
