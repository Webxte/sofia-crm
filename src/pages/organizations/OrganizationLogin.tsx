
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
  
  const slug = searchParams.get("slug") || "belmorso";

  useEffect(() => {
    const loadOrganization = async () => {
      console.log("Loading organization with slug:", slug);
      setLoading(true);
      
      try {
        const org = await getOrganizationBySlug(slug);
        console.log("Organization loaded:", org);
        setOrganization(org);
        
        // If user is authenticated and we found the organization
        if (isAuthenticated && user && org) {
          console.log("User already authenticated and organization found, attempting to navigate to dashboard");
          
          // Check if user is already a member
          const isMember = await checkMembership(org.id);
          
          if (isMember) {
            // User is already a member, set as current org and navigate
            setCurrentOrganization(org);
            navigate("/dashboard", { replace: true });
          } else {
            // User is not a member, add them to the organization
            console.log("User is not a member of this organization, adding them");
            await addUserToOrganization(org.id);
          }
        }
      } catch (error) {
        console.error("Error loading organization:", error);
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
  }, [slug, getOrganizationBySlug, isAuthenticated, user, checkMembership, setCurrentOrganization, navigate, toast]);

  const addUserToOrganization = async (organizationId: string) => {
    if (!user) return;

    try {
      console.log("Adding user to organization:", organizationId);
      
      const { error } = await supabase
        .from('organization_members')
        .insert({
          user_id: user.id,
          organization_id: organizationId,
          role: 'agent'
        });

      if (error) {
        console.error("Error adding user to organization:", error);
        toast({
          title: "Error",
          description: "Failed to join organization",
          variant: "destructive",
        });
        return;
      }

      console.log("Successfully added user to organization");
      
      // Set as current organization and navigate
      if (organization) {
        setCurrentOrganization(organization);
        navigate("/dashboard", { replace: true });
      }
      
    } catch (error) {
      console.error("Error in addUserToOrganization:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handlePasswordSubmit = async (password: string) => {
    if (!organization) return;
    
    setPasswordVerifying(true);
    
    try {
      // Check password using Supabase function
      const { data: isValidPassword, error } = await supabase
        .rpc('check_organization_password', {
          org_id: organization.id,
          password: password
        });

      if (error) {
        console.error("Error checking password:", error);
        toast({
          title: "Error",
          description: "Failed to verify password",
          variant: "destructive",
        });
        return;
      }

      if (!isValidPassword) {
        toast({
          title: "Invalid Password",
          description: "The password you entered is incorrect.",
          variant: "destructive",
        });
        return;
      }

      // Password is correct, add user to organization if not already a member
      if (user) {
        const isMember = await checkMembership(organization.id);
        
        if (!isMember) {
          await addUserToOrganization(organization.id);
        } else {
          // User is already a member, just set as current org and navigate
          setCurrentOrganization(organization);
          navigate("/dashboard", { replace: true });
        }
      }
      
    } catch (error) {
      console.error("Error in password verification:", error);
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
      >
        <div />
      </OrganizationContainer>
    );
  }

  // If user is not authenticated, redirect to login
  if (!isAuthenticated) {
    return (
      <OrganizationContainer 
        title="Authentication Required"
        description="You need to be logged in to access this organization."
        showHomeButton={true}
      >
        <button 
          onClick={() => navigate("/login")}
          className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90 w-full"
        >
          Go to Login
        </button>
      </OrganizationContainer>
    );
  }

  return (
    <OrganizationContainer 
      organization={organization}
      description="Enter the organization password to continue"
    >
      <LoginForm 
        onSubmit={handlePasswordSubmit}
        loading={passwordVerifying}
      />
    </OrganizationContainer>
  );
};

export default OrganizationLogin;
