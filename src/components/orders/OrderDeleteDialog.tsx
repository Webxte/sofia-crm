
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
import { useOrders } from "@/context/OrdersContext";
import { useToast } from "@/hooks/use-toast";

interface OrderDeleteDialogProps {
  orderId: string;
  reference?: string;
  trigger?: React.ReactNode;
}

export const OrderDeleteDialog = ({ orderId, reference, trigger }: OrderDeleteDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { deleteOrder } = useOrders();
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteOrder(orderId);
      toast({
        title: "Order deleted",
        description: "The order has been permanently deleted.",
      });
      setIsOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50">
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Order</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete order {reference || `#${orderId.slice(0, 6)}`}? This action cannot be undone.
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
