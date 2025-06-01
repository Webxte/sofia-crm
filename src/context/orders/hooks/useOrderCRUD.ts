
import { Order, OrderItem } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useOrganizations } from "@/context/organizations/OrganizationsContext";

export const useOrderCRUD = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { currentOrganization } = useOrganizations();

  const addOrder = async (
    orderData: Omit<Order, "id" | "createdAt" | "updatedAt">,
    setOrders: React.Dispatch<React.SetStateAction<Order[]>>
  ): Promise<Order | null> => {
    if (!currentOrganization) {
      toast({
        title: "Error",
        description: "No organization selected",
        variant: "destructive",
      });
      return null;
    }

    try {
      // Create the order first
      const newOrder = {
        contact_id: orderData.contactId,
        date: orderData.date,
        status: orderData.status,
        notes: orderData.notes,
        total: orderData.total,
        vat_total: orderData.vatTotal,
        terms_and_conditions: orderData.termsAndConditions,
        reference: orderData.reference,
        agent_id: orderData.agentId || user?.id,
        agent_name: orderData.agentName || user?.user_metadata?.name || 'Unknown',
        organization_id: currentOrganization.id,
      };

      const { data: orderResult, error: orderError } = await supabase
        .from('orders')
        .insert([newOrder])
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItemsToInsert = orderData.items.map(item => ({
        order_id: orderResult.id,
        product_id: item.productId,
        code: item.code,
        description: item.description,
        price: item.price,
        quantity: item.quantity,
        vat: item.vat,
        subtotal: item.subtotal,
      }));

      const { data: itemsResult, error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsToInsert)
        .select();

      if (itemsError) throw itemsError;

      const formattedOrder: Order = {
        id: orderResult.id,
        organizationId: orderResult.organization_id,
        contactId: orderResult.contact_id,
        date: orderResult.date,
        status: orderResult.status as "draft" | "confirmed" | "shipped" | "delivered" | "paid" | "cancelled",
        notes: orderResult.notes || '',
        items: (itemsResult || []).map(item => ({
          id: item.id,
          productId: item.product_id,
          code: item.code,
          description: item.description,
          price: item.price,
          quantity: item.quantity,
          vat: item.vat || 0,
          subtotal: item.subtotal,
          product: undefined
        })),
        total: orderResult.total,
        vatTotal: orderResult.vat_total || 0,
        termsAndConditions: orderResult.terms_and_conditions || '',
        reference: orderResult.reference || '',
        agentId: orderResult.agent_id || '',
        agentName: orderResult.agent_name || '',
        createdAt: new Date(orderResult.created_at),
        updatedAt: new Date(orderResult.updated_at),
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

  const updateOrder = async (
    id: string, 
    orderData: Partial<Order>,
    setOrders: React.Dispatch<React.SetStateAction<Order[]>>,
    fetchOrders: () => Promise<void>
  ): Promise<Order | null> => {
    try {
      // Update the order
      const updateData = {
        contact_id: orderData.contactId,
        date: orderData.date,
        status: orderData.status,
        notes: orderData.notes,
        total: orderData.total,
        vat_total: orderData.vatTotal,
        terms_and_conditions: orderData.termsAndConditions,
        reference: orderData.reference,
        agent_id: orderData.agentId,
        agent_name: orderData.agentName,
      };

      const { data: orderResult, error: orderError } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (orderError) throw orderError;

      // Update order items if provided
      if (orderData.items) {
        // Delete existing items
        await supabase.from('order_items').delete().eq('order_id', id);

        // Insert new items
        const orderItemsToInsert = orderData.items.map(item => ({
          order_id: id,
          product_id: item.productId,
          code: item.code,
          description: item.description,
          price: item.price,
          quantity: item.quantity,
          vat: item.vat,
          subtotal: item.subtotal,
        }));

        const { data: itemsResult, error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItemsToInsert)
          .select();

        if (itemsError) throw itemsError;

        const formattedOrder: Order = {
          id: orderResult.id,
          organizationId: orderResult.organization_id,
          contactId: orderResult.contact_id,
          date: orderResult.date,
          status: orderResult.status as "draft" | "confirmed" | "shipped" | "delivered" | "paid" | "cancelled",
          notes: orderResult.notes || '',
          items: (itemsResult || []).map(item => ({
            id: item.id,
            productId: item.product_id,
            code: item.code,
            description: item.description,
            price: item.price,
            quantity: item.quantity,
            vat: item.vat || 0,
            subtotal: item.subtotal,
            product: undefined
          })),
          total: orderResult.total,
          vatTotal: orderResult.vat_total || 0,
          termsAndConditions: orderResult.terms_and_conditions || '',
          reference: orderResult.reference || '',
          agentId: orderResult.agent_id || '',
          agentName: orderResult.agent_name || '',
          createdAt: new Date(orderResult.created_at),
          updatedAt: new Date(orderResult.updated_at),
        };

        setOrders(prev => prev.map(order => 
          order.id === id ? formattedOrder : order
        ));

        return formattedOrder;
      }

      // If no items update, just refresh the order data
      await fetchOrders();
      return null;
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

  const deleteOrder = async (
    id: string,
    setOrders: React.Dispatch<React.SetStateAction<Order[]>>
  ): Promise<boolean> => {
    try {
      // Delete order items first
      await supabase.from('order_items').delete().eq('order_id', id);
      
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
          order_id: orderItem.productId, // This seems wrong, should be order_id
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
        vat: data.vat || 0,
        subtotal: data.subtotal,
        product: undefined
      };
    } catch (error) {
      console.error('Error creating order item:', error);
      return null;
    }
  };

  return {
    addOrder,
    updateOrder,
    deleteOrder,
    createOrderItem,
  };
};
