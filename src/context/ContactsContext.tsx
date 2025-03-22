
import { createContext, useContext, useState, ReactNode } from "react";
import { Contact } from "@/types";

interface ContactsContextType {
  contacts: Contact[];
  addContact: (contact: Omit<Contact, "id" | "createdAt" | "updatedAt">) => void;
  updateContact: (id: string, contact: Partial<Contact>) => void;
  deleteContact: (id: string) => void;
  getContactById: (id: string) => Contact | undefined;
}

const ContactsContext = createContext<ContactsContextType | undefined>(undefined);

export const ContactsProvider = ({ children }: { children: ReactNode }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);

  const addContact = (contactData: Omit<Contact, "id" | "createdAt" | "updatedAt">) => {
    const newContact: Contact = {
      ...contactData,
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

  return (
    <ContactsContext.Provider
      value={{
        contacts,
        addContact,
        updateContact,
        deleteContact,
        getContactById,
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
