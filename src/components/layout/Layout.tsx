
import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useOrganizations } from "@/context/organizations/OrganizationsContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { OrganizationLogin } from "../organizations/OrganizationLogin";
import { Organization } from "@/types";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export const Layout = () => {
  const { user, isAuthenticated } = useAuth();
  const { 
    currentOrganization, 
    organizations, 
    fetchOrganizations,
    switchOrganization 
  } = useOrganizations();
  const navigate = useNavigate();
  const [belmorsoOrg, setBelmorsoOrg] = useState<Organization | null>(null);
  const [showOrgLoginDialog, setShowOrgLoginDialog] = useState(false);
  const [isLoadingBelmorso, setIsLoadingBelmorso] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  
  // Add smooth scrolling to top when route changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  // Make sure organizations are loaded when user is authenticated
  useEffect(() => {
    const loadOrganizations = async () => {
      if (!isAuthenticated || !user) {
        setIsInitializing(false);
        return;
      }
      
      console.log("Layout: User authenticated, fetching organizations");
      try {
        await fetchOrganizations();
        setIsInitializing(false);
      } catch (error) {
        console.error("Error fetching organizations:", error);
        setIsInitializing(false);
      }
    };
    
    loadOrganizations();
  }, [isAuthenticated, user, fetchOrganizations]);

  // Debug logging
  useEffect(() => {
    console.log("Current organizations in state:", organizations);
    console.log("Current selected organization:", currentOrganization);
  }, [organizations, currentOrganization]);

  // Check for Belmorso organization if user has no organizations
  useEffect(() => {
    const findOrCreateBelmorsoOrg = async () => {
      if (!isAuthenticated || !user || isLoadingBelmorso || isInitializing) {
        return;
      }
      
      // Log organizations length for debugging
      console.log(`User has ${organizations.length} organizations available`);
      
      if (organizations.length > 0) {
        // If organizations exist but no current organization is selected,
        // set the first one as current
        if (!currentOrganization) {
          console.log("Organizations exist but none selected, selecting first one:", organizations[0].id);
          switchOrganization(organizations[0].id);
        }
        return;
      }
      
      console.log("No organizations found, looking for Belmorso organization");
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
          console.log("Found existing Belmorso organization:", existingOrg);
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
            console.log("User is already a member of Belmorso, switching to it");
            await switchOrganization(existingOrg.id);
            toast({
              title: "Organization Selected",
              description: "You've been connected to the Belmorso organization."
            });
          } else {
            console.log("User is not a member of Belmorso, showing login dialog");
            setShowOrgLoginDialog(true);
          }
        } else {
          // Create Belmorso organization
          console.log("Belmorso organization doesn't exist, redirecting to create it");
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
  }, [isAuthenticated, user, organizations, isLoadingBelmorso, navigate, switchOrganization, currentOrganization, isInitializing]);

  // Handle successful organization login
  const handleOrgLoginSuccess = async () => {
    if (!belmorsoOrg || !user) return;
    
    try {
      console.log("Organization login successful, creating membership");
      // Create organization membership
      await supabase.from('organization_members').insert([{
        organization_id: belmorsoOrg.id,
        user_id: user.id,
        role: 'member'
      }]);
      
      // Switch to Belmorso organization
      switchOrganization(belmorsoOrg.id);
      toast({
        title: "Success", 
        description: "You've been added to the Belmorso organization"
      });
      
      // Refresh the page to make sure everything is loaded with the new organization context
      window.location.reload();
    } catch (error) {
      console.error("Error creating organization membership:", error);
      toast({
        title: "Error",
        description: "Failed to join organization",
        variant: "destructive"
      });
    }
  };

  // If still initializing, show loading state
  if (isInitializing && isAuthenticated) {
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

  // If organizations are still loading or not available, show loading state
  if (isAuthenticated && organizations.length === 0 && !belmorsoOrg && !isLoadingBelmorso) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-medium mb-2">No organizations available</h2>
          <p className="text-muted-foreground mb-4">
            You don't have access to any organizations yet.
          </p>
          <button 
            onClick={() => navigate('/organizations/new')} 
            className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
          >
            Create Organization
          </button>
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
