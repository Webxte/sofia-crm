
import { useState, useCallback } from "react";
import { Meeting } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

export const useMeetingsFetch = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();

  const fetchMeetings = useCallback(async () => {
    // Only fetch if user is authenticated
    if (!isAuthenticated || !user) {
      console.log("useMeetingsFetch: Not authenticated, skipping meetings fetch");
      setMeetings([]);
      return;
    }

    try {
      setLoading(true);
      console.log("useMeetingsFetch: Fetching all meetings for authenticated user:", user.id);
      
      // Simple query - get all meetings (RLS policies handle access control)
      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .order('date', { ascending: false });

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
        agentId: meeting.agent_id || '',
        agentName: meeting.agent_name || '',
        type: meeting.type as "meeting" | "phone" | "email" | "online" | "other",
        date: meeting.date,
        time: meeting.time,
        location: meeting.location || '',
        notes: meeting.notes,
        followUpScheduled: meeting.follow_up_scheduled,
        followUpDate: meeting.follow_up_date || undefined,
        followUpTime: meeting.follow_up_time || '',
        followUpNotes: meeting.follow_up_notes || '',
        nextSteps: meeting.next_steps || [],
        createdAt: new Date(meeting.created_at),
        updatedAt: new Date(meeting.updated_at),
      }));

      console.log(`useMeetingsFetch: Successfully formatted ${formattedMeetings.length} meetings`);
      setMeetings(formattedMeetings);
    } catch (error) {
      console.error('useMeetingsFetch: Error in fetchMeetings:', error);
      toast({
        title: "Error",
        description: "Failed to load meetings. Please check your connection and try again.",
        variant: "destructive",
      });
      setMeetings([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user, toast]);

  return {
    meetings,
    setMeetings,
    loading,
    fetchMeetings
  };
};
