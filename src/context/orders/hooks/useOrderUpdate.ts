
import { Order } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export const useOrderUpdate = (refreshOrders: () => Promise<void>) => {
  const { toast } = useToast();

  const updateOrder = async (id: string, orderData: Partial<Order>) => {
    try {
      // Convert Order type to Supabase table format (snake_case)
      const updateData: any = {};
      
      if (orderData.contactId !== undefined) updateData.contact_id = orderData.contactId;
      if (orderData.date !== undefined) updateData.date = format(orderData.date, 'yyyy-MM-dd'); // Format date
      if (orderData.status !== undefined) updateData.status = orderData.status;
      if (orderData.total !== undefined) updateData.total = orderData.total;
      if (orderData.vatTotal !== undefined) updateData.vat_total = orderData.vatTotal;
      if (orderData.notes !== undefined) updateData.notes = orderData.notes;
      if (orderData.termsAndConditions !== undefined) updateData.terms_and_conditions = orderData.termsAndConditions;
      if (orderData.reference !== undefined) updateData.reference = orderData.reference;
      
      // Add updated_at
      updateData.updated_at = new Date().toISOString();
      
      // Update the order
      const { error: orderError } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', id);
      
      if (orderError) {
        console.error('Error updating order:', orderError);
        toast({
          title: "Error",
          description: "Failed to update order",
          variant: "destructive",
        });
        return;
      }
      
      // If we have new items, handle them
      if (orderData.items) {
        // First delete all existing items
        const { error: deleteError } = await supabase
          .from('order_items')
          .delete()
          .eq('order_id', id);
        
        if (deleteError) {
          console.error('Error deleting order items:', deleteError);
          toast({
            title: "Error",
            description: "Failed to update order items",
            variant: "destructive",
          });
          return;
        }
        
        // Then insert the new items
        const orderItemsData = orderData.items.map(item => ({
          order_id: id,
          product_id: item.productId,
          code: item.code,
          description: item.description,
          price: item.price,
          quantity: item.quantity,
          vat: item.vat,
          subtotal: item.subtotal
        }));
        
        const { error: insertError } = await supabase
          .from('order_items')
          .insert(orderItemsData);
        
        if (insertError) {
          console.error('Error inserting new order items:', insertError);
          toast({
            title: "Error",
            description: "Failed to update order items",
            variant: "destructive",
          });
          return;
        }
      }
      
      // Refresh orders to get updated data
      await refreshOrders();
      
      toast({
        title: "Success",
        description: "Order updated successfully",
      });
    } catch (err) {
      console.error('Unexpected error updating order:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  return { updateOrder };
};
