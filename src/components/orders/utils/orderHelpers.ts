
import { Order } from "@/types";
import { Contact } from "@/context/contacts/types";

export const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "draft":
      return "bg-gray-100 text-gray-800";
    case "sent":
      return "bg-blue-100 text-blue-800";
    case "confirmed":
      return "bg-green-100 text-green-800";
    case "shipped":
      return "bg-purple-100 text-purple-800";
    case "delivered":
      return "bg-emerald-100 text-emerald-800";
    case "paid":
      return "bg-teal-100 text-teal-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const buildCompanyNameMap = (contacts: Contact[]) => {
  return contacts.reduce((acc, contact) => {
    acc[contact.id] = contact.company || contact.fullName || "Unknown";
    return acc;
  }, {} as Record<string, string>);
};

export const generateOrdersCSV = (orders: Order[], companyNameMap: Record<string, string>) => {
  const headers = ['Reference', 'Customer', 'Date', 'Status', 'Total', 'VAT Total', 'Agent', 'Notes'];
  
  const rows = orders.map(order => [
    order.reference || '',
    companyNameMap[order.contactId] || 'Unknown',
    order.date,
    order.status,
    order.total.toString(),
    order.vatTotal?.toString() || '0',
    order.agentName || '',
    order.notes || ''
  ]);
  
  const csvContent = [headers, ...rows]
    .map(row => row.map(field => `"${field.toString().replace(/"/g, '""')}"`).join(','))
    .join('\n');
    
  return csvContent;
};

export const downloadOrdersCSV = (csvContent: string, { toast }: any) => {
  try {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `orders_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Export Successful",
        description: "Orders have been exported to CSV file",
      });
    }
  } catch (error) {
    console.error("Error downloading CSV:", error);
    toast({
      title: "Export Failed",
      description: "There was an error exporting the orders",
      variant: "destructive",
    });
  }
};

export const filterOrders = (
  orders: Order[], 
  filters: {
    searchQuery: string;
    filterStatus: string;
    contactId: string | null;
    isAdmin: boolean;
    userId: string | undefined;
    getContactById: (id: string) => Contact | undefined;
  }
) => {
  const { searchQuery, filterStatus, contactId, isAdmin, userId, getContactById } = filters;
  
  return orders.filter(order => {
    // Filter by contact if specified
    if (contactId && order.contactId !== contactId) return false;
    
    // Filter by user (if not showing all orders)
    if (!isAdmin && order.agentId !== userId) return false;
    
    // Filter by status
    if (filterStatus !== "all" && order.status !== filterStatus) return false;
    
    // Filter by search query
    if (searchQuery) {
      const contact = getContactById(order.contactId);
      const companyName = contact?.company || contact?.fullName || '';
      const reference = order.reference || '';
      const agentName = order.agentName || '';
      
      const searchLower = searchQuery.toLowerCase();
      return (
        companyName.toLowerCase().includes(searchLower) ||
        reference.toLowerCase().includes(searchLower) ||
        agentName.toLowerCase().includes(searchLower) ||
        order.status.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });
};
