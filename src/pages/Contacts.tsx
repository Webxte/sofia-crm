
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useContacts } from "@/context/ContactsContext";
import { Contact } from "@/types";
import { EmptyState } from "@/components/EmptyState";
import { Users, Mail } from "lucide-react";
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

const Contacts = () => {
  const navigate = useNavigate();
  const { contacts, refreshContacts } = useContacts();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [showImporter, setShowImporter] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isMobile = useIsMobile();
  const [viewMode, setViewMode] = useState<"grid" | "list">(isMobile ? "grid" : "list");
  const [showAllContacts, setShowAllContacts] = useState(false);
  const [showBulkEmailDialog, setShowBulkEmailDialog] = useState(false);
  
  const { sortField, sortDirection, handleSortChange, toggleSortDirection } = useContactSorting();

  const sources = React.useMemo(() => {
    const allSources = new Set<string>();
    
    contacts.forEach(contact => {
      if (contact.source) {
        const contactSources = contact.source.split(',').map(s => s.trim());
        contactSources.forEach(source => {
          if (source) allSources.add(source);
        });
      }
    });
    
    return Array.from(allSources).sort();
  }, [contacts]);

  // Update view mode when screen size changes
  useEffect(() => {
    setViewMode(isMobile ? "grid" : "list");
  }, [isMobile]);
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshContacts();
    setIsRefreshing(false);
  };
  
  const filteredContacts = React.useMemo(() => {
    return useContactFilters(contacts, {
      showAllContacts,
      userId: user?.id,
      searchQuery,
      selectedSource,
      sortField,
      sortDirection
    });
  }, [contacts, showAllContacts, user?.id, searchQuery, selectedSource, sortField, sortDirection]);

  // Group contacts for grid view
  const { groupedContacts, sortedGroups } = React.useMemo(() => {
    return groupContactsByFirstLetter(filteredContacts, sortField, sortDirection);
  }, [filteredContacts, sortField, sortDirection]);
  
  const handleScheduleMeeting = (contactId: string) => {
    navigate(`/meetings/new?contactId=${contactId}`);
  };

  const handleCreateTask = (contactId: string) => {
    navigate(`/tasks/new?contactId=${contactId}`);
  };

  const handleCreateOrder = (contactId: string) => {
    navigate(`/orders/new?contactId=${contactId}`);
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
      
      {filteredContacts.length === 0 ? (
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
        viewMode === "grid" ? (
          <ContactsGrid 
            groupedContacts={groupedContacts} 
            sortedGroups={sortedGroups}
            onScheduleMeeting={handleScheduleMeeting}
            onCreateTask={handleCreateTask}
            onCreateOrder={handleCreateOrder}
          />
        ) : (
          <ContactsList 
            contacts={filteredContacts}
            onScheduleMeeting={handleScheduleMeeting}
            onCreateTask={handleCreateTask}
            onCreateOrder={handleCreateOrder}
          />
        )
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
