
import React, { createContext, useContext, ReactNode, useEffect } from "react";
import { useOrganizationsOperations } from "./useOrganizationsOperations";
import { OrganizationsContextType } from "./types";

const OrganizationsContext = createContext<OrganizationsContextType | undefined>(undefined);

export const OrganizationsProvider = ({ children }: { children: ReactNode }) => {
  const operations = useOrganizationsOperations();
  
  // Initialize organizations when the provider mounts
  useEffect(() => {
    operations.fetchOrganizations();
  }, []);
  
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
