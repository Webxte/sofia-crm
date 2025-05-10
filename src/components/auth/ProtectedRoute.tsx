
import { ReactNode, useEffect, useState } from "react";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useOrganizations } from "@/context/organizations/OrganizationsContext";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { toast } from "@/hooks/use-toast";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();
  const { 
    currentOrganization, 
    organizations, 
    initialLoadComplete,
    isLoadingOrganizations
  } = useOrganizations();
  const navigate = useNavigate();
  const location = useLocation();
  const [checksPassed, setChecksPassed] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Checking authentication");

  useEffect(() => {
    // Update loading message based on current state
    if (isLoading) {
      setLoadingMessage("Verifying authentication");
    } else if (isLoadingOrganizations) {
      setLoadingMessage("Loading organization data");
    } else if (!initialLoadComplete) {
      setLoadingMessage("Finalizing setup");
    }

    // Skip these checks on specific auth routes
    if (location.pathname === '/login' || 
        location.pathname === '/register' ||
        location.pathname === '/organizations/new' ||
        location.pathname.startsWith('/organizations/login')) {
      setChecksPassed(true);
      return;
    }

    // Only run redirects when auth and org data are loaded
    if (isLoading || isLoadingOrganizations || !initialLoadComplete) return;
    
    try {
      // First priority: If no current organization, redirect to organization login
      // This happens even before authentication check
      if (!currentOrganization) {
        console.log("No organization selected, redirecting to org login");
        navigate("/organizations/login?slug=belmorso", { 
          replace: true,
          state: { from: location } // Save the location we were trying to access
        });
        return;
      }
      
      // Second priority: If authenticated but no organizations at all, go to new org page
      if (isAuthenticated && organizations.length === 0) {
        console.log("No organizations found, redirecting to create new org");
        navigate("/organizations/new", { replace: true });
        return;
      }
      
      // Third priority: If not authenticated, redirect to login
      // But only after organization is selected
      if (!isAuthenticated) {
        console.log("Not authenticated, redirecting to login");
        navigate("/login", { 
          replace: true,
          state: { from: location } // Save the location we were trying to access
        });
        return;
      }

      // If we made it here, all checks passed
      setChecksPassed(true);
    } catch (error) {
      console.error("Error in protection checks:", error);
      toast({
        title: "Navigation error",
        description: "An error occurred while checking your access. Please refresh the page.",
        variant: "destructive"
      });
    }
  }, [
    isLoading, 
    isLoadingOrganizations,
    initialLoadComplete,
    isAuthenticated, 
    organizations, 
    currentOrganization, 
    navigate,
    location
  ]);

  // Show loading state while checking auth and orgs
  if (isLoading || isLoadingOrganizations || !initialLoadComplete || !checksPassed) {
    // Don't show loading for auth routes
    if (location.pathname === '/login' || 
        location.pathname === '/register' ||
        location.pathname === '/organizations/new' ||
        location.pathname.startsWith('/organizations/login')) {
      return <>{children}</>;
    }
    
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner message={loadingMessage} />
      </div>
    );
  }

  // Block access if no current organization is set (except in the org pages)
  if (!currentOrganization && 
      !location.pathname.startsWith('/organizations/login') && 
      !location.pathname.startsWith('/organizations/new')) {
    return <Navigate to="/organizations/login?slug=belmorso" replace />;
  }

  // Block access if not authenticated (after organization check)
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Block access for non-admins if admin required
  // Allow both admins and agents to access the Reports and Contacts pages
  if (requireAdmin && !isAdmin) {
    const path = location.pathname;
    if (path !== '/reports' && !path.startsWith('/contacts')) {
      toast({
        title: "Access denied",
        description: "You don't have permission to access this page.",
        variant: "destructive"
      });
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
