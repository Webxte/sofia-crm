import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Order, OrderItem } from "@/types";
import { useAuth } from "@/context/AuthContext";

export const useOrderCRUD = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const createOrder = async (orderData: Omit<Order, "id" | "createdAt" | "updatedAt">) => {
    try {
      setLoading(true);
      
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Create the order
      const { data: orderResult, error: orderError } = await supabase
        .from("orders")
        .insert({
          contact_id: orderData.contactId,
          agent_id: orderData.agentId,
          agent_name: orderData.agentName,
          date: orderData.date,
          status: orderData.status,
          total: orderData.total,
          vat_total: orderData.vatTotal,
          notes: orderData.notes,
          terms_and_conditions: orderData.termsAndConditions,
          reference: orderData.reference,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (orderError) {
        console.error("Error creating order:", orderError);
        throw orderError;
      }

      console.log("Order created successfully:", orderResult);

      // Create order items
      if (orderData.items && orderData.items.length > 0) {
        const orderItems = orderData.items.map(item => ({
          order_id: orderResult.id,
          product_id: item.productId,
          code: item.code,
          description: item.description,
          price: item.price,
          quantity: item.quantity,
          vat: item.vat,
          subtotal: item.subtotal,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));

        const { error: itemsError } = await supabase
          .from("order_items")
          .insert(orderItems);

        if (itemsError) {
          console.error("Error creating order items:", itemsError);
          throw itemsError;
        }

        console.log("Order items created successfully");
      }

      // Transform the result to match our Order interface
      const transformedOrder: Order = {
        id: orderResult.id,
        contactId: orderResult.contact_id,
        agentId: orderResult.agent_id,
        agentName: orderResult.agent_name,
        date: orderResult.date,
        status: orderResult.status as Order["status"],
        items: orderData.items,
        total: orderResult.total,
        vatTotal: orderResult.vat_total,
        notes: orderResult.notes,
        termsAndConditions: orderResult.terms_and_conditions,
        reference: orderResult.reference,
        createdAt: new Date(orderResult.created_at),
        updatedAt: new Date(orderResult.updated_at),
      };

      toast.success("Success", {
        description: "Order created successfully",
      });

      return transformedOrder;
    } catch (error) {
      console.error("Error in createOrder:", error);
      toast.error("Error", {
        description: "Failed to create order",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateOrder = async (orderId: string, orderData: Partial<Order>) => {
    try {
      setLoading(true);

      // Update the order
      const { data: orderResult, error: orderError } = await supabase
        .from("orders")
        .update({
          contact_id: orderData.contactId,
          agent_id: orderData.agentId,
          agent_name: orderData.agentName,
          date: orderData.date,
          status: orderData.status,
          total: orderData.total,
          vat_total: orderData.vatTotal,
          notes: orderData.notes,
          terms_and_conditions: orderData.termsAndConditions,
          reference: orderData.reference,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)
        .select()
        .single();

      if (orderError) {
        console.error("Error updating order:", orderError);
        throw orderError;
      }

      console.log("Order updated successfully:", orderResult);

      // Update order items if provided
      if (orderData.items) {
        // Delete existing items
        await supabase
          .from("order_items")
          .delete()
          .eq("order_id", orderId);

        // Insert new items
        if (orderData.items.length > 0) {
          const orderItems = orderData.items.map(item => ({
            order_id: orderId,
            product_id: item.productId,
            code: item.code,
            description: item.description,
            price: item.price,
            quantity: item.quantity,
            vat: item.vat,
            subtotal: item.subtotal,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }));

          const { error: itemsError } = await supabase
            .from("order_items")
            .insert(orderItems);

          if (itemsError) {
            console.error("Error updating order items:", itemsError);
            throw itemsError;
          }
        }
      }

      // Transform the result to match our Order interface
      const transformedOrder: Order = {
        id: orderResult.id,
        contactId: orderResult.contact_id,
        agentId: orderResult.agent_id,
        agentName: orderResult.agent_name,
        date: orderResult.date,
        status: orderResult.status as Order["status"],
        items: orderData.items || [],
        total: orderResult.total,
        vatTotal: orderResult.vat_total,
        notes: orderResult.notes,
        termsAndConditions: orderResult.terms_and_conditions,
        reference: orderResult.reference,
        createdAt: new Date(orderResult.created_at),
        updatedAt: new Date(orderResult.updated_at),
      };

      toast.success("Success", {
        description: "Order updated successfully",
      });

      return transformedOrder;
    } catch (error) {
      console.error("Error in updateOrder:", error);
      toast.error("Error", {
        description: "Failed to update order",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteOrder = async (orderId: string) => {
    try {
      setLoading(true);

      // Delete order items first (due to foreign key constraint)
      const { error: itemsError } = await supabase
        .from("order_items")
        .delete()
        .eq("order_id", orderId);

      if (itemsError) {
        console.error("Error deleting order items:", itemsError);
        throw itemsError;
      }

      // Delete the order
      const { error: orderError } = await supabase
        .from("orders")
        .delete()
        .eq("id", orderId);

      if (orderError) {
        console.error("Error deleting order:", orderError);
        throw orderError;
      }

      toast.success("Success", {
        description: "Order deleted successfully",
      });

      return true;
    } catch (error) {
      console.error("Error in deleteOrder:", error);
      toast.error("Error", {
        description: "Failed to delete order",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    createOrder,
    updateOrder,
    deleteOrder,
    loading,
  };
};
