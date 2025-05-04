
import { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useOrganizations } from "@/context/organizations/OrganizationsContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { OrganizationLogin } from "../organizations/OrganizationLogin";
import { Organization } from "@/types";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, Plus, LogIn } from "lucide-react";

export const Layout = () => {
  const { user, isAuthenticated } = useAuth();
  const { 
    currentOrganization, 
    organizations, 
    fetchOrganizations,
    isLoadingOrganizations,
    initialLoadComplete,
    switchOrganization 
  } = useOrganizations();
  const navigate = useNavigate();
  const location = useLocation();
  const [belmorsoOrg, setBelmorsoOrg] = useState<Organization | null>(null);
  const [showOrgLoginDialog, setShowOrgLoginDialog] = useState(false);
  const [isLoadingBelmorso, setIsLoadingBelmorso] = useState(false);
  
  // Add smooth scrolling to top when route changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  
  // Debug logging
  useEffect(() => {
    console.log("Layout: Current user:", user?.id);
    console.log("Layout: Organizations in state:", organizations);
    console.log("Layout: Current selected organization:", currentOrganization);
    console.log("Layout: Is loading organizations:", isLoadingOrganizations);
    console.log("Layout: Initial load complete:", initialLoadComplete);
  }, [organizations, currentOrganization, user, isLoadingOrganizations, initialLoadComplete]);

  // If still initializing or loading organizations, show loading state
  if ((isLoadingOrganizations || !initialLoadComplete) && isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-medium mb-2">Loading your account</h2>
          <p className="text-muted-foreground">
            Please wait while we set up your workspace
          </p>
        </div>
      </div>
    );
  }

  // If organizations are loaded but none are available
  if (isAuthenticated && initialLoadComplete && organizations.length === 0 && !isLoadingBelmorso) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center max-w-md w-full bg-card p-6 rounded-lg shadow-sm">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-amber-500" />
          <h2 className="text-xl font-medium mb-2">No Organizations Available</h2>
          <p className="text-muted-foreground mb-6">
            You don't have access to any organizations yet. 
            Create a new organization or join an existing one to get started.
          </p>
          <div className="space-y-3">
            <Button 
              onClick={() => navigate('/organizations/new')} 
              className="w-full"
              size="lg"
              variant="default"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Join or Create Organization
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  // If we're loading the Belmorso org details
  if (isLoadingBelmorso) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-medium mb-2">Setting up your workspace</h2>
          <p className="text-muted-foreground">
            Please wait while we prepare your organization
          </p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={!window.matchMedia('(max-width: 768px)').matches}>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-4 md:p-6 lg:p-8 bg-background">
            <Outlet />
          </main>
        </div>
      </div>
      
      {belmorsoOrg && showOrgLoginDialog && (
        <OrganizationLogin
          organization={belmorsoOrg}
          open={showOrgLoginDialog}
          onOpenChange={setShowOrgLoginDialog}
          onSuccess={() => {}}
        />
      )}
    </SidebarProvider>
  );
};

export default Layout;
