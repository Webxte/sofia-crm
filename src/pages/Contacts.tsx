import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useContacts } from "@/context/ContactsContext";
import { Contact } from "@/types";
import { EmptyState } from "@/components/EmptyState";
import { Users, ArrowDownUp, Mail } from "lucide-react";
import ContactImporter from "@/components/contacts/ContactImporter";
import { useIsMobile } from "@/hooks/use-mobile";
import { ContactsHeader } from "@/components/contacts/ContactsHeader";
import { ContactsFilter } from "@/components/contacts/ContactsFilter";
import { ContactsList } from "@/components/contacts/ContactsList";
import { ContactsGrid } from "@/components/contacts/ContactsGrid";
import { useAuth } from "@/context/AuthContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { BulkEmailDialog } from "@/components/contacts/BulkEmailDialog";

type SortField = "fullName" | "company" | "email" | "phone" | "source";
type SortDirection = "asc" | "desc";

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
  
  // Add sorting state
  const [sortField, setSortField] = useState<SortField>("company");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

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

  // Group contacts for grid view
  const groupedContacts = React.useMemo(() => {
    const groups: Record<string, Contact[]> = {};
    
    filteredContacts.forEach(contact => {
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
    
    return groups;
  }, [filteredContacts, sortField, sortDirection]);
  
  // Sort the group keys based on sortDirection
  const sortedGroups = Object.keys(groupedContacts).sort((a, b) => {
    return sortDirection === "asc" 
      ? a.localeCompare(b) 
      : b.localeCompare(a);
  });
  
  const handleScheduleMeeting = (contactId: string) => {
    navigate(`/meetings/new?contactId=${contactId}`);
  };

  const handleCreateTask = (contactId: string) => {
    navigate(`/tasks/new?contactId=${contactId}`);
  };

  const handleCreateOrder = (contactId: string) => {
    navigate(`/orders/new?contactId=${contactId}`);
  };

  const toggleSortDirection = () => {
    setSortDirection(prev => prev === "asc" ? "desc" : "asc");
  };
  
  const handleSortChange = (field: SortField) => {
    if (sortField === field) {
      // If clicking the same field, toggle direction
      toggleSortDirection();
    } else {
      // If clicking a new field, set it as the sort field and reset direction to asc
      setSortField(field);
      setSortDirection("asc");
    }
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <ArrowDownUp className="h-4 w-4 mr-2" />
                Sort: {sortField === "company" ? "Company" : 
                      sortField === "fullName" ? "Name" : 
                      sortField === "email" ? "Email" :
                      sortField === "phone" ? "Phone" : "Source"}
                {sortDirection === "asc" ? " (A-Z)" : " (Z-A)"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleSortChange("company")}>
                Sort by Company
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange("fullName")}>
                Sort by Name
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange("email")}>
                Sort by Email
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange("phone")}>
                Sort by Phone
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange("source")}>
                Sort by Source
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
