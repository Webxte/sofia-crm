
import { useState, useCallback, useEffect } from "react";
import { Contact } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

const formatContact = (row: Record<string, unknown>): Contact => ({
  id: row.id as string,
  fullName: (row.full_name as string) || '',
  company: (row.company as string) || '',
  email: (row.email as string) || '',
  phone: (row.phone as string) || '',
  mobile: (row.mobile as string) || '',
  position: (row.position as string) || '',
  address: (row.address as string) || '',
  source: (row.source as string) || '',
  category: (row.category as string) || '',
  notes: (row.notes as string) || '',
  agentId: (row.agent_id as string) || '',
  agentName: (row.agent_name as string) || '',
  createdAt: new Date(row.created_at as string),
  updatedAt: new Date(row.updated_at as string),
});

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

      const formattedContacts = contactsData.map(c => formatContact(c as Record<string, unknown>));
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

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    const channel = supabase
      .channel('contacts-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contacts' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setContacts(prev => [formatContact(payload.new as Record<string, unknown>), ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setContacts(prev => prev.map(c => c.id === payload.new.id ? formatContact(payload.new as Record<string, unknown>) : c));
        } else if (payload.eventType === 'DELETE') {
          setContacts(prev => prev.filter(c => c.id !== payload.old.id));
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [isAuthenticated, user?.id]);

  return {
    contacts,
    setContacts,
    loading,
    fetchContacts
  };
};
