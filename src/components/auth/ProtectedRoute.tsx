
import { ReactNode, useEffect } from "react";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useOrganizations } from "@/context/organizations/OrganizationsContext";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();
  const { 
    currentOrganization, 
    organizations, 
    initialLoadComplete 
  } = useOrganizations();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Skip these checks on the organization login page
    if (location.pathname.startsWith('/organizations/login')) {
      return;
    }

    // First priority: If authenticated but no current organization, 
    // redirect to organization login for Belmorso
    if (!isLoading && isAuthenticated && initialLoadComplete && !currentOrganization) {
      console.log("Authenticated but no organization selected, redirecting to org login");
      navigate("/organizations/login?slug=belmorso", { replace: true });
      return;
    }
    
    // Second priority: If not authenticated, redirect to login
    if (!isLoading && !isAuthenticated) {
      console.log("Not authenticated, redirecting to login");
      navigate("/login", { replace: true });
      return;
    }

    // Third priority: If no organizations at all, go to new org page
    if (!isLoading && isAuthenticated && initialLoadComplete && organizations.length === 0) {
      console.log("No organizations found, redirecting to create new org");
      navigate("/organizations/new", { replace: true });
      return;
    }
  }, [
    isLoading, 
    isAuthenticated, 
    initialLoadComplete, 
    organizations, 
    currentOrganization, 
    navigate,
    location.pathname
  ]);

  // Show loading state while checking auth and orgs
  if (isLoading || !initialLoadComplete) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  // Block access if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Block access if no current organization is set
  if (!currentOrganization) {
    return <Navigate to="/organizations/login?slug=belmorso" replace />;
  }

  // Block access for non-admins if admin required
  // Allow both admins and agents to access the Reports and Contacts pages
  if (requireAdmin && !isAdmin) {
    const path = location.pathname;
    if (path !== '/reports' && !path.startsWith('/contacts')) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
