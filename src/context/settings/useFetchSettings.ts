
import { useState, useCallback, useEffect } from "react";
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
    if (!isAuthenticated) {
      console.log("User not authenticated, skipping settings fetch");
      return;
    }

    console.log("Starting settings fetch...");
    setLoading(true);
    try {
      console.log("Fetching settings from Supabase...");
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Error fetching settings:", error);
        toast({
          title: "Error",
          description: `Failed to load settings: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      console.log("Fetched settings data:", data);
      if (data) {
        // Parse custom_links
        const customLinks = parseCustomLinks(data.custom_links);
        
        // Parse VAT rate
        const vatRate = parseVatRate(data.default_vat_rate);

        const newSettings = {
          ...DEFAULT_SETTINGS,
          id: data.id,
          company_name: data.company_name || DEFAULT_SETTINGS.company_name,
          companyName: data.company_name || DEFAULT_SETTINGS.companyName,
          company_email: data.company_email || DEFAULT_SETTINGS.company_email,
          companyEmail: data.company_email || DEFAULT_SETTINGS.companyEmail,
          company_phone: data.company_phone || DEFAULT_SETTINGS.company_phone,
          companyPhone: data.company_phone || DEFAULT_SETTINGS.companyPhone,
          company_address: data.company_address || DEFAULT_SETTINGS.company_address,
          companyAddress: data.company_address || DEFAULT_SETTINGS.companyAddress,
          terms: data.default_terms_and_conditions || DEFAULT_SETTINGS.terms,
          default_terms_and_conditions: data.default_terms_and_conditions || DEFAULT_SETTINGS.default_terms_and_conditions,
          defaultTermsAndConditions: data.default_terms_and_conditions || DEFAULT_SETTINGS.defaultTermsAndConditions,
          terms_enabled: data.terms_enabled !== null ? Boolean(data.terms_enabled) : DEFAULT_SETTINGS.terms_enabled,
          termsEnabled: data.terms_enabled !== null ? Boolean(data.terms_enabled) : DEFAULT_SETTINGS.termsEnabled,
          customLinks: customLinks,
          custom_links: customLinks,
          email_footer: data.email_footer || DEFAULT_SETTINGS.email_footer,
          emailFooter: data.email_footer || DEFAULT_SETTINGS.emailFooter,
          email_sender_name: data.email_sender_name || DEFAULT_SETTINGS.email_sender_name,
          emailSenderName: data.email_sender_name || DEFAULT_SETTINGS.emailSenderName,
          default_vat_rate: vatRate,
          defaultVatRate: vatRate,
          default_email_subject: data.default_email_subject || DEFAULT_SETTINGS.default_email_subject,
          defaultEmailSubject: data.default_email_subject || DEFAULT_SETTINGS.defaultEmailSubject,
          default_email_message: data.default_email_message || DEFAULT_SETTINGS.default_email_message,
          defaultEmailMessage: data.default_email_message || DEFAULT_SETTINGS.defaultEmailMessage,
          default_contact_email_message: data.default_contact_email_message,
          defaultContactEmailMessage: data.default_contact_email_message,
          catalog_url: data.catalog_url,
          catalogUrl: data.catalog_url,
          price_list_url: data.price_list_url,
          priceListUrl: data.price_list_url,
        };
        
        console.log("Setting new settings state:", newSettings);
        setSettings(newSettings);
      } else {
        console.log("No settings data found, creating initial settings");
        // If no settings are found, create initial settings
        createInitialSettings();
      }
    } catch (err) {
      console.error("Exception during settings fetch:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred while loading settings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      console.log("Settings fetch completed");
    }
  }, [isAuthenticated, toast]);
  
  // Function to create initial settings if none exist
  const createInitialSettings = async () => {
    if (!isAuthenticated) return;
    
    try {
      console.log("Creating initial settings...");
      const initialSettings = {
        company_name: DEFAULT_SETTINGS.company_name,
        email_footer: DEFAULT_SETTINGS.email_footer,
        email_sender_name: DEFAULT_SETTINGS.email_sender_name,
        default_email_subject: DEFAULT_SETTINGS.default_email_subject,
        default_email_message: DEFAULT_SETTINGS.default_email_message,
        terms_enabled: DEFAULT_SETTINGS.terms_enabled,
        custom_links: JSON.stringify(DEFAULT_SETTINGS.custom_links),
        // Convert to number for database compatibility
        default_vat_rate: DEFAULT_SETTINGS.default_vat_rate
      };
      
      console.log("Inserting initial settings:", initialSettings);
      const { error } = await supabase
        .from("settings")
        .insert(initialSettings)
        .select();

      if (error) {
        console.error("Error creating initial settings:", error);
      } else {
        console.log("Initial settings created successfully");
        refreshSettings();
      }
    } catch (err) {
      console.error("Exception during initial settings creation:", err);
    }
  };
  
  return { settings, setSettings, loading, refreshSettings };
};
