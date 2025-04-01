import React, { useState, useEffect } from "react";
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
  RefreshCw,
  List,
  Grid as GridIcon
} from "lucide-react";
import ContactImporter from "@/components/contacts/ContactImporter";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Contacts = () => {
  const navigate = useNavigate();
  const { contacts, refreshContacts } = useContacts();
  const { user, isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [showImporter, setShowImporter] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [showAllContacts, setShowAllContacts] = useState(true);

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

  useEffect(() => {
    if (user && user.name && !selectedSource && !isAdmin && !showAllContacts) {
      const agentSourceExists = sources.some(source => 
        source.toLowerCase() === user.name?.toLowerCase()
      );
      
      if (agentSourceExists) {
        const agentSource = sources.find(source => 
          source.toLowerCase() === user.name?.toLowerCase()
        );
        if (agentSource) {
          setSelectedSource(agentSource);
        }
      }
    }
  }, [user, sources, selectedSource, isAdmin, showAllContacts]);
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshContacts();
    setIsRefreshing(false);
  };
  
  const filteredContacts = contacts.filter(contact => {
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
    
    if (isAdmin || showAllContacts) {
      if (selectedSource && contact.source) {
        const contactSources = contact.source.split(',').map(s => s.trim());
        return contactSources.includes(selectedSource);
      }
      return true;
    }
    
    if (selectedSource) {
      if (!contact.source) return false;
      const contactSources = contact.source.split(',').map(s => s.trim());
      return contactSources.includes(selectedSource);
    }
    
    if (user?.name) {
      if (!contact.source) return false;
      const contactSources = contact.source.split(',').map(s => s.trim());
      return contactSources.includes(user.name);
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
  
  const handleScheduleMeeting = (contactId: string) => {
    navigate(`/meetings/new?contactId=${contactId}`);
  };

  const handleCreateTask = (contactId: string) => {
    navigate(`/tasks/new?contactId=${contactId}`);
  };

  const handleCreateOrder = (contactId: string) => {
    navigate(`/orders/new?contactId=${contactId}`);
  };
  
  const renderListView = () => (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredContacts.map((contact) => (
            <TableRow key={contact.id}>
              <TableCell className="font-medium">{contact.fullName || "-"}</TableCell>
              <TableCell>{contact.company || "-"}</TableCell>
              <TableCell>{contact.email || "-"}</TableCell>
              <TableCell>{contact.phone || "-"}</TableCell>
              <TableCell>{contact.source || "-"}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => navigate(`/contacts/${contact.id}`)}
                  >
                    View
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleScheduleMeeting(contact.id)}
                  >
                    Meeting
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleCreateTask(contact.id)}
                  >
                    Task
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleCreateOrder(contact.id)}
                  >
                    Order
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  const renderGridView = () => (
    <div className="space-y-6">
      {sortedGroups.map(group => (
        <Card key={group}>
          <CardHeader className="py-3">
            <CardTitle className="text-sm text-muted-foreground">{group}</CardTitle>
            <CardDescription>
              {groupedContacts[group].length} contact{groupedContacts[group].length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
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
  );
  
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
          {isAdmin && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowImporter(true)}
            >
              Import
            </Button>
          )}
          <Button 
            onClick={() => navigate("/contacts/new")}
            size="sm"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            New Contact
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-2 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search contacts..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 items-center">
          {!isAdmin && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showAllContacts"
                checked={showAllContacts}
                onChange={(e) => {
                  setShowAllContacts(e.target.checked);
                  if (!e.target.checked && user?.name) {
                    const agentSource = sources.find(source =>
                      source.toLowerCase() === user.name?.toLowerCase()
                    );
                    setSelectedSource(agentSource || null);
                  }
                }}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="showAllContacts" className="text-sm">
                Show all contacts
              </label>
            </div>
          )}
          <Select 
            value={selectedSource || "all"} 
            onValueChange={(value) => setSelectedSource(value === "all" ? null : value)}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="All Sources" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              {sources.map(source => (
                <SelectItem key={source} value={source}>
                  {source}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex border rounded-md overflow-hidden">
          <Button 
            variant={viewMode === "grid" ? "default" : "ghost"} 
            size="sm"
            onClick={() => setViewMode("grid")}
            className="rounded-none"
          >
            <GridIcon className="h-4 w-4" />
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
        viewMode === "grid" ? renderGridView() : renderListView()
      )}
      
      {isAdmin && showImporter && (
        <ContactImporter 
          open={showImporter} 
          onOpenChange={setShowImporter} 
        />
      )}
    </div>
  );
};

export default Contacts;
