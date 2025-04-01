
import { Meeting } from "@/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useContacts } from "@/context/ContactsContext";
import { format } from "date-fns";
import { CalendarDays, User, MapPin, ShoppingCart } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface MeetingCardProps {
  meeting: Meeting;
  onViewDetails: () => void;
  onCreateOrder?: () => void;
}

export const MeetingCard = ({ meeting, onViewDetails, onCreateOrder }: MeetingCardProps) => {
  const { getContactById } = useContacts();
  const { isAdmin } = useAuth();
  const contact = getContactById(meeting.contactId);

  const meetingDate = new Date(meeting.date);
  const formattedDate = format(meetingDate, "MMM d, yyyy");
  
  const contactName = contact?.company || contact?.fullName || "Unknown Contact";

  return (
    <Card className="h-full flex flex-col">
      <CardContent className="pt-6 flex-1">
        <div className="mb-4">
          <h3 className="font-semibold text-lg">{meeting.type.charAt(0).toUpperCase() + meeting.type.slice(1)}</h3>
          <div className="flex items-center text-muted-foreground mt-1">
            <CalendarDays className="h-4 w-4 mr-1" />
            <span className="text-sm">
              {formattedDate} at {meeting.time}
            </span>
          </div>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex items-start">
            <User className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
            <div>
              <p className="font-medium">{contactName}</p>
              {contact?.email && <p className="text-muted-foreground">{contact.email}</p>}
            </div>
          </div>
          {meeting.location && (
            <div className="flex items-start">
              <MapPin className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
              <p>{meeting.location}</p>
            </div>
          )}
          {isAdmin && meeting.agentName && (
            <div className="flex items-center mt-2 text-xs text-muted-foreground">
              <span>Agent: {meeting.agentName}</span>
            </div>
          )}
        </div>
        {meeting.notes && (
          <div className="mt-4 border-t pt-3">
            <p className="text-sm line-clamp-3">{meeting.notes}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t bg-muted/30 p-3 flex gap-2 justify-end">
        <Button variant="ghost" size="sm" onClick={onViewDetails}>
          View Details
        </Button>
        {onCreateOrder && (
          <Button variant="outline" size="sm" onClick={(e) => {
            e.stopPropagation();
            onCreateOrder();
          }}>
            <ShoppingCart className="h-4 w-4 mr-1" /> Order
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
