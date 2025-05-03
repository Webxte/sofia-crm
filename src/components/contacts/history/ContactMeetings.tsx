
import React from "react";
import { Meeting } from "@/types";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarClock, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ContactMeetingsProps {
  meetings: Meeting[];
}

export const ContactMeetings: React.FC<ContactMeetingsProps> = ({ meetings = [] }) => {
  const navigate = useNavigate();
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center">
          <CalendarClock className="mr-2 h-5 w-5" />
          Recent Meetings
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => meetings.length > 0 && navigate(`/meetings/new?contactId=${meetings[0]?.contactId}`)}
        >
          <CalendarClock className="mr-2 h-4 w-4" />
          Schedule Meeting
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {meetings.map(meeting => (
            <MeetingCard key={meeting.id} meeting={meeting} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

interface MeetingCardProps {
  meeting: Meeting;
}

const MeetingCard: React.FC<MeetingCardProps> = ({ meeting }) => {
  const navigate = useNavigate();
  
  const formatNotes = (notes: string | null | undefined, maxLines = 3) => {
    if (!notes) return "";
    
    const lines = notes.split("\n");
    if (lines.length <= maxLines) return notes;
    
    return lines.slice(0, maxLines).join("\n") + (lines.length > maxLines ? "..." : "");
  };

  return (
    <Card className="p-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="font-medium">{meeting.type} Meeting</h4>
          <p className="text-sm text-gray-500">
            {format(new Date(meeting.date), "PPP 'at' p")}
          </p>
          {meeting.agentName && (
            <p className="text-xs text-muted-foreground">
              Agent: {meeting.agentName}
            </p>
          )}
        </div>
        <div className="flex gap-2 items-center">
          <Badge>{meeting.followUpScheduled ? "Follow-up Scheduled" : "Completed"}</Badge>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(`/meetings/${meeting.id}`)}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {meeting.notes && (
        <div className="mt-2">
          <p className="text-sm text-gray-600 whitespace-pre-line line-clamp-3">{formatNotes(meeting.notes, 3)}</p>
        </div>
      )}
    </Card>
  );
};
