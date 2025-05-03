
import React from "react";
import { Order } from "@/types";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatCurrency } from "@/utils/formatting";

interface ContactOrdersProps {
  orders: Order[];
}

export const ContactOrders: React.FC<ContactOrdersProps> = ({ orders = [] }) => {
  const navigate = useNavigate();
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center">
          <ShoppingCart className="mr-2 h-5 w-5" />
          Recent Orders
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => orders.length > 0 && navigate(`/orders/new?contactId=${orders[0]?.contactId}`)}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Create Order
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders.map(order => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

interface OrderCardProps {
  order: Order;
}

const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  const navigate = useNavigate();
  
  const formatNotes = (notes: string | null | undefined, maxLines = 3) => {
    if (!notes) return "";
    
    const lines = notes.split("\n");
    if (lines.length <= maxLines) return notes;
    
    return lines.slice(0, maxLines).join("\n") + (lines.length > maxLines ? "..." : "");
  };

  return (
    <Card className="p-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="font-medium">Order #{order.reference || order.id.slice(0, 8).toUpperCase()}</h4>
          <p className="text-sm text-gray-500">
            {format(new Date(order.date), "PPP")}
          </p>
          {order.agentName && (
            <p className="text-xs text-muted-foreground">
              Agent: {order.agentName}
            </p>
          )}
        </div>
        <div className="flex gap-2 items-center">
          <Badge className={
            order.status === "paid" ? "bg-green-100 text-green-800" :
            order.status === "draft" ? "bg-yellow-100 text-yellow-800" :
            "bg-gray-100"
          }>
            {order.status}
          </Badge>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(`/orders/${order.id}`)}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex justify-between items-center text-sm mt-2">
        <span className="font-medium">Total:</span>
        <span className="font-bold">{formatCurrency(order.total)}</span>
      </div>
      
      {order.notes && (
        <div className="mt-2">
          <p className="text-sm text-gray-600 whitespace-pre-line line-clamp-3">{formatNotes(order.notes, 3)}</p>
        </div>
      )}
    </Card>
  );
};
