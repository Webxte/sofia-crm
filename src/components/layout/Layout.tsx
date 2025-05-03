
import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useOrganizations } from "@/context/organizations/OrganizationsContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { OrganizationLogin } from "../organizations/OrganizationLogin";
import { Organization } from "@/types";

export const Layout = () => {
  const { toggleSidebar } = useSidebar();
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

  // Find or create Belmorso organization if user has no organizations
  useEffect(() => {
    const findOrCreateBelmorsoOrg = async () => {
      if (!isAuthenticated || !user || organizations.length > 0 || isLoadingBelmorso) {
        return;
      }
      
      console.log("No organizations found, looking for Belmorso organization");
      setIsLoadingBelmorso(true);
      
      try {
        // Check if Belmorso organization exists
        const { data: existingOrg } = await supabase
          .from('organizations')
          .select('*')
          .eq('name', 'Belmorso')
          .single();
        
        if (existingOrg) {
          console.log("Found existing Belmorso organization:", existingOrg);
          setBelmorsoOrg({
            id: existingOrg.id,
            name: existingOrg.name,
            slug: existingOrg.slug,
            logoUrl: existingOrg.logo_url || undefined,
            primaryColor: existingOrg.primary_color || undefined,
            secondaryColor: existingOrg.secondary_color || undefined,
            createdAt: new Date(existingOrg.created_at),
            updatedAt: new Date(existingOrg.updated_at)
          });
          
          // Now check if user is already a member
          const { data: membership } = await supabase
            .from('organization_members')
            .select('*')
            .eq('organization_id', existingOrg.id)
            .eq('user_id', user.id)
            .single();
          
          if (membership) {
            // User is already a member, switch to this org
            console.log("User is already a member of Belmorso, switching to it");
            switchOrganization(existingOrg.id);
          } else {
            // Show login dialog for Belmorso org
            console.log("User is not a member of Belmorso, showing login dialog");
            setShowOrgLoginDialog(true);
          }
        } else {
          // Belmorso org doesn't exist yet, redirect to create it
          console.log("Belmorso organization doesn't exist, redirecting to create it");
          navigate('/organizations/new');
        }
      } catch (error) {
        console.error("Error finding Belmorso organization:", error);
        navigate('/organizations/new');
      } finally {
        setIsLoadingBelmorso(false);
      }
    };
    
    findOrCreateBelmorsoOrg();
  }, [isAuthenticated, user, organizations, isLoadingBelmorso, navigate, switchOrganization]);

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
      // Refresh the page to make sure everything is loaded with the new organization context
      window.location.reload();
    } catch (error) {
      console.error("Error creating organization membership:", error);
    }
  };

  return (
    <SidebarProvider defaultOpen={!window.matchMedia('(max-width: 768px)').matches}>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header onMenuClick={toggleSidebar} />
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
