
import { format } from "date-fns";
import { Order } from "@/types";
import { OrderStatusChanger } from "@/components/orders/OrderStatusChanger";
import { OrderDeleteDialog } from "@/components/orders/OrderDeleteDialog";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface OrdersGridViewProps {
  orders: Order[];
  getStatusColor: (status: string) => string;
  companyNameMap: Record<string, string>;
}

export const OrdersGridView = ({
  orders,
  getStatusColor,
  companyNameMap
}: OrdersGridViewProps) => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {orders.map((order) => {
        const companyName = companyNameMap[order.contactId] || "Unknown";
        
        return (
          <Card key={order.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardDescription className="flex items-center gap-1">
                  {order.reference || `Order #${order.id.slice(0, 6).toUpperCase()}`}
                </CardDescription>
                <Badge
                  className={getStatusColor(order.status)}
                  variant="outline"
                >
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
              </div>
              <CardTitle className="text-xl">
                {companyName}
              </CardTitle>
              <CardDescription>
                Date: {format(new Date(order.date), "PPP")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="text-sm flex justify-between">
                  <span className="text-muted-foreground">Items:</span>
                  <span>{order.items.length}</span>
                </div>
                <div className="text-sm flex justify-between">
                  <span className="text-muted-foreground">Agent:</span>
                  <span>{order.agentName || "Unknown"}</span>
                </div>
                <div className="text-sm flex justify-between font-medium">
                  <span className="text-muted-foreground">Total:</span>
                  <span>€{order.total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-2 flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => navigate(`/orders/edit/${order.id}`)}
              >
                View Details
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
};
