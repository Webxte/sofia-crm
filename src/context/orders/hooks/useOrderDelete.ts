
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useOrderDelete = (setOrders: React.Dispatch<React.SetStateAction<any[]>>) => {
  const { toast } = useToast();

  const deleteOrder = async (id: string) => {
    try {
      // First delete all order items (should cascade automatically, but being explicit)
      const { error: itemsError } = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', id);
      
      if (itemsError) {
        console.error('Error deleting order items:', itemsError);
        toast({
          title: "Error",
          description: "Failed to delete order items",
          variant: "destructive",
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
        toast({
          title: "Error",
          description: "Failed to delete order",
          variant: "destructive",
        });
        return;
      }
      
      // Remove the order from state
      setOrders(prevOrders => prevOrders.filter(order => order.id !== id));
      
      toast({
        title: "Success",
        description: "Order deleted successfully",
      });
    } catch (err) {
      console.error('Unexpected error deleting order:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  return { deleteOrder };
};
