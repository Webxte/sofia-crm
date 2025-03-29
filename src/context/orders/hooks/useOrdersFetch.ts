
import { useState } from "react";
import { Order, OrderItem } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useProducts } from "@/context/products/ProductsContext";

export const useOrdersFetch = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { getProductById } = useProducts();
  const { toast } = useToast();

  const refreshOrders = async () => {
    try {
      setLoading(true);
      
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

  return {
    orders,
    setOrders,
    loading,
    refreshOrders
  };
};
