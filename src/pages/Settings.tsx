
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import CompanySettings from "@/components/settings/CompanySettings";
import EmailTemplates from "@/components/settings/EmailTemplates";
import TermsSettings from "@/components/settings/TermsSettings";
import CustomLinksSettings from "@/components/settings/CustomLinksSettings";
import UserManagement from "@/components/settings/UserManagement";
import ContactEmailTemplates from "@/components/settings/ContactEmailTemplates";
import ProductImportSettings from "@/components/settings/ProductImportSettings";
import ContactImportSettings from "@/components/settings/ContactImportSettings";
import { useSettings } from "@/context/settings/DirectSettingsProvider";
import { useProducts } from "@/context/products/DirectProductsProvider";
import { Settings as SettingsType } from "@/types";
import { SettingsData } from "@/context/settings/types";

const Settings = () => {
  const { settings, loading, updateSettings } = useSettings();
  const { importProductsFromFile } = useProducts();

  // Transform SettingsData to Settings interface
  const transformToSettings = (data: SettingsData | null): SettingsType => {
    if (!data) {
      return {
        id: "",
        userId: "",
        companyName: "",
        companyEmail: "",
        companyPhone: "",
        companyAddress: "",
        defaultEmailSubject: "",
        defaultEmailMessage: "",
        defaultContactEmailMessage: "",
        defaultTermsAndConditions: "",
        customLinks: [],
        catalogUrl: "",
        priceListUrl: "",
        emailFooter: "",
        emailSenderName: "",
        termsEnabled: false,
        defaultVatRate: 0,
        bulkEmailTemplate: "",
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }

    return {
      id: data.id,
      userId: data.id, // Using id as userId for compatibility
      companyName: data.companyName || "",
      companyEmail: data.companyEmail || "",
      companyPhone: data.companyPhone || "",
      companyAddress: data.companyAddress || "",
      defaultEmailSubject: data.defaultEmailSubject || "",
      defaultEmailMessage: data.defaultEmailMessage || "",
      defaultContactEmailMessage: data.defaultContactEmailMessage || "",
      defaultTermsAndConditions: data.defaultTermsAndConditions || "",
      customLinks: data.customLinks || [],
      catalogUrl: data.catalogUrl || "",
      priceListUrl: data.priceListUrl || "",
      emailFooter: data.emailFooter || "",
      emailSenderName: data.emailSenderName || "",
      termsEnabled: data.termsEnabled || false,
      defaultVatRate: data.defaultVatRate || 0,
      bulkEmailTemplate: data.bulkEmailTemplate || "",
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    };
  };

  const transformedSettings = transformToSettings(settings);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your application settings and preferences.
        </p>
      </div>

      <Tabs defaultValue="company" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="contact-email">Contact Email</TabsTrigger>
          <TabsTrigger value="terms">Terms</TabsTrigger>
          <TabsTrigger value="links">Links</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>
                Update your company details and contact information.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CompanySettings initialSettings={transformedSettings} onSubmit={updateSettings} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Templates</CardTitle>
              <CardDescription>
                Configure default email templates for various communications.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmailTemplates initialSettings={transformedSettings} onSubmit={updateSettings} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact-email" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contact Email Templates</CardTitle>
              <CardDescription>
                Configure email templates specifically for contact communications.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ContactEmailTemplates initialSettings={transformedSettings} onSubmit={updateSettings} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="terms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Terms and Conditions</CardTitle>
              <CardDescription>
                Manage your terms and conditions settings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TermsSettings initialSettings={transformedSettings} onSubmit={updateSettings} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="links" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Custom Links</CardTitle>
              <CardDescription>
                Add custom links to include in your communications.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CustomLinksSettings initialSettings={transformedSettings} onSubmit={updateSettings} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage system users and their permissions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Product Import Settings</CardTitle>
              <CardDescription>
                Configure settings for importing products from CSV files.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProductImportSettings importProductsFromFile={importProductsFromFile} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contact Import Settings</CardTitle>
              <CardDescription>
                Configure settings for importing contacts from various sources.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ContactImportSettings />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
