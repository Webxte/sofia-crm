
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { ContactsFilter } from "@/components/contacts/ContactsFilter";
import { ContactSortingMenu } from "@/components/contacts/ContactSortingMenu";
import { SortField, SortDirection } from "@/hooks/use-contact-sorting";

interface ContactsToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  showAllContacts: boolean;
  onShowAllContactsChange: (show: boolean) => void;
  selectedSource: string | null;
  onSourceChange: (source: string | null) => void;
  sources: string[];
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  sortField: SortField;
  sortDirection: SortDirection;
  onSortChange: (field: SortField) => void;
  filteredContactsCount: number;
  onBulkEmailClick: () => void;
}

export const ContactsToolbar = ({
  searchQuery,
  onSearchChange,
  showAllContacts,
  onShowAllContactsChange,
  selectedSource,
  onSourceChange,
  sources,
  viewMode,
  onViewModeChange,
  onRefresh,
  isRefreshing,
  sortField,
  sortDirection,
  onSortChange,
  filteredContactsCount,
  onBulkEmailClick,
}: ContactsToolbarProps) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
      <ContactsFilter
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        showAllContacts={showAllContacts}
        onShowAllContactsChange={onShowAllContactsChange}
        selectedSource={selectedSource}
        onSourceChange={onSourceChange}
        sources={sources}
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
        onRefresh={onRefresh}
        isRefreshing={isRefreshing}
      />

      <div className="flex gap-2 items-center mt-2 sm:mt-0">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onBulkEmailClick}
          disabled={filteredContactsCount === 0}
          className="mr-2"
        >
          <Mail className="h-4 w-4 mr-2" />
          Bulk Email ({filteredContactsCount})
        </Button>

        <ContactSortingMenu 
          sortField={sortField} 
          sortDirection={sortDirection} 
          onSortChange={onSortChange} 
        />
      </div>
    </div>
  );
};
