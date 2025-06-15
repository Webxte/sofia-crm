import { useState } from "react";
import { useOrders } from "@/context/OrdersContext";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface OrderStatusChangerProps {
  orderId: string;
  currentStatus: "draft" | "confirmed" | "shipped" | "delivered" | "paid" | "cancelled";
}

export const OrderStatusChanger = ({ orderId, currentStatus }: OrderStatusChangerProps) => {
  const [changing, setChanging] = useState(false);
  const { updateOrder } = useOrders();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "paid":
        return "bg-emerald-100 text-emerald-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === currentStatus) return;
    
    try {
      setChanging(true);
      await updateOrder(orderId, { 
        status: newStatus as "draft" | "confirmed" | "shipped" | "delivered" | "paid" | "cancelled" 
      });
      toast.success("Status updated", {
        description: `Order status changed to ${newStatus}`,
      });
    } catch (error) {
      toast.error("Error", {
        description: "Failed to update order status",
      });
    } finally {
      setChanging(false);
    }
  };

  return (
    <Select 
      defaultValue={currentStatus} 
      onValueChange={handleStatusChange}
      disabled={changing}
    >
      <SelectTrigger className={`w-32 h-8 px-2 border-none ${getStatusColor(currentStatus)}`}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="draft">Draft</SelectItem>
        <SelectItem value="confirmed">Confirmed</SelectItem>
        <SelectItem value="shipped">Shipped</SelectItem>
        <SelectItem value="delivered">Delivered</SelectItem>
        <SelectItem value="paid">Paid</SelectItem>
        <SelectItem value="cancelled">Cancelled</SelectItem>
      </SelectContent>
    </Select>
  );
};
