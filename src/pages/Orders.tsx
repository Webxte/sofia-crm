
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useOrders } from "@/context/OrdersContext";
import { useContacts } from "@/context/ContactsContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { OrdersHeader } from "@/components/orders/OrdersHeader";
import { OrdersFilter } from "@/components/orders/OrdersFilter";
import { OrdersGridView } from "@/components/orders/OrdersGridView";
import { OrdersListView } from "@/components/orders/OrdersListView";
import { OrdersEmptyState } from "@/components/orders/OrdersEmptyState";
import { 
  getStatusColor, 
  buildCompanyNameMap, 
  generateOrdersCSV, 
  downloadOrdersCSV,
  filterOrders
} from "@/components/orders/utils/orderHelpers";

const Orders = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const { orders } = useOrders();
  const { contacts, getContactById } = useContacts();
  const { isAdmin, user } = useAuth();
  const location = useLocation();
  const { toast } = useToast();
  
  const queryParams = new URLSearchParams(location.search);
  const contactId = queryParams.get("contactId");
  
  // Build a map of contact IDs to company names for quick lookup
  const companyNameMap = buildCompanyNameMap(contacts);
  
  const filteredOrders = filterOrders(orders, {
    searchQuery,
    filterStatus,
    contactId,
    isAdmin,
    userId: user?.id,
    getContactById
  });
  
  const sortedOrders = [...filteredOrders].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const handleExport = () => {
    if (sortedOrders.length === 0) {
      toast({
        title: "No Orders",
        description: "There are no orders to export",
      });
      return;
    }
    
    const csvContent = generateOrdersCSV(sortedOrders, companyNameMap);
    downloadOrdersCSV(csvContent, { toast });
  };

  return (
    <div className="space-y-6">
      <OrdersHeader contactId={contactId} />
      <OrdersFilter 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        viewMode={viewMode}
        setViewMode={setViewMode}
        handleExport={handleExport}
      />

      {sortedOrders.length === 0 ? (
        <OrdersEmptyState />
      ) : (
        viewMode === "grid" ? (
          <OrdersGridView 
            orders={sortedOrders} 
            getStatusColor={getStatusColor}
            companyNameMap={companyNameMap}
          />
        ) : (
          <OrdersListView 
            orders={sortedOrders}
            companyNameMap={companyNameMap}
          />
        )
      )}
    </div>
  );
};

export default Orders;
