
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
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const { 
    contacts, 
    loading, 
    fetchContacts, 
    refreshContacts, 
    addContact, 
    updateContact, 
    deleteContact,
    importContactsFromCsv,
  } = useContactsOperations();

  // Fetch contacts when authentication is ready
  useEffect(() => {
    console.log("ContactsContext: Checking authentication state", {
      isAuthenticated,
      user: user?.id,
      loading
    });

    if (isAuthenticated && user && !loading) {
      console.log("ContactsContext: User authenticated, fetching contacts");
      fetchContacts().catch(err => {
        console.error("Error during contacts fetch:", err);
        toast({
          title: "Error",
          description: "Failed to load contacts. Please try refreshing the page.",
          variant: "destructive",
        });
      });
    } else {
      console.log("ContactsContext: Waiting for authentication or already loading");
    }
  }, [isAuthenticated, user?.id, fetchContacts, loading, toast]);

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

  return (
    <ContactsContext.Provider
      value={{
        contacts,
        loading,
        getContactById: getContactByIdSafe,
        getContactsByAgentId: (agentId: string) => getContactsByAgentId(contacts, agentId),
        getContactsBySource: (source: string) => getContactsBySource(contacts, source),
        searchContacts: (query: string) => searchContacts(contacts, query),
        addContact,
        updateContact,
        deleteContact,
        refreshContacts: async () => { 
          try {
            console.log("ContactsContext: Manual refresh requested");
            await fetchContacts(); 
          } catch (err) {
            console.error("Error refreshing contacts:", err);
            toast({
              title: "Error",
              description: "Failed to refresh contacts. Please try again.",
              variant: "destructive",
            });
          }
        },
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
