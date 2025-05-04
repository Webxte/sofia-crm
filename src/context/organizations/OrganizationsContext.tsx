
import React, { createContext, useContext, ReactNode, useEffect, useState } from "react";
import { useOrganizationsOperations } from "./useOrganizationsOperations";
import { OrganizationsContextType } from "./types";
import { useAuth } from "@/context/AuthContext";

const OrganizationsContext = createContext<OrganizationsContextType | undefined>(undefined);

export const OrganizationsProvider = ({ children }: { children: ReactNode }) => {
  const operations = useOrganizationsOperations();
  const { isAuthenticated, user } = useAuth();
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  
  // Initialize organizations when the provider mounts and auth status changes
  useEffect(() => {
    const loadOrganizations = async () => {
      if (isAuthenticated && user) {
        console.log("OrganizationsContext: User authenticated, fetching organizations");
        try {
          await operations.fetchOrganizations();
        } catch (error) {
          console.error("Error loading organizations:", error);
        } finally {
          setInitialLoadComplete(true);
        }
      } else {
        setInitialLoadComplete(true);
      }
    };
    
    loadOrganizations();
  }, [isAuthenticated, user?.id]);
  
  return (
    <OrganizationsContext.Provider value={operations}>
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
