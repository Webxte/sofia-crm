
import { useState } from "react";
import { ShoppingCart, Plus, Search, Filter } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Orders = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const orders = []; // This would be populated from your backend

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage your customer orders
          </p>
        </div>
        <Button className="sm:w-auto w-full">
          <Plus className="mr-2 h-4 w-4" /> Create Order
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search orders..."
            className="w-full pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 sm:ml-auto">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" /> Filter
          </Button>
          <Button variant="outline" size="sm">
            Export
          </Button>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
          <EmptyState
            icon={<ShoppingCart size={40} />}
            title="No orders created"
            description="Start creating orders to track your sales."
            actionText="Create Order"
          />
        </div>
      ) : (
        <div className="rounded-lg border border-dashed">
          {/* Orders table would go here */}
        </div>
      )}
    </div>
  );
};

export default Orders;
