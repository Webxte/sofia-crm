
import { format } from "date-fns";
import { Order } from "@/types";
import { OrderStatusChanger } from "@/components/orders/OrderStatusChanger";
import { OrderDeleteDialog } from "@/components/orders/OrderDeleteDialog";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface OrdersListViewProps {
  orders: Order[];
  companyNameMap: Record<string, string>;
}

export const OrdersListView = ({
  orders,
  companyNameMap
}: OrdersListViewProps) => {
  const navigate = useNavigate();

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Reference</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Agent</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => {
            const companyName = companyNameMap[order.contactId] || "Unknown";
            
            return (
              <TableRow key={order.id}>
                <TableCell className="font-medium">
                  {order.reference || `#${order.id.slice(0, 6).toUpperCase()}`}
                </TableCell>
                <TableCell>
                  {companyName}
                </TableCell>
                <TableCell>{format(new Date(order.date), "PP")}</TableCell>
                <TableCell>
                  <OrderStatusChanger 
                    orderId={order.id} 
                    currentStatus={order.status} 
                  />
                </TableCell>
                <TableCell>{order.agentName || "Unknown"}</TableCell>
                <TableCell className="text-right">€{order.total.toFixed(2)}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => navigate(`/orders/edit/${order.id}`)}
                    >
                      View
                    </Button>
                    <OrderDeleteDialog 
                      orderId={order.id} 
                      reference={order.reference}
                    />
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
