
import { Contact } from "@/types";

// Get contact by ID
export const getContactById = (contacts: Contact[], id: string): Contact | undefined => {
  return contacts.find(contact => contact.id === id);
};

// Get contacts by agent ID
export const getContactsByAgentId = (contacts: Contact[], agentId: string): Contact[] => {
  return contacts.filter(contact => contact.agentId === agentId);
};

// Get contacts by source
export const getContactsBySource = (contacts: Contact[], source: string): Contact[] => {
  return contacts.filter(contact => 
    contact.source && 
    contact.source.split(',').map(s => s.trim()).includes(source)
  );
};

// Search contacts
export const searchContacts = (contacts: Contact[], query: string): Contact[] => {
  const lowerQuery = query.toLowerCase();
  
  return contacts.filter(contact => 
    (contact.fullName && contact.fullName.toLowerCase().includes(lowerQuery)) ||
    (contact.email && contact.email.toLowerCase().includes(lowerQuery)) ||
    (contact.company && contact.company.toLowerCase().includes(lowerQuery)) ||
    (contact.phone && contact.phone.toLowerCase().includes(lowerQuery))
  );
};
