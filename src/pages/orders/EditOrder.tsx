
import { useParams, Navigate } from "react-router-dom";
import { useOrders } from "@/context/OrdersContext";
import OrderForm from "@/components/orders/OrderForm";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { OrderEmailDialog } from "@/components/orders/email/OrderEmailDialog";
import { useContacts } from "@/context/ContactsContext";
import { useState } from "react";

const EditOrder = () => {
  const { id } = useParams();
  const { getOrderById } = useOrders();
  const { getContactById } = useContacts();
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  
  const order = id ? getOrderById(id) : undefined;
  
  if (!order) {
    return <Navigate to="/orders" replace />;
  }
  
  const contact = order ? getContactById(order.contactId) : null;
  
  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-2xl font-bold">{order.reference || `Order #${order.id.slice(0, 8)}`}</h2>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setEmailDialogOpen(true)}
        >
          <Mail className="mr-2 h-4 w-4" /> Send Order Email
        </Button>
      </div>
      <OrderForm order={order} isEditing />
      
      <OrderEmailDialog
        orderId={order.id}
        reference={order.reference}
        customerEmail={contact?.email}
        open={emailDialogOpen}
        onOpenChange={setEmailDialogOpen}
      />
    </div>
  );
};

export default EditOrder;
