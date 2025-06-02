
import { useState } from "react";
import { Meeting } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useOrganizations } from "@/context/organizations/OrganizationsContext";
import { useToast } from "@/hooks/use-toast";

export const useMeetingCRUD = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { currentOrganization } = useOrganizations();
  const { toast } = useToast();

  const createMeeting = async (meetingData: Omit<Meeting, "id" | "createdAt" | "updatedAt">) => {
    if (!user || !currentOrganization) {
      throw new Error("User or organization not found");
    }

    setLoading(true);
    try {
      const newMeeting = {
        organization_id: currentOrganization.id,
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

      const { data, error } = await supabase
        .from("meetings")
        .insert([newMeeting])
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        organizationId: data.organization_id,
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
      } as Meeting;
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

  const updateMeeting = async (id: string, meetingData: Partial<Meeting>) => {
    if (!user || !currentOrganization) {
      throw new Error("User or organization not found");
    }

    setLoading(true);
    try {
      const updateData = {
        contact_id: meetingData.contactId,
        contact_name: meetingData.contactName,
        type: meetingData.type,
        date: meetingData.date,
        time: meetingData.time,
        location: meetingData.location,
        notes: meetingData.notes,
        next_steps: meetingData.nextSteps,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("meetings")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        organizationId: data.organization_id,
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
      } as Meeting;
    } catch (error) {
      console.error("Error updating meeting:", error);
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
    setLoading(true);
    try {
      const { error } = await supabase
        .from("meetings")
        .delete()
        .eq("id", id);

      if (error) throw error;
    } catch (error) {
      console.error("Error deleting meeting:", error);
      toast({
        title: "Error",
        description: "Failed to delete meeting",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    createMeeting,
    updateMeeting,
    deleteMeeting,
    loading
  };
};
