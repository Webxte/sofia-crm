
import { Meeting } from "@/types";
import { MeetingCard } from "./MeetingCard";

interface MeetingsGridProps {
  meetings: Meeting[];
  onViewDetails: (id: string) => void;
  onCreateOrder: (contactId: string) => void;
}

export const MeetingsGrid = ({ meetings, onViewDetails, onCreateOrder }: MeetingsGridProps) => {
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {meetings.map((meeting) => (
        <MeetingCard 
          key={meeting.id} 
          meeting={meeting} 
          onViewDetails={() => onViewDetails(meeting.id)}
          onCreateOrder={() => onCreateOrder(meeting.contactId)} 
        />
      ))}
    </div>
  );
};
