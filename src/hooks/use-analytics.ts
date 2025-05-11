
import * as React from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useOrganizations } from '@/context/organizations/OrganizationsContext';
import { useAuth } from '@/context/AuthContext';

export const useAnalytics = () => {
  const { currentOrganization } = useOrganizations();
  const { user } = useAuth();
  
  const trackEvent = React.useCallback(async (
    eventName: string, 
    eventData?: Record<string, any>
  ) => {
    try {
      // Don't wait for this to complete
      supabase.from('analytics_events').insert([{
        organization_id: currentOrganization?.id,
        user_id: user?.id,
        event_name: eventName,
        event_data: eventData
      }]).then(({ error }) => {
        if (error) console.error('Error tracking event:', error);
      });
    } catch (error) {
      console.error('Error in trackEvent:', error);
    }
  }, [currentOrganization, user]);
  
  return { trackEvent };
};
