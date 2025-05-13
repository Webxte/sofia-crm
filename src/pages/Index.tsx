
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
  
  // First, redirect to organization login if no organization is selected
  if (!currentOrganization) {
    return <Navigate to={`/organizations/login?slug=${DEFAULT_ORG_SLUG}`} replace />;
  }
  
  // Then, if authenticated but no organizations, redirect to create a new one
  if (isAuthenticated && organizations.length === 0) {
    return <Navigate to="/organizations/new" replace />;
  }
  
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // If all conditions are met (authenticated and has organization), redirect to dashboard
  return <Navigate to="/dashboard" replace />;
};

export default Index;
