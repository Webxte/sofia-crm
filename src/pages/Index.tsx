
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useOrganizations } from "@/context/organizations/OrganizationsContext";
import { Navigate } from "react-router-dom";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const Index = () => {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const { 
    currentOrganization, 
    organizations, 
    initialLoadComplete, 
    isLoadingOrganizations 
  } = useOrganizations();
  const [loadingStage, setLoadingStage] = useState<string>("Initializing");
  const [error, setError] = useState<string | null>(null);

  // Update loading stage based on current state
  useEffect(() => {
    if (authLoading) {
      setLoadingStage("Authenticating");
    } else if (isLoadingOrganizations) {
      setLoadingStage("Loading organizations");
    } else if (!initialLoadComplete) {
      setLoadingStage("Finalizing setup");
    }
  }, [authLoading, isLoadingOrganizations, initialLoadComplete]);

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

    // Set error if stuck in loading state for too long (10 seconds)
    const timeout = setTimeout(() => {
      if (authLoading || isLoadingOrganizations || !initialLoadComplete) {
        console.warn("Loading state persisted for too long, might indicate an issue");
      }
    }, 10000);

    return () => clearTimeout(timeout);
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
        <LoadingSpinner 
          size="lg" 
          message="Loading Your Account" 
          description={`Please wait while we ${loadingStage.toLowerCase()}...`}
        />
        
        <div className="mt-8 max-w-md">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
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
