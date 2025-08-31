
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // While we're processing auth status, show a loading state
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Show 404 page instead of auto-redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-6">Page not found</p>
        <p className="text-gray-500 mb-6">The page you're looking for doesn't exist.</p>
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
