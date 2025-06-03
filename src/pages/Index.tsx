
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

const Index = () => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
        <LoadingSpinner 
          size="lg" 
          message="Loading Your CRM" 
          description="Please wait while we set up your workspace..."
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log("Index: Not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }
  
  console.log("Index: Authenticated, redirecting to dashboard");
  return <Navigate to="/dashboard" replace />;
};

export default Index;
