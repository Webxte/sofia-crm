import { useState } from "react";
import { Meeting } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useContacts } from "@/context/contacts/ContactsContext";

export const useMeetingCRUD = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { contacts } = useContacts();

  const createMeeting = async (meetingData: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) {
      const errorMsg = "User not found";
      console.error("createMeeting error:", errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
      throw new Error(errorMsg);
    }

    setLoading(true);
    try {
      console.log("Creating meeting for user:", user.id);
      
      const newMeeting = {
        contact_id: meetingData.contactId,
        contact_name: meetingData.contactName,
        type: meetingData.type,
        date: meetingData.date,
        time: meetingData.time,
        location: meetingData.location,
        notes: meetingData.notes,
        next_steps: meetingData.nextSteps,
        agent_id: user.id,
        agent_name: user.name || user.email || "",
      };

      console.log("Meeting data being inserted:", newMeeting);

      const { data, error } = await supabase
        .from("meetings")
        .insert([newMeeting])
        .select()
        .single();

      if (error) {
        console.error("Database error creating meeting:", error);
        throw error;
      }

      console.log("Meeting created successfully:", data);

      const createdMeeting: Meeting = {
        id: data.id,
        contactId: data.contact_id,
        contactName: data.contact_name || "",
        type: data.type as "meeting" | "phone" | "email" | "online" | "other",
        date: data.date,
        time: data.time,
        location: data.location || "",
        notes: data.notes,
        nextSteps: data.next_steps || [],
        agentId: data.agent_id || "",
        agentName: data.agent_name || "",
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };

      toast({
        title: "Success",
        description: "Meeting created successfully",
      });

      return createdMeeting;
    } catch (error) {
      console.error("Error creating meeting:", error);
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

  const addMeeting = async (meetingData: any) => {
    try {
      setLoading(true);
      
      // Get contact name from contacts list
      const contact = contacts.find(c => c.id === meetingData.contactId);
      const contactName = contact ? contact.fullName : 'Unknown Contact';
      
      console.log("useMeetingCRUD: Adding meeting with contact name:", contactName);
      
      const { data, error } = await supabase
        .from('meetings')
        .insert({
          contact_id: meetingData.contactId,
          contact_name: contactName,
          type: meetingData.type,
          date: meetingData.date,
          time: meetingData.time,
          location: meetingData.location || '',
          notes: meetingData.notes || '',
          next_steps: meetingData.nextSteps || [],
          agent_id: user?.id || '',
          agent_name: meetingData.agentName || user?.user_metadata?.name || user?.email || 'Unknown Agent',
        })
        .select()
        .single();

      if (error) {
        console.error('useMeetingCRUD: Error adding meeting:', error);
        throw error;
      }

      console.log("useMeetingCRUD: Meeting added successfully:", data);
      
      toast({
        title: "Success",
        description: "Meeting added successfully",
      });

      return data;
    } catch (error) {
      console.error('useMeetingCRUD: Error in addMeeting:', error);
      toast({
        title: "Error",
        description: "Failed to add meeting. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateMeeting = async (id: string, meetingData: any) => {
    try {
      setLoading(true);
      
      // Get contact name from contacts list
      const contact = contacts.find(c => c.id === meetingData.contactId);
      const contactName = contact ? contact.fullName : 'Unknown Contact';
      
      console.log("useMeetingCRUD: Updating meeting with contact name:", contactName);
      
      const { data, error } = await supabase
        .from('meetings')
        .update({
          contact_id: meetingData.contactId,
          contact_name: contactName,
          type: meetingData.type,
          date: meetingData.date,
          time: meetingData.time,
          location: meetingData.location || '',
          notes: meetingData.notes || '',
          next_steps: meetingData.nextSteps || [],
          agent_name: meetingData.agentName || user?.user_metadata?.name || user?.email || 'Unknown Agent',
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('useMeetingCRUD: Error updating meeting:', error);
        throw error;
      }

      console.log("useMeetingCRUD: Meeting updated successfully:", data);
      
      toast({
        title: "Success",
        description: "Meeting updated successfully",
      });

      return data;
    } catch (error) {
      console.error('useMeetingCRUD: Error in updateMeeting:', error);
      toast({
        title: "Error",
        description: "Failed to update meeting. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteMeeting = async (id: string) => {
    try {
      setLoading(true);
      console.log("useMeetingCRUD: Deleting meeting:", id);
      
      const { error } = await supabase
        .from('meetings')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('useMeetingCRUD: Error deleting meeting:', error);
        throw error;
      }

      console.log("useMeetingCRUD: Meeting deleted successfully");
      
      toast({
        title: "Success",
        description: "Meeting deleted successfully",
      });

      return true;
    } catch (error) {
      console.error('useMeetingCRUD: Error in deleteMeeting:', error);
      toast({
        title: "Error",
        description: "Failed to delete meeting. Please try again.",
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
    loading
  };
};
