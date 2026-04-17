
import { useParams, useNavigate } from "react-router-dom";
import { useOrders } from "@/context/orders/OrdersContext";
import { useContacts } from "@/context/contacts/ContactsContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Mail, Copy } from "lucide-react";
import { OrderDeleteDialog } from "@/components/orders/OrderDeleteDialog";
import { OrderEmailDialog } from "@/components/orders/email/OrderEmailDialog";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { OrderStatusChanger } from "@/components/orders/OrderStatusChanger";
import { format } from "date-fns";
import { formatCurrency } from "@/utils/formatting";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getOrderById } = useOrders();
  const { getContactById } = useContacts();
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [cloning, setCloning] = useState(false);
  const isMobile = useIsMobile();
  const { addOrder } = useOrders();
  
  const order = id ? getOrderById(id) : undefined;
  const contact = order ? getContactById(order.contactId) : null;
  
  const handleClone = async () => {
    if (!order) return;
    setCloning(true);
    try {
      const newId = await addOrder({
        contactId: order.contactId,
        contactCompany: order.contactCompany,
        contactFullName: order.contactFullName,
        agentId: order.agentId,
        agentName: order.agentName,
        date: format(new Date(), "yyyy-MM-dd"),
        status: "draft",
        items: order.items,
        total: order.total,
        vatTotal: order.vatTotal,
        notes: order.notes,
        termsAndConditions: order.termsAndConditions,
      });
      if (newId) navigate(`/orders/${newId}`);
    } catch {
      toast.error("Error", { description: "Failed to clone order" });
    } finally {
      setCloning(false);
    }
  };

  if (!order) {
    return (
      <div className="p-4 sm:p-8 text-center">
        <h2 className="text-xl sm:text-2xl font-bold mb-4">Order not found</h2>
        <Button onClick={() => navigate("/orders")}>Return to Orders</Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigate("/orders")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg sm:text-2xl font-bold truncate">
            {order.reference || `Order #${order.id.slice(0, 8)}`}
          </h1>
          <OrderStatusBadge status={order.status} />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size={isMobile ? "sm" : "default"}
            onClick={handleClone}
            disabled={cloning}
            className="flex-grow sm:flex-grow-0"
          >
            <Copy className="mr-2 h-4 w-4" /> {cloning ? "Cloning…" : "Clone"}
          </Button>
          <Button
            variant="outline"
            size={isMobile ? "sm" : "default"}
            onClick={() => setEmailDialogOpen(true)}
            className="flex-grow sm:flex-grow-0"
          >
            <Mail className="mr-2 h-4 w-4" /> Send Email
          </Button>
          
          <Button 
            variant="outline" 
            size={isMobile ? "sm" : "default"}
            onClick={() => navigate(`/orders/${id}/edit`)}
            className="flex-grow sm:flex-grow-0"
          >
            <Edit className="mr-2 h-4 w-4" /> Edit
          </Button>
          
          <OrderDeleteDialog
            orderId={order.id}
            reference={order.reference}
            size={isMobile ? "sm" : undefined}
          />
        </div>
      </div>
      
      <OrderEmailDialog
        orderId={order.id}
        reference={order.reference}
        customerEmail={contact?.email}
        open={emailDialogOpen}
        onOpenChange={setEmailDialogOpen}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="border rounded-lg p-3 sm:p-4">
          <h3 className="text-base sm:text-lg font-medium mb-2">Order Information</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="text-sm text-muted-foreground">Date:</div>
            <div className="text-sm">{format(new Date(order.date), "PPP")}</div>
            
            <div className="text-sm text-muted-foreground">Status:</div>
            <div className="text-sm">
              <OrderStatusChanger orderId={order.id} currentStatus={order.status} />
            </div>
            
            <div className="text-sm text-muted-foreground">Customer:</div>
            <div className="text-sm">
              {contact ? (
                <span className="cursor-pointer hover:underline" onClick={() => navigate(`/contacts/${contact.id}`)}>
                  {contact.company || contact.fullName || "Unknown"}
                </span>
              ) : (
                "Unknown Customer"
              )}
            </div>
            
            <div className="text-sm text-muted-foreground">Total Amount:</div>
            <div className="text-sm font-semibold">{formatCurrency(order.total)}</div>
            
            <div className="text-sm text-muted-foreground">VAT Amount:</div>
            <div className="text-sm">{formatCurrency(order.vatTotal || 0)}</div>
          </div>
        </div>
        
        <div className="border rounded-lg p-3 sm:p-4">
          <h3 className="text-base sm:text-lg font-medium mb-2">Agent Information</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="text-sm text-muted-foreground">Agent Name:</div>
            <div className="text-sm">{order.agentName || "Not assigned"}</div>
            
            <div className="text-sm text-muted-foreground">Created:</div>
            <div className="text-sm">{format(new Date(order.createdAt), "PPP")}</div>
            
            <div className="text-sm text-muted-foreground">Last Updated:</div>
            <div className="text-sm">{format(new Date(order.updatedAt), "PPP")}</div>
          </div>
        </div>
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <h3 className="text-base sm:text-lg font-medium p-3 sm:p-4 bg-muted">Order Items</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 font-medium">Item</th>
                <th className="text-right p-3 font-medium">Price</th>
                <th className="text-right p-3 font-medium">Qty</th>
                <th className="text-right p-3 font-medium">VAT</th>
                <th className="text-right p-3 font-medium">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items && order.items.map((item, index) => (
                <tr key={index} className={index % 2 === 0 ? "bg-muted/50" : ""}>
                  <td className="p-3">
                    <div className="font-medium">{item.code}</div>
                    <div className="text-muted-foreground text-xs sm:text-sm">{item.description}</div>
                  </td>
                  <td className="text-right p-3">{formatCurrency(item.price)}</td>
                  <td className="text-right p-3">{item.quantity}</td>
                  <td className="text-right p-3">{item.vat ? `${item.vat}%` : "0%"}</td>
                  <td className="text-right p-3 font-medium">{formatCurrency(item.subtotal)}</td>
                </tr>
              ))}
              <tr className="border-t">
                <td colSpan={4} className="text-right p-3 font-medium">Subtotal:</td>
                <td className="text-right p-3">{formatCurrency(order.total - (order.vatTotal || 0))}</td>
              </tr>
              <tr>
                <td colSpan={4} className="text-right p-3 font-medium">VAT:</td>
                <td className="text-right p-3">{formatCurrency(order.vatTotal || 0)}</td>
              </tr>
              <tr className="bg-muted">
                <td colSpan={4} className="text-right p-3 font-bold">Total:</td>
                <td className="text-right p-3 font-bold">{formatCurrency(order.total)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      {order.status === "paid" && (order.paymentDate || order.paymentMethod || order.invoiceNumber) && (
        <div className="border rounded-lg p-3 sm:p-4 border-emerald-200 bg-emerald-50">
          <h3 className="text-base sm:text-lg font-medium mb-2 text-emerald-800">Payment Details</h3>
          <div className="grid grid-cols-2 gap-2">
            {order.paymentDate && (
              <>
                <div className="text-sm text-muted-foreground">Payment Date:</div>
                <div className="text-sm">{format(new Date(order.paymentDate), "PPP")}</div>
              </>
            )}
            {order.paymentMethod && (
              <>
                <div className="text-sm text-muted-foreground">Method:</div>
                <div className="text-sm">{order.paymentMethod}</div>
              </>
            )}
            {order.invoiceNumber && (
              <>
                <div className="text-sm text-muted-foreground">Invoice #:</div>
                <div className="text-sm font-mono">{order.invoiceNumber}</div>
              </>
            )}
          </div>
        </div>
      )}

      {order.notes && (
        <div className="border rounded-lg p-3 sm:p-4">
          <h3 className="text-base sm:text-lg font-medium mb-2">Notes</h3>
          <p className="whitespace-pre-wrap text-sm">{order.notes}</p>
        </div>
      )}
      
      {order.termsAndConditions && (
        <div className="border rounded-lg p-3 sm:p-4">
          <h3 className="text-base sm:text-lg font-medium mb-2">Terms & Conditions</h3>
          <p className="whitespace-pre-wrap text-xs sm:text-sm text-muted-foreground">{order.termsAndConditions}</p>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;
