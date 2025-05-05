
import { ReactNode, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useOrganizations } from "@/context/organizations/OrganizationsContext";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();
  const { initialLoadComplete, organizations } = useOrganizations();
  const navigate = useNavigate();

  // This effect ensures we have a valid user session
  useEffect(() => {
    // If we're not loading and not authenticated, redirect to login
    if (!isLoading && !isAuthenticated) {
      navigate("/login", { replace: true });
    }
    
    // If authenticated and initial load is complete, but no organizations, redirect to new org page
    if (!isLoading && isAuthenticated && initialLoadComplete && organizations.length === 0) {
      navigate("/organizations/new", { replace: true });
    }
  }, [isLoading, isAuthenticated, initialLoadComplete, organizations.length, navigate]);

  if (isLoading || !initialLoadComplete) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (organizations.length === 0) {
    return <Navigate to="/organizations/new" replace />;
  }

  // Allow both admins and agents to access the Reports and Contacts pages
  const path = window.location.pathname;
  if (requireAdmin && !isAdmin && path !== '/reports' && !path.startsWith('/contacts')) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
