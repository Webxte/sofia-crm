
import { Contact } from "@/types";

export const getContactById = (contacts: Contact[], id: string) => {
  return contacts.find(contact => contact.id === id);
};

export const getContactsByAgentId = (contacts: Contact[], agentId: string) => {
  return contacts.filter(contact => contact.agentId === agentId);
};

export const searchContacts = (contacts: Contact[], query: string) => {
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
