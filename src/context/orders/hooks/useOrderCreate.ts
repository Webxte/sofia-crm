import { Order } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { generateOrderReference } from "../utils/orderReferenceUtils";
import { format } from "date-fns";

export const useOrderCreate = (refreshOrders: () => Promise<void>) => {
  const { user } = useAuth();

  const addOrder = async (orderData: Omit<Order, "id" | "createdAt" | "updatedAt">): Promise<string | undefined> => {
    try {
      if (!user) {
        toast.error("Error", {
          description: "You must be logged in to add orders",
        });
        return;
      }
      
      // Add agent information
      const agentData = {
        agent_id: user.id,
        agent_name: user.name || ''
      };
      
      // Generate a fallback reference only if not provided by the form
      const reference = orderData.reference || `ORD-${Date.now().toString().slice(-6)}`;
      
      console.log("useOrderCreate: Creating order with reference:", reference, "User email:", user.email);
      
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
      
      console.log("useOrderCreate: Inserting order data:", newOrderData);
      
      // Insert the order
      const { data: orderResult, error: orderError } = await supabase
        .from('orders')
        .insert(newOrderData)
        .select('*')
        .single();
      
      if (orderError) {
        console.error('Error adding order:', orderError);
        toast.error("Failed to save order", {
          description: orderError.message || "Database error — please try again",
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
        const { error: deleteError } = await supabase.from('orders').delete().eq('id', orderResult.id);
        if (deleteError) {
          console.error('Error rolling back order after items failure:', deleteError);
        }
        toast.error("Failed to save order items", {
          description: itemsError.message || "Database error — please try again",
        });
        return;
      }
      
      // Refresh orders to get the complete data including items
      await refreshOrders();

      toast.success("Success", {
        description: "Order added successfully",
      });

      return orderResult.id as string;
    } catch (err) {
      console.error('Unexpected error adding order:', err);
      toast.error("Error", {
        description: "An unexpected error occurred",
      });
    }
  };

  return { addOrder };
};
