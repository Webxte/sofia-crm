
import React, { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useOrganizations } from "@/context/organizations/OrganizationsContext";
import { Navigate } from "react-router-dom";

const Index = () => {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const { 
    currentOrganization, 
    organizations, 
    initialLoadComplete, 
    isLoadingOrganizations 
  } = useOrganizations();

  // Log components that are mounted and their states to debug
  useEffect(() => {
    console.log("Index page mounted with state:", {
      authState: {
        isAuthenticated,
        authLoading,
        userId: user?.id,
        userName: user?.name
      },
      orgState: {
        initialLoadComplete,
        isLoadingOrganizations,
        currentOrgId: currentOrganization?.id,
        currentOrgName: currentOrganization?.name,
        orgsCount: organizations.length
      }
    });
  }, [
    isAuthenticated, 
    authLoading, 
    user, 
    initialLoadComplete, 
    isLoadingOrganizations, 
    currentOrganization, 
    organizations
  ]);

  // Show loading state while checking auth and orgs
  if (authLoading || isLoadingOrganizations || !initialLoadComplete) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
        <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <h2 className="text-2xl font-bold mb-2">Loading Your Account</h2>
        <p className="text-gray-600">Please wait while we set up your workspace...</p>
        <div className="mt-4 text-sm text-gray-500">
          {authLoading && <p>Authenticating...</p>}
          {!authLoading && isLoadingOrganizations && <p>Loading organizations...</p>}
          {!authLoading && !isLoadingOrganizations && !initialLoadComplete && <p>Finalizing setup...</p>}
        </div>
      </div>
    );
  }

  // First, redirect to organization login if no organization is selected
  // This takes priority over authentication
  if (initialLoadComplete && !currentOrganization) {
    return <Navigate to="/organizations/login?slug=belmorso" replace />;
  }

  // Then, if authenticated but no organizations, redirect to create a new one
  if (initialLoadComplete && isAuthenticated && organizations.length === 0) {
    return <Navigate to="/organizations/new" replace />;
  }
  
  // If not authenticated but organization is selected, redirect to login
  if (!isAuthenticated && currentOrganization) {
    return <Navigate to="/login" replace />;
  }
  
  // If not authenticated and no organization, we already redirected to org login above
  if (!isAuthenticated) {
    return <Navigate to="/organizations/login?slug=belmorso" replace />;
  }

  // If all conditions are met (authenticated and has organization), redirect to dashboard
  return <Navigate to="/dashboard" replace />;
};

export default Index;
