
import { useNavigate } from "react-router-dom";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { Eye, Trash2, Mail } from "lucide-react";
import { Order } from "@/types";
import { formatCurrency } from "@/utils/formatting";
import { OrderDeleteDialog } from "@/components/orders/OrderDeleteDialog";
import { format } from "date-fns";
import { OrderEmailDialog } from "@/components/orders/OrderEmailDialog";

interface OrdersListViewProps {
  orders: Order[];
  companyNameMap: Record<string, string>;
}

export const OrdersListView = ({ orders, companyNameMap }: OrdersListViewProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="border rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Reference</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map(order => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">
                {order.reference || `Order #${order.id.slice(0, 8)}`}
              </TableCell>
              <TableCell>{format(new Date(order.date), 'MMM d, yyyy')}</TableCell>
              <TableCell>{companyNameMap[order.contactId] || 'Unknown Customer'}</TableCell>
              <TableCell>
                <OrderStatusBadge status={order.status} />
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(order.total)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(`/orders/${order.id}`)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  
                  <OrderEmailDialog
                    orderId={order.id}
                    customerEmail=""
                    orderReference={order.reference}
                    trigger={
                      <Button variant="ghost" size="icon">
                        <Mail className="h-4 w-4" />
                      </Button>
                    }
                  />
                  
                  <OrderDeleteDialog
                    orderId={order.id}
                    reference={order.reference}
                    trigger={
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    }
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
