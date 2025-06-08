
import { useState, useEffect } from "react";
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
import { useIsMobile } from "@/hooks/use-mobile";

const Orders = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [showAllOrders, setShowAllOrders] = useState(false);
  const { orders } = useOrders();
  const { contacts, getContactById, setShowAllContacts } = useContacts();
  const { isAdmin, user } = useAuth();
  const location = useLocation();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const queryParams = new URLSearchParams(location.search);
  const contactId = queryParams.get("contactId");
  
  // If on mobile, force list view which we've optimized for mobile
  const effectiveViewMode = isMobile ? "list" : viewMode;
  
  // Sync contact visibility with order visibility
  useEffect(() => {
    console.log("Orders: Setting showAllContacts to:", showAllOrders);
    setShowAllContacts(showAllOrders);
  }, [showAllOrders, setShowAllContacts]);
  
  // Build a map of contact IDs to company names for quick lookup
  const companyNameMap = buildCompanyNameMap(contacts);
  
  // Debug logging for admin functionality
  console.log("Orders page - Admin status:", { isAdmin, userId: user?.id, showAllOrders });
  console.log("Orders page - Contacts count:", contacts.length, "Orders count:", orders.length);
  
  // Debug: Log all contact IDs that the agent has access to
  console.log("Agent's contact IDs:", contacts.map(c => c.id));
  
  // Debug: Log all order contact IDs
  console.log("Order contact IDs:", orders.map(o => ({ orderId: o.id, contactId: o.contactId, agentId: o.agentId })));
  
  const filteredOrders = filterOrders(orders, {
    searchQuery,
    filterStatus,
    contactId,
    isAdmin: showAllOrders, // Allow both admins and agents to see all when toggle is on
    userId: user?.id,
    getContactById
  });
  
  console.log("Filtered orders count:", filteredOrders.length, "Total orders:", orders.length);
  
  // Additional debugging: check which orders have missing contact info
  const ordersWithMissingContacts = filteredOrders.filter(order => 
    !companyNameMap[order.contactId] || companyNameMap[order.contactId] === "Unknown"
  );
  
  if (ordersWithMissingContacts.length > 0) {
    console.log("Orders with missing/unknown contacts:", ordersWithMissingContacts.map(order => ({
      orderId: order.id,
      contactId: order.contactId,
      agentId: order.agentId,
      reference: order.reference,
      mappedName: companyNameMap[order.contactId],
      contactExists: !!getContactById(order.contactId)
    })));
    
    // Check if these missing contact IDs belong to other agents
    const missingContactIds = ordersWithMissingContacts.map(o => o.contactId);
    console.log("Missing contact IDs:", missingContactIds);
    console.log("Orders that reference missing contacts but belong to current agent:", 
      ordersWithMissingContacts.filter(o => o.agentId === user?.id)
    );
  }
  
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

  const handleShowAllOrdersChange = (show: boolean) => {
    console.log("Orders: Changing showAllOrders to:", show);
    setShowAllOrders(show);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <OrdersHeader contactId={contactId} />
      <OrdersFilter 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        viewMode={effectiveViewMode}
        setViewMode={setViewMode}
        handleExport={handleExport}
        isMobile={isMobile}
        showAllOrders={showAllOrders}
        onShowAllOrdersChange={handleShowAllOrdersChange}
      />

      {sortedOrders.length === 0 ? (
        <OrdersEmptyState />
      ) : (
        effectiveViewMode === "grid" ? (
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
