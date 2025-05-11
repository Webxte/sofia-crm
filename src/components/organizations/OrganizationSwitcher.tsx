
import * as React from "react";
import { useOrganizations } from "@/context/organizations/OrganizationsContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Building, ChevronDown, PlusCircle, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAnalytics } from "@/hooks/use-analytics";
import { OrganizationLogin } from "./OrganizationLogin";
import { Organization } from "@/types";
import { useToast } from "@/hooks/use-toast";

export const OrganizationSwitcher = () => {
  const { organizations, currentOrganization, switchOrganization } = useOrganizations();
  const [loading, setLoading] = React.useState(false);
  const [selectedOrg, setSelectedOrg] = React.useState<Organization | null>(null);
  const [showPasswordDialog, setShowPasswordDialog] = React.useState(false);
  const navigate = useNavigate();
  const { trackEvent } = useAnalytics();
  const { toast } = useToast();

  const handleSwitchOrganization = async (org: Organization) => {
    if (loading || currentOrganization?.id === org.id) return;

    // For now, we'll show the password dialog for all organizations except the current one
    if (currentOrganization?.id !== org.id) {
      setSelectedOrg(org);
      setShowPasswordDialog(true);
    }
  };

  const handlePasswordSuccess = async () => {
    if (!selectedOrg) return;
    
    setLoading(true);
    try {
      console.log("Attempting to switch to organization:", selectedOrg.name);
      
      // Switch the organization
      const success = await switchOrganization(selectedOrg.id);
      
      if (success) {
        console.log("Successfully switched to organization:", selectedOrg.name);
        trackEvent('organization_switched', { organizationId: selectedOrg.id });
        
        toast({
          title: "Success",
          description: `Switched to ${selectedOrg.name}`
        });
        
        // Navigate to dashboard instead of reloading
        navigate('/dashboard', { replace: true });
      } else {
        toast({
          title: "Error",
          description: "Failed to switch organization. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error switching organization:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while switching organizations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateOrganization = () => {
    navigate("/organizations/new");
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center justify-between gap-2 w-full max-w-[240px]" disabled={loading}>
            <div className="flex items-center gap-2 truncate">
              <Building className="h-4 w-4" />
              <span className="truncate">{currentOrganization?.name || "Select Organization"}</span>
            </div>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[240px]">
          <DropdownMenuLabel>Organizations</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {organizations.map((org) => (
            <DropdownMenuItem
              key={org.id}
              disabled={loading}
              className="cursor-pointer"
              onClick={() => handleSwitchOrganization(org)}
            >
              <div className="flex items-center gap-2 w-full">
                {org.id === currentOrganization?.id ? (
                  <span className="w-2 h-2 bg-primary rounded-full" />
                ) : (
                  <span className="w-2 h-2" />
                )}
                <span className="truncate">{org.name}</span>
                {org.id !== currentOrganization?.id && (
                  <Shield className="h-3 w-3 ml-auto text-muted-foreground" />
                )}
              </div>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleCreateOrganization} className="cursor-pointer">
            <PlusCircle className="h-4 w-4 mr-2" />
            New Organization
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {selectedOrg && (
        <OrganizationLogin
          organization={selectedOrg}
          open={showPasswordDialog}
          onOpenChange={setShowPasswordDialog}
          onSuccess={handlePasswordSuccess}
        />
      )}
    </>
  );
};
