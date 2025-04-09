import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Settings {
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  companyAddress: string;
  terms: string;
  termsEnabled: boolean;
  defaultEmailSubject?: string;
  defaultEmailMessage?: string;
  catalogUrl?: string;
  priceListUrl?: string;
  defaultContactEmailMessage?: string;
  customLinks?: Array<{ description: string; url: string }>;
  emailFooter?: string;
  emailSenderName?: string;
}

export const DEFAULT_SETTINGS: Settings = {
  companyName: "CRM System",
  companyEmail: "",
  companyPhone: "",
  companyAddress: "",
  terms: "",
  termsEnabled: false,
  customLinks: [],
  emailFooter: "This is an automated message from your CRM system.",
  emailSenderName: "CRM System"
};

export const useSettingsOperations = (isAuthenticated: boolean, isAdmin: boolean) => {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const refreshSettings = useCallback(async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .single();

      if (error) {
        console.error("Error fetching settings:", error);
        toast({
          title: "Error",
          description: "Failed to load settings.",
          variant: "destructive",
        });
      }

      if (data) {
        // Parse custom_links if it's a string
        let customLinks = data.custom_links;
        if (typeof customLinks === 'string') {
          try {
            customLinks = JSON.parse(customLinks);
          } catch (e) {
            console.error("Failed to parse custom_links:", e);
            customLinks = [];
          }
        }

        setSettings({
          companyName: data.company_name || DEFAULT_SETTINGS.companyName,
          companyEmail: data.company_email || DEFAULT_SETTINGS.companyEmail,
          companyPhone: data.company_phone || DEFAULT_SETTINGS.companyPhone,
          companyAddress: data.company_address || DEFAULT_SETTINGS.companyAddress,
          terms: data.terms || DEFAULT_SETTINGS.terms,
          termsEnabled: data.terms_enabled || DEFAULT_SETTINGS.termsEnabled,
          defaultEmailSubject: data.default_email_subject || DEFAULT_SETTINGS.defaultEmailSubject,
          defaultEmailMessage: data.default_email_message || DEFAULT_SETTINGS.defaultEmailMessage,
          defaultContactEmailMessage: data.default_contact_email_message || DEFAULT_SETTINGS.defaultContactEmailMessage,
          catalogUrl: data.catalog_url || DEFAULT_SETTINGS.catalogUrl,
          priceListUrl: data.price_list_url || DEFAULT_SETTINGS.priceListUrl,
          customLinks: customLinks || DEFAULT_SETTINGS.customLinks,
          emailFooter: data.email_footer || DEFAULT_SETTINGS.emailFooter,
          emailSenderName: data.email_sender_name || DEFAULT_SETTINGS.emailSenderName,
        });
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, toast]);

  const updateSettings = async (updates: Partial<Settings>) => {
    if (!isAuthenticated || !isAdmin) {
      toast({
        title: "Unauthorized",
        description: "You do not have permission to update settings.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("settings")
        .update({
          company_name: updates.companyName,
          company_email: updates.companyEmail,
          company_phone: updates.companyPhone,
          company_address: updates.companyAddress,
          terms: updates.terms,
          terms_enabled: updates.termsEnabled,
          default_email_subject: updates.defaultEmailSubject,
          default_email_message: updates.defaultEmailMessage,
          default_contact_email_message: updates.defaultContactEmailMessage,
          catalog_url: updates.catalogUrl,
          price_list_url: updates.priceListUrl,
          custom_links: updates.customLinks,
          email_footer: updates.emailFooter,
          email_sender_name: updates.emailSenderName,
        })
        .eq("id", 1); // Assuming there's only one row for settings

      if (error) {
        console.error("Error updating settings:", error);
        toast({
          title: "Error",
          description: "Failed to update settings.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Settings updated successfully!",
        });
        await refreshSettings(); // Refresh settings after update
      }
    } finally {
      setLoading(false);
    }
  };

  return { settings, loading, refreshSettings, updateSettings };
};
