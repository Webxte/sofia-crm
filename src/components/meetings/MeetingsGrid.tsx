
import { Meeting } from "@/types";
import { MeetingCard } from "./MeetingCard";

interface MeetingsGridProps {
  meetings: Meeting[];
  onViewDetails: (id: string) => void;
  onCreateOrder: (contactId: string) => void;
  onSendEmail: (meeting: Meeting) => void;
}

export const MeetingsGrid = ({ meetings, onViewDetails, onCreateOrder, onSendEmail }: MeetingsGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {meetings.map((meeting) => (
        <MeetingCard
          key={meeting.id}
          meeting={meeting}
          onViewDetails={() => onViewDetails(meeting.id)}
          onCreateOrder={() => onCreateOrder(meeting.contactId)}
          onSendEmail={() => onSendEmail(meeting)}
        />
      ))}
    </div>
  );
};
