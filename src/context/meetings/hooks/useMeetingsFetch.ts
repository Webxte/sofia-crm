
import { useState, useCallback } from "react";
import { Meeting } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useOrganizations } from "@/context/organizations/OrganizationsContext";

export const useMeetingsFetch = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { currentOrganization } = useOrganizations();

  const fetchMeetings = useCallback(async () => {
    if (!currentOrganization) {
      console.log("useMeetingsFetch: No current organization, skipping meetings fetch");
      return;
    }

    try {
      setLoading(true);
      console.log("useMeetingsFetch: Fetching meetings for organization:", currentOrganization.id, currentOrganization.name);
      
      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('useMeetingsFetch: Error fetching meetings:', error);
        throw error;
      }

      console.log("useMeetingsFetch: Raw meetings data from Supabase:", data);

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

      console.log(`useMeetingsFetch: Formatted ${formattedMeetings.length} meetings for organization ${currentOrganization.name}`);
      setMeetings(formattedMeetings);
    } catch (error) {
      console.error('useMeetingsFetch: Error in fetchMeetings:', error);
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

  return {
    meetings,
    setMeetings,
    loading,
    fetchMeetings
  };
};
