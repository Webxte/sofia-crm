
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Calendar, ListChecks, ShoppingCart, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ContactCardProps {
  contact: {
    id: string;
    fullName?: string;
    company?: string;
    email?: string;
    phone?: string;
    mobile?: string;
    address?: string;
    notes?: string;
    position?: string;
    agentId?: string;
    agentName?: string;
    source?: string;
    createdAt: Date;
    updatedAt: Date;
  };
  onScheduleMeeting: (contactId: string) => void;
  onCreateTask: (contactId: string) => void;
  onCreateOrder: (contactId: string) => void;
}

const ContactCard = ({ contact, onScheduleMeeting, onCreateTask, onCreateOrder }: ContactCardProps) => {
  // Create display name with company first, then fullName if available
  const displayName = contact.company || "Unnamed Company";
  const contactPerson = contact.fullName || "";

  return (
    <Card className="bg-card text-card-foreground shadow-md">
      <CardHeader>
        <div className="flex items-center">
          <Avatar className="mr-4 h-10 w-10">
            {contact.company ? (
              <AvatarImage src={`https://ui-avatars.com/api/?name=${contact.company}`} />
            ) : (
              <AvatarFallback>{contact.fullName?.charAt(0) || "?"}</AvatarFallback>
            )}
          </Avatar>
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold">{displayName}</CardTitle>
            {contactPerson && <CardDescription>{contactPerson}</CardDescription>}
            {contact.position && <CardDescription className="text-xs">{contact.position}</CardDescription>}
            {contact.source && (
              <Badge variant="outline" className="mt-1 flex items-center gap-1 text-xs">
                <Tag className="h-3 w-3" />
                {contact.source}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {contact.email && (
          <div className="flex items-center text-sm text-muted-foreground">
            <Mail className="mr-2 h-4 w-4 flex-shrink-0" />
            <span className="truncate">{contact.email}</span>
          </div>
        )}
        {contact.phone && (
          <div className="flex items-center text-sm text-muted-foreground">
            <Phone className="mr-2 h-4 w-4 flex-shrink-0" />
            <span>{contact.phone}</span>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <div className="flex flex-wrap w-full gap-2">
          <Button size="sm" variant="outline" className="flex-1" onClick={() => onScheduleMeeting(contact.id)}>
            <Calendar className="mr-2 h-4 w-4" />
            Add Meeting
          </Button>
          <Button size="sm" variant="outline" className="flex-1" onClick={() => onCreateTask(contact.id)}>
            <ListChecks className="mr-2 h-4 w-4" />
            Create Task
          </Button>
          <Button size="sm" variant="outline" className="flex-1" onClick={() => onCreateOrder(contact.id)}>
            <ShoppingCart className="mr-2 h-4 w-4" />
            Create Order
          </Button>
          <Link to={`/contacts/edit/${contact.id}`} className="w-full mt-2">
            <Button size="sm" className="w-full">View Details</Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ContactCard;
