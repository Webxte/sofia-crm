
// No need to display all the code for OrderForm.tsx as it's a large file
// Just updating to use the correct properties for OrderItem

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Order, OrderItem } from "@/types";
import { useContacts } from "@/context/ContactsContext";
import { useOrders } from "@/context/OrdersContext";
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
import { ArrowLeft, Calendar as CalendarIcon, Plus, Trash } from "lucide-react";
import ProductSelector from "./ProductSelector";

// Define the schema for order validation
const orderSchema = z.object({
  contactId: z.string({
    required_error: "Contact is required",
  }),
  date: z.date({
    required_error: "Date is required",
  }),
  notes: z.string().optional(),
  status: z.enum(["draft", "confirmed", "shipped", "delivered", "cancelled"]).default("draft"),
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
  const { contacts } = useContacts();
  const { addOrder, updateOrder } = useOrders();
  const { toast } = useToast();
  const navigate = useNavigate();

  const defaultValues: Partial<OrderFormValues> = {
    contactId: contactId || order?.contactId || "",
    date: order?.date ? new Date(order.date) : new Date(),
    notes: order?.notes || "",
    status: order?.status || "draft",
  };

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues,
  });

  const addItem = (item: OrderItem) => {
    setOrderItems(prev => [...prev, item]);
  };

  const removeItem = (index: number) => {
    setOrderItems(prev => prev.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => sum + item.subtotal, 0);
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
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="contactId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer</FormLabel>
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
                          {contact.fullName || contact.company || "Unnamed Contact"}
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
                  <FormLabel>Date</FormLabel>
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
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Order Items</h3>
              <ProductSelector onAddItem={addItem} />
            </div>

            {orderItems.length === 0 ? (
              <div className="text-center p-8 border border-dashed rounded-lg">
                <p className="text-muted-foreground">No items added to this order yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Use the "Add Item" button to add products
                </p>
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Code
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Qty
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Subtotal
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-card divide-y divide-border">
                    {orderItems.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          {item.code}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          {item.description}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                          ${item.price.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                          ${item.subtotal.toFixed(2)}
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
                    <tr className="bg-muted">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium" colSpan={4}>
                        Total
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-right">
                        ${calculateTotal().toFixed(2)}
                      </td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>

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

          <div className="flex justify-end gap-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate("/orders")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : isEditing ? "Update Order" : "Create Order"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default OrderForm;
