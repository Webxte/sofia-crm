import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { useOrders } from "@/context/orders/OrdersContext";
import { toast } from "sonner";

interface OrderDeleteDialogProps {
  orderId: string;
  reference?: string;
  size?: "default" | "sm" | "lg" | "icon";
}

export const OrderDeleteDialog = ({ orderId, reference, size }: OrderDeleteDialogProps) => {
  const [open, setOpen] = useState(false);
  const { deleteOrder } = useOrders();
  const navigate = useNavigate();
  
  const handleDelete = () => {
    deleteOrder(orderId);
    setOpen(false);
    
    toast.success("Order Deleted", {
      description: `Order ${reference || orderId.slice(0, 8)} has been deleted.`,
    });
    
    // Navigate back to orders list if we're on the order details page
    if (window.location.pathname.includes(`/orders/${orderId}`)) {
      navigate("/orders");
    }
  };
  
  return (
    <>
      <Button
        variant="outline"
        size={size || (size === "icon" ? "icon" : "default")}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        className={`${size === "sm" ? "h-7 w-7" : ""} text-destructive hover:bg-destructive hover:text-destructive-foreground`}
      >
        <Trash className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} />
      </Button>
      
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete order {reference || `#${orderId.slice(0, 8)}`}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
