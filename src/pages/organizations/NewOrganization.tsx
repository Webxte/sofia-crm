
import { Helmet } from "react-helmet-async";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateOrganizationForm } from "@/components/organizations/CreateOrganizationForm";
import { JoinOrganizationForm } from "@/components/organizations/JoinOrganizationForm";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useOrganizations } from "@/context/organizations/OrganizationsContext";

const NewOrganization = () => {
  const [activeTab, setActiveTab] = useState<string>("join");
  const { isAuthenticated, isLoading } = useAuth();
  const { organizations, initialLoadComplete } = useOrganizations();
  const navigate = useNavigate();
  
  useEffect(() => {
    // If authenticated and has organizations, redirect to dashboard
    if (!isLoading && isAuthenticated && initialLoadComplete && organizations.length > 0) {
      navigate("/dashboard", { replace: true });
    }
    
    // If not authenticated, redirect to login
    if (!isLoading && !isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isLoading, isAuthenticated, organizations, initialLoadComplete, navigate]);
  
  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  return (
    <>
      <Helmet>
        <title>Organizations | CRM</title>
      </Helmet>
      <div className="container mx-auto py-10">
        <h1 className="text-2xl font-bold mb-6 text-center">Organizations</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="join" className="max-w-[600px] mx-auto">
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
