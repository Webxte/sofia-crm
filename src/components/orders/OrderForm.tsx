import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Order, OrderItem } from "@/types";
import { useContacts } from "@/context/contacts/ContactsContext";
import { useOrders } from "@/context/orders/OrdersContext";
import { useProducts } from "@/context/products/ProductsContext";
import { useSettings } from "@/context/settings";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ArrowLeft, Calendar as CalendarIcon, Plus, Trash, Mail, Save } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ProductSelector } from "./ProductSelector";
import { useOrderFormCleanup } from "./OrderFormCleanup";

const orderSchema = z.object({
  contactId: z.string({
    required_error: "Contact is required",
  }),
  date: z.date({
    required_error: "Date is required",
  }),
  notes: z.string().optional(),
  status: z.enum(["draft", "confirmed", "shipped", "delivered", "paid", "cancelled"]).default("draft"),
  reference: z.string().optional(),
  termsAndConditions: z.string().optional(),
});

type OrderFormValues = z.infer<typeof orderSchema>;

interface OrderFormProps {
  order?: Order;
  isEditing?: boolean;
  contactId?: string;
}

const OrderForm = ({ order, isEditing = false, contactId }: OrderFormProps) => {
  const contactsContext = useContacts();
  const productsContext = useProducts();
  const ordersContext = useOrders();
  const settingsContext = useSettings();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Safe destructuring with fallbacks to prevent crashes
  const { contacts = [], getContactById = () => undefined } = contactsContext || {};
  const { products = [], getProductByCode = () => undefined } = productsContext || {};
  const { 
    addOrder = async () => {}, 
    updateOrder = async () => {}, 
    sendOrderEmail = async () => false, 
    generateOrderReference = () => `ORD-${Date.now()}` 
  } = ordersContext || {};
  const { settings } = settingsContext || {};

  // Safe access to settings with fallbacks - use 0% as default VAT rate
  const safeSettings = settings || {
    defaultTermsAndConditions: '',
    defaultVatRate: 0, // Changed from 21 to 0
    companyName: '',
    companyPhone: '',
    companyEmail: ''
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderItems, setOrderItems] = useState<OrderItem[]>(order?.items || []);
  // Always have at least one empty row for new items
  const [newRows, setNewRows] = useState<Array<{
    code: string;
    description: string;
    price: number;
    quantity: number;
    vat: number;
    suggestions: any[];
    showSuggestions: boolean;
    searchTimeout?: NodeJS.Timeout;
  }>>([{
    code: "",
    description: "",
    price: 0,
    quantity: 1,
    vat: safeSettings.defaultVatRate || 0,
    suggestions: [],
    showSuggestions: false
  }]);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [isProductSelectorOpen, setIsProductSelectorOpen] = useState(false);
  const [emailData, setEmailData] = useState({
    recipient: "",
    subject: "Your Order",
    message: ""
  });
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  console.log("OrderForm: Settings default VAT rate:", safeSettings.defaultVatRate);

  // Cleanup timeouts to prevent memory leaks
  useOrderFormCleanup({ newRows });

  const defaultValues: Partial<OrderFormValues> = {
    contactId: contactId || order?.contactId || "",
    date: order?.date ? new Date(order.date) : new Date(),
    notes: order?.notes || "",
    status: order?.status || "draft",
    reference: order?.reference || "",
    termsAndConditions: order?.termsAndConditions || safeSettings.defaultTermsAndConditions || "",
  };

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues,
  });

  useEffect(() => {
    if (!isEditing && !form.getValues("reference") && generateOrderReference) {
      try {
        const newReference = generateOrderReference();
        if (newReference) {
          form.setValue("reference", newReference);
          console.log("OrderForm: Generated new reference:", newReference);
        }
      } catch (error) {
        console.error("Failed to generate order reference:", error);
        // Fallback reference generation
        const fallbackRef = `ORD-${Date.now().toString().slice(-6)}`;
        form.setValue("reference", fallbackRef);
      }
    }
  }, [isEditing, form, generateOrderReference]);

  // Initialize new rows with correct VAT rate when settings change
  useEffect(() => {
    setNewRows(prev => prev.map(row => ({
      ...row,
      vat: row.vat === 0 ? safeSettings.defaultVatRate || 0 : row.vat
    })));
  }, [safeSettings.defaultVatRate]);

  useEffect(() => {
    const contactId = form.watch("contactId");
    if (contactId && getContactById) {
      try {
        const contact = getContactById(contactId);
        if (contact && contact.email) {
          setEmailData(prev => ({
            ...prev,
            recipient: contact.email
          }));
        }
      } catch (error) {
        console.error("Failed to get contact by ID:", error);
      }
    }
  }, [form.watch("contactId"), getContactById]);

  const handleNewRowCodeChange = (rowIndex: number, code: string) => {
    const updatedRows = [...newRows];
    updatedRows[rowIndex].code = code;
    
    if (code.length >= 1 && Array.isArray(products)) {
      // Clear existing timeout to prevent memory leaks
      if (updatedRows[rowIndex].searchTimeout) {
        clearTimeout(updatedRows[rowIndex].searchTimeout);
      }
      
      // Immediate search for exact matches (auto-completion behavior)
      const exactMatch = products.find(product => 
        product && product.code && 
        product.code.toLowerCase() === code.toLowerCase()
      );
      
      if (exactMatch) {
        // Auto-populate if exact match found
        handleProductSelected(rowIndex, exactMatch);
        return;
      }
      
      // Search for suggestions immediately (no debounce for better UX)
      const searchTerm = code.toLowerCase();
      
      // First, find products that start with the search term
      const startsWith = products.filter(product => 
        product && product.code && 
        product.code.toLowerCase().startsWith(searchTerm)
      );
      
      // Then, find products that contain the search term (but don't start with it)
      const contains = products.filter(product => 
        product && product.code && 
        product.code.toLowerCase().includes(searchTerm) &&
        !product.code.toLowerCase().startsWith(searchTerm)
      );
      
      // Combine results, prioritizing those that start with the search term
      const suggestions = [...startsWith, ...contains].slice(0, 10);
      
      // Auto-complete if there's exactly one product that starts with the typed code
      if (startsWith.length === 1 && code.length >= 2) {
        handleProductSelected(rowIndex, startsWith[0]);
        return;
      }
      
      updatedRows[rowIndex].suggestions = suggestions;
      updatedRows[rowIndex].showSuggestions = suggestions.length > 0 && code.length > 0;
    } else {
      updatedRows[rowIndex].suggestions = [];
      updatedRows[rowIndex].showSuggestions = false;
    }
    
    setNewRows(updatedRows);
  };

  const handleProductSelected = (rowIndex: number, product: any) => {
    const vatRate = product.vat !== undefined ? product.vat : safeSettings.defaultVatRate || 0;
    const defaultQuantity = product.caseQuantity || 1;
    
    const orderItem: OrderItem = {
      id: Math.random().toString(36).substring(2, 9),
      productId: product.id,
      code: product.code,
      description: product.description,
      price: product.price,
      quantity: defaultQuantity,
      vat: vatRate,
      subtotal: product.price * defaultQuantity,
      product: product as any
    };

    setOrderItems(prev => [...prev, orderItem]);
    
    // Reset the current row and add a new empty row if this was the last one
    const updatedRows = [...newRows];
    updatedRows[rowIndex] = {
      code: "",
      description: "",
      price: 0,
      quantity: 1,
      vat: safeSettings.defaultVatRate || 0,
      suggestions: [],
      showSuggestions: false
    };
    
    // Add a new empty row if this was the last one
    if (rowIndex === newRows.length - 1) {
      updatedRows.push({
        code: "",
        description: "",
        price: 0,
        quantity: 1,
        vat: safeSettings.defaultVatRate || 0,
        suggestions: [],
        showSuggestions: false
      });
    }
    
    setNewRows(updatedRows);
  };

  const updateNewRowField = (rowIndex: number, field: string, value: any) => {
    const updatedRows = [...newRows];
    updatedRows[rowIndex][field] = value;
    setNewRows(updatedRows);
  };

  const removeNewRow = (rowIndex: number) => {
    if (newRows.length > 1) {
      setNewRows(prev => prev.filter((_, i) => i !== rowIndex));
    }
  };

  const removeItem = (index: number) => {
    setOrderItems(prev => prev.filter((_, i) => i !== index));
  };

  const updateOrderItem = (index: number, field: string, value: any) => {
    setOrderItems(prev => {
      const updatedItems = [...prev];
      const item = { ...updatedItems[index] };
      
      item[field] = value;
      
      if (field === 'price' || field === 'quantity') {
        item.subtotal = item.price * item.quantity;
      }
      
      updatedItems[index] = item;
      return updatedItems;
    });
  };

  const calculateSubtotal = () => {
    return orderItems.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const calculateVatTotal = () => {
    return orderItems.reduce((sum, item) => {
      const vatRate = item.vat || 0;
      return sum + (item.subtotal * vatRate / 100);
    }, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateVatTotal();
  };

  const prepareEmailContent = () => {
    const contact = getContactById(form.getValues("contactId"));
    const orderDate = format(form.getValues("date"), "PPP");
    const reference = form.getValues("reference") || "N/A";
    
    const items = orderItems.map(item => 
      `${item.quantity} x ${item.description} (${item.code}): €${item.subtotal.toFixed(2)}`
    ).join("\n");
    
    return `Dear ${contact?.fullName || "Customer"},

Your order (Ref: ${reference}) from ${orderDate} has been processed.

Order Details:
${items}

Subtotal: €${calculateSubtotal().toFixed(2)}
VAT: €${calculateVatTotal().toFixed(2)}
Total: €${calculateTotal().toFixed(2)}

${form.getValues("termsAndConditions") || ""}

Thank you for your business.
${safeSettings.companyName || ""}
${safeSettings.companyPhone || ""}
${safeSettings.companyEmail || ""}`;
  };

  const handleEmailDialogOpen = () => {
    const contact = getContactById(form.getValues("contactId"));
    
    if (!contact?.email) {
      toast.error("No email address", {
        description: "The selected contact doesn't have an email address",
      });
      return;
    }
    
    setEmailData({
      recipient: contact.email,
      subject: `Order Confirmation - Ref: ${form.getValues("reference") || order?.id?.slice(0, 6).toUpperCase() || ""}`,
      message: prepareEmailContent()
    });
    
    setIsEmailDialogOpen(true);
  };

  const handleSendEmail = async () => {
    if (!order?.id) {
      toast.error("Save Required", {
        description: "Please save the order before sending email",
      });
      return;
    }
    
    setIsSendingEmail(true);
    
    try {
      const emailSent = await sendOrderEmail(order.id, {
        recipient: emailData.recipient,
        subject: emailData.subject,
        message: emailData.message
      });
      
      if (emailSent) {
        toast.success("Email Sent", {
          description: `Order sent to ${emailData.recipient}`,
        });
        setIsEmailDialogOpen(false);
      } else {
        throw new Error("Failed to send email");
      }
    } catch (error) {
      toast.error("Error", {
        description: "Failed to send email",
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const onSubmit = async (data: OrderFormValues) => {
    if (orderItems.length === 0) {
      toast.error("Error", {
        description: "Please add at least one item to the order",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const orderData: Omit<Order, "id" | "createdAt" | "updatedAt"> = {
        contactId: data.contactId,
        date: format(data.date, 'yyyy-MM-dd'),
        status: data.status,
        notes: data.notes || "",
        items: orderItems,
        total: calculateTotal(),
        vatTotal: calculateVatTotal(),
        termsAndConditions: data.termsAndConditions,
        reference: data.reference,
        ...(user ? {
          agentId: user.id,
          agentName: user.name
        } : {})
      };
      
      if (isEditing && order) {
        await updateOrder(order.id, orderData);
        toast.success("Success", {
          description: "Order updated successfully",
        });
        navigate("/orders");
      } else {
        await addOrder(orderData);
        toast.success("Success", {
          description: "Order created successfully",
        });
        navigate("/orders");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error", {
        description: "Something went wrong",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button 
          variant="outline" 
          size="icon" 
          className="mr-2"
          onClick={() => navigate("/orders")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">
          {isEditing ? "Edit Order" : "Create Order"}
        </h1>
        
        {isEditing && order && (
          <div className="ml-auto space-x-2">
            <Button
              variant="outline"
              onClick={handleEmailDialogOpen}
            >
              <Mail className="mr-2 h-4 w-4" /> Email Order
            </Button>
          </div>
        )}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="contactId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer*</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    disabled={!!contactId}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a customer" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {contacts.map((contact) => (
                        <SelectItem key={contact.id} value={contact.id}>
                          {contact.company ? 
                            `${contact.company}${contact.fullName ? ` (${contact.fullName})` : ''}` : 
                            (contact.fullName || "Unnamed Contact")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date*</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reference/Order Number</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., ORD-12345" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Order Items</h3>
              {order && (
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormLabel className="mb-0">Status:</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Order Status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <div className="border rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-[15%]">
                      Code*
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-[35%]">
                      Description*
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider w-[15%]">
                      Price (€)*
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider w-[10%]">
                      VAT %
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider w-[10%]">
                      Qty*
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider w-[15%]">
                      Subtotal (€)
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider w-[5%]">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                  {orderItems.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <Input 
                          value={item.code}
                          onChange={(e) => updateOrderItem(index, 'code', e.target.value)}
                          className="p-1 h-7 text-sm"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <Input 
                          value={item.description}
                          onChange={(e) => updateOrderItem(index, 'description', e.target.value)}
                          className="p-1 h-7 text-sm"
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                        <Input 
                          type="number" 
                          min="0" 
                          step="0.01"
                          value={item.price}
                          onChange={(e) => updateOrderItem(index, 'price', parseFloat(e.target.value) || 0)}
                          className="p-1 h-7 text-sm text-right"
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                        <Input 
                          type="number" 
                          min="0" 
                          step="0.01"
                          value={item.vat || 0}
                          onChange={(e) => updateOrderItem(index, 'vat', parseFloat(e.target.value) || 0)}
                          className="p-1 h-7 text-sm text-right"
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                        <div className="flex items-center justify-center">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => updateOrderItem(index, 'quantity', Math.max(1, item.quantity - 1))}
                            className="h-7 w-7 p-0"
                          >
                            -
                          </Button>
                          <Input 
                            type="number" 
                            min="1" 
                            step="1"
                            value={item.quantity}
                            onChange={(e) => updateOrderItem(index, 'quantity', parseInt(e.target.value) || 1)}
                            className="p-1 h-7 text-sm text-center mx-1"
                            style={{ width: '50px' }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => updateOrderItem(index, 'quantity', item.quantity + 1)}
                            className="h-7 w-7 p-0"
                          >
                            +
                          </Button>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                        €{item.subtotal.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  
                  {/* New product entry rows */}
                  {newRows.map((row, rowIndex) => (
                    <tr key={`new-${rowIndex}`} className="bg-muted/50">
                      <td className="px-4 py-3 relative">
                        <Input
                          placeholder="Enter product code"
                          value={row.code}
                          onChange={(e) => handleNewRowCodeChange(rowIndex, e.target.value)}
                          onFocus={() => {
                            if (row.suggestions.length > 0) {
                              const updatedRows = [...newRows];
                              updatedRows[rowIndex].showSuggestions = true;
                              setNewRows(updatedRows);
                            }
                          }}
                          onBlur={(e) => {
                            // Delay hiding suggestions to allow for clicks, but close immediately if clicking outside
                            setTimeout(() => {
                              const updatedRows = [...newRows];
                              updatedRows[rowIndex].showSuggestions = false;
                              setNewRows(updatedRows);
                            }, 150);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && row.suggestions.length === 1) {
                              e.preventDefault();
                              handleProductSelected(rowIndex, row.suggestions[0]);
                            } else if (e.key === 'Escape') {
                              const updatedRows = [...newRows];
                              updatedRows[rowIndex].showSuggestions = false;
                              setNewRows(updatedRows);
                            }
                          }}
                        />
                        {row.showSuggestions && row.suggestions.length > 0 && (
                          <div className="absolute z-50 w-full max-w-md bg-popover border border-border rounded-md shadow-lg mt-1">
                            <div className="max-h-60 overflow-y-auto">
                              {row.suggestions.map((product) => (
                                <div
                                  key={product.id}
                                  className="px-3 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer border-b border-border last:border-b-0 transition-colors"
                                  onClick={() => handleProductSelected(rowIndex, product)}
                                >
                                  <div className="font-medium text-sm text-foreground">{product.code}</div>
                                  <div className="text-xs text-muted-foreground truncate">{product.description}</div>
                                  <div className="text-xs text-muted-foreground">€{product.price?.toFixed(2)} - Qty: {product.caseQuantity || 1}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <Input 
                          placeholder="Description"
                          value={row.description}
                          onChange={(e) => updateNewRowField(rowIndex, 'description', e.target.value)}
                          className="p-1 h-7 text-sm"
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                        <Input 
                          type="number" 
                          min="0" 
                          step="0.01"
                          placeholder="0.00"
                          value={row.price || ''}
                          onChange={(e) => updateNewRowField(rowIndex, 'price', parseFloat(e.target.value) || 0)}
                          className="p-1 h-7 text-sm text-right"
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                        <Input 
                          type="number" 
                          min="0" 
                          step="0.01"
                          value={row.vat || 0}
                          onChange={(e) => updateNewRowField(rowIndex, 'vat', parseFloat(e.target.value) || 0)}
                          className="p-1 h-7 text-sm text-right"
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                        <div className="flex items-center justify-center">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => updateNewRowField(rowIndex, 'quantity', Math.max(1, row.quantity - 1))}
                            className="h-7 w-7 p-0"
                          >
                            -
                          </Button>
                          <Input 
                            type="number" 
                            min="1" 
                            step="1"
                            value={row.quantity}
                            onChange={(e) => updateNewRowField(rowIndex, 'quantity', parseInt(e.target.value) || 1)}
                            className="p-1 h-7 text-sm text-center mx-1"
                            style={{ width: '50px' }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => updateNewRowField(rowIndex, 'quantity', row.quantity + 1)}
                            className="h-7 w-7 p-0"
                          >
                            +
                          </Button>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-400">
                        €{(row.price * row.quantity).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                        {newRows.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeNewRow(rowIndex)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                  
                  <tr className="border-t-2">
                    <td colSpan={5} className="px-4 py-3 text-sm font-medium text-right">
                      Subtotal:
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-right">
                      €{calculateSubtotal().toFixed(2)}
                    </td>
                    <td></td>
                  </tr>
                  <tr>
                    <td colSpan={5} className="px-4 py-3 text-sm font-medium text-right">
                      VAT:
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-right">
                      €{calculateVatTotal().toFixed(2)}
                    </td>
                    <td></td>
                  </tr>
                  <tr className="bg-muted">
                    <td colSpan={5} className="px-4 py-3 text-sm font-bold text-right">
                      Total:
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-right">
                      €{calculateTotal().toFixed(2)}
                    </td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Order Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add any notes about this order..." 
                      className="min-h-20" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="termsAndConditions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Terms & Conditions</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Terms and conditions..." 
                      className="min-h-20" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end gap-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate("/orders")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting ? "Saving..." : isEditing ? "Update Order" : "Create Order"}
            </Button>
          </div>
        </form>
      </Form>
      
      <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send Order by Email</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient</Label>
              <Input
                id="recipient"
                value={emailData.recipient}
                onChange={(e) => setEmailData(prev => ({ ...prev, recipient: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={emailData.subject}
                onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                rows={10}
                value={emailData.message}
                onChange={(e) => setEmailData(prev => ({ ...prev, message: e.target.value }))}
                className="font-mono text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsEmailDialogOpen(false)}
              disabled={isSendingEmail}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleSendEmail}
              disabled={isSendingEmail}
            >
              {isSendingEmail ? "Sending..." : "Send Email"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ProductSelector 
        open={isProductSelectorOpen}
        onOpenChange={setIsProductSelectorOpen}
        onSelect={(product) => handleProductSelected(0, product)}
        selectedProducts={orderItems.map(item => item.product).filter(Boolean)}
      />
    </div>
  );
};

export default OrderForm;
