
import { useCallback } from "react";
import { Contact } from "@/types";
import { supabase } from "@/integrations/supabase/client";

export const useContactAnalytics = (contacts: Contact[]) => {
  const trackContactView = useCallback(async (contactId: string) => {
    try {
      await supabase
        .from("analytics_events")
        .insert([{
          event_name: "contact_viewed",
          event_data: { contact_id: contactId },
        }]);
    } catch (error) {
      console.error("Error tracking contact view:", error);
    }
  }, []);

  const analyzeContactData = useCallback(() => {
    const totalContacts = contacts.length;
    const sources = contacts.reduce((acc, contact) => {
      if (contact.source) {
        acc[contact.source] = (acc[contact.source] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const agents = contacts.reduce((acc, contact) => {
      if (contact.agentName) {
        acc[contact.agentName] = (acc[contact.agentName] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return {
      totalContacts,
      sources,
      agents,
      contactsWithEmail: contacts.filter(c => c.email).length,
      contactsWithPhone: contacts.filter(c => c.phone || c.mobile).length,
    };
  }, [contacts]);

  return {
    trackContactView,
    analyzeContactData
  };
};
