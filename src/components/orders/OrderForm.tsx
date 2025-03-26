
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Order, OrderItem } from "@/types";
import { useContacts } from "@/context/ContactsContext";
import { useOrders } from "@/context/OrdersContext";
import { useProducts } from "@/context/products/ProductsContext";
import { useSettings } from "@/context/SettingsContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderItems, setOrderItems] = useState<OrderItem[]>(order?.items || []);
  const [newItem, setNewItem] = useState({
    code: "",
    description: "",
    price: 0,
    quantity: 1,
    vat: 0
  });
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [emailData, setEmailData] = useState({
    recipient: "",
    subject: "Your Order",
    message: ""
  });
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  
  const { contacts, getContactById } = useContacts();
  const { products, getProductByCode } = useProducts();
  const { addOrder, updateOrder, sendOrderEmail } = useOrders();
  const { settings } = useSettings();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const defaultValues: Partial<OrderFormValues> = {
    contactId: contactId || order?.contactId || "",
    date: order?.date ? new Date(order.date) : new Date(),
    notes: order?.notes || "",
    status: order?.status || "draft",
    reference: order?.reference || "",
    termsAndConditions: order?.termsAndConditions || settings.defaultTermsAndConditions,
  };

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues,
  });

  useEffect(() => {
    if (newItem.code) {
      const product = getProductByCode(newItem.code);
      if (product) {
        setNewItem(prev => ({
          ...prev,
          description: product.description,
          price: product.price,
          vat: product.vat || settings.defaultVatRate
        }));
      }
    }
  }, [newItem.code, getProductByCode, settings.defaultVatRate]);

  useEffect(() => {
    if (form.watch("contactId")) {
      const contact = getContactById(form.watch("contactId"));
      if (contact && contact.email) {
        setEmailData(prev => ({
          ...prev,
          recipient: contact.email
        }));
      }
    }
  }, [form.watch("contactId"), getContactById]);

  // Fix: changed parameter name from product to productToAdd to avoid conflict
  const addItemToOrder = (productToAdd = null) => {
    if (productToAdd) {
      const orderItem: OrderItem = {
        id: Math.random().toString(36).substring(2, 9),
        productId: productToAdd.id,
        code: productToAdd.code,
        description: productToAdd.description,
        price: productToAdd.price,
        quantity: productToAdd.caseQuantity || 1,
        vat: productToAdd.vat || settings.defaultVatRate,
        subtotal: productToAdd.price * (productToAdd.caseQuantity || 1),
        product: productToAdd as any
      };

      setOrderItems(prev => [...prev, orderItem]);
      return;
    }

    if (!newItem.code || !newItem.description || newItem.price <= 0 || newItem.quantity <= 0) {
      toast({
        title: "Invalid item",
        description: "Please fill all the required fields",
        variant: "destructive",
      });
      return;
    }

    const foundProduct = getProductByCode(newItem.code) || {
      id: Math.random().toString(36).substring(2, 9),
      code: newItem.code,
      description: newItem.description,
      price: newItem.price,
      cost: newItem.price * 0.7,
      vat: newItem.vat,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const newOrderItem: OrderItem = {
      id: Math.random().toString(36).substring(2, 9),
      productId: foundProduct.id,
      code: newItem.code,
      description: newItem.description,
      price: newItem.price,
      quantity: newItem.quantity,
      vat: newItem.vat,
      subtotal: newItem.price * newItem.quantity,
      product: foundProduct as any
    };

    setOrderItems(prev => [...prev, newOrderItem]);
    
    setNewItem({
      code: "",
      description: "",
      price: 0,
      quantity: 1,
      vat: settings.defaultVatRate
    });
  };

  const handleProductSelected = (product, quantity) => {
    const orderItem: OrderItem = {
      id: Math.random().toString(36).substring(2, 9),
      productId: product.id,
      code: product.code,
      description: product.description,
      price: product.price,
      quantity: quantity,
      vat: product.vat || settings.defaultVatRate,
      subtotal: product.price * quantity,
      product: product as any
    };

    setOrderItems(prev => [...prev, orderItem]);
  };

  const removeItem = (index: number) => {
    setOrderItems(prev => prev.filter((_, i) => i !== index));
  };

  // New function to update an order item
  const updateOrderItem = (index: number, field: string, value: any) => {
    setOrderItems(prev => {
      const updatedItems = [...prev];
      const item = { ...updatedItems[index] };
      
      // Update the specified field
      item[field] = value;
      
      // Recalculate subtotal if price or quantity changes
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
${settings.companyName}
${settings.companyPhone}
${settings.companyEmail}`;
  };

  const handleEmailDialogOpen = () => {
    const contact = getContactById(form.getValues("contactId"));
    
    if (!contact?.email) {
      toast({
        title: "No email address",
        description: "The selected contact doesn't have an email address",
        variant: "destructive",
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
      toast({
        title: "Save Required",
        description: "Please save the order before sending email",
        variant: "destructive",
      });
      return;
    }
    
    setIsSendingEmail(true);
    
    try {
      const success = await sendOrderEmail(
        order.id,
        emailData.recipient,
        emailData.subject,
        emailData.message
      );
      
      if (success) {
        toast({
          title: "Email Sent",
          description: `Order sent to ${emailData.recipient}`,
        });
        setIsEmailDialogOpen(false);
      } else {
        throw new Error("Failed to send email");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send email",
        variant: "destructive",
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const onSubmit = async (data: OrderFormValues) => {
    if (orderItems.length === 0) {
      return toast({
        title: "Error",
        description: "Please add at least one item to the order",
        variant: "destructive",
      });
    }
    
    setIsSubmitting(true);
    
    try {
      const orderData: Omit<Order, "id" | "createdAt" | "updatedAt"> = {
        contactId: data.contactId,
        date: data.date,
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
        updateOrder(order.id, orderData);
        toast({
          title: "Success",
          description: "Order updated successfully",
        });
      } else {
        addOrder(orderData);
        toast({
          title: "Success",
          description: "Order created successfully",
        });
      }
      navigate("/orders");
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
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
                        <Input 
                          type="number" 
                          min="1" 
                          step="1"
                          value={item.quantity}
                          onChange={(e) => updateOrderItem(index, 'quantity', parseInt(e.target.value) || 1)}
                          className="p-1 h-7 text-sm text-right"
                        />
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
                  
                  <tr className="bg-muted/50">
                    <td colSpan={7} className="px-4 py-3">
                      <ProductSelector 
                        onProductSelected={handleProductSelected}
                        onTabSuccess={() => {}}
                      />
                    </td>
                  </tr>
                  
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
    </div>
  );
};

export default OrderForm;
