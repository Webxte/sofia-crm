
import { useState, useCallback } from "react";
import { Meeting } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useOrganizations } from "@/context/organizations/OrganizationsContext";

export const useMeetingsFetch = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const { currentOrganization } = useOrganizations();

  const fetchMeetings = useCallback(async () => {
    // Only fetch if user is authenticated and has an organization
    if (!isAuthenticated || !user || !currentOrganization) {
      console.log("useMeetingsFetch: Missing requirements", {
        isAuthenticated,
        hasUser: !!user,
        hasOrganization: !!currentOrganization
      });
      setMeetings([]);
      return;
    }

    try {
      setLoading(true);
      console.log("useMeetingsFetch: Fetching meetings for organization:", currentOrganization.id);
      
      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .order('date', { ascending: false });

      if (error) {
        console.error('useMeetingsFetch: Error fetching meetings:', error);
        throw error;
      }

      console.log("useMeetingsFetch: Raw meetings data from Supabase:", data);

      const formattedMeetings: Meeting[] = (data || []).map(meeting => {
        const formatted = {
          id: meeting.id,
          organizationId: meeting.organization_id,
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
        };
        return formatted;
      });

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
  }, [isAuthenticated, user, currentOrganization, toast]);

  return {
    meetings,
    setMeetings,
    loading,
    fetchMeetings
  };
};
