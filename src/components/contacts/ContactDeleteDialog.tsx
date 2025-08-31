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
import { useContacts } from "@/context/contacts/ContactsContext";
import { useMeetings } from "@/context/meetings";
import { useOrders } from "@/context/orders/OrdersContext";
import { useTasks } from "@/context/tasks";
import { toast } from "sonner";
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
  const navigate = useNavigate();

  // Use either controlled or uncontrolled state
  const open = controlledOpen !== undefined ? controlledOpen : isOpen;
  const setOpen = setControlledOpen || setIsOpen;

  const associatedMeetings = meetings.filter(m => m.contactId === contact.id).length;
  const associatedOrders = orders.filter(o => o.contactId === contact.id).length;
  const associatedTasks = tasks.filter(t => t.contactId === contact.id).length;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const success = await deleteContact(contact.id);
      if (success) {
        toast.success("Contact Deleted", {
          description: `Contact ${contactName || contact.fullName || contact.id} has been deleted.`,
        });
        if (onConfirm) {
          onConfirm();
        }
        setOpen(false);
        if (window.location.pathname.includes(`/contacts/${contact.id}`)) {
            navigate("/contacts");
        }
      } else {
        toast.error("Deletion Failed", {
          description: "Could not delete the contact. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error deleting contact:", error);
      toast.error("Deletion Failed", {
        description: "An error occurred while deleting the contact.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the contact
            <span className="font-semibold"> {contactName || contact.fullName || contact.id}</span>.
            { (associatedMeetings > 0 || associatedOrders > 0 || associatedTasks > 0) &&
              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md text-sm">
                <p className="font-bold text-yellow-800">This contact has associated data:</p>
                <ul className="list-disc list-inside text-yellow-700">
                  {associatedMeetings > 0 && <li>{associatedMeetings} meeting(s)</li>}
                  {associatedOrders > 0 && <li>{associatedOrders} order(s)</li>}
                  {associatedTasks > 0 && <li>{associatedTasks} task(s)</li>}
                </ul>
                <p className="mt-1 text-yellow-800">Deleting the contact might cause issues if this data is not handled properly.</p>
              </div>
            }
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Continue'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
