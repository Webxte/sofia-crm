
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useContacts } from "@/context/ContactsContext";
import { Contact } from "@/types";
import { EmptyState } from "@/components/EmptyState";
import { Users } from "lucide-react";
import ContactImporter from "@/components/contacts/ContactImporter";
import { useIsMobile } from "@/hooks/use-mobile";
import { ContactsHeader } from "@/components/contacts/ContactsHeader";
import { ContactsFilter } from "@/components/contacts/ContactsFilter";
import { ContactsList } from "@/components/contacts/ContactsList";
import { ContactsGrid } from "@/components/contacts/ContactsGrid";
import { useAuth } from "@/context/AuthContext";

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
  const [showAllContacts, setShowAllContacts] = useState(false); // Show only agent's contacts by default

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
  
  const filteredContacts = contacts.filter(contact => {
    // Filter by agent ID first if not showing all contacts
    if (!showAllContacts && user && user.id !== contact.agentId) {
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
  });

  // Group contacts for grid view
  const groupedContacts = React.useMemo(() => {
    const groups: Record<string, Contact[]> = {};
    
    filteredContacts.forEach(contact => {
      let firstChar = '#';
      
      if (contact.fullName) {
        firstChar = contact.fullName.charAt(0).toUpperCase();
      } else if (contact.company) {
        firstChar = contact.company.charAt(0).toUpperCase();
      }
      
      if (!/[A-Z]/.test(firstChar)) {
        firstChar = '#';
      }
      
      if (!groups[firstChar]) {
        groups[firstChar] = [];
      }
      
      groups[firstChar].push(contact);
    });
    
    Object.keys(groups).forEach(key => {
      groups[key].sort((a, b) => {
        const aName = a.fullName || a.company || '';
        const bName = b.fullName || b.company || '';
        return aName.localeCompare(bName);
      });
    });
    
    return groups;
  }, [filteredContacts]);
  
  const sortedGroups = Object.keys(groupedContacts).sort();
  
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
      
      {filteredContacts.length === 0 ? (
        <EmptyState
          icon={<Users size={50} />}
          title="No contacts found"
          description={
            searchQuery || selectedSource
              ? "Try adjusting your search or filter"
              : "Get started by adding your first contact"
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
    </div>
  );
};

export default Contacts;
