
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { AlertCircle, LogIn } from "lucide-react";

export const NoOrganizationScreen = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="text-center max-w-md w-full bg-card p-6 rounded-lg shadow-sm">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-amber-500" />
        <h2 className="text-xl font-medium mb-2">No Organizations Available</h2>
        <p className="text-muted-foreground mb-6">
          You don't have access to any organizations yet. 
          Create a new organization or join an existing one to get started.
        </p>
        <div className="space-y-3">
          <Button 
            onClick={() => navigate('/organizations/new')} 
            className="w-full"
            size="lg"
            variant="default"
          >
            <LogIn className="mr-2 h-4 w-4" />
            Join or Create Organization
          </Button>
        </div>
      </div>
    </div>
  );
};
