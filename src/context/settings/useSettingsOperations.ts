
import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Settings } from "./types";
import { User } from "@supabase/supabase-js";

export const useSettingsOperations = (isAuthenticated: boolean, user: User | null) => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchSettings = useCallback(async () => {
    if (!isAuthenticated || !user) {
      console.log("User not authenticated, skipping settings fetch");
      return;
    }

    try {
      setLoading(true);
      console.log("Fetching settings for user:", user.id);
      
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching settings:', error);
        throw error;
      }

      if (data) {
        console.log("Settings found:", data);
        const formattedSettings: Settings = {
          id: data.id,
          userId: data.user_id,
          companyName: data.company_name || '',
          companyEmail: data.company_email || '',
          companyPhone: data.company_phone || '',
          companyAddress: data.company_address || '',
          defaultEmailSubject: data.default_email_subject || '',
          defaultEmailMessage: data.default_email_message || '',
          defaultContactEmailMessage: data.default_contact_email_message || '',
          defaultTermsAndConditions: data.default_terms_and_conditions || '',
          customLinks: (data.custom_links as any) || [],
          catalogUrl: data.catalog_url || '',
          priceListUrl: data.price_list_url || '',
          emailFooter: data.email_footer || '',
          emailSenderName: data.email_sender_name || '',
          termsEnabled: data.terms_enabled || false,
          defaultVatRate: data.default_vat_rate || 0,
          bulkEmailTemplate: '', // Not stored in DB yet, use default
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at),
        };
        setSettings(formattedSettings);
      } else {
        console.log("No settings found for user");
        setSettings(null);
      }
    } catch (error) {
      console.error('Error in fetchSettings:', error);
      toast({
        title: "Error",
        description: "Failed to load settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user, toast]);

  const updateSettings = useCallback(async (updatedSettings: Partial<Settings>) => {
    if (!user) {
      throw new Error("User not found");
    }

    setLoading(true);
    try {
      const updateData = {
        user_id: user.id,
        company_name: updatedSettings.companyName,
        company_email: updatedSettings.companyEmail,
        company_phone: updatedSettings.companyPhone,
        company_address: updatedSettings.companyAddress,
        default_email_subject: updatedSettings.defaultEmailSubject,
        default_email_message: updatedSettings.defaultEmailMessage,
        default_contact_email_message: updatedSettings.defaultContactEmailMessage,
        default_terms_and_conditions: updatedSettings.defaultTermsAndConditions,
        custom_links: updatedSettings.customLinks as any,
        catalog_url: updatedSettings.catalogUrl,
        price_list_url: updatedSettings.priceListUrl,
        email_footer: updatedSettings.emailFooter,
        email_sender_name: updatedSettings.emailSenderName,
        terms_enabled: updatedSettings.termsEnabled,
        default_vat_rate: updatedSettings.defaultVatRate,
        updated_at: new Date().toISOString(),
      };

      let data, error;

      if (settings?.id) {
        // Update existing settings
        ({ data, error } = await supabase
          .from("settings")
          .update(updateData)
          .eq("id", settings.id)
          .eq("user_id", user.id)
          .select()
          .single());
      } else {
        // Create new settings
        ({ data, error } = await supabase
          .from("settings")
          .insert(updateData)
          .select()
          .single());
      }

      if (error) throw error;

      const formattedSettings: Settings = {
        id: data.id,
        userId: data.user_id,
        companyName: data.company_name || '',
        companyEmail: data.company_email || '',
        companyPhone: data.company_phone || '',
        companyAddress: data.company_address || '',
        defaultEmailSubject: data.default_email_subject || '',
        defaultEmailMessage: data.default_email_message || '',
        defaultContactEmailMessage: data.default_contact_email_message || '',
        defaultTermsAndConditions: data.default_terms_and_conditions || '',
        customLinks: (data.custom_links as any) || [],
        catalogUrl: data.catalog_url || '',
        priceListUrl: data.price_list_url || '',
        emailFooter: data.email_footer || '',
        emailSenderName: data.email_sender_name || '',
        termsEnabled: data.terms_enabled || false,
        defaultVatRate: data.default_vat_rate || 0,
        bulkEmailTemplate: updatedSettings.bulkEmailTemplate || '',
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };

      setSettings(formattedSettings);

      toast({
        title: "Success",
        description: "Settings updated successfully",
      });

      return formattedSettings;
    } catch (error) {
      console.error("Error updating settings:", error);
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user, settings, toast]);

  const refreshSettings = useCallback(async () => {
    await fetchSettings();
  }, [fetchSettings]);

  // Load settings when user changes
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    loading,
    updateSettings,
    refreshSettings,
  };
};
