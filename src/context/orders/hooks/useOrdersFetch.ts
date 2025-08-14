import { useState, useCallback, useEffect } from "react";
import { Order, OrderItem } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/utils/toast";
import { useAuth } from "@/context/AuthContext";
import { useProducts } from "@/context/products/ProductsContext";

export const useOrdersFetch = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const { getProductById } = useProducts();

  const fetchOrders = useCallback(async () => {
    if (!isAuthenticated || !user) {
      console.log("useOrdersFetch: User not authenticated, clearing orders");
      setOrders([]);
      return;
    }

    try {
      setLoading(true);
      console.log("useOrdersFetch: Fetching orders for user:", user.id);
      
      // Simple query - let RLS handle the filtering automatically
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (ordersError) {
        console.error('useOrdersFetch: Error fetching orders:', ordersError);
        throw ordersError;
      }

      console.log("useOrdersFetch: Raw orders data from Supabase:", ordersData?.length || 0);
      
      // Get all order items
      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select('*');
      
      if (itemsError) {
        console.error('useOrdersFetch: Error fetching order items:', itemsError);
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
          date: order.date,
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
      
      console.log(`useOrdersFetch: Formatted ${formattedOrders.length} orders for user ${user.id}`);
      setOrders(formattedOrders);
    } catch (err) {
      console.error('useOrdersFetch: Unexpected error fetching orders:', err);
      toast.error("Error", {
        description: "Failed to load orders. Please check your connection and try again.",
      });
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user, getProductById]);

  // Auto-fetch when authentication state changes
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log("useOrdersFetch: Auth state changed, fetching orders");
      fetchOrders();
    }
  }, [isAuthenticated, user, fetchOrders]);

  return {
    orders,
    setOrders,
    loading,
    fetchOrders
  };
};
