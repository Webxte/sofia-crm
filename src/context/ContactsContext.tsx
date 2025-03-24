
import { createContext, useContext, useState, ReactNode } from "react";
import { Contact } from "@/types";
import { useAuth } from "./AuthContext";

interface ContactsContextType {
  contacts: Contact[];
  addContact: (contact: Omit<Contact, "id" | "createdAt" | "updatedAt">) => void;
  updateContact: (id: string, contact: Partial<Contact>) => void;
  deleteContact: (id: string) => void;
  getContactById: (id: string) => Contact | undefined;
  getContactsByAgentId: (agentId: string) => Contact[];
  searchContacts: (query: string) => Contact[];
}

const ContactsContext = createContext<ContactsContextType | undefined>(undefined);

export const ContactsProvider = ({ children }: { children: ReactNode }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const { user } = useAuth();

  const addContact = (contactData: Omit<Contact, "id" | "createdAt" | "updatedAt">) => {
    // Add agent information if available
    const agentData = user ? {
      agentId: user.id,
      agentName: user.name
    } : {};
    
    const newContact: Contact = {
      ...contactData,
      ...agentData,
      id: Math.random().toString(36).substring(2, 9),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setContacts(prevContacts => [...prevContacts, newContact]);
  };

  const updateContact = (id: string, contactData: Partial<Contact>) => {
    setContacts(prevContacts => 
      prevContacts.map(contact => 
        contact.id === id 
          ? { ...contact, ...contactData, updatedAt: new Date() } 
          : contact
      )
    );
  };

  const deleteContact = (id: string) => {
    setContacts(prevContacts => prevContacts.filter(contact => contact.id !== id));
  };

  const getContactById = (id: string) => {
    return contacts.find(contact => contact.id === id);
  };

  const getContactsByAgentId = (agentId: string) => {
    return contacts.filter(contact => contact.agentId === agentId);
  };

  const searchContacts = (query: string) => {
    if (!query) return contacts;
    
    const searchLower = query.toLowerCase();
    return contacts.filter(contact => {
      const fullName = contact.fullName?.toLowerCase() || '';
      const company = contact.company?.toLowerCase() || '';
      const email = contact.email?.toLowerCase() || '';
      const phone = contact.phone?.toLowerCase() || '';
      
      return fullName.includes(searchLower) || 
             company.includes(searchLower) || 
             email.includes(searchLower) || 
             phone.includes(searchLower);
    });
  };

  return (
    <ContactsContext.Provider
      value={{
        contacts,
        addContact,
        updateContact,
        deleteContact,
        getContactById,
        getContactsByAgentId,
        searchContacts,
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
