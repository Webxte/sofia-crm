
import { Contact } from "@/types";

// Filter contacts based on user, search and other criteria
export const useContactFilters = (
  contacts: Contact[],
  {
    showAllContacts,
    userId,
    searchQuery,
    selectedSource,
    sortField,
    sortDirection
  }: {
    showAllContacts: boolean;
    userId?: string;
    searchQuery: string;
    selectedSource: string | null;
    sortField: string;
    sortDirection: "asc" | "desc";
  }
) => {
  // First filter by agent (if not showing all)
  let filtered = showAllContacts 
    ? [...contacts] 
    : contacts.filter(contact => contact.agentId === userId);
  
  // Then filter by search query
  if (searchQuery) {
    const lowerQuery = searchQuery.toLowerCase();
    filtered = filtered.filter(contact => 
      (contact.fullName && contact.fullName.toLowerCase().includes(lowerQuery)) ||
      (contact.email && contact.email.toLowerCase().includes(lowerQuery)) ||
      (contact.company && contact.company.toLowerCase().includes(lowerQuery)) ||
      (contact.phone && contact.phone.toLowerCase().includes(lowerQuery))
    );
  }
  
  // Then filter by source
  if (selectedSource) {
    filtered = filtered.filter(contact => 
      contact.source && 
      contact.source.split(',').map(s => s.trim()).includes(selectedSource)
    );
  }
  
  // Sort the results
  filtered.sort((a, b) => {
    let aVal: any = a[sortField as keyof Contact];
    let bVal: any = b[sortField as keyof Contact];
    
    // Handle string comparison
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }
    
    // Handle comparison where values might be undefined
    if (aVal === undefined || aVal === null) return sortDirection === 'asc' ? 1 : -1;
    if (bVal === undefined || bVal === null) return sortDirection === 'asc' ? -1 : 1;
    
    // Standard comparison
    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });
  
  return filtered;
};

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

// Group contacts by first letter for grid view
export const groupContactsByFirstLetter = (contacts: Contact[], sortField: string, sortDirection: "asc" | "desc") => {
  const groupedContacts: Record<string, Contact[]> = {};
  
  contacts.forEach(contact => {
    let value = contact[sortField as keyof Contact];
    if (value === undefined || value === null) {
      value = sortField === 'fullName' ? 'Unnamed' : '';
    }
    
    const firstChar = String(value).trim()[0]?.toUpperCase() || '#';
    const group = /[A-Z]/.test(firstChar) ? firstChar : '#';
    
    if (!groupedContacts[group]) {
      groupedContacts[group] = [];
    }
    
    groupedContacts[group].push(contact);
  });
  
  // Sort each group internally
  Object.keys(groupedContacts).forEach(group => {
    groupedContacts[group].sort((a, b) => {
      const aVal = a[sortField as keyof Contact];
      const bVal = b[sortField as keyof Contact];
      
      if (aVal === undefined || aVal === null) return sortDirection === 'asc' ? 1 : -1;
      if (bVal === undefined || bVal === null) return sortDirection === 'asc' ? -1 : 1;
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' 
          ? aVal.toLowerCase().localeCompare(bVal.toLowerCase()) 
          : bVal.toLowerCase().localeCompare(aVal.toLowerCase());
      }
      
      return sortDirection === 'asc'
        ? (aVal < bVal ? -1 : aVal > bVal ? 1 : 0)
        : (aVal > bVal ? -1 : aVal < bVal ? 1 : 0);
    });
  });
  
  // Sort the groups alphabetically
  const sortedGroups = Object.keys(groupedContacts).sort();
  if (sortedGroups.includes('#')) {
    // Move '#' to the end
    sortedGroups.splice(sortedGroups.indexOf('#'), 1);
    sortedGroups.push('#');
  }
  
  return { groupedContacts, sortedGroups };
};
