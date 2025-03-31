
import { createContext, useContext, useEffect, ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { useContactsOperations } from "./useContactsOperations";
import { Contact } from "@/types";
import { getContactById, getContactsByAgentId, getContactsBySource, searchContacts } from "./contactUtils";

interface ContactsContextType {
  contacts: Contact[];
  loading: boolean;
  addContact: (contact: Omit<Contact, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  updateContact: (id: string, contact: Partial<Contact>) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;
  getContactById: (id: string) => Contact | undefined;
  getContactsByAgentId: (agentId: string) => Contact[];
  getContactsBySource: (source: string) => Contact[];
  searchContacts: (query: string) => Contact[];
  refreshContacts: () => Promise<void>;
  importContactsFromCsv: (file: File) => Promise<void>;
}

const ContactsContext = createContext<ContactsContextType | undefined>(undefined);

export const ContactsProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const { 
    contacts, 
    loading, 
    refreshContacts, 
    addContact: addContactOp, 
    updateContact: updateContactOp, 
    deleteContact: deleteContactOp,
    importContactsFromCsv: importContactsOp 
  } = useContactsOperations();

  // Fetch contacts when the component mounts or when user auth state changes
  useEffect(() => {
    if (isAuthenticated) {
      refreshContacts();
    }
  }, [isAuthenticated, refreshContacts]);

  // Wrapper functions to adapt return types
  const addContact = async (contact: Omit<Contact, "id" | "createdAt" | "updatedAt">) => {
    await addContactOp(contact);
  };

  const updateContact = async (id: string, contact: Partial<Contact>) => {
    await updateContactOp(id, contact);
  };

  const deleteContact = async (id: string) => {
    await deleteContactOp(id);
  };

  const importContactsFromCsv = async (file: File) => {
    await importContactsOp(file);
  };

  return (
    <ContactsContext.Provider
      value={{
        contacts,
        loading,
        addContact,
        updateContact,
        deleteContact,
        getContactById: (id) => getContactById(contacts, id),
        getContactsByAgentId: (agentId) => getContactsByAgentId(contacts, agentId),
        getContactsBySource: (source) => getContactsBySource(contacts, source),
        searchContacts: (query) => searchContacts(contacts, query),
        refreshContacts: async () => { await refreshContacts(); },
        importContactsFromCsv,
      }}
    >
      {children}
    </ContactsContext.Provider>
  );
};

export const useContacts = () => {
  const context = useContext(ContactsContext);
  if (context === undefined) {
    throw new Error("useContacts must be used within a ContactsProvider");
  }
  return context;
};
