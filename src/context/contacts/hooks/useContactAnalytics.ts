
import * as React from 'react';
import { Contact } from "@/types";
import { useAnalytics } from "@/hooks/use-analytics";

export const useContactAnalytics = (contacts: Contact[]) => {
  const { trackEvent } = useAnalytics();
  
  const trackContactView = React.useCallback((contactId: string) => {
    trackEvent('contact_viewed', { contactId });
  }, [trackEvent]);
  
  const analyzeContactData = React.useCallback(() => {
    // Calculate statistics
    const totalContacts = contacts.length;
    
    // Count contacts by source
    const sourceCount: Record<string, number> = {};
    contacts.forEach(contact => {
      if (contact.source) {
        const sources = contact.source.split(',').map(s => s.trim());
        sources.forEach(source => {
          sourceCount[source] = (sourceCount[source] || 0) + 1;
        });
      }
    });
    
    // Count contacts by company
    const companyCount: Record<string, number> = {};
    contacts.forEach(contact => {
      if (contact.company) {
        companyCount[contact.company] = (companyCount[contact.company] || 0) + 1;
      }
    });
    
    // Count contacts by agent
    const agentCount: Record<string, number> = {};
    contacts.forEach(contact => {
      if (contact.agentId) {
        const key = contact.agentName || contact.agentId;
        agentCount[key] = (agentCount[key] || 0) + 1;
      }
    });
    
    return {
      totalContacts,
      sourceCount,
      companyCount,
      agentCount,
      hasEmail: contacts.filter(c => !!c.email).length,
      hasPhone: contacts.filter(c => !!c.phone || !!c.mobile).length,
      hasNotes: contacts.filter(c => !!c.notes).length
    };
  }, [contacts]);
  
  return {
    trackContactView,
    analyzeContactData
  };
};
