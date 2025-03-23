
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { format } from "date-fns";
import { ShoppingCart, Plus, Search, Filter, Download, Mail } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useOrders } from "@/context/OrdersContext";
import { useContacts } from "@/context/ContactsContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import ProductImporter from "@/components/orders/ProductImporter";

const Orders = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const { orders } = useOrders();
  const { getContactById } = useContacts();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // Extract contactId from query param if it exists
  const queryParams = new URLSearchParams(location.search);
  const contactId = queryParams.get("contactId");
  
  // Filter orders based on filters and search query
  const filteredOrders = orders.filter(order => {
    // Filter by contact if specified
    if (contactId && order.contactId !== contactId) {
      return false;
    }
    
    // Filter by status
    if (filterStatus !== "all" && order.status !== filterStatus) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      
      // Check contact details
      const contact = getContactById(order.contactId);
      if (contact) {
        const contactName = contact.fullName?.toLowerCase() || "";
        const contactCompany = contact.company?.toLowerCase() || "";
        if (contactName.includes(searchLower) || contactCompany.includes(searchLower)) {
          return true;
        }
      }
      
      // Check products in order
      for (const item of order.items) {
        if (
          item.code.toLowerCase().includes(searchLower) ||
          item.description.toLowerCase().includes(searchLower)
        ) {
          return true;
        }
      }
      
      // Check agent name
      if (order.agentName?.toLowerCase().includes(searchLower)) {
        return true;
      }
      
      // Check reference number
      if (order.reference?.toLowerCase().includes(searchLower)) {
        return true;
      }
      
      return false;
    }
    
    return true;
  });
  
  // Sort orders by date, most recent first
  const sortedOrders = [...filteredOrders].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "paid":
        return "bg-emerald-100 text-emerald-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Handle export button click
  const handleExport = () => {
    if (sortedOrders.length === 0) {
      toast({
        title: "No Orders",
        description: "There are no orders to export",
      });
      return;
    }
    
    // Generate CSV content
    const headers = ["Order ID", "Reference", "Date", "Customer", "Status", "Agent", "Total", "Items"];
    const csvRows = [headers.join(",")];
    
    for (const order of sortedOrders) {
      const contact = getContactById(order.contactId);
      const contactName = contact?.fullName || contact?.company || "Unknown";
      const date = format(new Date(order.date), "yyyy-MM-dd");
      const row = [
        order.id,
        order.reference || "",
        date,
        contactName,
        order.status,
        order.agentName || "Unknown",
        order.total.toFixed(2),
        order.items.length
      ].map(item => `"${item}"`).join(",");
      
      csvRows.push(row);
    }
    
    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `orders_export_${format(new Date(), "yyyyMMdd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export Complete",
      description: `${sortedOrders.length} orders exported to CSV`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage your customer orders
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          {isAdmin && <ProductImporter />}
          <Button className="sm:w-auto w-full" asChild>
            <Link to={contactId ? `/orders/new?contactId=${contactId}` : "/orders/new"}>
              <Plus className="mr-2 h-4 w-4" /> Create Order
            </Link>
          </Button>
        </div>
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
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
        </div>
      </div>

      {sortedOrders.length === 0 ? (
        <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
          <EmptyState
            icon={<ShoppingCart size={40} />}
            title="No orders created"
            description="Start creating orders to track your sales."
            actionText="Create Order"
            actionLink="/orders/new"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {sortedOrders.map((order) => {
            const contact = getContactById(order.contactId);
            return (
              <Card key={order.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardDescription className="flex items-center gap-1">
                      {order.reference || `Order #${order.id.slice(0, 6).toUpperCase()}`}
                    </CardDescription>
                    <Badge
                      className={getStatusColor(order.status)}
                      variant="outline"
                    >
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">
                    {contact?.fullName || contact?.company || "Unknown Customer"}
                  </CardTitle>
                  <CardDescription>
                    Date: {format(new Date(order.date), "PPP")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <div className="text-sm flex justify-between">
                      <span className="text-muted-foreground">Items:</span>
                      <span>{order.items.length}</span>
                    </div>
                    <div className="text-sm flex justify-between">
                      <span className="text-muted-foreground">Agent:</span>
                      <span>{order.agentName || "Unknown"}</span>
                    </div>
                    <div className="text-sm flex justify-between font-medium">
                      <span className="text-muted-foreground">Total:</span>
                      <span>€{order.total.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-2 flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => navigate(`/orders/edit/${order.id}`)}
                  >
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;
