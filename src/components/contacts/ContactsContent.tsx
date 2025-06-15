
import { Contact } from "@/types";
import { EmptyState } from "@/components/EmptyState";
import { Users } from "lucide-react";
import { ContactsGrid } from "@/components/contacts/ContactsGrid";
import { ContactsList } from "@/components/contacts/ContactsList";
import { ContactCardSkeleton } from "@/components/ui/LoadingSkeleton";

interface ContactsContentProps {
  loading: boolean;
  contacts: Contact[];
  filteredContacts: Contact[];
  paginatedContacts: Contact[];
  groupedContacts: Record<string, Contact[]>;
  sortedGroups: string[];
  searchQuery: string;
  selectedSource: string | null;
  showAllContacts: boolean;
  viewMode: "grid" | "list";
  onScheduleMeeting: (contactId: string) => void;
  onCreateTask: (contactId: string) => void;
  onCreateOrder: (contactId: string) => void;
}

export const ContactsContent = ({
  loading,
  contacts,
  filteredContacts,
  paginatedContacts,
  groupedContacts,
  sortedGroups,
  searchQuery,
  selectedSource,
  showAllContacts,
  viewMode,
  onScheduleMeeting,
  onCreateTask,
  onCreateOrder,
}: ContactsContentProps) => {
  if (loading && !contacts.length) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <ContactCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (filteredContacts.length === 0) {
    return (
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
    );
  }

  if (viewMode === "grid") {
    return (
      <ContactsGrid 
        groupedContacts={groupedContacts} 
        sortedGroups={sortedGroups}
        onScheduleMeeting={onScheduleMeeting}
        onCreateTask={onCreateTask}
        onCreateOrder={onCreateOrder}
      />
    );
  }

  return (
    <ContactsList 
      contacts={paginatedContacts}
      onScheduleMeeting={onScheduleMeeting}
      onCreateTask={onCreateTask}
      onCreateOrder={onCreateOrder}
    />
  );
};
