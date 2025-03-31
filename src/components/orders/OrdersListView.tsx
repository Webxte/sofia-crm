
import React from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Order } from "@/types";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { formatCurrency } from "@/utils/formatting";
import { EmailOrderButton } from "./EmailOrderButton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/context/AuthContext";

interface OrdersListViewProps {
  orders: Order[];
  companyNameMap: Record<string, string>;
}

export const OrdersListView = ({
  orders,
  companyNameMap,
}: OrdersListViewProps) => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const handleRowClick = (id: string) => {
    navigate(`/orders/${id}`);
  };

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Reference</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            {isAdmin && <TableHead>Agent</TableHead>}
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow
              key={order.id}
              className="cursor-pointer"
              onClick={() => handleRowClick(order.id)}
            >
              <TableCell className="font-medium">
                {order.reference || `#${order.id.slice(0, 8)}`}
              </TableCell>
              <TableCell>{format(new Date(order.date), "MMM d, yyyy")}</TableCell>
              <TableCell>{companyNameMap[order.contactId] || "Unknown"}</TableCell>
              <TableCell>
                <OrderStatusBadge status={order.status} />
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(order.total)}
              </TableCell>
              {isAdmin && (
                <TableCell>{order.agentName || "Unassigned"}</TableCell>
              )}
              <TableCell
                onClick={(e) => e.stopPropagation()}
                className="text-center"
              >
                <EmailOrderButton order={order} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
