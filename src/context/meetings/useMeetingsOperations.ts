
import { useState, useCallback } from "react";
import { Meeting } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useOrganizations } from "@/context/organizations/OrganizationsContext";
import { useToast } from "@/hooks/use-toast";

// Transform database meeting to app meeting
const transformDatabaseMeeting = (dbMeeting: any): Meeting => {
  return {
    id: dbMeeting.id,
    organizationId: dbMeeting.organization_id,
    contactId: dbMeeting.contact_id,
    contactName: dbMeeting.contact_name,
    type: dbMeeting.type as "meeting" | "phone" | "email" | "online" | "other",
    date: dbMeeting.date,
    time: dbMeeting.time,
    location: dbMeeting.location,
    notes: dbMeeting.notes,
    followUpScheduled: dbMeeting.follow_up_scheduled,
    followUpDate: dbMeeting.follow_up_date,
    followUpTime: dbMeeting.follow_up_time,
    followUpNotes: dbMeeting.follow_up_notes,
    nextSteps: dbMeeting.next_steps,
    agentId: dbMeeting.agent_id,
    agentName: dbMeeting.agent_name,
    createdAt: new Date(dbMeeting.created_at),
    updatedAt: new Date(dbMeeting.updated_at),
  };
};

// Transform app meeting to database meeting
const transformAppMeeting = (meeting: Partial<Meeting>): any => {
  return {
    organization_id: meeting.organizationId,
    contact_id: meeting.contactId,
    contact_name: meeting.contactName,
    type: meeting.type,
    date: meeting.date,
    time: meeting.time,
    location: meeting.location,
    notes: meeting.notes,
    follow_up_scheduled: meeting.followUpScheduled,
    follow_up_date: meeting.followUpDate,
    follow_up_time: meeting.followUpTime,
    follow_up_notes: meeting.followUpNotes,
    next_steps: meeting.nextSteps,
    agent_id: meeting.agentId,
    agent_name: meeting.agentName,
    updated_at: new Date().toISOString(),
  };
};

export const useMeetingsOperations = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { currentOrganization } = useOrganizations();
  const { toast } = useToast();

  const fetchMeetings = useCallback(async () => {
    if (!user || !currentOrganization) {
      console.log("No user or organization, skipping meetings fetch");
      return;
    }

    setLoading(true);
    try {
      console.log("Fetching meetings for organization:", currentOrganization.id);
      
      const { data, error } = await supabase
        .from("meetings")
        .select("*")
        .eq("organization_id", currentOrganization.id)
        .order("date", { ascending: false });

      if (error) throw error;

      const transformedMeetings = data?.map(transformDatabaseMeeting) || [];
      console.log(`Fetched ${transformedMeetings.length} meetings`);
      setMeetings(transformedMeetings);
    } catch (error) {
      console.error("Error fetching meetings:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user, currentOrganization]);

  const addMeeting = useCallback(async (meetingData: Omit<Meeting, "id" | "createdAt" | "updatedAt">): Promise<Meeting | null> => {
    if (!user || !currentOrganization) {
      throw new Error("User or organization not found");
    }

    try {
      const dbMeeting = {
        ...transformAppMeeting(meetingData),
        organization_id: currentOrganization.id,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("meetings")
        .insert([dbMeeting])
        .select()
        .single();

      if (error) throw error;

      const newMeeting = transformDatabaseMeeting(data);
      setMeetings(prev => [newMeeting, ...prev]);
      
      return newMeeting;
    } catch (error) {
      console.error("Error adding meeting:", error);
      toast({
        title: "Error",
        description: "Failed to add meeting. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  }, [user, currentOrganization, toast]);

  const updateMeeting = useCallback(async (id: string, meetingData: Partial<Meeting>): Promise<Meeting | null> => {
    if (!user || !currentOrganization) {
      throw new Error("User or organization not found");
    }

    try {
      const dbMeeting = transformAppMeeting(meetingData);

      const { data, error } = await supabase
        .from("meetings")
        .update(dbMeeting)
        .eq("id", id)
        .eq("organization_id", currentOrganization.id)
        .select()
        .single();

      if (error) throw error;

      const updatedMeeting = transformDatabaseMeeting(data);
      setMeetings(prev => prev.map(meeting => 
        meeting.id === id ? updatedMeeting : meeting
      ));
      
      return updatedMeeting;
    } catch (error) {
      console.error("Error updating meeting:", error);
      toast({
        title: "Error",
        description: "Failed to update meeting. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  }, [user, currentOrganization, toast]);

  const deleteMeeting = useCallback(async (id: string): Promise<boolean> => {
    if (!user || !currentOrganization) {
      throw new Error("User or organization not found");
    }

    try {
      const { error } = await supabase
        .from("meetings")
        .delete()
        .eq("id", id)
        .eq("organization_id", currentOrganization.id);

      if (error) throw error;

      setMeetings(prev => prev.filter(meeting => meeting.id !== id));
      return true;
    } catch (error) {
      console.error("Error deleting meeting:", error);
      toast({
        title: "Error",
        description: "Failed to delete meeting. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  }, [user, currentOrganization, toast]);

  // Utility functions
  const getMeetingById = useCallback((id: string): Meeting | undefined => {
    return meetings.find(meeting => meeting.id === id);
  }, [meetings]);

  const getMeetingsByContactId = useCallback((contactId: string): Meeting[] => {
    return meetings.filter(meeting => meeting.contactId === contactId);
  }, [meetings]);

  const getMeetingsByAgentId = useCallback((agentId: string): Meeting[] => {
    return meetings.filter(meeting => meeting.agentId === agentId);
  }, [meetings]);

  const sendMeetingEmail = useCallback(async (meetingId: string, emailData: any): Promise<boolean> => {
    try {
      console.log("Sending meeting email for:", meetingId);
      // This would integrate with your email service
      return true;
    } catch (error) {
      console.error("Error sending meeting email:", error);
      return false;
    }
  }, []);

  return {
    meetings,
    loading,
    fetchMeetings,
    addMeeting,
    updateMeeting,
    deleteMeeting,
    getMeetingById,
    getMeetingsByContactId,
    getMeetingsByAgentId,
    refreshMeetings: fetchMeetings,
    sendMeetingEmail
  };
};
