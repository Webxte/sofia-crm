
import { useState, useCallback } from "react";
import { Contact } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

export const useContactsFetch = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
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
      
      // Simple query - let RLS handle the filtering
      let query = supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });

      // For agents: if showAll is false, explicitly filter by agent_id
      // If showAll is true or user is admin, let RLS policies handle it
      if (!isAdmin && !showAll) {
        query = query.eq('agent_id', user.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('useContactsFetch: Error fetching contacts:', error);
        throw error;
      }

      console.log("useContactsFetch: Raw contacts data from Supabase:", data?.length || 0);

      const formattedContacts: Contact[] = (data || []).map(contact => ({
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
      toast({
        title: "Error",
        description: "Failed to load contacts. Please check your connection and try again.",
        variant: "destructive",
      });
      setContacts([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user, isAdmin, toast]);

  return {
    contacts,
    setContacts,
    loading,
    fetchContacts
  };
};
