
import { Badge } from "@/components/ui/badge";

interface OrderStatusBadgeProps {
  status: "draft" | "confirmed" | "shipped" | "delivered" | "paid" | "cancelled";
}

export const OrderStatusBadge = ({ status }: OrderStatusBadgeProps) => {
  const getStatusStyles = () => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
      case "confirmed":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case "shipped":
        return "bg-purple-100 text-purple-800 hover:bg-purple-200";
      case "delivered":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "paid":
        return "bg-emerald-100 text-emerald-800 hover:bg-emerald-200";
      case "cancelled":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  return (
    <Badge variant="outline" className={`${getStatusStyles()} font-medium`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};
