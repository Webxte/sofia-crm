
import { createContext, useContext, useEffect, ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { useContactsOperations } from "./useContactsOperations";
import { ContactsContextType } from "./types";
import { getContactById, getContactsByAgentId, searchContacts } from "./contactUtils";

const ContactsContext = createContext<ContactsContextType | undefined>(undefined);

export const ContactsProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const { 
    contacts, 
    loading, 
    refreshContacts, 
    addContact, 
    updateContact, 
    deleteContact 
  } = useContactsOperations();

  // Fetch contacts when the component mounts or when user auth state changes
  useEffect(() => {
    if (isAuthenticated) {
      refreshContacts();
    }
  }, [isAuthenticated]);

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
        searchContacts: (query) => searchContacts(contacts, query),
        refreshContacts,
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
