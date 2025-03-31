
import { Contact } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarPlus, ClipboardList, ShoppingCart, MoreHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";

export interface ContactCardProps {
  contact: Contact;
  onScheduleMeeting: (contactId: string) => void;
  onCreateTask: (contactId: string) => void;
  onCreateOrder: (contactId: string) => void;
}

const ContactCard = ({ contact, onScheduleMeeting, onCreateTask, onCreateOrder }: ContactCardProps) => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  
  const handleViewDetails = () => {
    navigate(`/contacts/${contact.id}`);
  };

  const handleEdit = () => {
    navigate(`/contacts/${contact.id}/edit`);
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h3 className="font-medium leading-none">
              {contact.fullName}
            </h3>
            {contact.company && (
              <p className="text-sm text-muted-foreground">
                {contact.company}
              </p>
            )}
            {contact.position && (
              <p className="text-xs text-muted-foreground">
                {contact.position}
              </p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={handleViewDetails}>
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleEdit}>
                Edit Contact
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="mt-2 space-y-2">
          {contact.email && (
            <p className="text-sm">
              <span className="font-medium">Email:</span> {contact.email}
            </p>
          )}
          {contact.phone && (
            <p className="text-sm">
              <span className="font-medium">Phone:</span> {contact.phone}
            </p>
          )}
        </div>
        
        <div className="mt-4 flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => onScheduleMeeting(contact.id)}
          >
            <CalendarPlus className="mr-1 h-4 w-4" /> Meeting
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => onCreateTask(contact.id)}
          >
            <ClipboardList className="mr-1 h-4 w-4" /> Task
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => onCreateOrder(contact.id)}
          >
            <ShoppingCart className="mr-1 h-4 w-4" /> Order
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContactCard;
