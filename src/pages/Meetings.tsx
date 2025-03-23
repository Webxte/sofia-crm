
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { format } from "date-fns";
import { Plus, Search, Calendar, MessagesSquare } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMeetings } from "@/context/MeetingsContext";
import { useContacts } from "@/context/ContactsContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MeetingTypeFilter } from "@/components/meetings/MeetingTypeFilter";
import { MeetingCard } from "@/components/meetings/MeetingCard";

const Meetings = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const { meetings } = useMeetings();
  const { getContactById } = useContacts();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract contactId from query param if it exists
  const queryParams = new URLSearchParams(location.search);
  const contactId = queryParams.get("contactId");
  
  // Filter meetings based on search query and filter type
  const filteredMeetings = meetings.filter(meeting => {
    // Filter by contact if specified
    if (contactId && meeting.contactId !== contactId) {
      return false;
    }
    
    // Filter by type
    if (filterType !== "all" && meeting.type !== filterType) {
      return false;
    }
    
    // Filter by search query
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
  
  // Sort meetings by date, most recent first
  const sortedMeetings = [...filteredMeetings].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
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
        <Button className="sm:w-auto w-full" asChild>
          <Link to={contactId ? `/meetings/new?contactId=${contactId}` : "/meetings/new"}>
            <Plus className="mr-2 h-4 w-4" /> Add Meeting
          </Link>
        </Button>
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
            description="Add your first meeting to get started."
            actionText="Add Meeting"
            actionLink="/meetings/new"
          />
        </div>
      ) : (
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
      )}
    </div>
  );
};

export default Meetings;
