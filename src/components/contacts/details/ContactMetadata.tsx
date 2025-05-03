
import { Contact } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { useOrganizations } from "@/context/organizations/OrganizationsContext";

interface ContactMetadataProps {
  contact: Contact;
}

export const ContactMetadata = ({ contact }: ContactMetadataProps) => {
  const { organizations } = useOrganizations();
  
  // Find the organization name if organization_id exists
  const organizationName = contact.organizationId 
    ? organizations.find(org => org.id === contact.organizationId)?.name || 'Unknown Organization'
    : 'No Organization';
  
  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="font-medium mb-4">Contact Details</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Created</span>
            <span>{new Date(contact.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Last Updated</span>
            <span>{new Date(contact.updatedAt).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Organization</span>
            <span>{organizationName}</span>
          </div>
          {contact.agentName && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Assigned To</span>
              <span>{contact.agentName}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
