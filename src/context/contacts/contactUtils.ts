
import { Contact } from "@/types";

/**
 * Get contact by ID
 */
export const getContactById = (contacts: Contact[], id: string): Contact | undefined => {
  return contacts.find(contact => contact.id === id);
};

/**
 * Get contacts by agent ID
 */
export const getContactsByAgentId = (contacts: Contact[], agentId: string): Contact[] => {
  return contacts.filter(contact => contact.agentId === agentId);
};

/**
 * Get contacts by source
 */
export const getContactsBySource = (contacts: Contact[], source: string): Contact[] => {
  return contacts.filter(contact => 
    contact.source && 
    contact.source.split(',').map(s => s.trim()).includes(source)
  );
};

/**
 * Search contacts
 */
export const searchContacts = (contacts: Contact[], query: string): Contact[] => {
  const lowerQuery = query.toLowerCase();
  
  return contacts.filter(contact => 
    (contact.fullName && contact.fullName.toLowerCase().includes(lowerQuery)) ||
    (contact.email && contact.email.toLowerCase().includes(lowerQuery)) ||
    (contact.company && contact.company.toLowerCase().includes(lowerQuery)) ||
    (contact.phone && contact.phone.toLowerCase().includes(lowerQuery))
  );
};

/**
 * Transform database contact to app contact
 */
export const transformDatabaseContact = (dbContact: any): Contact => {
  return {
    id: dbContact.id,
    organizationId: dbContact.organization_id,
    fullName: dbContact.full_name,
    company: dbContact.company,
    email: dbContact.email,
    phone: dbContact.phone,
    mobile: dbContact.mobile,
    position: dbContact.position,
    address: dbContact.address,
    source: dbContact.source,
    notes: dbContact.notes,
    agentId: dbContact.agent_id,
    agentName: dbContact.agent_name,
    createdAt: new Date(dbContact.created_at),
    updatedAt: new Date(dbContact.updated_at),
  };
};

/**
 * Transform app contact to database contact
 */
export const transformAppContact = (contact: Partial<Contact>): any => {
  return {
    organization_id: contact.organizationId,
    full_name: contact.fullName,
    company: contact.company,
    email: contact.email,
    phone: contact.phone,
    mobile: contact.mobile,
    position: contact.position,
    address: contact.address,
    source: contact.source,
    notes: contact.notes,
    agent_id: contact.agentId,
    agent_name: contact.agentName,
    updated_at: new Date().toISOString(),
  };
};
