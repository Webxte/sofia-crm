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
      
      // Join with contacts to always have company/name info
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*, contacts(full_name, company)')
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
      
      // Find orders where the join returned null (contacts hidden by RLS)
      const missingContactIds = [...new Set(
        (ordersData || [])
          .filter(order => !(order as any).contacts)
          .map(order => order.contact_id)
      )];
      
      // Fetch missing contact info using SECURITY DEFINER function
      const missingContactMap: Record<string, { company: string | null; full_name: string | null }> = {};
      if (missingContactIds.length > 0) {
        const results = await Promise.all(
          missingContactIds.map(id =>
            supabase.rpc('get_order_contact_info', { p_contact_id: id }).then(res => ({ id, data: res.data }))
          )
        );
        results.forEach(({ id, data }) => {
          if (data && data.length > 0) {
            missingContactMap[id] = data[0];
          }
        });
      }

      // Map items to their respective orders
      const formattedOrders = (ordersData || []).map(order => {
        const orderItems = (itemsData || [])
          .filter(item => item.order_id === order.id)
          .map(item => {
            const product = getProductById(item.product_id) || {
              id: item.product_id,
              code: item.code,
              description: item.description,
              price: item.price,
              cost: item.price * 0.7,
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
        
        // Use joined contact data, falling back to RPC results for RLS-blocked contacts
        const contactData = (order as any).contacts || missingContactMap[order.contact_id];
        const contactCompany = contactData?.company || null;
        const contactFullName = contactData?.full_name || null;
        
        return {
          id: order.id,
          contactId: order.contact_id,
          contactCompany,
          contactFullName,
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
          paymentDate: (order as any).payment_date ?? null,
          paymentMethod: (order as any).payment_method ?? null,
          invoiceNumber: (order as any).invoice_number ?? null,
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
  }, [isAuthenticated, user]); // Removed getProductById from dependencies to prevent infinite loop

  useEffect(() => {
    if (isAuthenticated && user) fetchOrders();
  }, [isAuthenticated, user, fetchOrders]);

  // Orders have nested order_items, so refetch on any change rather than patch in place
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    const channel = supabase
      .channel('orders-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => { fetchOrders(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'order_items' }, () => { fetchOrders(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [isAuthenticated, user?.id, fetchOrders]);

  return {
    orders,
    setOrders,
    loading,
    fetchOrders
  };
};
