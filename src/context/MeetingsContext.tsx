
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Meeting } from "@/types";
import { useAuth } from "./AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MeetingsContextType {
  meetings: Meeting[];
  loading: boolean;
  addMeeting: (meeting: Omit<Meeting, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  updateMeeting: (id: string, meeting: Partial<Meeting>) => Promise<void>;
  deleteMeeting: (id: string) => Promise<void>;
  getMeetingById: (id: string) => Meeting | undefined;
  getMeetingsByContactId: (contactId: string) => Meeting[];
  getMeetingsByAgentId: (agentId: string) => Meeting[];
  refreshMeetings: () => Promise<void>;
}

const MeetingsContext = createContext<MeetingsContextType | undefined>(undefined);

export const MeetingsProvider = ({ children }: { children: ReactNode }) => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Fetch meetings when the component mounts or when user auth state changes
  useEffect(() => {
    if (isAuthenticated) {
      refreshMeetings();
    } else {
      setMeetings([]);
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Function to fetch meetings from Supabase
  const refreshMeetings = async () => {
    try {
      setLoading(true);
      
      if (!isAuthenticated) {
        setMeetings([]);
        return;
      }
      
      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) {
        console.error('Error fetching meetings:', error);
        toast({
          title: "Error",
          description: "Failed to load meetings",
          variant: "destructive",
        });
        return;
      }
      
      // Transform the Supabase data to match our Meeting type
      const formattedMeetings: Meeting[] = data.map(meeting => ({
        id: meeting.id,
        contactId: meeting.contact_id,
        type: meeting.type,
        date: new Date(meeting.date),
        time: meeting.time,
        location: meeting.location,
        notes: meeting.notes,
        followUpScheduled: meeting.follow_up_scheduled,
        followUpDate: meeting.follow_up_date ? new Date(meeting.follow_up_date) : null,
        followUpTime: meeting.follow_up_time,
        followUpNotes: meeting.follow_up_notes,
        nextSteps: meeting.next_steps || [],
        agentId: meeting.agent_id,
        agentName: meeting.agent_name,
        createdAt: new Date(meeting.created_at),
        updatedAt: new Date(meeting.updated_at),
      }));
      
      setMeetings(formattedMeetings);
    } catch (err) {
      console.error('Unexpected error fetching meetings:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred while loading meetings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addMeeting = async (meetingData: Omit<Meeting, "id" | "createdAt" | "updatedAt">) => {
    try {
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to add meetings",
          variant: "destructive",
        });
        return;
      }
      
      // Add agent information
      const agentData = {
        agent_id: user.id,
        agent_name: user.name || ''
      };
      
      // Convert Meeting type to Supabase table format (snake_case)
      const newMeetingData = {
        contact_id: meetingData.contactId,
        type: meetingData.type,
        date: meetingData.date,
        time: meetingData.time,
        location: meetingData.location,
        notes: meetingData.notes,
        follow_up_scheduled: meetingData.followUpScheduled,
        follow_up_date: meetingData.followUpDate,
        follow_up_time: meetingData.followUpTime,
        follow_up_notes: meetingData.followUpNotes,
        next_steps: meetingData.nextSteps,
        ...agentData
      };
      
      const { data, error } = await supabase
        .from('meetings')
        .insert(newMeetingData)
        .select('*')
        .single();
      
      if (error) {
        console.error('Error adding meeting:', error);
        toast({
          title: "Error",
          description: "Failed to add meeting",
          variant: "destructive",
        });
        return;
      }
      
      // Transform and add the new meeting to state
      const newMeeting: Meeting = {
        id: data.id,
        contactId: data.contact_id,
        type: data.type,
        date: new Date(data.date),
        time: data.time,
        location: data.location,
        notes: data.notes,
        followUpScheduled: data.follow_up_scheduled,
        followUpDate: data.follow_up_date ? new Date(data.follow_up_date) : null,
        followUpTime: data.follow_up_time,
        followUpNotes: data.follow_up_notes,
        nextSteps: data.next_steps || [],
        agentId: data.agent_id,
        agentName: data.agent_name,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };
      
      setMeetings(prevMeetings => [newMeeting, ...prevMeetings]);
      
      toast({
        title: "Success",
        description: "Meeting added successfully",
      });
    } catch (err) {
      console.error('Unexpected error adding meeting:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const updateMeeting = async (id: string, meetingData: Partial<Meeting>) => {
    try {
      // Convert Meeting type to Supabase table format (snake_case)
      const updateData: any = {};
      
      if (meetingData.contactId !== undefined) updateData.contact_id = meetingData.contactId;
      if (meetingData.type !== undefined) updateData.type = meetingData.type;
      if (meetingData.date !== undefined) updateData.date = meetingData.date;
      if (meetingData.time !== undefined) updateData.time = meetingData.time;
      if (meetingData.location !== undefined) updateData.location = meetingData.location;
      if (meetingData.notes !== undefined) updateData.notes = meetingData.notes;
      if (meetingData.followUpScheduled !== undefined) updateData.follow_up_scheduled = meetingData.followUpScheduled;
      if (meetingData.followUpDate !== undefined) updateData.follow_up_date = meetingData.followUpDate;
      if (meetingData.followUpTime !== undefined) updateData.follow_up_time = meetingData.followUpTime;
      if (meetingData.followUpNotes !== undefined) updateData.follow_up_notes = meetingData.followUpNotes;
      if (meetingData.nextSteps !== undefined) updateData.next_steps = meetingData.nextSteps;
      
      // Add updated_at
      updateData.updated_at = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('meetings')
        .update(updateData)
        .eq('id', id)
        .select('*')
        .single();
      
      if (error) {
        console.error('Error updating meeting:', error);
        toast({
          title: "Error",
          description: "Failed to update meeting",
          variant: "destructive",
        });
        return;
      }
      
      // Update the meeting in state
      setMeetings(prevMeetings => 
        prevMeetings.map(meeting => 
          meeting.id === id 
            ? {
                ...meeting,
                contactId: data.contact_id,
                type: data.type,
                date: new Date(data.date),
                time: data.time,
                location: data.location,
                notes: data.notes,
                followUpScheduled: data.follow_up_scheduled,
                followUpDate: data.follow_up_date ? new Date(data.follow_up_date) : null,
                followUpTime: data.follow_up_time,
                followUpNotes: data.follow_up_notes,
                nextSteps: data.next_steps || [],
                updatedAt: new Date(data.updated_at)
              }
            : meeting
        )
      );
      
      toast({
        title: "Success",
        description: "Meeting updated successfully",
      });
    } catch (err) {
      console.error('Unexpected error updating meeting:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const deleteMeeting = async (id: string) => {
    try {
      const { error } = await supabase
        .from('meetings')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting meeting:', error);
        toast({
          title: "Error",
          description: "Failed to delete meeting",
          variant: "destructive",
        });
        return;
      }
      
      // Remove the meeting from state
      setMeetings(prevMeetings => prevMeetings.filter(meeting => meeting.id !== id));
      
      toast({
        title: "Success",
        description: "Meeting deleted successfully",
      });
    } catch (err) {
      console.error('Unexpected error deleting meeting:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
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
        loading,
        addMeeting,
        updateMeeting,
        deleteMeeting,
        getMeetingById,
        getMeetingsByContactId,
        getMeetingsByAgentId,
        refreshMeetings,
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
