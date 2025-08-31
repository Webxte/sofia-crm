
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useOrders } from "@/context/orders/OrdersContext";
import { useContacts } from "@/context/contacts/ContactsContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
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
  
  const location = useLocation();
  const isMobile = useIsMobile();
  
  const queryParams = new URLSearchParams(location.search);
  const contactId = queryParams.get("contactId");
  
  // If on mobile, force list view which we've optimized for mobile
  const effectiveViewMode = isMobile ? "list" : viewMode;

  // Add error handling for context hooks
  let orders, contacts, getContactById, setShowAllContacts, isAdmin, user;
  
  try {
    const ordersContext = useOrders();
    orders = ordersContext?.orders || [];
    console.log("Orders context loaded successfully:", orders.length, "orders");
  } catch (error) {
    console.error("Error loading orders context:", error);
    orders = [];
  }

  try {
    const contactsContext = useContacts();
    contacts = contactsContext?.contacts || [];
    getContactById = contactsContext?.getContactById || (() => null);
    setShowAllContacts = contactsContext?.setShowAllContacts || (() => {});
    console.log("Contacts context loaded successfully:", contacts.length, "contacts");
  } catch (error) {
    console.error("Error loading contacts context:", error);
    contacts = [];
    getContactById = () => null;
    setShowAllContacts = () => {};
  }

  try {
    const authContext = useAuth();
    isAdmin = authContext?.isAdmin || false;
    user = authContext?.user || null;
    console.log("Auth context loaded successfully:", { isAdmin, userId: user?.id });
  } catch (error) {
    console.error("Error loading auth context:", error);
    isAdmin = false;
    user = null;
  }

  // Sync contact visibility with order visibility
  useEffect(() => {
    try {
      console.log("Orders: Setting showAllContacts to:", showAllOrders);
      setShowAllContacts(showAllOrders);
    } catch (error) {
      console.error("Error setting showAllContacts:", error);
    }
  }, [showAllOrders, setShowAllContacts]);
  
  // Build a map of contact IDs to company names for quick lookup
  let companyNameMap = {};
  try {
    companyNameMap = buildCompanyNameMap(contacts);
    console.log("Company name map built successfully:", Object.keys(companyNameMap).length, "entries");
  } catch (error) {
    console.error("Error building company name map:", error);
    companyNameMap = {};
  }
  
  // Debug logging for admin functionality
  console.log("Orders page - Admin status:", { isAdmin, userId: user?.id, showAllOrders });
  console.log("Orders page - Contacts count:", contacts.length, "Orders count:", orders.length);
  
  let filteredOrders = [];
  try {
    filteredOrders = filterOrders(orders, {
      searchQuery,
      filterStatus,
      contactId,
      isAdmin: showAllOrders, // Allow both admins and agents to see all when toggle is on
      userId: user?.id,
      getContactById
    });
    console.log("Filtered orders successfully:", filteredOrders.length, "orders");
  } catch (error) {
    console.error("Error filtering orders:", error);
    filteredOrders = [];
  }
  
  let sortedOrders = [];
  try {
    sortedOrders = [...filteredOrders].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    console.log("Sorted orders successfully:", sortedOrders.length, "orders");
  } catch (error) {
    console.error("Error sorting orders:", error);
    sortedOrders = [];
  }

  const handleExport = () => {
    try {
      if (sortedOrders.length === 0) {
        toast.error("No Orders", {
          description: "There are no orders to export",
        });
        return;
      }
      
      const csvContent = generateOrdersCSV(sortedOrders, companyNameMap);
      downloadOrdersCSV(csvContent, { toast });
    } catch (error) {
      console.error("Error exporting orders:", error);
      toast.error("Export Error", {
        description: "Failed to export orders",
      });
    }
  };

  const handleShowAllOrdersChange = (show: boolean) => {
    try {
      console.log("Orders: Changing showAllOrders to:", show);
      setShowAllOrders(show);
    } catch (error) {
      console.error("Error changing showAllOrders:", error);
    }
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
