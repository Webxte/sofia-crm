
import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useOrganizations } from "@/context/organizations/OrganizationsContext";
import { Navigate } from "react-router-dom";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const DEFAULT_ORG_SLUG = "belmorso";

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
  const [redirectStarted, setRedirectStarted] = useState<boolean>(false);
  const redirectAttemptsRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

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
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      if (authLoading || isLoadingOrganizations || !initialLoadComplete) {
        console.warn("Loading state persisted for too long, might indicate an issue");
        setError("Taking longer than expected to load. You may need to refresh the page.");
      }
    }, 10000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [
    isAuthenticated, 
    authLoading, 
    user, 
    initialLoadComplete, 
    isLoadingOrganizations, 
    currentOrganization, 
    organizations
  ]);

  // Prevent excessive redirect attempts
  useEffect(() => {
    // Only try to redirect if we haven't started redirecting already
    if (!redirectStarted && initialLoadComplete && !authLoading && !isLoadingOrganizations) {
      // Increment the number of redirect attempts
      redirectAttemptsRef.current += 1;
      
      // Prevent infinite redirect loops by capping the number of attempts
      if (redirectAttemptsRef.current > 3) {
        console.error("Too many redirect attempts, might be in a loop");
        setError("Unable to determine the correct page to show. Please try logging in again.");
        return;
      }
      
      // Mark redirecting as started to prevent multiple redirects
      setRedirectStarted(true);
    }
  }, [redirectStarted, initialLoadComplete, authLoading, isLoadingOrganizations]);

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

  // Use redirectStarted state to prevent multiple redirects
  if (redirectStarted) {
    return null;
  }

  // Handle redirects based on authentication and organization state
  let redirectTo = null;

  // First, redirect to organization login if no organization is selected
  if (initialLoadComplete && !currentOrganization) {
    console.log("Index: No current organization, redirecting to organization login");
    redirectTo = `/organizations/login?slug=${DEFAULT_ORG_SLUG}`;
    setRedirectStarted(true);
  }
  // Then, if authenticated but no organizations, redirect to create a new one
  else if (initialLoadComplete && isAuthenticated && organizations.length === 0) {
    console.log("Index: Authenticated but no organizations, redirecting to create organization");
    redirectTo = "/organizations/new";
    setRedirectStarted(true);
  }
  // If not authenticated but organization is selected, redirect to login
  else if (!isAuthenticated && currentOrganization) {
    console.log("Index: Not authenticated but organization selected, redirecting to login");
    redirectTo = "/login";
    setRedirectStarted(true);
  }
  // If not authenticated and no organization, we redirect to org login
  else if (!isAuthenticated) {
    console.log("Index: Not authenticated and no organization, redirecting to organization login");
    redirectTo = `/organizations/login?slug=${DEFAULT_ORG_SLUG}`;
    setRedirectStarted(true);
  }
  // If all conditions are met (authenticated and has organization), redirect to dashboard
  else if (isAuthenticated && currentOrganization) {
    console.log("Index: Authenticated with organization, redirecting to dashboard");
    redirectTo = "/dashboard";
    setRedirectStarted(true);
  }

  return redirectTo ? <Navigate to={redirectTo} replace /> : null;
};

export default Index;
