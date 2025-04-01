import { useParams, useNavigate } from "react-router-dom";
import { useOrders } from "@/context/OrdersContext";
import { useContacts } from "@/context/ContactsContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Mail } from "lucide-react";
import { OrderDeleteDialog } from "@/components/orders/OrderDeleteDialog";
import { OrderEmailDialog } from "@/components/orders/email/OrderEmailDialog";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { OrderStatusChanger } from "@/components/orders/OrderStatusChanger";
import { format } from "date-fns";
import { formatCurrency } from "@/utils/formatting";

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getOrderById } = useOrders();
  const { getContactById } = useContacts();
  
  const order = id ? getOrderById(id) : undefined;
  const contact = order ? getContactById(order.contactId) : null;
  
  if (!order) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Order not found</h2>
        <Button onClick={() => navigate("/orders")}>Return to Orders</Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigate("/orders")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">
            {order.reference || `Order #${order.id.slice(0, 8)}`}
          </h1>
          <OrderStatusBadge status={order.status} />
        </div>
        <div className="flex gap-2">
          <OrderEmailDialog
            orderId={order.id}
            customerEmail={contact?.email}
            orderReference={order.reference}
            trigger={
              <Button variant="outline">
                <Mail className="mr-2 h-4 w-4" /> Send Email
              </Button>
            }
          />
          
          <Button variant="outline" onClick={() => navigate(`/orders/${id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" /> Edit
          </Button>
          
          <OrderDeleteDialog
            orderId={order.id}
            reference={order.reference}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-medium mb-2">Order Information</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="text-muted-foreground">Date:</div>
            <div>{format(new Date(order.date), "PPP")}</div>
            
            <div className="text-muted-foreground">Status:</div>
            <div>
              <OrderStatusChanger orderId={order.id} currentStatus={order.status} />
            </div>
            
            <div className="text-muted-foreground">Customer:</div>
            <div>
              {contact ? (
                <span className="cursor-pointer hover:underline" onClick={() => navigate(`/contacts/${contact.id}`)}>
                  {contact.company || contact.fullName || "Unknown"}
                </span>
              ) : (
                "Unknown Customer"
              )}
            </div>
            
            <div className="text-muted-foreground">Total Amount:</div>
            <div className="font-semibold">{formatCurrency(order.total)}</div>
            
            <div className="text-muted-foreground">VAT Amount:</div>
            <div>{formatCurrency(order.vatTotal || 0)}</div>
          </div>
        </div>
        
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-medium mb-2">Agent Information</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="text-muted-foreground">Agent Name:</div>
            <div>{order.agentName || "Not assigned"}</div>
            
            <div className="text-muted-foreground">Created:</div>
            <div>{format(new Date(order.createdAt), "PPP")}</div>
            
            <div className="text-muted-foreground">Last Updated:</div>
            <div>{format(new Date(order.updatedAt), "PPP")}</div>
          </div>
        </div>
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <h3 className="text-lg font-medium p-4 bg-muted">Order Items</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4 font-medium">Item</th>
                <th className="text-right p-4 font-medium">Price</th>
                <th className="text-right p-4 font-medium">Quantity</th>
                <th className="text-right p-4 font-medium">VAT</th>
                <th className="text-right p-4 font-medium">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items && order.items.map((item, index) => (
                <tr key={index} className={index % 2 === 0 ? "bg-muted/50" : ""}>
                  <td className="p-4">
                    <div className="font-medium">{item.code}</div>
                    <div className="text-muted-foreground text-sm">{item.description}</div>
                  </td>
                  <td className="text-right p-4">{formatCurrency(item.price)}</td>
                  <td className="text-right p-4">{item.quantity}</td>
                  <td className="text-right p-4">{item.vat ? `${item.vat}%` : "0%"}</td>
                  <td className="text-right p-4 font-medium">{formatCurrency(item.subtotal)}</td>
                </tr>
              ))}
              <tr className="border-t">
                <td colSpan={4} className="text-right p-4 font-medium">Subtotal:</td>
                <td className="text-right p-4">{formatCurrency(order.total - (order.vatTotal || 0))}</td>
              </tr>
              <tr>
                <td colSpan={4} className="text-right p-4 font-medium">VAT:</td>
                <td className="text-right p-4">{formatCurrency(order.vatTotal || 0)}</td>
              </tr>
              <tr className="bg-muted">
                <td colSpan={4} className="text-right p-4 font-bold">Total:</td>
                <td className="text-right p-4 font-bold">{formatCurrency(order.total)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      {order.notes && (
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-medium mb-2">Notes</h3>
          <p className="whitespace-pre-wrap">{order.notes}</p>
        </div>
      )}
      
      {order.termsAndConditions && (
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-medium mb-2">Terms & Conditions</h3>
          <p className="whitespace-pre-wrap text-sm text-muted-foreground">{order.termsAndConditions}</p>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;
