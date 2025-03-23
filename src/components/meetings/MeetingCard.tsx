
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

interface MeetingCardProps {
  meeting: Meeting;
  contact?: Contact;
  onViewDetails: () => void;
}

export const MeetingCard = ({ meeting, contact, onViewDetails }: MeetingCardProps) => {
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
          {contact?.fullName || contact?.company || "Unknown Contact"}
        </CardTitle>
        <CardDescription className="flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5" />
          {format(new Date(meeting.date), "PPP")} at {meeting.time}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="line-clamp-3 text-sm text-muted-foreground">
          {meeting.notes}
        </p>
      </CardContent>
      <CardFooter className="pt-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={onViewDetails}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};
