
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
import { useToast } from "@/hooks/use-toast";

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
}

const ContactsContext = createContext<ContactsContextType | undefined>(undefined);

export const ContactsProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, user, isAdmin } = useAuth();
  const { toast } = useToast();
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
  } = useContactsOperations();

  // Initial fetch when authentication is ready
  useEffect(() => {
    console.log("ContactsContext: Checking initial fetch condition", {
      isAuthenticated,
      user: user?.id,
      loading,
      hasInitialFetch
    });

    if (isAuthenticated && user && !loading && !hasInitialFetch) {
      console.log("ContactsContext: Performing initial fetch");
      fetchContacts(isAdmin || showAllContacts).then(() => {
        setHasInitialFetch(true);
      }).catch(err => {
        console.error("Error during initial contacts fetch:", err);
        toast({
          title: "Error",
          description: "Failed to load contacts. Please try refreshing the page.",
          variant: "destructive",
        });
      });
    }
  }, [isAuthenticated, user?.id, loading, hasInitialFetch, fetchContacts, toast, isAdmin, showAllContacts]);

  // Handle toggle changes
  useEffect(() => {
    if (hasInitialFetch && isAuthenticated && user) {
      console.log("ContactsContext: Toggle changed, refetching with showAll:", showAllContacts);
      fetchContacts(isAdmin || showAllContacts).catch(err => {
        console.error("Error during toggle fetch:", err);
        toast({
          title: "Error",
          description: "Failed to refresh contacts.",
          variant: "destructive",
        });
      });
    }
  }, [showAllContacts, hasInitialFetch, isAuthenticated, user, fetchContacts, toast, isAdmin]);

  // Enhanced getContactById that handles missing IDs gracefully
  const getContactByIdSafe = (id: string): Contact | undefined => {
    if (!id) return undefined;
    try {
      return getContactById(contacts, id);
    } catch (err) {
      console.warn(`Error getting contact by ID ${id}:`, err);
      return undefined;
    }
  };

  const refreshContacts = async () => {
    try {
      console.log("ContactsContext: Manual refresh requested with showAll:", showAllContacts);
      await refreshContactsBase(isAdmin || showAllContacts);
    } catch (err) {
      console.error("Error refreshing contacts:", err);
      toast({
        title: "Error",
        description: "Failed to refresh contacts. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleShowAllContactsChange = (show: boolean) => {
    console.log("ContactsContext: Toggle showAllContacts to:", show);
    setShowAllContacts(show);
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
