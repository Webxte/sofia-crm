
import { Contact } from "@/types";

export const getContactById = (contacts: Contact[], id: string) => {
  return contacts.find(contact => contact.id === id);
};

export const getContactsByAgentId = (contacts: Contact[], agentId: string) => {
  return contacts.filter(contact => contact.agentId === agentId);
};

export const getContactsBySource = (contacts: Contact[], source: string) => {
  return contacts.filter(contact => {
    // If contact has no source, it won't match
    if (!contact.source) return false;
    
    // Split the source by commas to handle multiple tags
    const contactSources = contact.source.split(',').map(s => s.trim());
    
    // Check if any of the contact's sources matches the requested source
    return contactSources.includes(source);
  });
};

export const searchContacts = (contacts: Contact[], query: string) => {
  if (!query) return contacts;
  
  const searchLower = query.toLowerCase();
  return contacts.filter(contact => {
    const fullName = contact.fullName?.toLowerCase() || '';
    const company = contact.company?.toLowerCase() || '';
    const email = contact.email?.toLowerCase() || '';
    const phone = contact.phone?.toLowerCase() || '';
    const source = contact.source?.toLowerCase() || '';
    
    return fullName.includes(searchLower) || 
           company.includes(searchLower) || 
           email.includes(searchLower) || 
           phone.includes(searchLower) || 
           source.includes(searchLower);
  });
};

export const getAvailableSources = (contacts: Contact[]): string[] => {
  const sources = new Set<string>();
  
  contacts.forEach(contact => {
    if (contact.source) {
      // Split the source string by commas to handle multiple tags
      const sourceTags = contact.source.split(',').map(s => s.trim());
      
      // Add each individual tag to the set
      sourceTags.forEach(tag => {
        if (tag) sources.add(tag);
      });
    }
  });
  
  return Array.from(sources).sort();
};
