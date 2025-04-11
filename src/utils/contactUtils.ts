
import { Contact } from "@/types";
import { SortDirection, SortField } from "@/hooks/use-contact-sorting";

export const useContactFilters = (
  contacts: Contact[],
  options: {
    showAllContacts: boolean;
    userId?: string;
    searchQuery: string;
    selectedSource: string | null;
    sortField: SortField;
    sortDirection: SortDirection;
  }
) => {
  const { showAllContacts, userId, searchQuery, selectedSource, sortField, sortDirection } = options;

  return contacts
    .filter((contact) => {
      // Filter based on agent assignment
      if (!showAllContacts && userId) {
        if (contact.agentId !== userId) return false;
      }

      // Filter based on search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = contact.fullName?.toLowerCase().includes(query) || false;
        const matchesCompany = contact.company?.toLowerCase().includes(query) || false;
        const matchesEmail = contact.email?.toLowerCase().includes(query) || false;
        const matchesPhone = contact.phone?.toLowerCase().includes(query) || false;
        const matchesNotes = contact.notes?.toLowerCase().includes(query) || false;

        if (!(matchesName || matchesCompany || matchesEmail || matchesPhone || matchesNotes)) {
          return false;
        }
      }

      // Filter based on source/tag
      if (selectedSource) {
        if (!contact.source) return false;
        
        const contactSources = contact.source.split(',').map(s => s.trim());
        if (!contactSources.includes(selectedSource)) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      // Sort based on the selected field and direction
      let comparison = 0;

      if (sortField === "createdAt") {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortField === "updatedAt") {
        comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      } else {
        const aValue = a[sortField] || "";
        const bValue = b[sortField] || "";
        
        comparison = String(aValue).localeCompare(String(bValue));
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
};

export const groupContactsByFirstLetter = (
  contacts: Contact[],
  sortField: SortField,
  sortDirection: SortDirection
) => {
  const groupedContacts: Record<string, Contact[]> = {};

  // Group contacts by first letter of the grouping field
  contacts.forEach((contact) => {
    let value = "";
    
    if (sortField === "fullName") {
      value = contact.fullName || "Unknown";
    } else if (sortField === "company") {
      value = contact.company || "Unknown";
    } else if (sortField === "email") {
      value = contact.email || "Unknown";
    } else if (sortField === "phone") {
      value = contact.phone || "Unknown";
    } else if (sortField === "source") {
      value = contact.source || "Unknown";
    } else if (sortField === "createdAt") {
      // Format date as "YYYY-MM" for grouping by month
      const date = new Date(contact.createdAt);
      value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    } else if (sortField === "updatedAt") {
      // Format date as "YYYY-MM" for grouping by month
      const date = new Date(contact.updatedAt);
      value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    } else {
      value = "Unknown";
    }

    let group = "";

    // For date fields, use special grouping
    if (sortField === "createdAt" || sortField === "updatedAt") {
      // Format as "Month YYYY"
      const [year, month] = value.split("-");
      const monthNames = ["January", "February", "March", "April", "May", "June", 
                          "July", "August", "September", "October", "November", "December"];
      group = `${monthNames[parseInt(month) - 1]} ${year}`;
    } else {
      // For other fields, group by first letter
      const firstChar = value.charAt(0).toUpperCase();
      group = /[A-Z]/.test(firstChar) ? firstChar : "#";
    }

    if (!groupedContacts[group]) {
      groupedContacts[group] = [];
    }

    groupedContacts[group].push(contact);
  });

  // Sort the groups
  let sortedGroups: string[];
  
  if (sortField === "createdAt" || sortField === "updatedAt") {
    // For date fields, sort chronologically
    sortedGroups = Object.keys(groupedContacts).sort((a, b) => {
      const monthNames = ["January", "February", "March", "April", "May", "June", 
                          "July", "August", "September", "October", "November", "December"];
      
      const [aMonth, aYear] = a.split(" ");
      const [bMonth, bYear] = b.split(" ");
      
      const aMonthIndex = monthNames.indexOf(aMonth);
      const bMonthIndex = monthNames.indexOf(bMonth);
      
      const aDate = new Date(parseInt(aYear), aMonthIndex);
      const bDate = new Date(parseInt(bYear), bMonthIndex);
      
      return sortDirection === "asc" 
        ? aDate.getTime() - bDate.getTime() 
        : bDate.getTime() - aDate.getTime();
    });
  } else {
    // For other fields, sort alphabetically
    sortedGroups = Object.keys(groupedContacts).sort((a, b) => {
      if (a === "#" && b !== "#") return 1;
      if (a !== "#" && b === "#") return -1;
      return sortDirection === "asc" ? a.localeCompare(b) : b.localeCompare(a);
    });
  }

  return { groupedContacts, sortedGroups };
};
