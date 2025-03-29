
import { Order } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { generateOrderReference } from "../orderUtils";
import { format } from "date-fns";

export const useOrderCreate = (refreshOrders: () => Promise<void>) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const addOrder = async (orderData: Omit<Order, "id" | "createdAt" | "updatedAt">) => {
    try {
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to add orders",
          variant: "destructive",
        });
        return;
      }
      
      // Add agent information
      const agentData = {
        agent_id: user.id,
        agent_name: user.name || ''
      };
      
      // Generate a reference if not provided
      const reference = orderData.reference || generateOrderReference([], user.email, user.id);
      
      // Convert Order type to Supabase table format (snake_case)
      const newOrderData = {
        contact_id: orderData.contactId,
        date: format(orderData.date, 'yyyy-MM-dd'), // Format date as string for Supabase
        status: orderData.status,
        total: orderData.total,
        vat_total: orderData.vatTotal,
        notes: orderData.notes,
        terms_and_conditions: orderData.termsAndConditions,
        reference,
        ...agentData
      };
      
      // Insert the order
      const { data: orderResult, error: orderError } = await supabase
        .from('orders')
        .insert(newOrderData)
        .select('*')
        .single();
      
      if (orderError) {
        console.error('Error adding order:', orderError);
        toast({
          title: "Error",
          description: "Failed to add order",
          variant: "destructive",
        });
        return;
      }
      
      // Insert all order items
      const orderItems = orderData.items;
      const orderItemsData = orderItems.map(item => ({
        order_id: orderResult.id,
        product_id: item.productId,
        code: item.code,
        description: item.description,
        price: item.price,
        quantity: item.quantity,
        vat: item.vat,
        subtotal: item.subtotal
      }));
      
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsData);
      
      if (itemsError) {
        console.error('Error adding order items:', itemsError);
        // Attempt to delete the order if items insertion fails
        await supabase.from('orders').delete().eq('id', orderResult.id);
        toast({
          title: "Error",
          description: "Failed to add order items",
          variant: "destructive",
        });
        return;
      }
      
      // Refresh orders to get the complete data including items
      await refreshOrders();
      
      toast({
        title: "Success",
        description: "Order added successfully",
      });
    } catch (err) {
      console.error('Unexpected error adding order:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  return { addOrder };
};
