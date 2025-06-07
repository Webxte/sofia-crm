
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Meeting } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useContacts } from "@/context/contacts/ContactsContext";

export const useMeetingCRUD = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { getContactById } = useContacts();

  const createMeeting = async (meetingData: Omit<Meeting, "id" | "createdAt" | "updatedAt">) => {
    console.log("useMeetingCRUD: Creating meeting with data:", meetingData);
    
    if (!user) {
      console.error("useMeetingCRUD: User not authenticated");
      throw new Error("User not authenticated");
    }
    
    setLoading(true);
    try {
      // Get contact name from contact ID
      const contact = getContactById(meetingData.contactId);
      const contactName = contact ? contact.fullName : 'Unknown Contact';
      
      console.log("useMeetingCRUD: Found contact:", contactName, "for ID:", meetingData.contactId);

      const { data, error } = await supabase
        .from("meetings")
        .insert([{
          contact_id: meetingData.contactId,
          contact_name: contactName,
          type: meetingData.type,
          date: meetingData.date,
          time: meetingData.time,
          location: meetingData.location || '',
          notes: meetingData.notes || '',
          next_steps: meetingData.nextSteps || [],
          agent_id: user.id,
          agent_name: user.user_metadata?.name || user.email || 'Unknown Agent',
        }])
        .select()
        .single();

      if (error) {
        console.error("useMeetingCRUD: Supabase error:", error);
        throw error;
      }

      console.log("useMeetingCRUD: Meeting created successfully:", data);

      // Convert database format to app format
      const newMeeting: Meeting = {
        id: data.id,
        contactId: data.contact_id,
        contactName: data.contact_name,
        type: data.type as Meeting["type"],
        date: data.date,
        time: data.time,
        location: data.location,
        notes: data.notes,
        nextSteps: data.next_steps || [],
        agentId: data.agent_id,
        agentName: data.agent_name,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };

      toast({
        title: "Success",
        description: "Meeting created successfully",
      });

      return newMeeting;
    } catch (error) {
      console.error("useMeetingCRUD: Error creating meeting:", error);
      toast({
        title: "Error",
        description: "Failed to create meeting",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const addMeeting = createMeeting;

  const updateMeeting = async (id: string, meetingData: Partial<Meeting>) => {
    console.log("useMeetingCRUD: Updating meeting:", id, meetingData);
    
    setLoading(true);
    try {
      // Get contact name if contactId is being updated
      let contactName = meetingData.contactName;
      if (meetingData.contactId && !contactName) {
        const contact = getContactById(meetingData.contactId);
        contactName = contact ? contact.fullName : 'Unknown Contact';
      }

      const { data, error } = await supabase
        .from("meetings")
        .update({
          contact_id: meetingData.contactId,
          contact_name: contactName,
          type: meetingData.type,
          date: meetingData.date,
          time: meetingData.time,
          location: meetingData.location,
          notes: meetingData.notes,
          next_steps: meetingData.nextSteps,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("useMeetingCRUD: Update error:", error);
        throw error;
      }

      console.log("useMeetingCRUD: Meeting updated successfully:", data);

      // Convert database format to app format
      const updatedMeeting: Meeting = {
        id: data.id,
        contactId: data.contact_id,
        contactName: data.contact_name,
        type: data.type as Meeting["type"],
        date: data.date,
        time: data.time,
        location: data.location,
        notes: data.notes,
        nextSteps: data.next_steps || [],
        agentId: data.agent_id,
        agentName: data.agent_name,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };

      toast({
        title: "Success",
        description: "Meeting updated successfully",
      });

      return updatedMeeting;
    } catch (error) {
      console.error("useMeetingCRUD: Error updating meeting:", error);
      toast({
        title: "Error",
        description: "Failed to update meeting",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteMeeting = async (id: string) => {
    console.log("useMeetingCRUD: Deleting meeting:", id);
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from("meetings")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("useMeetingCRUD: Delete error:", error);
        throw error;
      }

      console.log("useMeetingCRUD: Meeting deleted successfully");

      toast({
        title: "Success",
        description: "Meeting deleted successfully",
      });

      return true;
    } catch (error) {
      console.error("useMeetingCRUD: Error deleting meeting:", error);
      toast({
        title: "Error",
        description: "Failed to delete meeting",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    createMeeting,
    addMeeting,
    updateMeeting,
    deleteMeeting,
    loading,
  };
};
