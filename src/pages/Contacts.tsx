
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useContacts } from "@/context/ContactsContext";
import { Contact } from "@/types";
import { EmptyState } from "@/components/EmptyState";
import { Users, Mail, ChevronLeft, ChevronRight } from "lucide-react";
import ContactImporter from "@/components/contacts/ContactImporter";
import { useIsMobile } from "@/hooks/use-mobile";
import { ContactsHeader } from "@/components/contacts/ContactsHeader";
import { ContactsFilter } from "@/components/contacts/ContactsFilter";
import { ContactsList } from "@/components/contacts/ContactsList";
import { ContactsGrid } from "@/components/contacts/ContactsGrid";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { BulkEmailDialog } from "@/components/contacts/BulkEmailDialog";
import { useContactSorting } from "@/hooks/use-contact-sorting";
import { useContactFilters, groupContactsByFirstLetter } from "@/utils/contactUtils";
import { ContactSortingMenu } from "@/components/contacts/ContactSortingMenu";
import { usePagination } from "@/hooks/use-pagination";
import { ContactCardSkeleton } from "@/components/ui/LoadingSkeleton";

const Contacts = () => {
  const navigate = useNavigate();
  const { contacts, refreshContacts, loading, showAllContacts, setShowAllContacts } = useContacts();
  const { user, isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [showImporter, setShowImporter] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isMobile = useIsMobile();
  const [viewMode, setViewMode] = useState<"grid" | "list">(isMobile ? "grid" : "list");
  const [showBulkEmailDialog, setShowBulkEmailDialog] = useState(false);
  
  const { sortField, sortDirection, handleSortChange, toggleSortDirection } = useContactSorting();

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
      sortField,
      sortDirection
    });
  }, [contacts, user?.id, searchQuery, selectedSource, sortField, sortDirection]);

  // Add pagination
  const {
    currentPage,
    totalPages,
    paginatedData: paginatedContacts,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    hasNextPage,
    hasPreviousPage,
    totalItems,
    startIndex,
    endIndex
  } = usePagination({ 
    data: filteredContacts, 
    itemsPerPage: isMobile ? 12 : 20 
  });

  // Group contacts for grid view
  const { groupedContacts, sortedGroups } = useMemo(() => {
    return groupContactsByFirstLetter(paginatedContacts, sortField, sortDirection);
  }, [paginatedContacts, sortField, sortDirection]);
  
  const handleScheduleMeeting = (contactId: string) => {
    navigate(`/meetings/new?contactId=${contactId}`);
  };

  const handleCreateTask = (contactId: string) => {
    navigate(`/tasks/new?contactId=${contactId}`);
  };

  const handleCreateOrder = (contactId: string) => {
    navigate(`/orders/new?contactId=${contactId}`);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
        <div className="flex justify-between flex-1 sm:hidden">
          <Button
            onClick={goToPreviousPage}
            disabled={!hasPreviousPage}
            variant="outline"
            size="sm"
          >
            Previous
          </Button>
          <Button
            onClick={goToNextPage}
            disabled={!hasNextPage}
            variant="outline"
            size="sm"
          >
            Next
          </Button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{startIndex}</span> to{' '}
              <span className="font-medium">{endIndex}</span> of{' '}
              <span className="font-medium">{totalItems}</span> results
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={goToPreviousPage}
              disabled={!hasPreviousPage}
              variant="outline"
              size="sm"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              onClick={goToNextPage}
              disabled={!hasNextPage}
              variant="outline"
              size="sm"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      <ContactsHeader onImportClick={() => setShowImporter(true)} />
      
      <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
        <ContactsFilter
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          showAllContacts={showAllContacts}
          onShowAllContactsChange={setShowAllContacts}
          selectedSource={selectedSource}
          onSourceChange={setSelectedSource}
          sources={sources}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />

        <div className="flex gap-2 items-center mt-2 sm:mt-0">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowBulkEmailDialog(true)}
            disabled={filteredContacts.length === 0}
            className="mr-2"
          >
            <Mail className="h-4 w-4 mr-2" />
            Bulk Email ({filteredContacts.length})
          </Button>

          <ContactSortingMenu 
            sortField={sortField} 
            sortDirection={sortDirection} 
            onSortChange={handleSortChange} 
          />
        </div>
      </div>
      
      {loading && !contacts.length ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <ContactCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredContacts.length === 0 ? (
        <EmptyState
          icon={<Users size={50} />}
          title="No contacts found"
          description={
            searchQuery || selectedSource
              ? "Try adjusting your search or filter"
              : showAllContacts 
                ? "Get started by adding your first contact" 
                : "You don't have any contacts assigned to you. Try showing all contacts or add a new one."
          }
          actionText="Add Contact"
          actionLink="/contacts/new"
        />
      ) : (
        <>
          {viewMode === "grid" ? (
            <ContactsGrid 
              groupedContacts={groupedContacts} 
              sortedGroups={sortedGroups}
              onScheduleMeeting={handleScheduleMeeting}
              onCreateTask={handleCreateTask}
              onCreateOrder={handleCreateOrder}
            />
          ) : (
            <ContactsList 
              contacts={paginatedContacts}
              onScheduleMeeting={handleScheduleMeeting}
              onCreateTask={handleCreateTask}
              onCreateOrder={handleCreateOrder}
            />
          )}
          
          {renderPagination()}
        </>
      )}
      
      {showImporter && (
        <ContactImporter 
          open={showImporter} 
          onOpenChange={setShowImporter} 
        />
      )}
      
      {showBulkEmailDialog && (
        <BulkEmailDialog
          contacts={filteredContacts}
          open={showBulkEmailDialog}
          onOpenChange={setShowBulkEmailDialog}
        />
      )}
    </div>
  );
};

export default Contacts;
