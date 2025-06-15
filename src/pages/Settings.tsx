import React, { useEffect } from "react";
import { useSettings } from "@/context/settings";
import { useProducts } from "@/context/products/ProductsContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CompanySettings from "@/components/settings/CompanySettings";
import TermsSettings from "@/components/settings/TermsSettings";
import ProductImportSettings from "@/components/settings/ProductImportSettings";
import ContactImportSettings from "@/components/settings/ContactImportSettings";
import UserManagement from "@/components/settings/UserManagement";
import UnifiedEmailSettings from "@/components/settings/UnifiedEmailSettings";
import CustomLinksSettings from "@/components/settings/CustomLinksSettings";
import type { Settings as SettingsType } from "@/types";

const Settings = () => {
  const { settings, updateSettings, refreshSettings, loading } = useSettings();
  const { importProductsFromFile } = useProducts();
  
  useEffect(() => {
    console.log("Settings page mounted, refreshing settings...");
    refreshSettings();
  }, [refreshSettings]);

  useEffect(() => {
    console.log("Settings state changed:", settings);
  }, [settings]);
  
  const handleUpdateSettings = async (formData: Partial<SettingsType>) => {
    console.log("Updating settings with form data:", formData);
    await updateSettings(formData);
  };
  
  // Show loading state while fetching settings
  if (loading || !settings) {
    console.log("Settings loading or null, showing loading state", { loading, settings: !!settings });
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Loading settings...
          </p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }
  
  console.log("Rendering settings with data:", settings);
  
  // Convert context settings to component-expected format
  const componentSettings: SettingsType = {
    id: settings.id,
    organization_id: "", // Add required field with default
    company_name: settings.companyName,
    companyName: settings.companyName,
    companyEmail: settings.companyEmail,
    companyPhone: settings.companyPhone,
    companyAddress: settings.companyAddress,
    defaultEmailSubject: settings.defaultEmailSubject,
    defaultEmailMessage: settings.defaultEmailMessage,
    defaultContactEmailMessage: settings.defaultContactEmailMessage,
    defaultTermsAndConditions: settings.defaultTermsAndConditions,
    customLinks: settings.customLinks,
    catalogUrl: settings.catalogUrl,
    priceListUrl: settings.priceListUrl,
    emailFooter: settings.emailFooter,
    emailSenderName: settings.emailSenderName,
    termsEnabled: settings.termsEnabled,
    defaultVatRate: settings.defaultVatRate,
    bulkEmailTemplate: settings.bulkEmailTemplate,
    createdAt: settings.createdAt,
    updatedAt: settings.updatedAt,
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your application settings
        </p>
      </div>
      
      <Tabs defaultValue="company">
        <TabsList className="mb-4">
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="data">Data Import</TabsTrigger>
          <TabsTrigger value="terms">Terms & Conditions</TabsTrigger>
          <TabsTrigger value="email">Email Templates</TabsTrigger>
          <TabsTrigger value="custom-links">Custom Links</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>
        
        <TabsContent value="company">
          <CompanySettings 
            initialSettings={componentSettings} 
            onSubmit={handleUpdateSettings} 
          />
        </TabsContent>
        
        <TabsContent value="data">
          <div className="space-y-6">
            <ProductImportSettings 
              importProductsFromFile={importProductsFromFile} 
            />
            <ContactImportSettings />
          </div>
        </TabsContent>
        
        <TabsContent value="terms">
          <TermsSettings 
            initialSettings={componentSettings} 
            onSubmit={handleUpdateSettings} 
          />
        </TabsContent>
        
        <TabsContent value="email">
          <UnifiedEmailSettings
            initialSettings={componentSettings}
            onSubmit={handleUpdateSettings}
          />
        </TabsContent>
        
        <TabsContent value="custom-links">
          <CustomLinksSettings
            initialSettings={componentSettings}
            onSubmit={handleUpdateSettings}
          />
        </TabsContent>
        
        <TabsContent value="users">
          <UserManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
