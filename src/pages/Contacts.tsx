
import React, { useState } from "react";
import ContactImporter from "@/components/contacts/ContactImporter";
import { ContactsHeader } from "@/components/contacts/ContactsHeader";
import { ContactsToolbar } from "@/components/contacts/ContactsToolbar";
import { ContactsContent } from "@/components/contacts/ContactsContent";
import { ContactsPagination } from "@/components/contacts/ContactsPagination";
import { BulkEmailDialog } from "@/components/contacts/BulkEmailDialog";
import { ContactMergeDialog } from "@/components/contacts/ContactMergeDialog";
import { useContactsPage } from "@/hooks/use-contacts-page";

const Contacts = () => {
  const [showMergeDialog, setShowMergeDialog] = useState(false);
  const {
    contacts,
    filteredContacts,
    groupedContacts,
    sortedGroups,
    sources,
    loading,
    searchQuery,
    setSearchQuery,
    selectedSource,
    setSelectedSource,
    showAllContacts,
    setShowAllContacts,
    showImporter,
    setShowImporter,
    isRefreshing,
    viewMode,
    setViewMode,
    showBulkEmailDialog,
    setShowBulkEmailDialog,
    sortField,
    sortDirection,
    handleSortChange,
    pagination,
    handleRefresh,
    handleScheduleMeeting,
    handleCreateTask,
    handleCreateOrder,
  } = useContactsPage();
  
  return (
    <div className="space-y-6">
      <ContactsHeader onImportClick={() => setShowImporter(true)} filteredContacts={filteredContacts} />
      
      <ContactsToolbar
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
        sortField={sortField}
        sortDirection={sortDirection}
        onSortChange={handleSortChange}
        filteredContactsCount={filteredContacts.length}
        onBulkEmailClick={() => setShowBulkEmailDialog(true)}
        onMergeClick={() => setShowMergeDialog(true)}
      />
      
      <ContactsContent
        loading={loading}
        contacts={contacts}
        filteredContacts={filteredContacts}
        paginatedContacts={pagination.paginatedData}
        groupedContacts={groupedContacts}
        sortedGroups={sortedGroups}
        searchQuery={searchQuery}
        selectedSource={selectedSource}
        showAllContacts={showAllContacts}
        viewMode={viewMode}
        onScheduleMeeting={handleScheduleMeeting}
        onCreateTask={handleCreateTask}
        onCreateOrder={handleCreateOrder}
      />
      
      <ContactsPagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        totalItems={pagination.totalItems}
        startIndex={pagination.startIndex}
        endIndex={pagination.endIndex}
        hasNextPage={pagination.hasNextPage}
        hasPreviousPage={pagination.hasPreviousPage}
        onNextPage={pagination.goToNextPage}
        onPreviousPage={pagination.goToPreviousPage}
      />
      
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

      <ContactMergeDialog
        open={showMergeDialog}
        onOpenChange={setShowMergeDialog}
      />
    </div>
  );
};

export default Contacts;
