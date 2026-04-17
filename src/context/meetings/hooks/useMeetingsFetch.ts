import { useState, useCallback, useEffect } from "react";
import { Meeting } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

const formatMeeting = (row: Record<string, unknown>): Meeting => ({
  id: row.id as string,
  contactId: row.contact_id as string,
  contactName: (row.contact_name as string) || '',
  type: row.type as "meeting" | "phone" | "email" | "online" | "other",
  date: row.date as string,
  time: row.time as string,
  location: (row.location as string) || '',
  notes: row.notes as string,
  nextSteps: (row.next_steps as string[]) || [],
  agentId: (row.agent_id as string) || '',
  agentName: (row.agent_name as string) || '',
  createdAt: new Date(row.created_at as string),
  updatedAt: new Date(row.updated_at as string),
});

export const useMeetingsFetch = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, user } = useAuth();

  const fetchMeetings = useCallback(async () => {
    if (!isAuthenticated || !user) {
      console.log("useMeetingsFetch: User not authenticated, clearing meetings");
      setMeetings([]);
      return;
    }

    try {
      setLoading(true);
      console.log("useMeetingsFetch: Fetching meetings for user:", user.id);
      
      // Simple query - let RLS handle the filtering automatically
      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        console.error('useMeetingsFetch: Error fetching meetings:', error);
        throw error;
      }

      console.log("useMeetingsFetch: Raw meetings data from Supabase:", data?.length || 0);

      const formattedMeetings = (data || []).map(m => formatMeeting(m as Record<string, unknown>));
      setMeetings(formattedMeetings);
    } catch (error) {
      console.error('useMeetingsFetch: Error in fetchMeetings:', error);
      toast.error("Error", {
        description: "Failed to load meetings. Please check your connection and try again.",
      });
      setMeetings([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (isAuthenticated && user) fetchMeetings();
  }, [isAuthenticated, user, fetchMeetings]);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    const channel = supabase
      .channel('meetings-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'meetings' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setMeetings(prev => [formatMeeting(payload.new as Record<string, unknown>), ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setMeetings(prev => prev.map(m => m.id === payload.new.id ? formatMeeting(payload.new as Record<string, unknown>) : m));
        } else if (payload.eventType === 'DELETE') {
          setMeetings(prev => prev.filter(m => m.id !== payload.old.id));
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [isAuthenticated, user?.id]);

  return {
    meetings,
    setMeetings,
    loading,
    fetchMeetings
  };
};
