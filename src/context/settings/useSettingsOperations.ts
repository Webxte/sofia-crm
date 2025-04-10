
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Settings, CustomLink } from "@/types";

export const DEFAULT_SETTINGS: Settings = {
  companyName: "CRM System",
  companyEmail: "",
  companyPhone: "",
  companyAddress: "",
  terms: "", // Changed from defaultTermsAndConditions
  termsEnabled: false,
  customLinks: [],
  emailFooter: "This is an automated message from your CRM system.",
  emailSenderName: "CRM System",
  defaultVatRate: 0
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
        // Parse custom_links if needed
        let customLinks: CustomLink[] = [];
        
        if (data.custom_links) {
          if (typeof data.custom_links === 'string') {
            try {
              customLinks = JSON.parse(data.custom_links) as CustomLink[];
            } catch (e) {
              console.error("Failed to parse custom_links:", e);
              customLinks = [];
            }
          } else {
            // Already an object, convert to our type
            const rawLinks = data.custom_links as any;
            if (Array.isArray(rawLinks)) {
              customLinks = rawLinks.map((link: any) => ({
                url: link.url || '',
                description: link.description || ''
              }));
            }
          }
        }

        // Ensure customLinks is an array
        if (!Array.isArray(customLinks)) {
          customLinks = [];
        }

        setSettings({
          id: data.id,
          companyName: data.company_name || DEFAULT_SETTINGS.companyName,
          companyEmail: data.company_email || DEFAULT_SETTINGS.companyEmail,
          companyPhone: data.company_phone || DEFAULT_SETTINGS.companyPhone,
          companyAddress: data.company_address || DEFAULT_SETTINGS.companyAddress,
          terms: data.default_terms_and_conditions || DEFAULT_SETTINGS.terms,
          termsEnabled: data.terms_enabled !== null ? Boolean(data.terms_enabled) : DEFAULT_SETTINGS.termsEnabled,
          customLinks: customLinks,
          emailFooter: data.email_footer || DEFAULT_SETTINGS.emailFooter,
          emailSenderName: data.email_sender_name || DEFAULT_SETTINGS.emailSenderName,
          defaultVatRate: data.default_vat_rate !== null ? Number(data.default_vat_rate) : DEFAULT_SETTINGS.defaultVatRate,
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
      // Fix: Make sure we're handling the defaultVatRate type correctly
      const { error } = await supabase
        .from("settings")
        .update({
          company_name: updates.companyName,
          company_email: updates.companyEmail,
          company_phone: updates.companyPhone,
          company_address: updates.companyAddress,
          default_terms_and_conditions: updates.terms,
          terms_enabled: updates.termsEnabled,
          default_vat_rate: updates.defaultVatRate !== undefined ? updates.defaultVatRate.toString() : DEFAULT_SETTINGS.defaultVatRate.toString(),
          custom_links: updates.customLinks ? JSON.stringify(updates.customLinks) : JSON.stringify([]),
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
