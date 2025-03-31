
import React, { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useContacts } from "@/context/ContactsContext";
import { useAuth } from "@/context/AuthContext";
import { Contact } from "@/types";
import ContactCard from "@/components/contacts/ContactCard";
import { EmptyState } from "@/components/EmptyState";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Users, 
  PlusCircle,
  Search,
  RefreshCw
} from "lucide-react";
import ContactImporter from "@/components/contacts/ContactImporter";

const Contacts = () => {
  const navigate = useNavigate();
  const { contacts, refreshContacts } = useContacts();
  const { user, isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [showImporter, setShowImporter] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
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
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshContacts();
    setIsRefreshing(false);
  };
  
  const filteredContacts = contacts.filter(contact => {
    const shouldShowContact = isAdmin || 
      !selectedSource || 
      (contact.agentName === user?.name || (selectedSource && contact.source?.includes(selectedSource)));
    
    if (!shouldShowContact) {
      return false;
    }
    
    if (selectedSource) {
      if (!contact.source) return false;
      const contactSources = contact.source.split(',').map(s => s.trim());
      if (!contactSources.includes(selectedSource)) {
        return false;
      }
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        (contact.fullName?.toLowerCase().includes(query)) ||
        (contact.email?.toLowerCase().includes(query)) ||
        (contact.company?.toLowerCase().includes(query)) ||
        (contact.phone?.toLowerCase().includes(query))
      );
    }
    
    return true;
  });

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
  
  // Handlers for ContactCard required props
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Contacts</h1>
          <p className="text-muted-foreground">
            Manage your contacts and leads
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowImporter(true)}
          >
            Import
          </Button>
          <Button 
            onClick={() => navigate("/contacts/new")}
            size="sm"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            New Contact
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search contacts..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select 
          value={selectedSource || ""} 
          onValueChange={(value) => setSelectedSource(value || null)}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All Sources" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Sources</SelectItem>
            {sources.map(source => (
              <SelectItem key={source} value={source}>
                {source}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
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
        <div className="space-y-6">
          {sortedGroups.map(group => (
            <Card key={group}>
              <CardHeader className="py-3">
                <CardTitle className="text-sm text-muted-foreground">{group}</CardTitle>
                <CardDescription>
                  {groupedContacts[group].length} contact{groupedContacts[group].length !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-2">
                {groupedContacts[group].map(contact => (
                  <ContactCard 
                    key={contact.id} 
                    contact={contact} 
                    onScheduleMeeting={handleScheduleMeeting}
                    onCreateTask={handleCreateTask}
                    onCreateOrder={handleCreateOrder}
                  />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
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
