
import React, { createContext, useContext, ReactNode, useEffect, useState } from "react";
import { useOrganizationsOperations } from "./useOrganizationsOperations";
import { OrganizationsContextType } from "./types";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";

const OrganizationsContext = createContext<OrganizationsContextType | undefined>(undefined);

export const OrganizationsProvider = ({ children }: { children: ReactNode }) => {
  const operations = useOrganizationsOperations();
  const { isAuthenticated, user } = useAuth();
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [loadingOrganizations, setLoadingOrganizations] = useState(false);
  
  // Initialize organizations when the provider mounts and auth status changes
  useEffect(() => {
    const loadOrganizations = async () => {
      if (isAuthenticated && user) {
        console.log("OrganizationsContext: User authenticated, fetching organizations");
        setLoadingOrganizations(true);
        try {
          await operations.fetchOrganizations();
          
          // If after fetching there are no organizations, we'll show an error
          if (operations.organizations.length === 0) {
            console.log("No organizations found after fetch, user may need to create one");
            toast({
              title: "No organizations found",
              description: "Please create an organization to continue",
              variant: "default"
            });
          } else {
            console.log(`Found ${operations.organizations.length} organizations for user`);
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
      } else {
        setInitialLoadComplete(true);
      }
    };
    
    loadOrganizations();
  }, [isAuthenticated, user?.id]);
  
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
