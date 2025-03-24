import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Calendar, ListChecks, ShoppingCart } from "lucide-react";

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
    createdAt: Date;
    updatedAt: Date;
  };
  onScheduleMeeting: (contactId: string) => void;
  onCreateTask: (contactId: string) => void;
  onCreateOrder: (contactId: string) => void;
}

const ContactCard = ({ contact, onScheduleMeeting, onCreateTask, onCreateOrder }: ContactCardProps) => {
  return (
    <Card className="bg-card text-card-foreground shadow-md">
      <CardHeader>
        <div className="flex items-center">
          <Avatar className="mr-4 h-10 w-10">
            {contact.fullName ? (
              <AvatarImage src={`https://ui-avatars.com/api/?name=${contact.fullName}`} />
            ) : (
              <AvatarFallback>{contact.company?.charAt(0)}</AvatarFallback>
            )}
          </Avatar>
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold">{contact.fullName || contact.company || "Unnamed Contact"}</CardTitle>
            <CardDescription>{contact.position}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {contact.email && (
          <div className="flex items-center text-sm text-muted-foreground">
            <Mail className="mr-2 h-4 w-4" />
            {contact.email}
          </div>
        )}
        {contact.phone && (
          <div className="flex items-center text-sm text-muted-foreground">
            <Phone className="mr-2 h-4 w-4" />
            {contact.phone}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button size="sm" variant="outline" onClick={() => onScheduleMeeting(contact.id)}>
          <Calendar className="mr-2 h-4 w-4" />
          Add Meeting
        </Button>
        <Button size="sm" variant="outline" onClick={() => onCreateTask(contact.id)}>
          <ListChecks className="mr-2 h-4 w-4" />
          Create Task
        </Button>
        <Button size="sm" variant="outline" onClick={() => onCreateOrder(contact.id)}>
          <ShoppingCart className="mr-2 h-4 w-4" />
          Create Order
        </Button>
        <Link to={`/contacts/edit/${contact.id}`}>
          <Button size="sm">View Details</Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default ContactCard;
