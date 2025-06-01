
import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { OrganizationContainer } from "@/components/organizations/OrganizationContainer";
import { LoginForm } from "@/components/organizations/LoginForm";
import { useOrganizationLoader } from "@/hooks/useOrganizationLoader";
import { useOrganizationAuth } from "@/hooks/useOrganizationAuth";
import { toast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

const DEFAULT_ORG_SLUG = "belmorso";

const OrganizationLogin = () => {
  const [searchParams] = useSearchParams();
  const slug = searchParams.get("slug") || DEFAULT_ORG_SLUG;
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [hasAttemptedRedirect, setHasAttemptedRedirect] = useState(false);
  const navigate = useNavigate();
  
  // Use our custom hooks for organization loading and authentication
  const { 
    organization, 
    isLoaded, 
    error, 
    setError 
  } = useOrganizationLoader(slug);
  
  const { 
    isSubmitting, 
    error: authError, 
    handleLogin, 
    handleSuccessfulLogin,
    attempts
  } = useOrganizationAuth(organization?.id, organization?.slug);

  // Use the combined error from both hooks
  const displayError = authError || error;
  
  // Effect to handle automatic redirect if already authenticated with an organization
  useEffect(() => {
    // Prevent multiple redirect attempts
    if (hasAttemptedRedirect) {
      return;
    }
    
    // Only run this effect when both auth and org data are loaded
    if (authLoading || !isLoaded) {
      return;
    }

    // If authenticated and organization exists, try auto-navigation
    if (isAuthenticated && organization) {
      setHasAttemptedRedirect(true);
      console.log("User already authenticated and organization found, attempting to navigate to dashboard");
      
      // Navigate to dashboard with a small delay to ensure state is properly set
      const timer = setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, organization, navigate, authLoading, isLoaded, hasAttemptedRedirect]);
  
  const handleSubmit = async (password: string) => {
    if (!organization) {
      toast({
        title: "Error",
        description: "Organization not found",
        variant: "destructive"
      });
      return;
    }
    
    try {
      console.log(`Submitting login for organization: ${organization.name}`);
      const success = await handleLogin(password, organization.name);
      
      if (success) {
        console.log("Login successful, navigating...");
        // Set the redirect flag to prevent loops
        setHasAttemptedRedirect(true);
        // Navigate after a short delay to ensure state updates
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 1000);
      } else {
        console.log("Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  // Show loading state
  if ((!isLoaded || authLoading) && !displayError) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner message="Loading organization..." />
      </div>
    );
  }

  // If no org found or error without an organization
  if (displayError && !organization) {
    return (
      <OrganizationContainer
        title="Organization Error"
        error={displayError}
        showHomeButton
      >
        <div>Please check the URL or contact support.</div>
      </OrganizationContainer>
    );
  }

  return (
    <>
      <Helmet>
        <title>{organization?.name || "Organization"} Login | CRM</title>
      </Helmet>
      
      <OrganizationContainer
        title={organization?.name || "Organization"}
        description="Enter the organization password to continue"
        error={displayError}
      >
        <LoginForm
          organization={organization}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          error={displayError}
        />
      </OrganizationContainer>
    </>
  );
};

export default OrganizationLogin;
