
import { Contact } from "@/types";
import { supabase } from "@/integrations/supabase/client";

export const getContactById = (contacts: Contact[], id: string) => {
  return contacts.find(contact => contact.id === id);
};

export const getContactsByAgentId = (contacts: Contact[], agentId: string) => {
  return contacts.filter(contact => contact.agentId === agentId);
};

export const getContactsBySource = (contacts: Contact[], source: string) => {
  if (!source) return contacts;
  
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

// Process contacts from the database into the expected format
export const processContacts = (data: any[]): Contact[] => {
  return data.map(item => ({
    id: item.id,
    fullName: item.full_name,
    company: item.company,
    email: item.email,
    phone: item.phone,
    mobile: item.mobile,
    address: item.address,
    notes: item.notes,
    position: item.position,
    agentId: item.agent_id,
    agentName: item.agent_name,
    source: item.source,
    createdAt: new Date(item.created_at),
    updatedAt: new Date(item.updated_at)
  }));
};

// Create a new contact in the database
export const createContact = async (contactData: Omit<Contact, "id">): Promise<Contact | null> => {
  try {
    // Convert from camelCase to snake_case for database
    const dbData = {
      full_name: contactData.fullName,
      company: contactData.company,
      email: contactData.email,
      phone: contactData.phone,
      mobile: contactData.mobile,
      address: contactData.address,
      notes: contactData.notes,
      position: contactData.position,
      agent_id: contactData.agentId,
      agent_name: contactData.agentName,
      source: contactData.source
    };
    
    const { data, error } = await supabase
      .from("contacts")
      .insert(dbData)
      .select()
      .single();
      
    if (error) {
      console.error("Error creating contact:", error);
      return null;
    }
    
    return processContacts([data])[0];
  } catch (error) {
    console.error("Error in createContact:", error);
    return null;
  }
};

// Update an existing contact
export const updateContact = async (id: string, contactData: Partial<Contact>): Promise<Contact | null> => {
  try {
    // Convert from camelCase to snake_case for database
    const dbData: Record<string, any> = {};
    
    if (contactData.fullName !== undefined) dbData.full_name = contactData.fullName;
    if (contactData.company !== undefined) dbData.company = contactData.company;
    if (contactData.email !== undefined) dbData.email = contactData.email;
    if (contactData.phone !== undefined) dbData.phone = contactData.phone;
    if (contactData.mobile !== undefined) dbData.mobile = contactData.mobile;
    if (contactData.address !== undefined) dbData.address = contactData.address;
    if (contactData.notes !== undefined) dbData.notes = contactData.notes;
    if (contactData.position !== undefined) dbData.position = contactData.position;
    if (contactData.agentId !== undefined) dbData.agent_id = contactData.agentId;
    if (contactData.agentName !== undefined) dbData.agent_name = contactData.agentName;
    if (contactData.source !== undefined) dbData.source = contactData.source;
    
    const { data, error } = await supabase
      .from("contacts")
      .update(dbData)
      .eq("id", id)
      .select()
      .single();
      
    if (error) {
      console.error("Error updating contact:", error);
      return null;
    }
    
    return processContacts([data])[0];
  } catch (error) {
    console.error("Error in updateContact:", error);
    return null;
  }
};

// Delete a contact
export const deleteContact = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("contacts")
      .delete()
      .eq("id", id);
      
    if (error) {
      console.error("Error deleting contact:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in deleteContact:", error);
    return false;
  }
};

// Import contacts from CSV
export const importContactsFromCsv = async (file: File): Promise<number> => {
  try {
    // This would be implemented with a server function or direct processing
    // For now, we'll return 0 as a placeholder
    console.error("importContactsFromCsv not fully implemented yet");
    return 0;
  } catch (error) {
    console.error("Error importing contacts from CSV:", error);
    return 0;
  }
};
