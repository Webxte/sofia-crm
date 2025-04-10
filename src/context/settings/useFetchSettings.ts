
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Settings } from "@/types";
import { DEFAULT_SETTINGS } from "./constants";
import { parseCustomLinks, parseVatRate } from "./utils";

export const useFetchSettings = (isAuthenticated: boolean) => {
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
        // Parse custom_links
        const customLinks = parseCustomLinks(data.custom_links);
        
        // Parse VAT rate
        const vatRate = parseVatRate(data.default_vat_rate);

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
          defaultVatRate: vatRate,
          defaultEmailSubject: data.default_email_subject || DEFAULT_SETTINGS.defaultEmailSubject,
          defaultEmailMessage: data.default_email_message || DEFAULT_SETTINGS.defaultEmailMessage,
          defaultContactEmailMessage: data.default_contact_email_message,
          catalogUrl: data.catalog_url,
          priceListUrl: data.price_list_url,
        });
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, toast]);
  
  return { settings, setSettings, loading, refreshSettings };
};
