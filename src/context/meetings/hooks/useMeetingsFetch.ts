
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
    if (!isAuthenticated || !user) {
      console.log("useMeetingsFetch: User not authenticated");
      setMeetings([]);
      return;
    }

    try {
      setLoading(true);
      console.log("useMeetingsFetch: Fetching meetings for user:", user.id);
      
      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .eq('agent_id', user.id)
        .order('date', { ascending: false });

      if (error) {
        console.error('useMeetingsFetch: Error fetching meetings:', error);
        throw error;
      }

      console.log("useMeetingsFetch: Raw meetings data from Supabase:", data?.length || 0);

      const formattedMeetings: Meeting[] = (data || []).map(meeting => ({
        id: meeting.id,
        contactId: meeting.contact_id,
        contactName: meeting.contact_name || '',
        type: meeting.type as "meeting" | "phone" | "email" | "online" | "other",
        date: meeting.date,
        time: meeting.time,
        location: meeting.location || '',
        notes: meeting.notes,
        nextSteps: meeting.next_steps || [],
        agentId: meeting.agent_id || '',
        agentName: meeting.agent_name || '',
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
