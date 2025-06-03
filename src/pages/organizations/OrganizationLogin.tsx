
import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useOrganizations } from "@/context/organizations/OrganizationsContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { OrganizationContainer } from "@/components/organizations/OrganizationContainer";
import { LoginForm } from "@/components/organizations/LoginForm";
import { useToast } from "@/hooks/use-toast";

const OrganizationLogin = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { 
    getOrganizationBySlug, 
    checkMembership, 
    setCurrentOrganization,
    currentOrganization 
  } = useOrganizations();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [organization, setOrganization] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [passwordVerifying, setPasswordVerifying] = useState(false);
  const [hasCheckedMembership, setHasCheckedMembership] = useState(false);
  
  const slug = searchParams.get("slug") || "belmorso";

  useEffect(() => {
    const loadOrganization = async () => {
      console.log("OrganizationLogin: Loading organization with slug:", slug);
      setLoading(true);
      
      try {
        const org = await getOrganizationBySlug(slug);
        console.log("OrganizationLogin: Organization loaded:", org);
        setOrganization(org);
        
        if (!org) {
          console.log("OrganizationLogin: No organization found");
          return;
        }

        // If user is authenticated and we found the organization, check membership
        if (isAuthenticated && user && !hasCheckedMembership) {
          console.log("OrganizationLogin: User authenticated, checking membership");
          setHasCheckedMembership(true);
          
          const isMember = await checkMembership(org.id);
          console.log("OrganizationLogin: Is member?", isMember);
          
          if (isMember) {
            console.log("OrganizationLogin: User is member, setting current org and navigating");
            setCurrentOrganization(org);
            navigate("/dashboard", { replace: true });
          } else {
            console.log("OrganizationLogin: User is not a member, password required");
          }
        }
      } catch (error) {
        console.error("OrganizationLogin: Error loading organization:", error);
        toast({
          title: "Error",
          description: "Failed to load organization",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadOrganization();
  }, [slug, getOrganizationBySlug, isAuthenticated, user, hasCheckedMembership, checkMembership, setCurrentOrganization, navigate, toast]);

  const addUserToOrganization = async (organizationId: string) => {
    if (!user) {
      console.error("OrganizationLogin: No user to add to organization");
      return false;
    }

    try {
      console.log("OrganizationLogin: Adding user to organization:", organizationId);
      
      const { error } = await supabase
        .from('organization_members')
        .insert({
          user_id: user.id,
          organization_id: organizationId,
          role: 'member'
        });

      if (error) {
        console.error("OrganizationLogin: Error adding user to organization:", error);
        toast({
          title: "Error",
          description: "Failed to join organization",
          variant: "destructive",
        });
        return false;
      }

      console.log("OrganizationLogin: Successfully added user to organization");
      return true;
      
    } catch (error) {
      console.error("OrganizationLogin: Error in addUserToOrganization:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    }
  };

  const handlePasswordSubmit = async (password: string) => {
    if (!organization || !user) {
      console.error("OrganizationLogin: Missing organization or user for password submit");
      return;
    }
    
    setPasswordVerifying(true);
    
    try {
      console.log("OrganizationLogin: Verifying password for organization:", organization.id);
      
      const { data: isValidPassword, error } = await supabase
        .rpc('check_organization_password', {
          org_id: organization.id,
          password: password
        });

      if (error) {
        console.error("OrganizationLogin: Error checking password:", error);
        toast({
          title: "Error",
          description: "Failed to verify password",
          variant: "destructive",
        });
        return;
      }

      if (!isValidPassword) {
        console.log("OrganizationLogin: Invalid password provided");
        toast({
          title: "Invalid Password",
          description: "The password you entered is incorrect.",
          variant: "destructive",
        });
        return;
      }

      console.log("OrganizationLogin: Password verified successfully");

      // Check if user is already a member
      const isMember = await checkMembership(organization.id);
      
      if (!isMember) {
        console.log("OrganizationLogin: Adding user to organization");
        const success = await addUserToOrganization(organization.id);
        if (!success) {
          return;
        }
      } else {
        console.log("OrganizationLogin: User is already a member");
      }

      // Set as current organization and navigate
      const orgWithRole = { ...organization, role: 'member' as const };
      setCurrentOrganization(orgWithRole);
      
      console.log("OrganizationLogin: Navigating to dashboard");
      navigate("/dashboard", { replace: true });
      
    } catch (error) {
      console.error("OrganizationLogin: Error in password verification:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setPasswordVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner message="Loading organization..." />
      </div>
    );
  }

  if (!organization) {
    return (
      <OrganizationContainer 
        title="Organization Not Found"
        error={`The organization "${slug}" could not be found.`}
        showHomeButton={true}
        hideDefaultButtons={true}
      >
        <div />
      </OrganizationContainer>
    );
  }

  if (!isAuthenticated) {
    return (
      <OrganizationContainer 
        title="Authentication Required"
        description="You need to be logged in to access this organization."
        hideDefaultButtons={false}
      >
        <div />
      </OrganizationContainer>
    );
  }

  return (
    <OrganizationContainer 
      organization={organization}
      description="Enter the organization password to continue"
      hideDefaultButtons={true}
    >
      <LoginForm 
        onSubmit={handlePasswordSubmit}
        loading={passwordVerifying}
      />
    </OrganizationContainer>
  );
};

export default OrganizationLogin;
