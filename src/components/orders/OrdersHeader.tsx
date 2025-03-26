
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

interface OrdersHeaderProps {
  contactId?: string | null;
}

export const OrdersHeader = ({ contactId }: OrdersHeaderProps) => {
  const { isAdmin } = useAuth();
  
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
        <p className="text-muted-foreground mt-1">
          Track and manage your customer orders
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        {!isAdmin && (
          <Button className="sm:w-auto w-full" asChild>
            <Link to={contactId ? `/orders/new?contactId=${contactId}` : "/orders/new"}>
              <Plus className="mr-2 h-4 w-4" /> Create Order
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
};
