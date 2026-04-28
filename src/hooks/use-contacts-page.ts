
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useContacts } from "@/context/ContactsContext";
import { useAuth } from "@/context/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { useContactSorting } from "@/hooks/use-contact-sorting";
import { useContactFilters, groupContactsByFirstLetter } from "@/utils/contactUtils";
import { usePagination } from "@/hooks/use-pagination";

export const useContactsPage = () => {
  const navigate = useNavigate();
  const { contacts, refreshContacts, loading, showAllContacts, setShowAllContacts } = useContacts();
  const { user, isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [showImporter, setShowImporter] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isMobile = useIsMobile();
  const [viewMode, setViewMode] = useState<"grid" | "list">(isMobile ? "grid" : "list");
  const [showBulkEmailDialog, setShowBulkEmailDialog] = useState(false);
  
  const { sortField, sortDirection, handleSortChange } = useContactSorting();

  // Extract unique sources from contacts for the source filter
  const sources = useMemo(() => {
    const sourceSet = new Set<string>();
    contacts.forEach(contact => {
      if (contact.source) {
        contact.source.split(',').forEach(src => {
          sourceSet.add(src.trim());
        });
      }
    });
    return Array.from(sourceSet).sort();
  }, [contacts]);

  // Update view mode when screen size changes
  useEffect(() => {
    setViewMode(isMobile ? "grid" : "list");
  }, [isMobile]);
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshContacts();
    } catch (error) {
      console.error("Error during manual refresh:", error);
    } finally {
      setIsRefreshing(false);
    }
  };
  
  const filteredContacts = useMemo(() => {
    return useContactFilters(contacts, {
      showAllContacts: true, // Always show filtered contacts since we're handling the toggle at fetch level
      userId: user?.id,
      searchQuery,
      selectedSource,
      selectedType,
      sortField,
      sortDirection
    });
  }, [contacts, user?.id, searchQuery, selectedSource, selectedType, sortField, sortDirection]);

  // Add pagination
  const pagination = usePagination({ 
    data: filteredContacts, 
    itemsPerPage: isMobile ? 12 : 20 
  });

  // Group contacts for grid view
  const { groupedContacts, sortedGroups } = useMemo(() => {
    return groupContactsByFirstLetter(pagination.paginatedData, sortField, sortDirection);
  }, [pagination.paginatedData, sortField, sortDirection]);
  
  const handleScheduleMeeting = (contactId: string) => {
    navigate(`/meetings/new?contactId=${contactId}`);
  };

  const handleCreateTask = (contactId: string) => {
    navigate(`/tasks/new?contactId=${contactId}`);
  };

  const handleCreateOrder = (contactId: string) => {
    navigate(`/orders/new?contactId=${contactId}`);
  };

  return {
    // Data
    contacts,
    filteredContacts,
    groupedContacts,
    sortedGroups,
    sources,
    loading,
    
    // State
    searchQuery,
    setSearchQuery,
    selectedSource,
    setSelectedSource,
    selectedType,
    setSelectedType,
    showAllContacts,
    setShowAllContacts,
    showImporter,
    setShowImporter,
    isRefreshing,
    viewMode,
    setViewMode,
    showBulkEmailDialog,
    setShowBulkEmailDialog,
    
    // Sorting
    sortField,
    sortDirection,
    handleSortChange,
    
    // Pagination
    pagination,
    
    // Actions
    handleRefresh,
    handleScheduleMeeting,
    handleCreateTask,
    handleCreateOrder,
  };
};
