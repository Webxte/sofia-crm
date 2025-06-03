
import React from "react";
import { Organization } from "@/types";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Building } from "lucide-react";

interface OrganizationContainerProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  error?: string;
  organization?: Organization;
  showHomeButton?: boolean;
}

export const OrganizationContainer = ({ 
  children, 
  title, 
  description, 
  error, 
  organization,
  showHomeButton = false 
}: OrganizationContainerProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary/10">
            <Building className="h-6 w-6 text-primary" />
          </div>
          
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {title || (organization ? `Access ${organization.name}` : "Organization Access")}
          </h2>
          
          {description && (
            <p className="mt-2 text-sm text-gray-600">
              {description}
            </p>
          )}
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
        </div>
        
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {children}
          
          {showHomeButton && (
            <div className="mt-6">
              <Button 
                variant="outline" 
                onClick={() => navigate("/")}
                className="w-full"
              >
                Go Home
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
