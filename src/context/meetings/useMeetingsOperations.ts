import { useState, useCallback } from "react";
import { Meeting } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useOrganizations } from "@/context/organizations/OrganizationsContext";

export const useMeetingsOperations = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { currentOrganization } = useOrganizations();

  const fetchMeetings = useCallback(async () => {
    if (!currentOrganization) {
      console.log("useMeetingsOperations: No current organization, skipping meetings fetch");
      return;
    }

    try {
      setLoading(true);
      console.log("useMeetingsOperations: Fetching meetings for organization:", currentOrganization.id, currentOrganization.name);
      
      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('useMeetingsOperations: Error fetching meetings:', error);
        throw error;
      }

      console.log("useMeetingsOperations: Raw meetings data from Supabase:", data);

      const formattedMeetings: Meeting[] = (data || []).map(meeting => ({
        id: meeting.id,
        organizationId: meeting.organization_id,
        contactId: meeting.contact_id,
        contactName: meeting.contact_name || '',
        date: meeting.date,
        time: meeting.time,
        type: meeting.type as "meeting" | "phone" | "email" | "online" | "other",
        location: meeting.location || '',
        notes: meeting.notes,
        agentId: meeting.agent_id || '',
        agentName: meeting.agent_name || '',
        nextSteps: meeting.next_steps || [],
        followUpScheduled: meeting.follow_up_scheduled,
        followUpDate: meeting.follow_up_date ? new Date(meeting.follow_up_date) : undefined,
        followUpTime: meeting.follow_up_time || undefined,
        followUpNotes: meeting.follow_up_notes || undefined,
        createdAt: new Date(meeting.created_at),
        updatedAt: new Date(meeting.updated_at),
      }));

      console.log(`useMeetingsOperations: Formatted ${formattedMeetings.length} meetings for organization ${currentOrganization.name}`);
      setMeetings(formattedMeetings);
    } catch (error) {
      console.error('useMeetingsOperations: Error in fetchMeetings:', error);
      toast({
        title: "Error",
        description: "Failed to load meetings. Please check your connection and try again.",
        variant: "destructive",
      });
      setMeetings([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }, [currentOrganization, toast]);

  const addMeeting = async (meetingData: Omit<Meeting, "id" | "createdAt" | "updatedAt">): Promise<Meeting | null> => {
    if (!currentOrganization) {
      toast({
        title: "Error",
        description: "No organization selected",
        variant: "destructive",
      });
      return null;
    }

    try {
      const newMeeting = {
        contact_id: meetingData.contactId,
        contact_name: meetingData.contactName,
        date: meetingData.date,
        time: meetingData.time,
        type: meetingData.type,
        location: meetingData.location,
        notes: meetingData.notes,
        agent_id: meetingData.agentId || user?.id,
        agent_name: meetingData.agentName || user?.user_metadata?.name || 'Unknown',
        next_steps: meetingData.nextSteps,
        follow_up_scheduled: meetingData.followUpScheduled,
        follow_up_date: meetingData.followUpDate ? meetingData.followUpDate.toISOString().split('T')[0] : null,
        follow_up_time: meetingData.followUpTime,
        follow_up_notes: meetingData.followUpNotes,
        organization_id: currentOrganization.id,
      };

      const { data, error } = await supabase
        .from('meetings')
        .insert([newMeeting])
        .select()
        .single();

      if (error) throw error;

      const formattedMeeting: Meeting = {
        id: data.id,
        organizationId: data.organization_id,
        contactId: data.contact_id,
        contactName: data.contact_name || '',
        date: data.date,
        time: data.time,
        type: data.type as "meeting" | "phone" | "email" | "online" | "other",
        location: data.location || '',
        notes: data.notes,
        agentId: data.agent_id || '',
        agentName: data.agent_name || '',
        nextSteps: data.next_steps || [],
        followUpScheduled: data.follow_up_scheduled,
        followUpDate: data.follow_up_date ? new Date(data.follow_up_date) : undefined,
        followUpTime: data.follow_up_time || undefined,
        followUpNotes: data.follow_up_notes || undefined,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };

      setMeetings(prev => [formattedMeeting, ...prev]);
      
      toast({
        title: "Success",
        description: "Meeting added successfully",
      });

      return formattedMeeting;
    } catch (error) {
      console.error('Error adding meeting:', error);
      toast({
        title: "Error",
        description: "Failed to add meeting",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateMeeting = async (id: string, meetingData: Partial<Meeting>): Promise<Meeting | null> => {
    try {
      const updateData = {
        contact_id: meetingData.contactId,
        contact_name: meetingData.contactName,
        date: meetingData.date,
        time: meetingData.time,
        type: meetingData.type,
        location: meetingData.location,
        notes: meetingData.notes,
        agent_id: meetingData.agentId,
        agent_name: meetingData.agentName,
        next_steps: meetingData.nextSteps,
        follow_up_scheduled: meetingData.followUpScheduled,
        follow_up_date: meetingData.followUpDate ? meetingData.followUpDate.toISOString().split('T')[0] : null,
        follow_up_time: meetingData.followUpTime,
        follow_up_notes: meetingData.followUpNotes,
      };

      const { data, error } = await supabase
        .from('meetings')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const formattedMeeting: Meeting = {
        id: data.id,
        organizationId: data.organization_id,
        contactId: data.contact_id,
        contactName: data.contact_name || '',
        date: data.date,
        time: data.time,
        type: data.type as "meeting" | "phone" | "email" | "online" | "other",
        location: data.location || '',
        notes: data.notes,
        agentId: data.agent_id || '',
        agentName: data.agent_name || '',
        nextSteps: data.next_steps || [],
        followUpScheduled: data.follow_up_scheduled,
        followUpDate: data.follow_up_date ? new Date(data.follow_up_date) : undefined,
        followUpTime: data.follow_up_time || undefined,
        followUpNotes: data.follow_up_notes || undefined,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };

      setMeetings(prev => prev.map(meeting => 
        meeting.id === id ? formattedMeeting : meeting
      ));

      toast({
        title: "Success",
        description: "Meeting updated successfully",
      });

      return formattedMeeting;
    } catch (error) {
      console.error('Error updating meeting:', error);
      toast({
        title: "Error",
        description: "Failed to update meeting",
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteMeeting = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('meetings')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setMeetings(prev => prev.filter(meeting => meeting.id !== id));
      
      toast({
        title: "Success",
        description: "Meeting deleted successfully",
      });

      return true;
    } catch (error) {
      console.error('Error deleting meeting:', error);
      toast({
        title: "Error",
        description: "Failed to delete meeting",
        variant: "destructive",
      });
      return false;
    }
  };

  const refreshMeetings = async () => {
    await fetchMeetings();
  };

  // Utility methods
  const getMeetingById = (id: string): Meeting | undefined => {
    return meetings.find(meeting => meeting.id === id);
  };

  const getMeetingsByContactId = (contactId: string): Meeting[] => {
    return meetings.filter(meeting => meeting.contactId === contactId);
  };

  const getMeetingsByAgentId = (agentId: string): Meeting[] => {
    return meetings.filter(meeting => meeting.agentId === agentId);
  };

  const sendMeetingEmail = async (meetingId: string, emailData: any): Promise<boolean> => {
    // Implementation for sending meeting emails would go here
    console.log("Meeting email not yet implemented");
    return false;
  };

  return {
    meetings,
    loading,
    addMeeting,
    updateMeeting,
    deleteMeeting,
    refreshMeetings,
    fetchMeetings,
    getMeetingById,
    getMeetingsByContactId,
    getMeetingsByAgentId,
    sendMeetingEmail,
  };
};
