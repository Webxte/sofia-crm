
import { useState } from "react";
import { Meeting } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { supabaseToMeeting, meetingToSupabase, newMeetingToSupabase } from "./meetingUtils";
import { useContacts } from "@/context/ContactsContext";

export const useMeetingsOperations = (initialMeetings: Meeting[] = []) => {
  const [meetings, setMeetings] = useState<Meeting[]>(initialMeetings);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { getContactById } = useContacts();

  // Helper function to sort meetings by date and time
  const sortMeetingsByDateTime = (meetingsToSort: Meeting[]) => {
    return [...meetingsToSort].sort((a, b) => {
      // First compare by date
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      const dateComparison = dateA.getTime() - dateB.getTime();
      
      // If dates are the same, compare by time
      if (dateComparison === 0) {
        const timeA = a.time ? a.time.split(':').map(Number) : [0, 0];
        const timeB = b.time ? b.time.split(':').map(Number) : [0, 0];
        
        // Compare hours first
        if (timeA[0] !== timeB[0]) {
          return timeA[0] - timeB[0];
        }
        
        // If hours are the same, compare minutes
        return timeA[1] - timeB[1];
      }
      
      return dateComparison;
    });
  };

  // Function to fetch meetings from Supabase
  const refreshMeetings = async (isAuthenticated = true) => {
    try {
      setLoading(true);
      console.log("Attempting to fetch meetings...");
      
      if (!isAuthenticated) {
        console.log("User not authenticated, skipping meetings fetch");
        setMeetings([]);
        return;
      }
      
      // Fetch all meetings without organization_id filter
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
      
      console.log(`Successfully fetched ${data?.length || 0} meetings`);
      
      // Transform the Supabase data to match our Meeting type
      let formattedMeetings: Meeting[] = data.map(meeting => {
        // Create meeting with basic data
        const formattedMeeting = supabaseToMeeting(meeting);
        
        // Try to get contact name
        try {
          const contact = getContactById(meeting.contact_id);
          formattedMeeting.contactName = contact ? 
            (contact.company || contact.fullName || "Unknown") : 
            meeting.contact_name || "Unknown";
        } catch (err) {
          console.warn("Error getting contact name for meeting:", meeting.id, err);
          formattedMeeting.contactName = meeting.contact_name || "Unknown";
        }
        
        return formattedMeeting;
      });
      
      // Sort meetings by date AND time
      const sortedMeetings = sortMeetingsByDateTime(formattedMeetings);
      console.log(`Processed ${sortedMeetings.length} meetings`);
      
      setMeetings(sortedMeetings);
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
      
      // Add contact name if not present
      if (!meetingData.contactName) {
        const contact = getContactById(meetingData.contactId);
        meetingData.contactName = contact ? (contact.company || contact.fullName || "Unknown") : "Unknown";
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
      
      // Sort after adding new meeting
      setMeetings(prevMeetings => {
        const updatedMeetings = [...prevMeetings, newMeeting];
        return updatedMeetings.sort((a, b) => {
          // First compare by date
          const dateComparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          
          // If dates are the same, compare by time
          if (dateComparison === 0) {
            const timeA = a.time ? a.time.split(':').map(Number) : [0, 0];
            const timeB = b.time ? b.time.split(':').map(Number) : [0, 0];
            
            // Compare hours first
            if (timeA[0] !== timeB[0]) {
              return timeA[0] - timeB[0];
            }
            
            // If hours are the same, compare minutes
            return timeA[1] - timeB[1];
          }
          
          return dateComparison;
        });
      });
      
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
    const contactMeetings = meetings.filter(meeting => meeting.contactId === contactId);
    return sortMeetingsByDateTime(contactMeetings);
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
