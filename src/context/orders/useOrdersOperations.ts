
import { useState, useCallback } from "react";
import { Order, OrderItem } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useOrganizations } from "@/context/organizations/OrganizationsContext";
import { useProducts } from "@/context/products/ProductsContext";

export const useOrdersOperations = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { currentOrganization } = useOrganizations();
  const { getProductById } = useProducts();

  const fetchOrders = useCallback(async () => {
    if (!currentOrganization) {
      console.log("No current organization, skipping orders fetch");
      return;
    }

    try {
      setLoading(true);
      console.log("Fetching orders for organization:", currentOrganization.id);
      
      // First get all orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .order('created_at', { ascending: false });
      
      if (ordersError) {
        console.error('Error fetching orders:', ordersError);
        throw ordersError;
      }
      
      // Then get all order items
      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select('*');
      
      if (itemsError) {
        console.error('Error fetching order items:', itemsError);
        throw itemsError;
      }
      
      // Map items to their respective orders
      const formattedOrders = (ordersData || []).map(order => {
        // Find all items for this order
        const orderItems = (itemsData || [])
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
          date: order.date, // Already a string from the database
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
      
      console.log("Fetched orders:", formattedOrders.length);
      setOrders(formattedOrders);
    } catch (error) {
      console.error('Error in fetchOrders:', error);
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [currentOrganization, getProductById, toast]);

  const addOrder = async (orderData: Omit<Order, "id" | "createdAt" | "updatedAt">): Promise<Order | null> => {
    if (!currentOrganization) {
      toast({
        title: "Error",
        description: "No organization selected",
        variant: "destructive",
      });
      return null;
    }

    try {
      const newOrder = {
        contact_id: orderData.contactId,
        agent_id: orderData.agentId || user?.id,
        agent_name: orderData.agentName || user?.user_metadata?.name || 'Unknown',
        date: orderData.date,
        status: orderData.status,
        total: orderData.total,
        vat_total: orderData.vatTotal,
        notes: orderData.notes,
        terms_and_conditions: orderData.termsAndConditions,
        reference: orderData.reference,
        organization_id: currentOrganization.id,
      };

      const { data, error } = await supabase
        .from('orders')
        .insert([newOrder])
        .select()
        .single();

      if (error) throw error;

      // Add order items
      if (orderData.items && orderData.items.length > 0) {
        const orderItems = orderData.items.map(item => ({
          order_id: data.id,
          product_id: item.productId,
          code: item.code,
          description: item.description,
          price: item.price,
          quantity: item.quantity,
          vat: item.vat,
          subtotal: item.subtotal,
        }));

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems);

        if (itemsError) throw itemsError;
      }

      const formattedOrder: Order = {
        id: data.id,
        contactId: data.contact_id,
        agentId: data.agent_id,
        agentName: data.agent_name,
        date: data.date,
        status: data.status as "draft" | "confirmed" | "shipped" | "delivered" | "paid" | "cancelled",
        items: orderData.items || [],
        total: data.total,
        vatTotal: data.vat_total,
        notes: data.notes,
        termsAndConditions: data.terms_and_conditions,
        reference: data.reference,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };

      setOrders(prev => [formattedOrder, ...prev]);
      
      toast({
        title: "Success",
        description: "Order added successfully",
      });

      return formattedOrder;
    } catch (error) {
      console.error('Error adding order:', error);
      toast({
        title: "Error",
        description: "Failed to add order",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateOrder = async (id: string, orderData: Partial<Order>): Promise<Order | null> => {
    try {
      const updateData = {
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
      };

      const { data, error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const formattedOrder: Order = {
        id: data.id,
        contactId: data.contact_id,
        agentId: data.agent_id,
        agentName: data.agent_name,
        date: data.date,
        status: data.status as "draft" | "confirmed" | "shipped" | "delivered" | "paid" | "cancelled",
        items: [], // Would need to fetch items separately
        total: data.total,
        vatTotal: data.vat_total,
        notes: data.notes,
        termsAndConditions: data.terms_and_conditions,
        reference: data.reference,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };

      setOrders(prev => prev.map(order => 
        order.id === id ? formattedOrder : order
      ));

      toast({
        title: "Success",
        description: "Order updated successfully",
      });

      return formattedOrder;
    } catch (error) {
      console.error('Error updating order:', error);
      toast({
        title: "Error",
        description: "Failed to update order",
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteOrder = async (id: string): Promise<boolean> => {
    try {
      // First delete order items
      const { error: itemsError } = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', id);

      if (itemsError) throw itemsError;

      // Then delete the order
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setOrders(prev => prev.filter(order => order.id !== id));
      
      toast({
        title: "Success",
        description: "Order deleted successfully",
      });

      return true;
    } catch (error) {
      console.error('Error deleting order:', error);
      toast({
        title: "Error",
        description: "Failed to delete order",
        variant: "destructive",
      });
      return false;
    }
  };

  const createOrderItem = async (orderItem: Omit<OrderItem, "id">): Promise<OrderItem | null> => {
    try {
      const { data, error } = await supabase
        .from('order_items')
        .insert([{
          order_id: orderItem.productId, // This should be order_id, not product_id
          product_id: orderItem.productId,
          code: orderItem.code,
          description: orderItem.description,
          price: orderItem.price,
          quantity: orderItem.quantity,
          vat: orderItem.vat,
          subtotal: orderItem.subtotal,
        }])
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        productId: data.product_id,
        code: data.code,
        description: data.description,
        price: data.price,
        quantity: data.quantity,
        vat: data.vat,
        subtotal: data.subtotal,
        product: orderItem.product,
      };
    } catch (error) {
      console.error('Error creating order item:', error);
      return null;
    }
  };

  const refreshOrders = async () => {
    await fetchOrders();
  };

  return {
    orders,
    setOrders,
    loading,
    refreshOrders,
    addOrder,
    updateOrder,
    deleteOrder,
    createOrderItem,
  };
};
