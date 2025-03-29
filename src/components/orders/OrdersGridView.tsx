
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { formatCurrency } from "@/utils/formatting";
import { EmailOrderButton } from "./EmailOrderButton";
import { Order } from "@/types";
import { format } from "date-fns";
import { Eye } from "lucide-react";

interface OrdersGridViewProps {
  orders: Order[];
  getStatusColor: (status: string) => string;
  companyNameMap: Record<string, string>;
}

export const OrdersGridView = ({ orders, getStatusColor, companyNameMap }: OrdersGridViewProps) => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {orders.map((order) => (
        <Card key={order.id} className="overflow-hidden">
          <div className={`h-2 ${getStatusColor(order.status)}`} />
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg font-medium">
                {order.reference || `Order #${order.id.slice(0, 8)}`}
              </CardTitle>
              <OrderStatusBadge status={order.status} />
            </div>
            <p className="text-sm text-muted-foreground">
              {format(new Date(order.date), "MMM d, yyyy")}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium">Customer</p>
              <p className="text-sm">{companyNameMap[order.contactId] || "Unknown"}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Amount</p>
              <p className="text-lg font-semibold">
                {formatCurrency(order.total)}
              </p>
            </div>
            <div className="flex flex-col space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => navigate(`/orders/${order.id}`)}
              >
                <Eye className="mr-2 h-4 w-4" /> View Details
              </Button>
              
              <EmailOrderButton order={order} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
