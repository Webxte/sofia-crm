
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SettingsContextType, SettingsData } from "./types";

export const useSettingsOperations = (isAuthenticated: boolean, user: any): SettingsContextType => {
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchSettings = useCallback(async () => {
    if (!isAuthenticated || !user) {
      console.log("useSettingsOperations: User not authenticated, using default settings");
      // Set default settings when user is not authenticated
      setSettings({
        id: '',
        companyName: '',
        companyEmail: '',
        companyPhone: '',
        companyAddress: '',
        defaultEmailSubject: '',
        defaultEmailMessage: '',
        defaultContactEmailMessage: '',
        defaultTermsAndConditions: '',
        customLinks: [],
        catalogUrl: '',
        priceListUrl: '',
        emailFooter: 'This is an automated message from your CRM system.',
        emailSenderName: 'CRM System',
        termsEnabled: false,
        defaultVatRate: 21,
        bulkEmailTemplate: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return;
    }

    try {
      setLoading(true);
      console.log("useSettingsOperations: Fetching settings for user:", user.id);

      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('useSettingsOperations: Error fetching settings:', error);
        // Don't throw error, just use defaults
      }

      const settingsData: SettingsData = data ? {
        id: data.id,
        companyName: data.company_name || '',
        companyEmail: data.company_email || '',
        companyPhone: data.company_phone || '',
        companyAddress: data.company_address || '',
        defaultEmailSubject: data.default_email_subject || '',
        defaultEmailMessage: data.default_email_message || '',
        defaultContactEmailMessage: data.default_contact_email_message || '',
        defaultTermsAndConditions: data.default_terms_and_conditions || '',
        customLinks: data.custom_links || [],
        catalogUrl: data.catalog_url || '',
        priceListUrl: data.price_list_url || '',
        emailFooter: data.email_footer || 'This is an automated message from your CRM system.',
        emailSenderName: data.email_sender_name || 'CRM System',
        termsEnabled: data.terms_enabled || false,
        defaultVatRate: data.default_vat_rate || 21,
        bulkEmailTemplate: '',
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      } : {
        // Default settings when no data found
        id: '',
        companyName: '',
        companyEmail: '',
        companyPhone: '',
        companyAddress: '',
        defaultEmailSubject: '',
        defaultEmailMessage: '',
        defaultContactEmailMessage: '',
        defaultTermsAndConditions: '',
        customLinks: [],
        catalogUrl: '',
        priceListUrl: '',
        emailFooter: 'This is an automated message from your CRM system.',
        emailSenderName: 'CRM System',
        termsEnabled: false,
        defaultVatRate: 21,
        bulkEmailTemplate: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      console.log("useSettingsOperations: Settings loaded:", settingsData);
      setSettings(settingsData);
    } catch (error) {
      console.error('useSettingsOperations: Error in fetchSettings:', error);
      // Set default settings on error
      setSettings({
        id: '',
        companyName: '',
        companyEmail: '',
        companyPhone: '',
        companyAddress: '',
        defaultEmailSubject: '',
        defaultEmailMessage: '',
        defaultContactEmailMessage: '',
        defaultTermsAndConditions: '',
        customLinks: [],
        catalogUrl: '',
        priceListUrl: '',
        emailFooter: 'This is an automated message from your CRM system.',
        emailSenderName: 'CRM System',
        termsEnabled: false,
        defaultVatRate: 21,
        bulkEmailTemplate: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user, toast]);

  const updateSettings = async (newSettings: Partial<SettingsData>) => {
    if (!isAuthenticated || !user) {
      toast({
        title: "Error",
        description: "You must be logged in to update settings",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      console.log("useSettingsOperations: Updating settings:", newSettings);

      const updateData = {
        company_name: newSettings.companyName,
        company_email: newSettings.companyEmail,
        company_phone: newSettings.companyPhone,
        company_address: newSettings.companyAddress,
        default_email_subject: newSettings.defaultEmailSubject,
        default_email_message: newSettings.defaultEmailMessage,
        default_contact_email_message: newSettings.defaultContactEmailMessage,
        default_terms_and_conditions: newSettings.defaultTermsAndConditions,
        custom_links: newSettings.customLinks,
        catalog_url: newSettings.catalogUrl,
        price_list_url: newSettings.priceListUrl,
        email_footer: newSettings.emailFooter,
        email_sender_name: newSettings.emailSenderName,
        terms_enabled: newSettings.termsEnabled,
        default_vat_rate: newSettings.defaultVatRate,
        user_id: user.id,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('settings')
        .upsert(updateData, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) {
        console.error('useSettingsOperations: Error updating settings:', error);
        throw error;
      }

      console.log("useSettingsOperations: Settings updated successfully:", data);
      
      // Update local state
      await fetchSettings();

      toast({
        title: "Success",
        description: "Settings updated successfully",
      });
    } catch (error) {
      console.error('useSettingsOperations: Error in updateSettings:', error);
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshSettings = useCallback(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    loading,
    updateSettings,
    refreshSettings,
  };
};
