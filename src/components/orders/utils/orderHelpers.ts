
import { format } from "date-fns";
import { Order } from "@/types";
import { Contact } from "@/types";
import { useToast } from "@/hooks/use-toast";

export const getStatusColor = (status: string) => {
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

export const buildCompanyNameMap = (contacts: Contact[]): Record<string, string> => {
  const map: Record<string, string> = {};
  
  contacts.forEach(contact => {
    map[contact.id] = contact.company || contact.fullName || "Unknown";
  });
  
  return map;
};

export const generateOrdersCSV = (
  orders: Order[],
  companyNameMap: Record<string, string>
) => {
  const headers = ["Order ID", "Reference", "Date", "Customer", "Status", "Agent", "Total", "Items"];
  const csvRows = [headers.join(",")];
  
  for (const order of orders) {
    const contactName = companyNameMap[order.contactId] || "Unknown";
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
  
  return csvRows.join("\n");
};

export const downloadOrdersCSV = (
  csvContent: string,
  { toast }: { toast: ReturnType<typeof useToast>["toast"] }
) => {
  const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `orders_export_${format(new Date(), "yyyyMMdd")}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  toast({
    title: "Export Complete",
    description: "Orders exported to CSV",
  });
};

export const filterOrders = (
  orders: Order[],
  {
    searchQuery,
    filterStatus,
    contactId,
    isAdmin,
    userId,
    getContactById
  }: {
    searchQuery: string;
    filterStatus: string;
    contactId: string | null;
    isAdmin: boolean;
    userId?: string;
    getContactById: (id: string) => Contact | undefined;
  }
) => {
  return orders.filter(order => {
    if (contactId && order.contactId !== contactId) {
      return false;
    }
    
    if (!isAdmin && userId && order.agentId !== userId) {
      return false;
    }
    
    if (filterStatus !== "all" && order.status !== filterStatus) {
      return false;
    }
    
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      
      const contact = getContactById(order.contactId);
      if (contact) {
        const contactName = contact.fullName?.toLowerCase() || "";
        const contactCompany = contact.company?.toLowerCase() || "";
        if (contactName.includes(searchLower) || contactCompany.includes(searchLower)) {
          return true;
        }
      }
      
      for (const item of order.items) {
        if (
          item.code.toLowerCase().includes(searchLower) ||
          item.description.toLowerCase().includes(searchLower)
        ) {
          return true;
        }
      }
      
      if (order.agentName?.toLowerCase().includes(searchLower)) {
        return true;
      }
      
      if (order.reference?.toLowerCase().includes(searchLower)) {
        return true;
      }
      
      return false;
    }
    
    return true;
  });
};
