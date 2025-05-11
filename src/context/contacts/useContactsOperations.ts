
import * as React from "react";
import { Contact } from "@/types";
import { useContactsFetch } from "./hooks/useContactsFetch";
import { useContactCRUD } from "./hooks/useContactCRUD";
import { useContactImport } from "./hooks/useContactImport";
import { useContactExport } from "./hooks/useContactExport";
import { useContactAnalytics } from "./hooks/useContactAnalytics";

/**
 * Main hook for contact operations that combines multiple contact-related hooks
 * @returns Contact operations methods and state
 */
export const useContactsOperations = () => {
  // Fetch operations
  const { contacts, loading, fetchContacts, setContacts } = useContactsFetch();
  
  // CRUD operations
  const { addContact, updateContact, deleteContact } = useContactCRUD(setContacts);
  
  // Refresh operation - simplified to avoid typing issues
  const refreshContacts = React.useCallback(async () => {
    await fetchContacts();
  }, [fetchContacts]);
  
  // Import/Export operations
  const { importContactsFromCsv } = useContactImport(refreshContacts);
  const { exportContactsToCsv } = useContactExport(contacts);
  
  // Analytics operations
  const { trackContactView, analyzeContactData } = useContactAnalytics(contacts);

  return {
    // Data
    contacts,
    loading,
    
    // Core operations
    fetchContacts,
    refreshContacts,
    addContact,
    updateContact,
    deleteContact,
    
    // Import/Export
    importContactsFromCsv,
    exportContactsToCsv,
    
    // Analytics
    trackContactView,
    analyzeContactData
  };
};
