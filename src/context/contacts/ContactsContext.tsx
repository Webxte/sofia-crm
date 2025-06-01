
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
import { useOrganizations } from "@/context/organizations/OrganizationsContext";
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
  const { currentOrganization } = useOrganizations();
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

  // Fetch contacts when component mounts and when authentication state changes
  useEffect(() => {
    if (isAuthenticated && currentOrganization) {
      console.log("ContactsContext: User authenticated and organization set, fetching contacts");
      fetchContacts().catch(err => {
        console.error("Error during initial contacts fetch:", err);
        toast({
          title: "Error",
          description: "Failed to load contacts on initial load. Please try refreshing.",
          variant: "destructive",
        });
      });
    } else {
      console.log("ContactsContext: Missing auth or organization, skipping contacts fetch");
    }
  }, [isAuthenticated, currentOrganization?.id, fetchContacts, toast]);

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
