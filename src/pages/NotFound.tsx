
import { useNavigate, Link } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If we're still loading auth status, wait
    if (isLoading) return;
    
    // After auth is loaded, redirect automatically to the appropriate page
    const redirectPath = isAuthenticated ? "/dashboard" : "/login";
    // Use setTimeout to ensure the redirect happens after the component has fully mounted
    setTimeout(() => {
      navigate(redirectPath, { replace: true });
    }, 100);
  }, [isAuthenticated, isLoading, navigate]);

  // While we're processing or redirecting, show a loading state
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // This should only briefly appear before the redirect happens
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-6">Page not found. Redirecting you...</p>
        <Button asChild className="bg-primary hover:bg-primary/90">
          <Link to={isAuthenticated ? "/dashboard" : "/login"}>
            {isAuthenticated ? "Go to Dashboard" : "Go to Login"}
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
