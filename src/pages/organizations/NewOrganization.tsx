
import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateOrganizationForm } from "@/components/organizations/CreateOrganizationForm";
import { JoinOrganizationForm } from "@/components/organizations/JoinOrganizationForm";

const NewOrganization = () => {
  // Change default tab to "join" instead of "create"
  const [activeTab, setActiveTab] = useState<string>("join");
  
  return (
    <>
      <Helmet>
        <title>Organizations | CRM</title>
      </Helmet>
      <div className="container mx-auto py-10">
        <h1 className="text-2xl font-bold mb-6 text-center">Organizations</h1>
        
        <Tabs defaultValue="join" onValueChange={setActiveTab} className="max-w-[600px] mx-auto">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="join">Join Existing</TabsTrigger>
            <TabsTrigger value="create">Create New</TabsTrigger>
          </TabsList>
          
          <TabsContent value="join">
            <JoinOrganizationForm />
          </TabsContent>
          
          <TabsContent value="create">
            <CreateOrganizationForm />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default NewOrganization;
