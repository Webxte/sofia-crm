
import React from "react";
import { Settings as Cog } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";
import { useProducts } from "@/context/products/ProductsContext";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CompanySettings from "@/components/settings/CompanySettings";
import TermsSettings from "@/components/settings/TermsSettings";
import ProductImportSettings from "@/components/settings/ProductImportSettings";
import UserManagement from "@/components/settings/UserManagement";

const Settings = () => {
  const { settings, updateSettings } = useSettings();
  const { importProductsFromFile } = useProducts();
  const { toast } = useToast();
  
  const handleUpdateSettings = async (formData: Partial<typeof settings>) => {
    await updateSettings(formData);
    toast({
      title: "Settings Saved",
      description: "Your settings have been updated successfully",
    });
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
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="terms">Terms & Conditions</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>
        
        <TabsContent value="company">
          <CompanySettings 
            initialSettings={settings} 
            onSubmit={handleUpdateSettings} 
          />
        </TabsContent>
        
        <TabsContent value="products">
          <ProductImportSettings 
            importProductsFromFile={importProductsFromFile} 
          />
        </TabsContent>
        
        <TabsContent value="terms">
          <TermsSettings 
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
