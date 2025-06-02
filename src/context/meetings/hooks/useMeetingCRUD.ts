import { Meeting } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useOrganizations } from "@/context/organizations/OrganizationsContext";

export const useMeetingCRUD = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { currentOrganization } = useOrganizations();

  const addMeeting = async (
    meetingData: Omit<Meeting, "id" | "createdAt" | "updatedAt">,
    setMeetings: React.Dispatch<React.SetStateAction<Meeting[]>>
  ): Promise<Meeting | null> => {
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
        date: meetingData.date, // Already a string from form conversion
        time: meetingData.time,
        type: meetingData.type,
        location: meetingData.location,
        notes: meetingData.notes,
        agent_id: meetingData.agentId || user?.id,
        agent_name: meetingData.agentName || user?.user_metadata?.name || 'Unknown',
        next_steps: meetingData.nextSteps,
        follow_up_scheduled: meetingData.followUpScheduled,
        follow_up_date: meetingData.followUpDate || null, // Keep as string or null
        follow_up_time: meetingData.followUpTime,
        follow_up_notes: meetingData.followUpNotes,
        organization_id: currentOrganization.id,
      };

      const { data, error } = await supabase
        .from('meetings')
        .insert(newMeeting)
        .select()
        .single();

      if (error) throw error;

      const formattedMeeting: Meeting = {
        id: data.id,
        organizationId: data.organization_id,
        contactId: data.contact_id,
        contactName: data.contact_name || '',
        date: data.date, // Keep as string
        time: data.time,
        type: data.type as "meeting" | "phone" | "email" | "online" | "other",
        location: data.location || '',
        notes: data.notes,
        agentId: data.agent_id || '',
        agentName: data.agent_name || '',
        nextSteps: data.next_steps || [],
        followUpScheduled: data.follow_up_scheduled,
        followUpDate: data.follow_up_date || undefined, // Keep as string or undefined
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

  const updateMeeting = async (
    id: string, 
    meetingData: Partial<Meeting>,
    setMeetings: React.Dispatch<React.SetStateAction<Meeting[]>>
  ): Promise<Meeting | null> => {
    try {
      const updateData = {
        contact_id: meetingData.contactId,
        contact_name: meetingData.contactName,
        date: meetingData.date, // Already a string
        time: meetingData.time,
        type: meetingData.type,
        location: meetingData.location,
        notes: meetingData.notes,
        agent_id: meetingData.agentId,
        agent_name: meetingData.agentName,
        next_steps: meetingData.nextSteps,
        follow_up_scheduled: meetingData.followUpScheduled,
        follow_up_date: meetingData.followUpDate || null, // Keep as string or null
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
        date: data.date, // Keep as string
        time: data.time,
        type: data.type as "meeting" | "phone" | "email" | "online" | "other",
        location: data.location || '',
        notes: data.notes,
        agentId: data.agent_id || '',
        agentName: data.agent_name || '',
        nextSteps: data.next_steps || [],
        followUpScheduled: data.follow_up_scheduled,
        followUpDate: data.follow_up_date || undefined, // Keep as string or undefined
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

  const deleteMeeting = async (
    id: string,
    setMeetings: React.Dispatch<React.SetStateAction<Meeting[]>>
  ): Promise<boolean> => {
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

  const sendMeetingEmail = async (meetingId: string, emailData: any): Promise<boolean> => {
    // Implementation for sending meeting emails would go here
    console.log("Meeting email not yet implemented");
    return false;
  };

  return {
    addMeeting,
    updateMeeting,
    deleteMeeting,
    sendMeetingEmail,
  };
};
