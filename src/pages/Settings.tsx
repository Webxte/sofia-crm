
import React, { useEffect } from "react";
import { useSettings } from "@/context/settings";
import { useProducts } from "@/context/products/ProductsContext";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CompanySettings from "@/components/settings/CompanySettings";
import TermsSettings from "@/components/settings/TermsSettings";
import ProductImportSettings from "@/components/settings/ProductImportSettings";
import ContactImportSettings from "@/components/settings/ContactImportSettings";
import UserManagement from "@/components/settings/UserManagement";
import UnifiedEmailSettings from "@/components/settings/UnifiedEmailSettings";
import CustomLinksSettings from "@/components/settings/CustomLinksSettings";
import { Settings } from "@/context/settings/types";

const Settings = () => {
  const { settings, updateSettings, refreshSettings } = useSettings();
  const { importProductsFromFile } = useProducts();
  const { toast } = useToast();
  
  useEffect(() => {
    refreshSettings();
  }, []);
  
  const handleUpdateSettings = async (formData: Partial<Settings>) => {
    console.log("Updating settings with form data:", formData);
    await updateSettings(formData);
  };
  
  // If settings is null, show a loading state or default settings
  if (!settings) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Loading settings...
          </p>
        </div>
      </div>
    );
  }
  
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
            initialSettings={settings} 
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
            initialSettings={settings} 
            onSubmit={handleUpdateSettings} 
          />
        </TabsContent>
        
        <TabsContent value="email">
          <UnifiedEmailSettings
            initialSettings={settings}
            onSubmit={handleUpdateSettings}
          />
        </TabsContent>
        
        <TabsContent value="custom-links">
          <CustomLinksSettings
            initialSettings={settings}
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
