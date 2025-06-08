
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
      
      let contactsData = [];
      
      if (isAdmin || showAll) {
        // Admin or showAll: get all contacts
        const { data, error } = await supabase
          .from('contacts')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        contactsData = data || [];
      } else {
        // Agent: get their own contacts AND contacts referenced by their orders
        console.log("useContactsFetch: Fetching agent's contacts plus contacts from their orders");
        
        // First, get the agent's own contacts
        const { data: ownContacts, error: ownContactsError } = await supabase
          .from('contacts')
          .select('*')
          .eq('agent_id', user.id)
          .order('created_at', { ascending: false });

        if (ownContactsError) throw ownContactsError;
        
        // Get contact IDs referenced by this agent's orders
        const { data: agentOrders, error: ordersError } = await supabase
          .from('orders')
          .select('contact_id')
          .eq('agent_id', user.id);

        if (ordersError) throw ordersError;
        
        const orderContactIds = agentOrders?.map(order => order.contact_id) || [];
        const uniqueOrderContactIds = [...new Set(orderContactIds)];
        
        console.log("useContactsFetch: Agent's order contact IDs:", uniqueOrderContactIds);
        
        // Get contacts referenced by orders (that might not be owned by this agent)
        let orderContacts = [];
        if (uniqueOrderContactIds.length > 0) {
          const { data: referencedContacts, error: referencedContactsError } = await supabase
            .from('contacts')
            .select('*')
            .in('id', uniqueOrderContactIds);

          if (referencedContactsError) {
            console.warn("useContactsFetch: Error fetching referenced contacts:", referencedContactsError);
          } else {
            orderContacts = referencedContacts || [];
          }
        }
        
        // Combine and deduplicate contacts
        const ownContactIds = new Set((ownContacts || []).map(c => c.id));
        const additionalContacts = orderContacts.filter(c => !ownContactIds.has(c.id));
        
        contactsData = [...(ownContacts || []), ...additionalContacts];
        
        console.log("useContactsFetch: Own contacts:", (ownContacts || []).length);
        console.log("useContactsFetch: Additional contacts from orders:", additionalContacts.length);
        console.log("useContactsFetch: Total contacts:", contactsData.length);
      }

      console.log("useContactsFetch: Raw contacts data from Supabase:", contactsData?.length || 0);

      const formattedContacts: Contact[] = (contactsData || []).map(contact => ({
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
