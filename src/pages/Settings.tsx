
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
import ProductManagement from "@/components/settings/ProductManagement";
import ContactImportSettings from "@/components/settings/ContactImportSettings";
import AuditLog from "@/components/settings/AuditLog";
import { useSettings } from "@/context/settings";
import { useProducts } from "@/context/products/ProductsContext";
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
        organization_id: "",
        company_name: "",
        companyName: "",
        companyEmail: "",
        company_email: "",
        companyPhone: "",
        company_phone: "",
        companyAddress: "",
        company_address: "",
        defaultEmailSubject: "",
        default_email_subject: "",
        defaultEmailMessage: "",
        default_email_message: "",
        defaultContactEmailMessage: "",
        default_contact_email_message: "",
        defaultTermsAndConditions: "",
        default_terms_and_conditions: "",
        terms: "",
        customLinks: [],
        custom_links: [],
        catalogUrl: "",
        catalog_url: "",
        priceListUrl: "",
        price_list_url: "",
        emailFooter: "",
        email_footer: "",
        emailSenderName: "",
        email_sender_name: "",
        termsEnabled: false,
        terms_enabled: false,
        defaultVatRate: 0,
        default_vat_rate: 0,
        bulkEmailTemplate: "",
        bulk_email_template: "",
        primary_color: "",
        secondary_color: "",
        show_footer_in_emails: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }

    return {
      id: data.id,
      organization_id: "", // Default empty since not available in SettingsData
      company_name: data.companyName || "",
      companyName: data.companyName || "",
      companyEmail: data.companyEmail || "",
      company_email: data.companyEmail || "",
      companyPhone: data.companyPhone || "",
      company_phone: data.companyPhone || "",
      companyAddress: data.companyAddress || "",
      company_address: data.companyAddress || "",
      defaultEmailSubject: data.defaultEmailSubject || "",
      default_email_subject: data.defaultEmailSubject || "",
      defaultEmailMessage: data.defaultEmailMessage || "",
      default_email_message: data.defaultEmailMessage || "",
      defaultContactEmailMessage: data.defaultContactEmailMessage || "",
      default_contact_email_message: data.defaultContactEmailMessage || "",
      defaultTermsAndConditions: data.defaultTermsAndConditions || "",
      default_terms_and_conditions: data.defaultTermsAndConditions || "",
      terms: data.defaultTermsAndConditions || "",
      customLinks: data.customLinks || [],
      custom_links: data.customLinks || [],
      catalogUrl: data.catalogUrl || "",
      catalog_url: data.catalogUrl || "",
      priceListUrl: data.priceListUrl || "",
      price_list_url: data.priceListUrl || "",
      emailFooter: data.emailFooter || "",
      email_footer: data.emailFooter || "",
      emailSenderName: data.emailSenderName || "",
      email_sender_name: data.emailSenderName || "",
      termsEnabled: data.termsEnabled || false,
      terms_enabled: data.termsEnabled || false,
      defaultVatRate: data.defaultVatRate || 0,
      default_vat_rate: data.defaultVatRate || 0,
      bulkEmailTemplate: data.bulkEmailTemplate || "",
      bulk_email_template: data.bulkEmailTemplate || "",
      primary_color: "",
      secondary_color: "",
      show_footer_in_emails: false,
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
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-9">
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="contact-email">Contact Email</TabsTrigger>
          <TabsTrigger value="terms">Terms</TabsTrigger>
          <TabsTrigger value="links">Links</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
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
              <CardTitle>Product Catalogue</CardTitle>
              <CardDescription>
                View, add, edit, and delete products in your catalogue.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProductManagement />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Import from CSV</CardTitle>
              <CardDescription>
                Bulk-import products from a CSV file (upserts by code).
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

        <TabsContent value="audit" className="space-y-4">
          <AuditLog />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
