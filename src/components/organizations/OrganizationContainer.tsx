
import { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface OrganizationContainerProps {
  title: string;
  description?: string;
  error?: string | null;
  children: ReactNode;
  showHomeButton?: boolean;
}

export const OrganizationContainer = ({
  title,
  description,
  error,
  children,
  showHomeButton = false
}: OrganizationContainerProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted/40">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          
          {children}
        </CardContent>
        
        {showHomeButton && (
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate("/")}
            >
              Go to Home
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};
