
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useContacts } from "@/context/ContactsContext";
import { useMeetings } from "@/context/meetings";
import { useOrders } from "@/context/orders/OrdersContext";
import { useTasks } from "@/context/tasks";
import { useToast } from "@/hooks/use-toast";
import { Contact } from "@/types";
import { useNavigate } from "react-router-dom";

interface ContactDeleteDialogProps {
  contact: Contact;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onConfirm?: () => void;
  contactName?: string;
}

export const ContactDeleteDialog = ({ 
  contact, 
  open: controlledOpen, 
  onOpenChange: setControlledOpen,
  onConfirm,
  contactName
}: ContactDeleteDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { deleteContact } = useContacts();
  const { meetings } = useMeetings();
  const { orders } = useOrders();
  const { tasks } = useTasks();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Use either controlled or uncontrolled state
  const open = controlledOpen !== undefined ? controlledOpen : isOpen;
  const setOpen = setControlledOpen || setIsOpen;

  const displayName = contactName || (contact.company ? 
    `${contact.company}${contact.fullName ? ` (${contact.fullName})` : ''}` : 
    (contact.fullName || "Unnamed Contact"));

  // Check for associated data
  const associatedMeetings = meetings.filter(meeting => meeting.contactId === contact.id);
  const associatedOrders = orders.filter(order => order.contactId === contact.id);
  const associatedTasks = tasks.filter(task => task.contactId === contact.id);

  const hasAssociatedData = associatedMeetings.length > 0 || associatedOrders.length > 0 || associatedTasks.length > 0;

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      
      // Force delete by first deleting associated data
      if (hasAssociatedData) {
        // Note: In a real app, you might want to handle this more carefully
        // For now, we'll show a more detailed error
        toast({
          title: "Cannot Delete Contact",
          description: `This contact has ${associatedMeetings.length} meetings, ${associatedOrders.length} orders, and ${associatedTasks.length} tasks. Please delete or reassign these items first.`,
          variant: "destructive",
        });
        return;
      }
      
      const success = await deleteContact(contact.id);
      
      if (success) {
        toast({
          title: "Contact deleted",
          description: "The contact has been permanently deleted.",
        });
        setOpen(false);
        
        // If we're on the contact details page, navigate back to the contacts list
        if (window.location.pathname.includes(`/contacts/${contact.id}`)) {
          navigate('/contacts');
        }
        
        // If there's a custom onConfirm handler, call it
        if (onConfirm) {
          onConfirm();
        }
      } else {
        throw new Error("Failed to delete contact");
      }
    } catch (error) {
      console.error("Error deleting contact:", error);
      toast({
        title: "Error",
        description: "Failed to delete contact. Please check for associated data and try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50">
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Contact</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete {displayName}? This action cannot be undone.
            
            {hasAssociatedData && (
              <div className="mt-3 p-3 bg-red-50 rounded border border-red-200">
                <p className="font-medium text-red-800 mb-2">This contact has associated data:</p>
                <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
                  {associatedMeetings.length > 0 && (
                    <li>{associatedMeetings.length} meeting(s)</li>
                  )}
                  {associatedOrders.length > 0 && (
                    <li>{associatedOrders.length} order(s)</li>
                  )}
                  {associatedTasks.length > 0 && (
                    <li>{associatedTasks.length} task(s)</li>
                  )}
                </ul>
                <p className="text-red-800 font-medium mt-2">
                  Please delete or reassign these items first.
                </p>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            className="bg-red-500 hover:bg-red-600"
            disabled={isDeleting || hasAssociatedData}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
