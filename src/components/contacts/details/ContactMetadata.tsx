
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Contact } from "@/types";
import { formatDistanceToNow } from "date-fns";

interface ContactMetadataProps {
  contact: Contact;
}

export const ContactMetadata = ({ contact }: ContactMetadataProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Information</CardTitle>
        <CardDescription>Additional details about this contact</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <div className="text-sm">
            <span className="font-medium">Agent:</span> {contact.agentName}
          </div>
          <div className="text-sm">
            <span className="font-medium">Source:</span> {contact.source}
          </div>
          <div className="text-sm">
            <span className="font-medium">Created:</span> {" "}
            {formatDistanceToNow(new Date(contact.createdAt), { addSuffix: true })}
          </div>
          <div className="text-sm">
            <span className="font-medium">Last Updated:</span> {" "}
            {formatDistanceToNow(new Date(contact.updatedAt), { addSuffix: true })}
          </div>
        </div>
        
        {contact.notes && (
          <div>
            <h4 className="font-medium mb-2">Notes</h4>
            <p className="text-sm text-muted-foreground">{contact.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
