
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { format } from "date-fns";
import { Plus, Search, Calendar, MessagesSquare, List, Grid } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMeetings } from "@/context/MeetingsContext";
import { useContacts } from "@/context/ContactsContext";
import { useAuth } from "@/context/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MeetingTypeFilter } from "@/components/meetings/MeetingTypeFilter";
import { MeetingCard } from "@/components/meetings/MeetingCard";

const Meetings = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const { meetings } = useMeetings();
  const { getContactById } = useContacts();
  const { isAdmin, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const queryParams = new URLSearchParams(location.search);
  const contactId = queryParams.get("contactId");
  
  const filteredMeetings = meetings.filter(meeting => {
    if (contactId && meeting.contactId !== contactId) {
      return false;
    }
    
    if (!isAdmin && user && meeting.agentId !== user.id) {
      return false;
    }
    
    if (filterType !== "all" && meeting.type !== filterType) {
      return false;
    }
    
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const contact = getContactById(meeting.contactId);
      const contactName = contact?.fullName?.toLowerCase() || "";
      const contactCompany = contact?.company?.toLowerCase() || "";
      const notes = meeting.notes.toLowerCase();
      
      return contactName.includes(searchLower) || 
             contactCompany.includes(searchLower) || 
             notes.includes(searchLower);
    }
    
    return true;
  });
  
  const sortedMeetings = [...filteredMeetings].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const getMeetingTypeLabel = (type: string) => {
    switch(type) {
      case "meeting": return "In-person Meeting";
      case "phone": return "Phone Call";
      case "email": return "Email";
      case "online": return "Online Meeting";
      case "other": return "Other";
      default: return type;
    }
  };

  const getMeetingTypeColor = (type: string) => {
    switch(type) {
      case "meeting": return "bg-blue-100 text-blue-800";
      case "phone": return "bg-green-100 text-green-800";
      case "email": return "bg-purple-100 text-purple-800";
      case "online": return "bg-indigo-100 text-indigo-800";
      case "other": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {sortedMeetings.map((meeting) => (
        <MeetingCard 
          key={meeting.id} 
          meeting={meeting} 
          contact={getContactById(meeting.contactId)} 
          onViewDetails={() => navigate(`/meetings/edit/${meeting.id}`)}
        />
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Contact</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Date & Time</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedMeetings.map((meeting) => {
            const contact = getContactById(meeting.contactId);
            const contactName = contact?.company || contact?.fullName || "Unknown";
            return (
              <TableRow key={meeting.id}>
                <TableCell className="font-medium">
                  {contactName}
                </TableCell>
                <TableCell>
                  <Badge
                    className={getMeetingTypeColor(meeting.type)}
                    variant="outline"
                  >
                    {getMeetingTypeLabel(meeting.type)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {format(new Date(meeting.date), "PP")} at {meeting.time}
                </TableCell>
                <TableCell>{meeting.location || "-"}</TableCell>
                <TableCell className="max-w-[200px] line-clamp-3 whitespace-pre-wrap">
                  {meeting.notes}
                </TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => navigate(`/meetings/edit/${meeting.id}`)}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Meetings</h1>
          <p className="text-muted-foreground mt-1">
            Schedule and manage your meetings
          </p>
        </div>
        {!isAdmin && (
          <Button className="sm:w-auto w-full" asChild>
            <Link to={contactId ? `/meetings/new?contactId=${contactId}` : "/meetings/new"}>
              <Plus className="mr-2 h-4 w-4" /> Add Meeting
            </Link>
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search meetings..."
            className="w-full pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 sm:ml-auto">
          <MeetingTypeFilter value={filterType} onValueChange={setFilterType} />
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
          <Button variant="outline" size="sm" asChild>
            <Link to="/calendar">
              <Calendar className="mr-2 h-4 w-4" /> View Calendar
            </Link>
          </Button>
        </div>
      </div>

      {sortedMeetings.length === 0 ? (
        <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
          <EmptyState
            icon={<MessagesSquare size={40} />}
            title="No meetings scheduled"
            description={isAdmin ? "No meetings have been scheduled yet." : "Add your first meeting to get started."}
            actionText={!isAdmin ? "Add Meeting" : undefined}
            actionLink={!isAdmin ? "/meetings/new" : undefined}
          />
        </div>
      ) : (
        viewMode === "grid" ? renderGridView() : renderListView()
      )}
    </div>
  );
};

export default Meetings;
