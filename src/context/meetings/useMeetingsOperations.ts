import { useState } from "react";
import { Meeting } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { supabaseToMeeting, meetingToSupabase, newMeetingToSupabase } from "./meetingUtils";
import { useContacts } from "@/context/ContactsContext";
import { useOrganizations } from "@/context/organizations/OrganizationsContext";
import { useAuth } from "@/context/AuthContext";

export const useMeetingsOperations = (initialMeetings: Meeting[] = []) => {
  const [meetings, setMeetings] = useState<Meeting[]>(initialMeetings);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { getContactById } = useContacts();
  const { currentOrganization } = useOrganizations();
  const { user } = useAuth();

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
      
      if (!isAuthenticated || !user?.id) {
        console.log("User not authenticated, skipping meetings fetch");
        setMeetings([]);
        setLoading(false);
        return [];
      }
      
      console.log("Current organization:", currentOrganization?.id);
      console.log("Current user:", user.id);
      
      // Create a base query
      let query = supabase.from('meetings').select('*');
      
      // Apply organization filter if available
      if (currentOrganization?.id) {
        console.log(`Filtering meetings by organization: ${currentOrganization.id}`);
        query = query.eq('organization_id', currentOrganization.id);
      } else {
        // Fallback to agent_id filter if no organization is selected
        console.log(`Filtering meetings by agent: ${user.id}`);
        query = query.eq('agent_id', user.id);
      }
      
      // Execute query with order
      const { data, error } = await query.order('date', { ascending: false });
      
      if (error) {
        console.error('Error fetching meetings:', error);
        toast({
          title: "Error",
          description: "Failed to load meetings. Please try again later.",
          variant: "destructive",
        });
        setMeetings([]);
        setLoading(false);
        return [];
      }
      
      if (!data || data.length === 0) {
        console.log("No meetings found");
        setMeetings([]);
        setLoading(false);
        return [];
      }
      
      console.log(`Successfully fetched ${data.length} meetings`);
      
      // Transform the Supabase data to match our Meeting type
      let formattedMeetings: Meeting[] = [];
      
      for (const meeting of data) {
        try {
          // Create meeting with basic data
          const formattedMeeting = supabaseToMeeting(meeting);
          
          // Try to get contact name
          if (meeting.contact_id) {
            try {
              const contact = getContactById(meeting.contact_id);
              
              if (contact) {
                formattedMeeting.contactName = contact.company || contact.fullName || "Unknown";
              } else if (meeting.contact_name) {
                formattedMeeting.contactName = meeting.contact_name;
              } else {
                formattedMeeting.contactName = "Unknown";
              }
            } catch (err) {
              console.warn("Error getting contact name for meeting:", meeting.id, err);
              formattedMeeting.contactName = meeting.contact_name || "Unknown";
            }
          } else {
            formattedMeeting.contactName = meeting.contact_name || "Unknown";
          }
          
          formattedMeetings.push(formattedMeeting);
        } catch (err) {
          console.error("Error processing meeting data:", err, meeting);
        }
      }
      
      // Sort meetings by date AND time
      const sortedMeetings = sortMeetingsByDateTime(formattedMeetings);
      console.log(`Processed ${sortedMeetings.length} meetings`);
      
      setMeetings(sortedMeetings);
      return sortedMeetings;
    } catch (err) {
      console.error('Unexpected error fetching meetings:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred while loading meetings",
        variant: "destructive",
      });
      setMeetings([]);
      return [];
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
        return null;
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
      
      // Add organization information
      if (currentOrganization?.id) {
        meetingData.organizationId = currentOrganization.id;
      }
      
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
          description: "Failed to add meeting. " + error.message,
          variant: "destructive",
        });
        return null;
      }
      
      // Transform and add the new meeting to state
      const newMeeting = supabaseToMeeting(data);
      
      // Sort after adding new meeting
      setMeetings(prevMeetings => sortMeetingsByDateTime([...prevMeetings, newMeeting]));
      
      toast({
        title: "Success",
        description: "Meeting added successfully",
      });
      
      return newMeeting;
    } catch (err) {
      console.error('Unexpected error adding meeting:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return null;
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
          description: "Failed to update meeting. " + error.message,
          variant: "destructive",
        });
        return false;
      }
      
      // Refresh meetings to get updated data
      await refreshMeetings();
      
      toast({
        title: "Success",
        description: "Meeting updated successfully",
      });
      return true;
    } catch (err) {
      console.error('Unexpected error updating meeting:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
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
          description: "Failed to delete meeting. " + error.message,
          variant: "destructive",
        });
        return false;
      }
      
      // Remove the meeting from state
      setMeetings(prevMeetings => prevMeetings.filter(meeting => meeting.id !== id));
      
      toast({
        title: "Success",
        description: "Meeting deleted successfully",
      });
      return true;
    } catch (err) {
      console.error('Unexpected error deleting meeting:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
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
