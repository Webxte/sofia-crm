
import { Meeting } from "@/types";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Trash2 } from "lucide-react";
import { useContacts } from "@/context/ContactsContext";
import { format } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";

interface MeetingsListProps {
  meetings: Meeting[];
  onViewMeeting: (id: string) => void;
  onCreateOrder: (contactId: string) => void;
  onDeleteMeeting: (id: string) => void;
}

export const MeetingsList = ({ meetings, onViewMeeting, onCreateOrder, onDeleteMeeting }: MeetingsListProps) => {
  const { getContactById } = useContacts();
  const { isAdmin } = useAuth();
  const [meetingToDelete, setMeetingToDelete] = useState<string | null>(null);

  const getContactName = (contactId: string) => {
    const contact = getContactById(contactId);
    if (!contact) return "Unknown Contact";
    return contact.company || contact.fullName || "Unknown Contact";
  };

  return (
    <div className="space-y-4">
      {meetings.map((meeting) => (
        <div 
          key={meeting.id} 
          className="border rounded-lg p-3 hover:border-primary transition-colors cursor-pointer"
          onClick={() => onViewMeeting(meeting.id)}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium">{getContactName(meeting.contactId)}</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(meeting.date), 'PPP')} at {meeting.time}
              </p>
              {isAdmin && meeting.agentName && (
                <p className="text-xs text-muted-foreground mt-1">
                  Agent: {meeting.agentName}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={(e) => {
                e.stopPropagation();
                onViewMeeting(meeting.id);
              }}>
                View
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onCreateOrder(meeting.contactId);
                }}
              >
                <ShoppingCart className="h-4 w-4 mr-1" /> Order
              </Button>
              <AlertDialog 
                open={meetingToDelete === meeting.id} 
                onOpenChange={(open) => {
                  if (!open) setMeetingToDelete(null);
                }}
              >
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-red-500 hover:text-red-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMeetingToDelete(meeting.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete this meeting and all related data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => {
                        if (meetingToDelete) {
                          onDeleteMeeting(meetingToDelete);
                          setMeetingToDelete(null);
                        }
                      }}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
