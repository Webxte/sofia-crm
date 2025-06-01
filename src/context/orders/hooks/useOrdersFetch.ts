
import { useState, useCallback } from "react";
import { Order, OrderItem } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useOrganizations } from "@/context/organizations/OrganizationsContext";
import { useProducts } from "@/context/products/ProductsContext";

export const useOrdersFetch = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { currentOrganization } = useOrganizations();
  const { getProductById } = useProducts();

  const fetchOrders = useCallback(async () => {
    if (!currentOrganization) {
      console.log("useOrdersFetch: No current organization, skipping orders fetch");
      return;
    }

    try {
      setLoading(true);
      console.log("useOrdersFetch: Fetching orders for organization:", currentOrganization.id, currentOrganization.name);
      
      // First get all orders for the organization
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .order('created_at', { ascending: false });
      
      if (ordersError) {
        console.error('useOrdersFetch: Error fetching orders:', ordersError);
        throw ordersError;
      }

      console.log("useOrdersFetch: Raw orders data from Supabase:", ordersData);
      
      // Then get all order items
      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select('*');
      
      if (itemsError) {
        console.error('useOrdersFetch: Error fetching order items:', itemsError);
        throw itemsError;
      }
      
      // Map items to their respective orders
      const formattedOrders = ordersData.map(order => {
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
      
      console.log(`useOrdersFetch: Formatted ${formattedOrders.length} orders for organization ${currentOrganization.name}`);
      setOrders(formattedOrders);
    } catch (err) {
      console.error('useOrdersFetch: Unexpected error fetching orders:', err);
      toast({
        title: "Error",
        description: "Failed to load orders. Please check your connection and try again.",
        variant: "destructive",
      });
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [currentOrganization, getProductById, toast]);

  return {
    orders,
    setOrders,
    loading,
    fetchOrders
  };
};
