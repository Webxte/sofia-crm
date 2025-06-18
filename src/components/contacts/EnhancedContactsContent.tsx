
import { Contact } from "@/types";
import { EnhancedEmptyState } from "@/components/ui/enhanced-empty-state";
import { ContactCardSkeleton } from "@/components/ui/enhanced-skeleton";
import { Users, UserPlus } from "lucide-react";
import { ContactsGrid } from "@/components/contacts/ContactsGrid";
import { ContactsList } from "@/components/contacts/ContactsList";
import { cn } from "@/lib/utils";

interface EnhancedContactsContentProps {
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

export const EnhancedContactsContent = ({
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
}: EnhancedContactsContentProps) => {
  // Enhanced loading state with staggered animations
  if (loading && !contacts.length) {
    return (
      <div className={cn(
        viewMode === "grid" 
          ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3" 
          : "space-y-4"
      )}>
        {Array.from({ length: viewMode === "grid" ? 6 : 8 }).map((_, i) => (
          <div
            key={i}
            className="animate-fadeInUp opacity-0"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <ContactCardSkeleton />
          </div>
        ))}
      </div>
    );
  }

  // Enhanced empty state
  if (filteredContacts.length === 0) {
    const getEmptyStateProps = () => {
      if (searchQuery || selectedSource) {
        return {
          icon: <Users className="h-16 w-16" />,
          title: "No contacts found",
          description: "Try adjusting your search or filter criteria to find the contacts you're looking for.",
          actionText: "Clear Filters",
          onAction: () => window.location.reload() // Simple clear for now
        };
      }

      if (!showAllContacts) {
        return {
          icon: <Users className="h-16 w-16" />,
          title: "No contacts assigned",
          description: "You don't have any contacts assigned to you yet. Try showing all contacts or add a new one to get started.",
          actionText: "Add Contact",
          actionLink: "/contacts/new"
        };
      }

      return {
        icon: <UserPlus className="h-16 w-16" />,
        title: "Get started with contacts",
        description: "Your contact list is empty. Add your first contact to start building relationships and growing your business.",
        actionText: "Add Contact",
        actionLink: "/contacts/new"
      };
    };

    return (
      <div className="animate-fadeInUp opacity-0">
        <EnhancedEmptyState 
          {...getEmptyStateProps()}
          size="lg"
          className="py-16"
        />
      </div>
    );
  }

  // Enhanced content rendering with animations
  const contentClass = cn(
    "animate-fadeInUp opacity-0",
    viewMode === "grid" && "space-y-6",
    viewMode === "list" && "space-y-4"
  );

  if (viewMode === "grid") {
    return (
      <div className={contentClass}>
        <ContactsGrid 
          groupedContacts={groupedContacts} 
          sortedGroups={sortedGroups}
          onScheduleMeeting={onScheduleMeeting}
          onCreateTask={onCreateTask}
          onCreateOrder={onCreateOrder}
        />
      </div>
    );
  }

  return (
    <div className={contentClass}>
      <ContactsList 
        contacts={paginatedContacts}
        onScheduleMeeting={onScheduleMeeting}
        onCreateTask={onCreateTask}
        onCreateOrder={onCreateOrder}
      />
    </div>
  );
};
