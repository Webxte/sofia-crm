import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { Contact } from "@/types";
import { useContactsOperations } from "./useContactsOperations";
import { 
  getContactById, 
  getContactsByAgentId, 
  getContactsBySource, 
  searchContacts 
} from "./contactUtils";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { logger } from "@/utils/logger";

interface ContactsContextType {
  contacts: Contact[];
  loading: boolean;
  showAllContacts: boolean;
  setShowAllContacts: (show: boolean) => void;
  getContactById: (id: string) => Contact | undefined;
  getContactsByAgentId: (agentId: string) => Contact[];
  getContactsBySource: (source: string) => Contact[];
  searchContacts: (query: string) => Contact[];
  addContact: (contactData: Omit<Contact, "id" | "createdAt" | "updatedAt">) => Promise<Contact | null>;
  updateContact: (id: string, contactData: Partial<Contact>) => Promise<Contact | null>;
  deleteContact: (id: string) => Promise<boolean>;
  refreshContacts: () => Promise<void>;
  importContactsFromCsv: (file: File) => Promise<void>;
  previewCsvImport: (file: File, defaultSource?: string) => Promise<{ toImport: any[]; duplicates: { row: any; matchedOn: string }[] } | null>;
  executeImport: (contacts: any[]) => Promise<void>;
}

const ContactsContext = createContext<ContactsContextType | undefined>(undefined);

export const ContactsProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, user, isAdmin } = useAuth();
  const [showAllContacts, setShowAllContacts] = useState(false);
  const [hasInitialFetch, setHasInitialFetch] = useState(false);
  const { 
    contacts, 
    loading, 
    fetchContacts, 
    refreshContacts: refreshContactsBase, 
    addContact, 
    updateContact, 
    deleteContact,
    importContactsFromCsv,
    previewCsvImport,
    executeImport,
  } = useContactsOperations();

  // Initial fetch when authentication is ready
  useEffect(() => {
    logger.debug("ContactsContext: Checking initial fetch condition", {
      isAuthenticated,
      user: user?.id,
      loading,
      hasInitialFetch
    });

    if (isAuthenticated && user && !loading && !hasInitialFetch) {
      logger.debug("ContactsContext: Performing initial fetch");
      // With RLS policies, we don't need to pass showAll parameter anymore
      fetchContacts(false).then(() => {
        setHasInitialFetch(true);
      }).catch(err => {
        logger.error("Error during initial contacts fetch:", err);
        toast.error("Error", {
          description: "Failed to load contacts. Please try refreshing the page.",
        });
      });
    }
  }, [isAuthenticated, user?.id, loading, hasInitialFetch, fetchContacts]);

  // For admin users, the showAllContacts toggle doesn't affect data since RLS handles it
  // But we keep it for UI consistency
  useEffect(() => {
    if (hasInitialFetch && isAuthenticated && user && isAdmin) {
      logger.debug("ContactsContext: Admin user, RLS policies handle data filtering automatically");
    }
  }, [showAllContacts, hasInitialFetch, isAuthenticated, user, isAdmin]);

  // Enhanced getContactById that handles missing IDs gracefully
  const getContactByIdSafe = (id: string): Contact | undefined => {
    if (!id) return undefined;
    try {
      return getContactById(contacts, id);
    } catch (err) {
      logger.warn(`Error getting contact by ID ${id}:`, err);
      return undefined;
    }
  };

  const refreshContacts = async () => {
    try {
      logger.debug("ContactsContext: Manual refresh requested");
      await refreshContactsBase(false); // RLS handles filtering
    } catch (err) {
      logger.error("Error refreshing contacts:", err);
      toast.error("Error", {
        description: "Failed to refresh contacts. Please try again.",
      });
    }
  };

  const handleShowAllContactsChange = (show: boolean) => {
    logger.debug("ContactsContext: Toggle showAllContacts to:", show);
    setShowAllContacts(show);
    // For non-admin users, this doesn't change data due to RLS
    // For admin users, they always see all contacts anyway
  };

  return (
    <ContactsContext.Provider
      value={{
        contacts,
        loading,
        showAllContacts,
        setShowAllContacts: handleShowAllContactsChange,
        getContactById: getContactByIdSafe,
        getContactsByAgentId: (agentId: string) => getContactsByAgentId(contacts, agentId),
        getContactsBySource: (source: string) => getContactsBySource(contacts, source),
        searchContacts: (query: string) => searchContacts(contacts, query),
        addContact,
        updateContact,
        deleteContact,
        refreshContacts,
        importContactsFromCsv,
        previewCsvImport,
        executeImport,
      }}
    >
      {children}
    </ContactsContext.Provider>
  );
};

export const useContacts = () => {
  const context = useContext(ContactsContext);
  if (!context) {
    throw new Error("useContacts must be used within a ContactsProvider");
  }
  return context;
};
