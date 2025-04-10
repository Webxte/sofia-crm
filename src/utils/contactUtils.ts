
import { Contact } from "@/types";
import { SortField, SortDirection } from "@/hooks/use-contact-sorting";

interface FilterOptions {
  showAllContacts: boolean;
  userId?: string;
  searchQuery: string;
  selectedSource: string | null;
  sortField: SortField;
  sortDirection: SortDirection;
}

export const useContactFilters = (contacts: Contact[], options: FilterOptions) => {
  const { showAllContacts, userId, searchQuery, selectedSource, sortField, sortDirection } = options;
  
  return contacts.filter(contact => {
    // Filter by agent ID first if not showing all contacts
    if (!showAllContacts && userId && userId !== contact.agentId) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = (
        (contact.fullName?.toLowerCase().includes(query)) ||
        (contact.email?.toLowerCase().includes(query)) ||
        (contact.company?.toLowerCase().includes(query)) ||
        (contact.phone?.toLowerCase().includes(query))
      );
      
      if (!matchesSearch) return false;
    }
    
    // Filter by source if selected
    if (selectedSource && contact.source) {
      const contactSources = contact.source.split(',').map(s => s.trim());
      return contactSources.includes(selectedSource);
    }
    
    return true;
  }).sort((a, b) => {
    // Sort by selected field
    let valueA: string | undefined;
    let valueB: string | undefined;
    
    switch (sortField) {
      case "company":
        valueA = a.company || a.fullName || "";
        valueB = b.company || b.fullName || "";
        break;
      case "fullName":
        valueA = a.fullName || a.company || "";
        valueB = b.fullName || b.company || "";
        break;
      case "email":
        valueA = a.email || "";
        valueB = b.email || "";
        break;
      case "phone":
        valueA = a.phone || "";
        valueB = b.phone || "";
        break;
      case "source":
        valueA = a.source || "";
        valueB = b.source || "";
        break;
      default:
        valueA = a.company || a.fullName || "";
        valueB = b.company || b.fullName || "";
    }
    
    // Apply sort direction
    return sortDirection === "asc" 
      ? valueA.localeCompare(valueB) 
      : valueB.localeCompare(valueA);
  });
};

export const groupContactsByFirstLetter = (contacts: Contact[], sortField: SortField, sortDirection: SortDirection) => {
  const groups: Record<string, Contact[]> = {};
  
  contacts.forEach(contact => {
    let firstChar = '#';
    
    // Get the first character of the sorting field
    if (sortField === "company") {
      firstChar = (contact.company || contact.fullName || "#").charAt(0).toUpperCase();
    } else if (sortField === "fullName") {
      firstChar = (contact.fullName || contact.company || "#").charAt(0).toUpperCase();
    } else {
      // For other sort fields, still group by name or company
      firstChar = (contact.company || contact.fullName || "#").charAt(0).toUpperCase();
    }
    
    if (!/[A-Z]/.test(firstChar)) {
      firstChar = '#';
    }
    
    if (!groups[firstChar]) {
      groups[firstChar] = [];
    }
    
    groups[firstChar].push(contact);
  });
  
  // Sort contacts within each group by the sorting field
  Object.keys(groups).forEach(key => {
    groups[key].sort((a, b) => {
      let valueA: string | undefined;
      let valueB: string | undefined;
      
      switch (sortField) {
        case "company":
          valueA = a.company || a.fullName || "";
          valueB = b.company || b.fullName || "";
          break;
        case "fullName":
          valueA = a.fullName || a.company || "";
          valueB = b.fullName || b.company || "";
          break;
        default:
          valueA = a.company || a.fullName || "";
          valueB = b.company || b.fullName || "";
      }
      
      return sortDirection === "asc"
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    });
  });
  
  // Sort the group keys based on sortDirection
  const sortedGroups = Object.keys(groups).sort((a, b) => {
    return sortDirection === "asc" 
      ? a.localeCompare(b) 
      : b.localeCompare(a);
  });
  
  return { groupedContacts: groups, sortedGroups };
};
