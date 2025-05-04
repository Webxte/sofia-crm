
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
  
  // Add smooth scrolling to top when route changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  // Make sure organizations are loaded
  useEffect(() => {
    if (isAuthenticated) {
      console.log("Layout: User authenticated, fetching organizations");
      fetchOrganizations();
    } else {
      console.log("Layout: User not authenticated, skipping organization fetch");
    }
  }, [isAuthenticated, fetchOrganizations]);

  // Log what organizations we have for debugging
  useEffect(() => {
    console.log("Current organizations in state:", organizations);
    console.log("Current selected organization:", currentOrganization);
  }, [organizations, currentOrganization]);

  // Find or create Belmorso organization if user has no organizations
  useEffect(() => {
    const findOrCreateBelmorsoOrg = async () => {
      if (!isAuthenticated || !user || isLoadingBelmorso) {
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
          .single();
        
        if (error && error.code !== 'PGRST116') {
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
          const { data: membership } = await supabase
            .from('organization_members')
            .select('*')
            .eq('organization_id', existingOrg.id)
            .eq('user_id', user.id)
            .single();
          
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
          console.log("Belmorso organization doesn't exist, creating it");
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
  }, [isAuthenticated, user, organizations, isLoadingBelmorso, navigate, switchOrganization, currentOrganization]);

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
