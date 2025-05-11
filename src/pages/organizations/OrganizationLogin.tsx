
import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { OrganizationContainer } from "@/components/organizations/OrganizationContainer";
import { LoginForm } from "@/components/organizations/LoginForm";
import { useOrganizationLoader } from "@/hooks/useOrganizationLoader";
import { useOrganizationAuth } from "@/hooks/useOrganizationAuth";

const OrganizationLogin = () => {
  const [searchParams] = useSearchParams();
  const slug = searchParams.get("slug");
  const { isAuthenticated, isLoading, user } = useAuth();
  
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
    handleSuccessfulLogin 
  } = useOrganizationAuth(organization?.id, organization?.slug);

  // Use the combined error from both hooks
  const displayError = authError || error;
  
  const handleSubmit = async (password: string) => {
    if (!organization) return;
    
    const success = await handleLogin(password, organization.name);
    
    if (success) {
      handleSuccessfulLogin(isAuthenticated, user?.id);
    }
  };

  // Show loading state
  if (!isLoaded || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p>Loading organization...</p>
        </div>
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
