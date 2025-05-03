
import { useState } from "react";
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
import { Building, ChevronDown, PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAnalytics } from "@/hooks/use-analytics";

export const OrganizationSwitcher = () => {
  const { organizations, currentOrganization, switchOrganization } = useOrganizations();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { trackEvent } = useAnalytics();

  const handleSwitchOrganization = async (orgId: string) => {
    if (loading || currentOrganization?.id === orgId) return;

    setLoading(true);
    await switchOrganization(orgId);
    trackEvent('organization_switched', { organizationId: orgId });
    window.location.reload(); // Reload to refresh all data with new organization context
    setLoading(false);
  };

  const handleCreateOrganization = () => {
    navigate("/organizations/new");
  };

  return (
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
            onClick={() => handleSwitchOrganization(org.id)}
          >
            <div className="flex items-center gap-2 w-full">
              {org.id === currentOrganization?.id ? (
                <span className="w-2 h-2 bg-primary rounded-full" />
              ) : (
                <span className="w-2 h-2" />
              )}
              <span className="truncate">{org.name}</span>
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
  );
};
