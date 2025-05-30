
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Settings } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useOrganizations } from "@/context/organizations/OrganizationsContext";
import { useToast } from "@/hooks/use-toast";
import { SettingsContextType } from "./settings/types";

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<Settings>({
    id: "",
    organization_id: "",
    companyName: "",
    company_name: "",
    emailFooter: "This is an automated message from your CRM system.",
    emailSenderName: "CRM System",
    defaultVatRate: 0,
    termsEnabled: false,
    customLinks: [],
    showFooterInEmails: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { currentOrganization } = useOrganizations();
  const { toast } = useToast();

  const fetchSettings = async () => {
    if (!user || !currentOrganization) {
      console.log("No user or organization, skipping settings fetch");
      return;
    }

    setLoading(true);
    try {
      console.log("Fetching settings for organization:", currentOrganization.id);
      
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .eq("organization_id", currentOrganization.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        throw error;
      }

      if (data) {
        // Transform database settings to app settings
        const transformedSettings: Settings = {
          id: data.id,
          organization_id: data.organization_id,
          company_name: data.company_name || "",
          companyName: data.company_name || "",
          company_email: data.company_email,
          companyEmail: data.company_email,
          company_phone: data.company_phone,
          companyPhone: data.company_phone,
          company_address: data.company_address,
          companyAddress: data.company_address,
          primary_color: data.primary_color,
          secondary_color: data.secondary_color,
          default_vat_rate: data.default_vat_rate || 0,
          defaultVatRate: data.default_vat_rate || 0,
          terms_enabled: data.terms_enabled || false,
          termsEnabled: data.terms_enabled || false,
          terms: data.terms,
          default_terms_and_conditions: data.default_terms_and_conditions,
          defaultTermsAndConditions: data.default_terms_and_conditions,
          catalog_url: data.catalog_url,
          catalogUrl: data.catalog_url,
          price_list_url: data.price_list_url,
          priceListUrl: data.price_list_url,
          custom_links: data.custom_links || [],
          customLinks: data.custom_links || [],
          bulk_email_template: data.bulk_email_template,
          bulkEmailTemplate: data.bulk_email_template,
          default_contact_email_message: data.default_contact_email_message,
          defaultContactEmailMessage: data.default_contact_email_message,
          default_email_subject: data.default_email_subject,
          defaultEmailSubject: data.default_email_subject,
          default_email_message: data.default_email_message,
          defaultEmailMessage: data.default_email_message,
          email_footer: data.email_footer || "This is an automated message from your CRM system.",
          emailFooter: data.email_footer || "This is an automated message from your CRM system.",
          email_sender_name: data.email_sender_name || "CRM System",
          emailSenderName: data.email_sender_name || "CRM System",
          show_footer_in_emails: data.show_footer_in_emails !== false,
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at),
        };
        
        setSettings(transformedSettings);
        console.log("Settings loaded successfully");
      } else {
        console.log("No settings found, using defaults");
        // Create default settings
        setSettings(prev => ({
          ...prev,
          organization_id: currentOrganization.id,
        }));
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast({
        title: "Error",
        description: "Failed to load settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<Settings>) => {
    if (!user || !currentOrganization) {
      throw new Error("User or organization not found");
    }

    try {
      // Transform app settings to database format
      const dbSettings = {
        organization_id: currentOrganization.id,
        company_name: newSettings.companyName || newSettings.company_name,
        company_email: newSettings.companyEmail || newSettings.company_email,
        company_phone: newSettings.companyPhone || newSettings.company_phone,
        company_address: newSettings.companyAddress || newSettings.company_address,
        primary_color: newSettings.primary_color,
        secondary_color: newSettings.secondary_color,
        default_vat_rate: newSettings.defaultVatRate ?? newSettings.default_vat_rate,
        terms_enabled: newSettings.termsEnabled ?? newSettings.terms_enabled,
        terms: newSettings.terms,
        default_terms_and_conditions: newSettings.defaultTermsAndConditions || newSettings.default_terms_and_conditions,
        catalog_url: newSettings.catalogUrl || newSettings.catalog_url,
        price_list_url: newSettings.priceListUrl || newSettings.price_list_url,
        custom_links: newSettings.customLinks || newSettings.custom_links,
        bulk_email_template: newSettings.bulkEmailTemplate || newSettings.bulk_email_template,
        default_contact_email_message: newSettings.defaultContactEmailMessage || newSettings.default_contact_email_message,
        default_email_subject: newSettings.defaultEmailSubject || newSettings.default_email_subject,
        default_email_message: newSettings.defaultEmailMessage || newSettings.default_email_message,
        email_footer: newSettings.emailFooter || newSettings.email_footer,
        email_sender_name: newSettings.emailSenderName || newSettings.email_sender_name,
        show_footer_in_emails: newSettings.show_footer_in_emails,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("settings")
        .upsert([dbSettings], { onConflict: "organization_id" })
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setSettings(prev => ({ ...prev, ...newSettings }));
      
      toast({
        title: "Settings Updated",
        description: "Your settings have been saved successfully.",
      });
    } catch (error) {
      console.error("Error updating settings:", error);
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Fetch settings when user or organization changes
  useEffect(() => {
    if (user && currentOrganization) {
      fetchSettings();
    }
  }, [user, currentOrganization]);

  const value: SettingsContextType = {
    settings,
    loading,
    updateSettings,
    refreshSettings: fetchSettings,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
