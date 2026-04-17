
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
import { usePagination } from "@/hooks/use-pagination";
import { ContactsPagination } from "@/components/contacts/ContactsPagination";

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
      setShowAllContacts(showAllOrders);
    } catch (error) {
      console.error("Error setting showAllContacts:", error);
    }
  }, [showAllOrders, setShowAllContacts]);
  
  // Build a map of contact IDs to company names for quick lookup
  let companyNameMap = {};
  try {
    companyNameMap = buildCompanyNameMap(contacts, orders);
  } catch (error) {
    companyNameMap = {};
  }

  let filteredOrders = [];
  try {
    filteredOrders = filterOrders(orders, {
      searchQuery,
      filterStatus,
      contactId,
      isAdmin: showAllOrders,
      userId: user?.id,
      getContactById
    });
  } catch (error) {
    filteredOrders = [];
  }

  let sortedOrders = [];
  try {
    sortedOrders = [...filteredOrders].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  } catch (error) {
    sortedOrders = [];
  }

  const pagination = usePagination({ data: sortedOrders, itemsPerPage: 20 });

  useEffect(() => {
    pagination.resetPage();
  }, [searchQuery, filterStatus, showAllOrders, contactId]);

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
        <>
          {effectiveViewMode === "grid" ? (
            <OrdersGridView
              orders={pagination.paginatedData}
              getStatusColor={getStatusColor}
              companyNameMap={companyNameMap}
            />
          ) : (
            <OrdersListView
              orders={pagination.paginatedData}
              companyNameMap={companyNameMap}
            />
          )}
          <ContactsPagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            startIndex={pagination.startIndex}
            endIndex={pagination.endIndex}
            hasNextPage={pagination.hasNextPage}
            hasPreviousPage={pagination.hasPreviousPage}
            onNextPage={pagination.goToNextPage}
            onPreviousPage={pagination.goToPreviousPage}
          />
        </>
      )}
    </div>
  );
};

export default Orders;
