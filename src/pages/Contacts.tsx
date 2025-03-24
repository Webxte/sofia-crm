
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search, Filter, ArrowUpDown, UserPlus, Users } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useContacts } from "@/context/ContactsContext";
import { useAuth } from "@/context/AuthContext";
import ContactCard from "@/components/contacts/ContactCard";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Contact } from "@/types";

// Sort options
type SortOption = "name" | "company" | "recent";

const Contacts = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Fetch contacts from Supabase
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setLoading(true);
        let query = supabase.from('contacts').select('*');
        
        // If not admin, only fetch own contacts
        if (!isAdmin && user) {
          query = query.eq('agent_id', user.id);
        }
        
        const { data, error } = await query;
        
        if (error) {
          throw error;
        }
        
        // Convert data to our Contact type
        const formattedContacts: Contact[] = data.map((item) => ({
          id: item.id,
          fullName: item.full_name || undefined,
          company: item.company || undefined,
          email: item.email || undefined,
          phone: item.phone || undefined,
          mobile: item.mobile || undefined,
          address: item.address || undefined,
          notes: item.notes || undefined,
          position: item.position || undefined,
          agentId: item.agent_id || undefined,
          agentName: item.agent_name || undefined,
          createdAt: new Date(item.created_at),
          updatedAt: new Date(item.updated_at),
        }));
        
        setContacts(formattedContacts);
      } catch (error) {
        console.error("Error fetching contacts:", error);
        toast({
          title: "Error",
          description: "Failed to load contacts. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchContacts();
  }, [isAdmin, user, toast]);
  
  // Filter contacts based on search query
  const filteredContacts = contacts.filter(contact => {
    const searchLower = searchQuery.toLowerCase();
    const name = contact.fullName?.toLowerCase() || "";
    const company = contact.company?.toLowerCase() || "";
    const email = contact.email?.toLowerCase() || "";
    
    return name.includes(searchLower) || 
           company.includes(searchLower) || 
           email.includes(searchLower);
  });
  
  // Sort contacts based on sortBy
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
      // Sort by recent (created date)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  // Handle scheduling a meeting with a contact
  const handleScheduleMeeting = (contactId: string) => {
    navigate(`/meetings/new?contactId=${contactId}`);
  };

  // Handle creating a task for a contact
  const handleCreateTask = (contactId: string) => {
    navigate(`/tasks/new?contactId=${contactId}`);
  };

  // Handle creating an order for a contact
  const handleCreateOrder = (contactId: string) => {
    navigate(`/orders/new?contactId=${contactId}`);
  };

  // Loading skeletons
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Contacts</h1>
          <p className="text-muted-foreground mt-1">
            Manage your contacts and their information
          </p>
        </div>
        <Button className="sm:w-auto w-full" asChild>
          <Link to="/contacts/new">
            <UserPlus className="mr-2 h-4 w-4" /> Add Contact
          </Link>
        </Button>
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
            onClick={() => setSortBy(sortBy === "name" ? "company" : "name")}
          >
            <ArrowUpDown className="mr-2 h-4 w-4" />
            Sort by {sortBy === "name" ? "Company" : "Name"}
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" /> Filter
          </Button>
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
            description="Get started by creating your first contact."
            actionText="Add Contact"
            actionLink="/contacts/new"
          />
        </div>
      ) : (
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
      )}
    </div>
  );
};

export default Contacts;
