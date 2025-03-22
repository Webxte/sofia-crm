
import { useState } from "react";
import { Link } from "react-router-dom";
import { Contact } from "@/types";
import { useContacts } from "@/context/ContactsContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Building, Mail, MapPin, MoreVertical, Phone, Pencil, Trash, 
  Calendar, ClipboardList, ShoppingCart 
} from "lucide-react";

interface ContactCardProps {
  contact: Contact;
  onScheduleMeeting: (contactId: string) => void;
  onCreateTask: (contactId: string) => void;
  onCreateOrder: (contactId: string) => void;
}

const ContactCard = ({ 
  contact, 
  onScheduleMeeting, 
  onCreateTask, 
  onCreateOrder 
}: ContactCardProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { deleteContact } = useContacts();
  const { toast } = useToast();

  const handleDelete = () => {
    deleteContact(contact.id);
    toast({
      title: "Success",
      description: "Contact deleted successfully",
    });
    setIsDeleteDialogOpen(false);
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">
                {contact.fullName || "Unnamed Contact"}
              </CardTitle>
              {contact.position && (
                <CardDescription className="text-sm text-muted-foreground">
                  {contact.position}
                </CardDescription>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onScheduleMeeting(contact.id)}>
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>Schedule Meeting</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onCreateTask(contact.id)}>
                  <ClipboardList className="mr-2 h-4 w-4" />
                  <span>Create Task</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onCreateOrder(contact.id)}>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  <span>Create Order</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to={`/contacts/edit/${contact.id}`}>
                    <Pencil className="mr-2 h-4 w-4" />
                    <span>Edit</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-destructive focus:text-destructive"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash className="mr-2 h-4 w-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {contact.company && (
            <div className="flex items-center">
              <Building className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{contact.company}</span>
            </div>
          )}
          {contact.email && (
            <div className="flex items-center">
              <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{contact.email}</span>
            </div>
          )}
          {contact.phone && (
            <div className="flex items-center">
              <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{contact.phone}</span>
            </div>
          )}
          {contact.address && (
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{contact.address}</span>
            </div>
          )}
        </CardContent>
        <CardFooter className="justify-end pt-4">
          <Link to={`/contacts/${contact.id}`}>
            <Button variant="outline" size="sm">View Details</Button>
          </Link>
        </CardFooter>
      </Card>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Contact</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this contact? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ContactCard;
