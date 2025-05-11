
import { useEffect } from "react";
import { Outlet, useLocation, Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useOrganizations } from "@/context/organizations/OrganizationsContext";
import { LoadingScreen } from "./LoadingScreen";
import { useSmoothScroll } from "./hooks/useSmoothScroll";
import { useAuth } from "@/context/AuthContext";

export const Layout = () => {
  const { 
    isLoadingOrganizations,
    initialLoadComplete,
    organizations 
  } = useOrganizations();
  
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  
  // Use the extracted smooth scroll hook
  useSmoothScroll(location);
  
  // Show loading screen while initializing/loading organizations
  if (isLoading || isLoadingOrganizations || !initialLoadComplete) {
    return <LoadingScreen message="Loading your account" description="Please wait while we set up your workspace" />;
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to organizations/new if authenticated but no organizations
  if (initialLoadComplete && organizations.length === 0) {
    return <Navigate to="/organizations/new" replace />;
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
    </SidebarProvider>
  );
};

export default Layout;
