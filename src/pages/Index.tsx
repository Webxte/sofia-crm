
import React, { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useOrganizations } from "@/context/organizations/OrganizationsContext";
import { Navigate } from "react-router-dom";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

const DEFAULT_ORG_SLUG = "belmorso";

const Index = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { 
    currentOrganization, 
    organizations, 
    initialLoadComplete, 
    isLoadingOrganizations 
  } = useOrganizations();
  
  useEffect(() => {
    console.log("Index page state:", {
      isAuthenticated,
      authLoading,
      currentOrganization: currentOrganization?.name,
      organizationsCount: organizations.length,
      initialLoadComplete,
      isLoadingOrganizations
    });
  }, [isAuthenticated, authLoading, currentOrganization, organizations, initialLoadComplete, isLoadingOrganizations]);
  
  // Show loading state while checking auth and orgs
  if (authLoading || isLoadingOrganizations || !initialLoadComplete) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
        <LoadingSpinner 
          size="lg" 
          message="Loading Your Account" 
          description="Please wait while we set up your workspace..."
        />
      </div>
    );
  }

  // Handle redirects based on authentication and organization state
  console.log("Index: Determining redirect logic");
  
  // If not authenticated, redirect to login first
  if (!isAuthenticated) {
    console.log("Index: Not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }
  
  // If authenticated but no current organization, redirect to organization login
  if (!currentOrganization) {
    console.log("Index: No current organization, redirecting to org login");
    return <Navigate to={`/organizations/login?slug=${DEFAULT_ORG_SLUG}`} replace />;
  }
  
  // If authenticated and has organization, redirect to dashboard
  console.log("Index: Authenticated with organization, redirecting to dashboard");
  return <Navigate to="/dashboard" replace />;
};

export default Index;
