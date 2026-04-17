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
import { Trash2, AlertTriangle } from "lucide-react";
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
  contactName,
}: ContactDeleteDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { deleteContact } = useContacts();
  const { meetings } = useMeetings();
  const { orders } = useOrders();
  const { tasks } = useTasks();
  const navigate = useNavigate();

  const open = controlledOpen !== undefined ? controlledOpen : isOpen;
  const setOpen = setControlledOpen || setIsOpen;

  const relatedMeetings = meetings.filter(m => m.contactId === contact.id).length;
  const relatedOrders   = orders.filter(o => o.contactId === contact.id).length;
  const relatedTasks    = tasks.filter(t => t.contactId === contact.id).length;
  const hasRelated = relatedMeetings > 0 || relatedOrders > 0 || relatedTasks > 0;

  const displayName = contactName || contact.fullName || contact.company || contact.id;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const success = await deleteContact(contact.id);
      if (success) {
        toast.success("Contact deleted", {
          description: `${displayName} has been deleted.`,
        });
        onConfirm?.();
        setOpen(false);
        if (window.location.pathname.includes(`/contacts/${contact.id}`)) {
          navigate("/contacts");
        }
      } else {
        toast.error("Deletion failed", {
          description: "Could not delete the contact. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error deleting contact:", error);
      toast.error("Deletion failed", {
        description: "An error occurred while deleting the contact.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const relatedSummary = [
    relatedOrders   > 0 && `${relatedOrders} order${relatedOrders   !== 1 ? "s" : ""}`,
    relatedMeetings > 0 && `${relatedMeetings} meeting${relatedMeetings !== 1 ? "s" : ""}`,
    relatedTasks    > 0 && `${relatedTasks} task${relatedTasks    !== 1 ? "s" : ""}`,
  ].filter(Boolean).join(", ");

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
          <AlertDialogTitle>Delete {displayName}?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>This will permanently delete the contact. This cannot be undone.</p>
              {hasRelated && (
                <div className="flex gap-2 p-3 rounded-md border border-amber-200 bg-amber-50">
                  <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                  <div className="text-sm text-amber-800">
                    <p className="font-semibold">This contact has linked records:</p>
                    <p className="mt-0.5">{relatedSummary}</p>
                    <p className="mt-1">These records will be kept but will show as <strong>"Deleted contact"</strong>.</p>
                  </div>
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Deleting…" : hasRelated ? "Delete anyway" : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
