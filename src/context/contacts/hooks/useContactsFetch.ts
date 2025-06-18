
import { useState, useCallback } from "react";
import { Contact } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export const useContactsFetch = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, user, isAdmin } = useAuth();

  const fetchContacts = useCallback(async (showAll: boolean = false) => {
    if (!isAuthenticated || !user) {
      console.log("useContactsFetch: User not authenticated");
      setContacts([]);
      return;
    }

    try {
      setLoading(true);
      console.log("useContactsFetch: Fetching contacts for user:", user.id, "showAll:", showAll, "isAdmin:", isAdmin);
      
      // With RLS policies in place, we can simply query all contacts
      // The policies will automatically filter based on agent_id and admin status
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("useContactsFetch: Error fetching contacts:", error);
        throw error;
      }

      const contactsData = data || [];
      console.log("useContactsFetch: Raw contacts data from Supabase:", contactsData?.length || 0);

      const formattedContacts: Contact[] = contactsData.map(contact => ({
        id: contact.id,
        fullName: contact.full_name || '',
        company: contact.company || '',
        email: contact.email || '',
        phone: contact.phone || '',
        mobile: contact.mobile || '',
        position: contact.position || '',
        address: contact.address || '',
        source: contact.source || '',
        notes: contact.notes || '',
        agentId: contact.agent_id || '',
        agentName: contact.agent_name || '',
        createdAt: new Date(contact.created_at),
        updatedAt: new Date(contact.updated_at),
      }));

      console.log(`useContactsFetch: Successfully formatted ${formattedContacts.length} contacts`);
      setContacts(formattedContacts);
    } catch (error) {
      console.error('useContactsFetch: Error in fetchContacts:', error);
      toast.error("Error", {
        description: "Failed to load contacts. Please check your connection and try again.",
      });
      setContacts([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user, isAdmin]);

  return {
    contacts,
    setContacts,
    loading,
    fetchContacts
  };
};
