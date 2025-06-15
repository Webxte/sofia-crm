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
        notes: contactData.notes,
        agent_id: user.id,
        agent_name: user.name || user.email || "",
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
      const updateData = {
        full_name: contactData.fullName,
        company: contactData.company,
        email: contactData.email,
        phone: contactData.phone,
        mobile: contactData.mobile,
        position: contactData.position,
        address: contactData.address,
        source: contactData.source,
        notes: contactData.notes,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("contacts")
        .update(updateData)
        .eq("id", id)
        .eq("agent_id", user.id)
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
        notes: data.notes || "",
        agentId: data.agent_id || "",
        agentName: data.agent_name || "",
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
      const { error } = await supabase
        .from("contacts")
        .delete()
        .eq("id", id)
        .eq("agent_id", user.id);

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
