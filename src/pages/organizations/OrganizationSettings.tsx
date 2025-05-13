
import React from "react";
import { Helmet } from "react-helmet-async";
import { OrganizationMembers } from "@/components/organizations/OrganizationMembers";
import { OrganizationBranding } from "@/components/organizations/OrganizationBranding";
import { OrganizationPassword } from "@/components/organizations/OrganizationPassword";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const OrganizationSettings = () => {
  return (
    <>
      <Helmet>
        <title>Organization Settings</title>
      </Helmet>
      
      <div className="container mx-auto py-6 space-y-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Organization Settings</h1>
          <p className="text-muted-foreground">
            Manage your organization settings and members
          </p>
        </div>
        
        <Tabs defaultValue="branding" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="branding">Branding</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
          </TabsList>
          
          <TabsContent value="branding" className="space-y-4">
            <OrganizationBranding />
          </TabsContent>
          
          <TabsContent value="members" className="space-y-4">
            <OrganizationMembers />
          </TabsContent>
          
          <TabsContent value="password" className="space-y-4">
            <OrganizationPassword />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default OrganizationSettings;
