
import { useState, useCallback } from "react";
import { Contact } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

export const useContactsFetch = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();

  const fetchContacts = useCallback(async (showAll: boolean = false) => {
    if (!isAuthenticated || !user) {
      console.log("useContactsFetch: User not authenticated");
      setContacts([]);
      return;
    }

    try {
      setLoading(true);
      console.log("useContactsFetch: Fetching contacts for user:", user.id, "showAll:", showAll);
      
      let query = supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });

      // If showAll is false, only fetch user's own contacts
      if (!showAll) {
        query = query.eq('agent_id', user.id);
      }
      // If showAll is true, the RLS policies will handle what the user can see
      // (admins see all, agents see all when allowed by toggle)

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
  }, [isAuthenticated, user, toast]);

  return {
    contacts,
    setContacts,
    loading,
    fetchContacts
  };
};
