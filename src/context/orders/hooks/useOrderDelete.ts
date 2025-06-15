
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useOrderDelete = (setOrders: React.Dispatch<React.SetStateAction<any[]>>) => {
  const deleteOrder = async (id: string) => {
    try {
      // First delete all order items (should cascade automatically, but being explicit)
      const { error: itemsError } = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', id);
      
      if (itemsError) {
        console.error('Error deleting order items:', itemsError);
        toast.error("Error", {
          description: "Failed to delete order items",
        });
        return;
      }
      
      // Then delete the order
      const { error: orderError } = await supabase
        .from('orders')
        .delete()
        .eq('id', id);
      
      if (orderError) {
        console.error('Error deleting order:', orderError);
        toast.error("Error", {
          description: "Failed to delete order",
        });
        return;
      }
      
      // Remove the order from state
      setOrders(prevOrders => prevOrders.filter(order => order.id !== id));
      
      toast.success("Success", {
        description: "Order deleted successfully",
      });
    } catch (err) {
      console.error('Unexpected error deleting order:', err);
      toast.error("Error", {
        description: "An unexpected error occurred",
      });
    }
  };

  return { deleteOrder };
};
