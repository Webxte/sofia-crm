
import React, { createContext, useContext, ReactNode, useEffect, useState } from "react";
import { useOrganizationsOperations } from "./useOrganizationsOperations";
import { OrganizationsContextType } from "./types";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { useNavigate, useLocation } from "react-router-dom";

const OrganizationsContext = createContext<OrganizationsContextType | undefined>(undefined);

export const OrganizationsProvider = ({ children }: { children: ReactNode }) => {
  const operations = useOrganizationsOperations();
  const { isAuthenticated, user } = useAuth();
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [loadingOrganizations, setLoadingOrganizations] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Initialize organizations when the provider mounts and auth status changes
  useEffect(() => {
    const loadOrganizations = async () => {
      if (isAuthenticated && user) {
        console.log("OrganizationsContext: User authenticated, fetching organizations");
        setLoadingOrganizations(true);
        try {
          await operations.fetchOrganizations();
          
          // Check if we're on non-organization pages
          const isOrgLoginPage = location.pathname.startsWith("/organizations/login");
          const isLoginPage = location.pathname === "/login";
          const isRegisterPage = location.pathname === "/register";
          const isNewOrgPage = location.pathname === "/organizations/new";
          const isNonOrgPage = isOrgLoginPage || isLoginPage || isRegisterPage || isNewOrgPage;
          
          if (operations.organizations.length === 0 && !isNewOrgPage) {
            console.log("No organizations found, redirecting to create org page");
            navigate("/organizations/new");
          } 
          // If we have organizations but no current organization selected, redirect to org login
          else if (operations.organizations.length > 0 && !operations.currentOrganization && !isOrgLoginPage) {
            console.log("Organizations exist but none selected, redirecting to org login");
            navigate("/organizations/login?slug=belmorso");
          }
          else {
            console.log(`Found ${operations.organizations.length} organizations for user`);
            if (operations.currentOrganization) {
              console.log("Current organization:", operations.currentOrganization.name);
            }
          }
        } catch (error) {
          console.error("Error loading organizations:", error);
          toast({
            title: "Error loading organizations",
            description: "Please try refreshing the page",
            variant: "destructive"
          });
        } finally {
          setLoadingOrganizations(false);
          setInitialLoadComplete(true);
        }
      } else if (!isAuthenticated) {
        // If not authenticated, we're done initializing
        setInitialLoadComplete(true);
      }
    };
    
    loadOrganizations();
  }, [isAuthenticated, user?.id, location.pathname, navigate, operations]);
  
  // Create a context value with loading state included
  const contextValue = {
    ...operations,
    isLoadingOrganizations: loadingOrganizations,
    initialLoadComplete
  };
  
  return (
    <OrganizationsContext.Provider value={contextValue}>
      {children}
    </OrganizationsContext.Provider>
  );
};

export const useOrganizations = () => {
  const context = useContext(OrganizationsContext);
  if (context === undefined) {
    throw new Error("useOrganizations must be used within an OrganizationsProvider");
  }
  return context;
};
