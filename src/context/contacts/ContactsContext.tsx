
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
  const { isAuthenticated } = useAuth();
  const { currentOrganization } = useOrganizations();
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

  // Fetch contacts when the component mounts, when authentication state changes or organization changes
  useEffect(() => {
    if (isAuthenticated && currentOrganization) {
      console.log("Fetching contacts for organization:", currentOrganization.id);
      fetchContacts();
    }
  }, [isAuthenticated, currentOrganization, fetchContacts]);

  return (
    <ContactsContext.Provider
      value={{
        contacts,
        loading,
        getContactById: (id: string) => getContactById(contacts, id),
        getContactsByAgentId: (agentId: string) => getContactsByAgentId(contacts, agentId),
        getContactsBySource: (source: string) => getContactsBySource(contacts, source),
        searchContacts: (query: string) => searchContacts(contacts, query),
        addContact,
        updateContact,
        deleteContact,
        refreshContacts: async () => { await fetchContacts(); },
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
