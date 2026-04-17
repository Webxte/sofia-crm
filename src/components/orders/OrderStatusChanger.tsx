import { useState } from "react";
import { useOrders } from "@/context/orders/OrdersContext";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Order } from "@/types";

type OrderStatus = Order["status"];

interface OrderStatusChangerProps {
  orderId: string;
  currentStatus: OrderStatus;
}

const statusColor: Record<OrderStatus, string> = {
  draft:     "bg-gray-100 text-gray-800",
  confirmed: "bg-blue-100 text-blue-800",
  shipped:   "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  paid:      "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-800",
};

const PAYMENT_METHODS = ["Bank Transfer", "Cash", "Credit Card", "Cheque", "Other"];

export const OrderStatusChanger = ({ orderId, currentStatus }: OrderStatusChangerProps) => {
  const [changing, setChanging] = useState(false);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [paymentDate, setPaymentDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [paymentMethod, setPaymentMethod] = useState("Bank Transfer");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const { updateOrder } = useOrders();

  const applyStatus = async (newStatus: OrderStatus, extra?: Partial<Order>) => {
    try {
      setChanging(true);
      await updateOrder(orderId, { status: newStatus, ...extra });
      toast.success("Status updated", {
        description: `Order status changed to ${newStatus}`,
      });
    } catch {
      toast.error("Error", { description: "Failed to update order status" });
    } finally {
      setChanging(false);
    }
  };

  const handleStatusChange = (newStatus: string) => {
    if (newStatus === currentStatus) return;
    if (newStatus === "paid") {
      setPaymentDialog(true);
      return;
    }
    applyStatus(newStatus as OrderStatus);
  };

  const handlePaymentConfirm = async () => {
    setPaymentDialog(false);
    await applyStatus("paid", {
      paymentDate: paymentDate || null,
      paymentMethod: paymentMethod || null,
      invoiceNumber: invoiceNumber.trim() || null,
    });
  };

  return (
    <>
      <Select
        value={currentStatus}
        onValueChange={handleStatusChange}
        disabled={changing}
      >
        <SelectTrigger className={`w-32 h-8 px-2 border-none ${statusColor[currentStatus]}`}>
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

      <Dialog open={paymentDialog} onOpenChange={setPaymentDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-1">
            <div className="space-y-1">
              <Label htmlFor="pay-date">Payment Date</Label>
              <Input
                id="pay-date"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="pay-method">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger id="pay-method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="invoice-no">Invoice Number <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Input
                id="invoice-no"
                placeholder="INV-001"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialog(false)}>Cancel</Button>
            <Button onClick={handlePaymentConfirm}>Confirm Payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
