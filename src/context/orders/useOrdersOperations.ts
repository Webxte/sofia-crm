
import { useState } from "react";
import { Order, OrderItem, Product } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useProducts } from "@/context/products/ProductsContext";
import { generateOrderReference, sendOrderEmail } from "./orderUtils";
import { format } from "date-fns";

export const useOrdersOperations = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { getProductById } = useProducts();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Function to fetch orders from Supabase
  const refreshOrders = async () => {
    try {
      setLoading(true);
      
      if (!isAuthenticated) {
        setOrders([]);
        return;
      }
      
      // First get all orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (ordersError) {
        console.error('Error fetching orders:', ordersError);
        toast({
          title: "Error",
          description: "Failed to load orders",
          variant: "destructive",
        });
        return;
      }
      
      // Then get all order items
      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select('*');
      
      if (itemsError) {
        console.error('Error fetching order items:', itemsError);
        toast({
          title: "Error",
          description: "Failed to load order items",
          variant: "destructive",
        });
        return;
      }
      
      // Map items to their respective orders
      const formattedOrders: Order[] = ordersData.map(order => {
        // Find all items for this order
        const orderItems = itemsData
          .filter(item => item.order_id === order.id)
          .map(item => {
            // Get the corresponding product
            const product = getProductById(item.product_id) || {
              id: item.product_id,
              code: item.code,
              description: item.description,
              price: item.price,
              cost: item.price * 0.7, // Estimate cost if not available
              createdAt: new Date(),
              updatedAt: new Date()
            };
            
            return {
              id: item.id,
              productId: item.product_id,
              code: item.code,
              description: item.description,
              price: item.price,
              quantity: item.quantity,
              vat: item.vat,
              subtotal: item.subtotal,
              product
            } as OrderItem;
          });
        
        return {
          id: order.id,
          contactId: order.contact_id,
          agentId: order.agent_id,
          agentName: order.agent_name,
          date: new Date(order.date),
          status: order.status as "draft" | "confirmed" | "shipped" | "delivered" | "paid" | "cancelled",
          items: orderItems,
          total: order.total,
          vatTotal: order.vat_total,
          notes: order.notes,
          termsAndConditions: order.terms_and_conditions,
          reference: order.reference,
          createdAt: new Date(order.created_at),
          updatedAt: new Date(order.updated_at),
        };
      });
      
      setOrders(formattedOrders);
    } catch (err) {
      console.error('Unexpected error fetching orders:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred while loading orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createOrderItem = (productId: string, quantity: number): OrderItem | undefined => {
    const product = getProductById(productId);
    
    if (!product) return undefined;
    
    return {
      id: Math.random().toString(36).substring(2, 9),
      productId: product.id,
      code: product.code,
      description: product.description,
      price: product.price,
      quantity,
      vat: product.vat || 0,
      subtotal: product.price * quantity,
      product,
    };
  };

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
      
      // Begin transaction
      // Add agent information
      const agentData = {
        agent_id: user.id,
        agent_name: user.name || ''
      };
      
      // Generate a reference if not provided
      const reference = orderData.reference || generateOrderReference(orders, user.email, user.id);
      
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

  return {
    orders,
    loading,
    refreshOrders,
    addOrder,
    updateOrder,
    deleteOrder,
    createOrderItem,
    sendOrderEmail
  };
};
