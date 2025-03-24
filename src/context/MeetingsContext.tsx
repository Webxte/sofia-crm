
import { createContext, useContext, useState, ReactNode } from "react";
import { Meeting } from "@/types";
import { useAuth } from "./AuthContext";

interface MeetingsContextType {
  meetings: Meeting[];
  addMeeting: (meeting: Omit<Meeting, "id" | "createdAt" | "updatedAt">) => void;
  updateMeeting: (id: string, meeting: Partial<Meeting>) => void;
  deleteMeeting: (id: string) => void;
  getMeetingById: (id: string) => Meeting | undefined;
  getMeetingsByContactId: (contactId: string) => Meeting[];
  getMeetingsByAgentId: (agentId: string) => Meeting[];
}

const MeetingsContext = createContext<MeetingsContextType | undefined>(undefined);

export const MeetingsProvider = ({ children }: { children: ReactNode }) => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const { user } = useAuth();

  const addMeeting = (meetingData: Omit<Meeting, "id" | "createdAt" | "updatedAt">) => {
    // Add agent information if available
    const agentData = user ? {
      agentId: user.id,
      agentName: user.name
    } : {};
    
    const newMeeting: Meeting = {
      ...meetingData,
      ...agentData,
      id: Math.random().toString(36).substring(2, 9),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setMeetings(prevMeetings => [...prevMeetings, newMeeting]);
  };

  const updateMeeting = (id: string, meetingData: Partial<Meeting>) => {
    setMeetings(prevMeetings => 
      prevMeetings.map(meeting => 
        meeting.id === id 
          ? { ...meeting, ...meetingData, updatedAt: new Date() } 
          : meeting
      )
    );
  };

  const deleteMeeting = (id: string) => {
    setMeetings(prevMeetings => prevMeetings.filter(meeting => meeting.id !== id));
  };

  const getMeetingById = (id: string) => {
    return meetings.find(meeting => meeting.id === id);
  };

  const getMeetingsByContactId = (contactId: string) => {
    return meetings.filter(meeting => meeting.contactId === contactId);
  };

  const getMeetingsByAgentId = (agentId: string) => {
    return meetings.filter(meeting => meeting.agentId === agentId);
  };

  return (
    <MeetingsContext.Provider
      value={{
        meetings,
        addMeeting,
        updateMeeting,
        deleteMeeting,
        getMeetingById,
        getMeetingsByContactId,
        getMeetingsByAgentId,
      }}
    >
      {children}
    </MeetingsContext.Provider>
  );
};

export const useMeetings = () => {
  const context = useContext(MeetingsContext);
  if (context === undefined) {
    throw new Error("useMeetings must be used within a MeetingsProvider");
  }
  return context;
};
