
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
import { useToast } from "@/hooks/use-toast";
import { Contact } from "@/types";

interface ContactDeleteDialogProps {
  contact: Contact;
}

export const ContactDeleteDialog = ({ contact }: ContactDeleteDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { deleteContact } = useContacts();
  const { toast } = useToast();

  const displayName = contact.company ? 
    `${contact.company}${contact.fullName ? ` (${contact.fullName})` : ''}` : 
    (contact.fullName || "Unnamed Contact");

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const success = await deleteContact(contact.id);
      
      if (success) {
        toast({
          title: "Contact deleted",
          description: "The contact has been permanently deleted.",
        });
        setIsOpen(false);
      } else {
        throw new Error("Failed to delete contact");
      }
    } catch (error) {
      console.error("Error deleting contact:", error);
      toast({
        title: "Error",
        description: "Failed to delete contact. This may be because you don't have permission to delete contacts created by other agents.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
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
            All associated meetings, tasks, and orders will remain but will no longer be linked to this contact.
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
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
