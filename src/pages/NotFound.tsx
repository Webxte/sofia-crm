
import { useLocation, Link, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  // If we're still loading auth status, don't show the 404 yet
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Check if this is post-logout navigation - if we have 'from=logout' in the URL
  // or if it's a login redirect
  const params = new URLSearchParams(location.search);
  const fromLogout = params.get('from') === 'logout';
  const fromLogin = params.get('from') === 'login';
  
  // Redirect based on navigation source
  if (fromLogout || fromLogin) {
    return <Navigate to="/login" replace />;
  }

  // If user is authenticated but somehow landed on 404, redirect to dashboard
  if (isAuthenticated && (location.pathname === "/404" || location.pathname === "/")) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-6">Oops! Page not found</p>
        <p className="text-gray-500 mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Button asChild className="bg-primary hover:bg-primary/90">
          <Link to={isAuthenticated ? "/dashboard" : "/login"}>
            {isAuthenticated ? "Return to Dashboard" : "Go to Login"}
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
