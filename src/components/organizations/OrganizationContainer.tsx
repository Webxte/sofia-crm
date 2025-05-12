
import React, { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building, ArrowLeft } from "lucide-react";

interface OrganizationContainerProps {
  title: string;
  description?: string;
  children: ReactNode;
  error?: string | null;
  showHomeButton?: boolean;
}

export const OrganizationContainer = ({ 
  title, 
  description,
  children,
  error,
  showHomeButton = false
}: OrganizationContainerProps) => {
  const navigate = useNavigate();
  
  const handleGoHome = () => {
    navigate('/', { replace: true });
  };
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Building className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl">{title}</CardTitle>
          </div>
          {description && !error && <CardDescription>{description}</CardDescription>}
          {error && <CardDescription className="text-destructive">{error}</CardDescription>}
        </CardHeader>
        <CardContent>
          {children}
          
          {showHomeButton && (
            <div className="mt-6">
              <Button 
                variant="outline" 
                onClick={handleGoHome}
                className="w-full"
                type="button"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
