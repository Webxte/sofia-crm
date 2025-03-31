
import { format } from "date-fns";
import { Calendar } from "lucide-react";
import { Meeting, Contact } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface MeetingCardProps {
  meeting: Meeting;
  contact?: Contact;
  onViewDetails?: () => void;
}

export const MeetingCard = ({ meeting, contact, onViewDetails }: MeetingCardProps) => {
  const navigate = useNavigate();
  
  // Get meeting type badge color
  const getMeetingTypeColor = (type: string) => {
    switch (type) {
      case "meeting":
        return "bg-blue-100 text-blue-800";
      case "phone":
        return "bg-green-100 text-green-800";
      case "email":
        return "bg-purple-100 text-purple-800";
      case "online":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get formatted meeting type
  const getMeetingTypeText = (type: string) => {
    switch (type) {
      case "meeting":
        return "In-person Meeting";
      case "phone":
        return "Phone Call";
      case "email":
        return "Email";
      case "online":
        return "Online Meeting";
      default:
        return "Other";
    }
  };

  // Prioritize company name over contact name
  const displayCompany = contact?.company || "Unknown Company";
  const displayPerson = contact?.fullName ? ` (${contact.fullName})` : "";
  const displayTitle = contact?.company ? displayCompany : (contact?.fullName || "Unknown Contact");
  
  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails();
    } else {
      navigate(`/meetings/${meeting.id}`);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <Badge
            className={getMeetingTypeColor(meeting.type)}
            variant="outline"
          >
            {getMeetingTypeText(meeting.type)}
          </Badge>
          <Badge variant={meeting.followUpScheduled ? "default" : "outline"}>
            {meeting.followUpScheduled ? "Follow-up Scheduled" : "No Follow-up"}
          </Badge>
        </div>
        <CardTitle className="text-xl">
          {displayTitle}
        </CardTitle>
        <CardDescription className="flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5" />
          {format(new Date(meeting.date), "PPP")} at {meeting.time}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground whitespace-pre-line overflow-hidden max-h-36 line-clamp-3">
          {meeting.notes}
        </p>
      </CardContent>
      <CardFooter className="pt-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={handleViewDetails}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};
