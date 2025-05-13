
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
  const { isAuthenticated, isLoading, user } = useAuth();
  const [attemptsCount, setAttemptsCount] = useState(0);
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
    if (isAuthenticated && organization && attemptsCount === 0) {
      // Only try auto-switch on first attempt
      setAttemptsCount(prev => prev + 1);
      console.log("User already authenticated and organization found, attempting to navigate to dashboard");
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, organization, navigate, attemptsCount]);
  
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
        handleSuccessfulLogin(isAuthenticated, user?.id);
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
  if (!isLoaded || isLoading) {
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
