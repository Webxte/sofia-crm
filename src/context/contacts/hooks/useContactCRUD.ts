
import { useState } from "react";
import { Contact } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export const useContactCRUD = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const createContact = async (contactData: Omit<Contact, "id" | "createdAt" | "updatedAt">) => {
    if (!user) {
      const errorMsg = "User not found";
      console.error("createContact error:", errorMsg);
      toast.error("Error", {
        description: errorMsg,
      });
      throw new Error(errorMsg);
    }

    setLoading(true);
    try {
      console.log("Creating contact for user:", user.id);
      
      const newContact = {
        full_name: contactData.fullName,
        company: contactData.company,
        email: contactData.email,
        phone: contactData.phone,
        mobile: contactData.mobile,
        position: contactData.position,
        address: contactData.address,
        source: contactData.source,
        category: contactData.category,
        notes: contactData.notes,
        agent_id: user.id,
        agent_name: user.name || user.email || "",
        pipeline_stage: contactData.pipelineStage || 'lead',
        pipeline_value: contactData.pipelineValue || 0,
        pipeline_notes: contactData.pipelineNotes || '',
        contact_type: contactData.contactType || 'lead',
      };

      console.log("Contact data being inserted:", newContact);

      const { data, error } = await supabase
        .from("contacts")
        .insert([newContact])
        .select()
        .single();

      if (error) {
        console.error("Database error creating contact:", error);
        throw error;
      }

      console.log("Contact created successfully:", data);

      const createdContact: Contact = {
        id: data.id,
        fullName: data.full_name || "",
        company: data.company || "",
        email: data.email || "",
        phone: data.phone || "",
        mobile: data.mobile || "",
        position: data.position || "",
        address: data.address || "",
        source: data.source || "",
        category: data.category || "",
        notes: data.notes || "",
        agentId: data.agent_id || "",
        agentName: data.agent_name || "",
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };

      toast.success("Success", {
        description: "Contact created successfully",
      });

      return createdContact;
    } catch (error) {
      console.error("Error creating contact:", error);
      toast.error("Error", {
        description: "Failed to create contact",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateContact = async (id: string, contactData: Partial<Contact>) => {
    if (!user) {
      throw new Error("User not found");
    }

    setLoading(true);
    try {
      const updateData: Record<string, unknown> = {
        full_name: contactData.fullName,
        company: contactData.company,
        email: contactData.email,
        phone: contactData.phone,
        mobile: contactData.mobile,
        position: contactData.position,
        address: contactData.address,
        source: contactData.source,
        category: contactData.category,
        notes: contactData.notes,
        updated_at: new Date().toISOString(),
      };

      // Only include pipeline/type fields when explicitly provided
      if (contactData.pipelineStage !== undefined) updateData.pipeline_stage = contactData.pipelineStage;
      if (contactData.pipelineValue  !== undefined) updateData.pipeline_value  = contactData.pipelineValue;
      if (contactData.pipelineNotes  !== undefined) updateData.pipeline_notes  = contactData.pipelineNotes;
      if (contactData.contactType    !== undefined) updateData.contact_type    = contactData.contactType;

      // RLS policies will ensure users can only update their own contacts or all if admin
      const { data, error } = await supabase
        .from("contacts")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        fullName: data.full_name || "",
        company: data.company || "",
        email: data.email || "",
        phone: data.phone || "",
        mobile: data.mobile || "",
        position: data.position || "",
        address: data.address || "",
        source: data.source || "",
        category: data.category || "",
        notes: data.notes || "",
        agentId: data.agent_id || "",
        agentName: data.agent_name || "",
        pipelineStage: data.pipeline_stage || 'lead',
        pipelineValue: data.pipeline_value || 0,
        pipelineNotes: data.pipeline_notes || '',
        contactType: data.contact_type || 'lead',
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      } as Contact;
    } catch (error) {
      console.error("Error updating contact:", error);
      toast.error("Error", {
        description: "Failed to update contact",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteContact = async (id: string): Promise<boolean> => {
    if (!user) {
      throw new Error("User not found");
    }

    setLoading(true);
    try {
      // RLS policies will ensure users can only delete their own contacts or all if admin
      const { error } = await supabase
        .from("contacts")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error deleting contact:", error);
      toast.error("Error", {
        description: "Failed to delete contact",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Alias for compatibility
  const addContact = createContact;

  return {
    createContact,
    addContact,
    updateContact,
    deleteContact,
    loading
  };
};
