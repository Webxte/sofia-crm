
import { useState } from "react";
import { Meeting } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { supabaseToMeeting, meetingToSupabase, newMeetingToSupabase } from "./meetingUtils";

export const useMeetingsOperations = (initialMeetings: Meeting[] = []) => {
  const [meetings, setMeetings] = useState<Meeting[]>(initialMeetings);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Function to fetch meetings from Supabase
  const refreshMeetings = async (isAuthenticated = true) => {
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
      const formattedMeetings: Meeting[] = data.map(supabaseToMeeting);
      
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

  const addMeeting = async (meetingData: Omit<Meeting, "id" | "createdAt" | "updatedAt">, userId?: string, userName?: string) => {
    try {
      if (!userId) {
        toast({
          title: "Error",
          description: "You must be logged in to add meetings",
          variant: "destructive",
        });
        return;
      }
      
      // Add agent information
      const agentData = {
        agent_id: userId,
        agent_name: userName || ''
      };
      
      // Convert Meeting type to Supabase table format
      const newMeetingData = newMeetingToSupabase(meetingData, agentData);
      
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
      const newMeeting = supabaseToMeeting(data);
      
      setMeetings(prevMeetings => [...prevMeetings, newMeeting]);
      
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
      // Convert Meeting type to Supabase table format
      const updateData = meetingToSupabase(meetingData);
      
      // Add updated_at
      updateData.updated_at = new Date().toISOString();
      
      const { error } = await supabase
        .from('meetings')
        .update(updateData)
        .eq('id', id);
      
      if (error) {
        console.error('Error updating meeting:', error);
        toast({
          title: "Error",
          description: "Failed to update meeting",
          variant: "destructive",
        });
        return;
      }
      
      // Refresh meetings to get updated data
      await refreshMeetings();
      
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

  return {
    meetings,
    loading,
    refreshMeetings,
    addMeeting,
    updateMeeting,
    deleteMeeting,
    getMeetingById,
    getMeetingsByContactId,
  };
};
