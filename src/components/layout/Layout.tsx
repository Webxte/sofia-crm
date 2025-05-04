
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
import { Loader2, AlertCircle, Plus } from "lucide-react";

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

  // Check for Belmorso organization if user has no organizations
  useEffect(() => {
    const findOrCreateBelmorsoOrg = async () => {
      // Skip this process if we're on the organization creation page
      if (location.pathname === '/organizations/new') {
        console.log("On organization creation page, skipping auto-organization setup");
        return;
      }
      
      if (!isAuthenticated || !user || isLoadingBelmorso || isLoadingOrganizations) {
        return;
      }
      
      // Don't do anything if not fully loaded yet
      if (!initialLoadComplete) {
        return;
      }
      
      // Log organizations length for debugging
      console.log(`Layout: User has ${organizations.length} organizations available`);
      
      if (organizations.length > 0) {
        // If organizations exist but no current organization is selected,
        // set the first one as current
        if (!currentOrganization) {
          console.log("Layout: Organizations exist but none selected, selecting first one:", organizations[0].id);
          switchOrganization(organizations[0].id);
        }
        return;
      }
      
      console.log("Layout: No organizations found, looking for Belmorso organization");
      setIsLoadingBelmorso(true);
      
      try {
        // Check if Belmorso organization exists
        const { data: existingOrg, error } = await supabase
          .from('organizations')
          .select('*')
          .eq('name', 'Belmorso')
          .maybeSingle();
        
        if (error) {
          console.error("Error finding Belmorso organization:", error);
          setIsLoadingBelmorso(false);
          return;
        }
        
        if (existingOrg) {
          console.log("Layout: Found existing Belmorso organization:", existingOrg);
          const formattedOrg = {
            id: existingOrg.id,
            name: existingOrg.name,
            slug: existingOrg.slug,
            logoUrl: existingOrg.logo_url || undefined,
            primaryColor: existingOrg.primary_color || undefined,
            secondaryColor: existingOrg.secondary_color || undefined,
            createdAt: new Date(existingOrg.created_at),
            updatedAt: new Date(existingOrg.updated_at)
          };
          
          setBelmorsoOrg(formattedOrg);
          
          // Now check if user is already a member
          const { data: membership, error: membershipError } = await supabase
            .from('organization_members')
            .select('*')
            .eq('organization_id', existingOrg.id)
            .eq('user_id', user.id)
            .maybeSingle();
          
          if (membershipError) {
            console.error("Error checking membership:", membershipError);
          }
          
          if (membership) {
            console.log("Layout: User is already a member of Belmorso, switching to it");
            await switchOrganization(existingOrg.id);
            // Refresh organizations list to make sure UI updates
            await fetchOrganizations();
            toast({
              title: "Organization Selected",
              description: "You've been connected to the Belmorso organization."
            });
          } else {
            console.log("Layout: User is not a member of Belmorso, showing login dialog");
            setShowOrgLoginDialog(true);
          }
        } else {
          // No Belmorso organization found
          console.log("Layout: Belmorso organization doesn't exist, redirecting to create it");
          navigate('/organizations/new');
        }
      } catch (error) {
        console.error("Error in findOrCreateBelmorsoOrg:", error);
        navigate('/organizations/new');
      } finally {
        setIsLoadingBelmorso(false);
      }
    };
    
    // Small delay to ensure the organizations list has been fetched
    const timer = setTimeout(() => {
      findOrCreateBelmorsoOrg();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [isAuthenticated, user, organizations, isLoadingBelmorso, navigate, switchOrganization, currentOrganization, initialLoadComplete, isLoadingOrganizations, location.pathname]);

  // Handle successful organization login
  const handleOrgLoginSuccess = async () => {
    if (!belmorsoOrg || !user) return;
    
    try {
      console.log("Layout: Organization login successful, creating membership");
      // Create organization membership
      const { error: membershipError } = await supabase.from('organization_members').insert([{
        organization_id: belmorsoOrg.id,
        user_id: user.id,
        role: 'member'
      }]);
      
      if (membershipError) {
        throw membershipError;
      }
      
      // After creating membership, fetch organizations again and switch
      await fetchOrganizations();
      await switchOrganization(belmorsoOrg.id);
      
      toast({
        title: "Success", 
        description: "You've been added to the Belmorso organization"
      });
    } catch (error) {
      console.error("Error creating organization membership:", error);
      toast({
        title: "Error",
        description: "Failed to join organization",
        variant: "destructive"
      });
    }
  };

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
            Create a new organization to get started with the CRM.
          </p>
          <Button 
            onClick={() => navigate('/organizations/new')} 
            className="w-full"
            size="lg"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Organization
          </Button>
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
          onSuccess={handleOrgLoginSuccess}
        />
      )}
    </SidebarProvider>
  );
};

export default Layout;
