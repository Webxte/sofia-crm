
import * as React from 'react';
import { Contact } from "@/types";
import { useAnalytics } from "@/hooks/use-analytics";

export const useContactAnalytics = (contacts: Contact[]) => {
  const analytics = useAnalytics();
  
  // Track when contact details are viewed
  const trackContactView = React.useCallback((contactId: string) => {
    const contact = contacts.find(c => c.id === contactId);
    if (contact) {
      analytics.track('contact_viewed', {
        contactId,
        contactName: contact.fullName,
        contactCompany: contact.company
      });
    }
  }, [contacts, analytics]);
  
  // Analyze contact data for reporting
  const analyzeContactData = React.useCallback(() => {
    // Group contacts by source
    const contactsBySource = contacts.reduce((acc, contact) => {
      const source = contact.source || 'Unknown';
      if (!acc[source]) {
        acc[source] = [];
      }
      acc[source].push(contact);
      return acc;
    }, {} as Record<string, Contact[]>);
    
    // Group contacts by company
    const contactsByCompany = contacts.reduce((acc, contact) => {
      const company = contact.company || 'Unknown';
      if (!acc[company]) {
        acc[company] = [];
      }
      acc[company].push(contact);
      return acc;
    }, {} as Record<string, Contact[]>);
    
    return {
      totalContacts: contacts.length,
      contactsBySource,
      contactsByCompany,
      sources: Object.keys(contactsBySource),
      companies: Object.keys(contactsByCompany),
      sourceDistribution: Object.entries(contactsBySource).map(([source, contacts]) => ({
        source,
        count: contacts.length,
        percentage: (contacts.length / Math.max(1, contacts.length)) * 100
      }))
    };
  }, [contacts]);
  
  return {
    trackContactView,
    analyzeContactData
  };
};
