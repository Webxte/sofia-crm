
import { useNavigate } from "react-router-dom";
import { Order } from "@/types";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { formatCurrency } from "@/utils/formatting";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/context/AuthContext";
import { Edit, Mail } from "lucide-react";
import { OrderDeleteDialog } from "./OrderDeleteDialog";
import { EmailOrderButton } from "./EmailOrderButton";

interface OrdersListViewProps {
  orders: Order[];
  companyNameMap: Record<string, string>;
}

export const OrdersListView = ({ orders, companyNameMap }: OrdersListViewProps) => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  
  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Reference</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Date</TableHead>
            {isAdmin && <TableHead>Agent</TableHead>}
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">
                {order.reference || `Order ${order.id.slice(0, 8)}`}
              </TableCell>
              <TableCell>
                {companyNameMap[order.contactId] || "Unknown"}
              </TableCell>
              <TableCell>
                {format(new Date(order.date), "MMM d, yyyy")}
              </TableCell>
              {isAdmin && (
                <TableCell>{order.agentName || "Unknown"}</TableCell>
              )}
              <TableCell>
                <OrderStatusBadge status={order.status} />
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(order.total)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/orders/${order.id}`)}
                  >
                    View
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => navigate(`/orders/edit/${order.id}`)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <EmailOrderButton order={order} />
                  <OrderDeleteDialog orderId={order.id} reference={order.reference} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
