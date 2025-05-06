
import * as React from "react";
import { Helmet } from "react-helmet-async";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateOrganizationForm } from "@/components/organizations/CreateOrganizationForm";
import { JoinOrganizationForm } from "@/components/organizations/JoinOrganizationForm";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useOrganizations } from "@/context/organizations/OrganizationsContext";
import { DebugHooks } from "@/components/DebugHooks";

const NewOrganization = () => {
  const [activeTab, setActiveTab] = React.useState<string>("join"); // Set "join" as the default tab
  const { isAuthenticated, isLoading } = useAuth();
  const { organizations, initialLoadComplete } = useOrganizations();
  const navigate = useNavigate();
  
  React.useEffect(() => {
    // Only redirect if the user has organizations and we've completed initial loading
    if (!isLoading && isAuthenticated && initialLoadComplete && organizations.length > 0) {
      console.log("User has organizations, redirecting to dashboard");
      navigate("/dashboard", { replace: true });
    }
    
    // If not authenticated, redirect to login
    if (!isLoading && !isAuthenticated) {
      console.log("User not authenticated, redirecting to login");
      navigate("/login", { replace: true });
    }
  }, [isLoading, isAuthenticated, organizations, initialLoadComplete, navigate]);
  
  // Add debug logging for the component render
  console.log("NewOrganization render", { 
    isLoading, 
    isAuthenticated, 
    initialLoadComplete, 
    organizationsCount: organizations.length,
    activeTab
  });
  
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
        
        {/* Debug component to verify React hooks are working */}
        <DebugHooks />
        
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
