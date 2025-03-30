
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Plus, 
  Search, 
  ArrowUpDown, 
  UserPlus, 
  Users, 
  Grid, 
  List,
  Calendar,
  ListChecks,
  ShoppingCart,
  Tag
} from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useContacts } from "@/context/ContactsContext";
import { useAuth } from "@/context/AuthContext";
import ContactCard from "@/components/contacts/ContactCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Contact } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ContactDeleteDialog } from "@/components/contacts/ContactDeleteDialog";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuCheckboxItem, 
  DropdownMenuTrigger, 
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { getAvailableSources } from "@/context/contacts/contactUtils";

// Sort options
type SortOption = "name" | "company" | "recent";
type ViewMode = "grid" | "list";

const Contacts = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const { contacts, loading, refreshContacts } = useContacts();
  const { isAdmin, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Get initial source from user's name if available
  useEffect(() => {
    if (user?.name && !selectedSource) {
      // Don't auto-select source for admins
      if (!isAdmin) {
        setSelectedSource(user.name);
      }
    }
  }, [user, isAdmin]);

  useEffect(() => {
    refreshContacts();
  }, []);
  
  // Get all available sources for filtering
  const availableSources = getAvailableSources(contacts);
  
  // Filter contacts based on selected source and search query
  const filteredContacts = contacts.filter(contact => {
    // Apply source filter if selected (but not if user is admin and has explicitly selected "All Sources")
    if (selectedSource && !(isAdmin && selectedSource === null)) {
      if (!contact.source) return false;
      
      // Split the source string by commas to handle multiple tags
      const contactSources = contact.source.split(',').map(s => s.trim());
      
      // Check if the contact has the selected source tag
      if (!contactSources.includes(selectedSource)) {
        return false;
      }
    }
    
    // Admins can see all contacts when no filter is applied
    // Non-admins can only see their own contacts (by agent name) unless explicitly filtered
    if (!isAdmin && !selectedSource) {
      // If not an admin and no source selected, only show user's contacts
      if (user?.name && contact.agentName !== user.name) {
        return false;
      }
    }
    
    // Apply search query filter
    if (searchQuery.trim() === "") return true;
    
    const searchLower = searchQuery.toLowerCase();
    const name = contact.fullName?.toLowerCase() || "";
    const company = contact.company?.toLowerCase() || "";
    const email = contact.email?.toLowerCase() || "";
    const position = contact.position?.toLowerCase() || "";
    const source = contact.source?.toLowerCase() || "";
    
    return name.includes(searchLower) || 
           company.includes(searchLower) || 
           email.includes(searchLower) ||
           position.includes(searchLower) ||
           source.includes(searchLower);
  });
  
  const sortedContacts = [...filteredContacts].sort((a, b) => {
    if (sortBy === "name") {
      const nameA = a.fullName?.toLowerCase() || "";
      const nameB = b.fullName?.toLowerCase() || "";
      return nameA.localeCompare(nameB);
    } else if (sortBy === "company") {
      const companyA = a.company?.toLowerCase() || "";
      const companyB = b.company?.toLowerCase() || "";
      return companyA.localeCompare(companyB);
    } else {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
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

  const renderSkeletons = () => {
    return Array(6)
      .fill(0)
      .map((_, index) => (
        <div key={index} className="border rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-8 w-full mt-2" />
          </div>
        </div>
      ));
  };

  const renderListView = () => (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Company</TableHead>
            <TableHead>Contact Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Position</TableHead>
            <TableHead>Source/Tag</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedContacts.map((contact) => (
            <TableRow key={contact.id}>
              <TableCell className="font-medium">{contact.company || "-"}</TableCell>
              <TableCell>{contact.fullName || "-"}</TableCell>
              <TableCell>{contact.email || "-"}</TableCell>
              <TableCell>{contact.phone || contact.mobile || "-"}</TableCell>
              <TableCell>{contact.position || "-"}</TableCell>
              <TableCell>{contact.source || "-"}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleScheduleMeeting(contact.id)}
                  >
                    <Calendar className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCreateTask(contact.id)}
                  >
                    <ListChecks className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCreateOrder(contact.id)}
                  >
                    <ShoppingCart className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/contacts/edit/${contact.id}`)}
                  >
                    View
                  </Button>
                  <ContactDeleteDialog contact={contact} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Contacts</h1>
          <p className="text-muted-foreground mt-1">
            {selectedSource ? `Viewing contacts for: ${selectedSource}` : 'Manage your contacts and their information'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button className="sm:w-auto w-full" asChild>
            <Link to="/contacts/new">
              <UserPlus className="mr-2 h-4 w-4" /> Add Contact
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search contacts..."
            className="w-full pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 sm:ml-auto">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setSortBy(sortBy === "company" ? "name" : (sortBy === "name" ? "recent" : "company"))}
          >
            <ArrowUpDown className="mr-2 h-4 w-4" />
            Sort by {sortBy === "company" ? "Name" : sortBy === "name" ? "Recent" : "Company"}
          </Button>
          <div className="flex border rounded-md overflow-hidden">
            <Button 
              variant={viewMode === "grid" ? "default" : "ghost"} 
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button 
              variant={viewMode === "list" ? "default" : "ghost"} 
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          {/* Source/Tag Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Tag className="mr-2 h-4 w-4" />
                {selectedSource || "All Sources"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Filter by Source/Agent</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={selectedSource === null}
                onSelect={() => setSelectedSource(null)}
              >
                All Sources
              </DropdownMenuCheckboxItem>
              {availableSources.map(source => (
                <DropdownMenuCheckboxItem
                  key={source}
                  checked={selectedSource === source}
                  onSelect={() => setSelectedSource(source)}
                >
                  {source}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {renderSkeletons()}
        </div>
      ) : sortedContacts.length === 0 ? (
        <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
          <EmptyState
            icon={<Users size={40} />}
            title="No contacts found"
            description={selectedSource ? `No contacts found with source: ${selectedSource}` : "Get started by creating your first contact."}
            actionText="Add Contact"
            actionLink="/contacts/new"
          />
        </div>
      ) : (
        viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedContacts.map((contact) => (
              <ContactCard
                key={contact.id}
                contact={contact}
                onScheduleMeeting={handleScheduleMeeting}
                onCreateTask={handleCreateTask}
                onCreateOrder={handleCreateOrder}
              />
            ))}
          </div>
        ) : (
          renderListView()
        )
      )}
    </div>
  );
};

export default Contacts;
