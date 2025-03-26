
import { ShoppingCart } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { useAuth } from "@/context/AuthContext";

export const OrdersEmptyState = () => {
  const { isAdmin } = useAuth();
  
  return (
    <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
      <EmptyState
        icon={<ShoppingCart size={40} />}
        title="No orders created"
        description={isAdmin ? "No orders have been created yet." : "Start creating orders to track your sales."}
        actionText={!isAdmin ? "Create Order" : undefined}
        actionLink={!isAdmin ? "/orders/new" : undefined}
      />
    </div>
  );
};
