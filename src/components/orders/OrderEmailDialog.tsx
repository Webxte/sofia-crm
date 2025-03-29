
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail } from "lucide-react";
import { useOrders } from "@/context/OrdersContext";
import { useContacts } from "@/context/ContactsContext";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  recipient: z.string().email({ message: "Please enter a valid email address" }),
  cc: z.string().optional().refine(val => !val || val.split(',').every(email => email.trim().match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)), {
    message: "Please enter valid email addresses separated by commas"
  }),
  subject: z.string().min(1, { message: "Subject is required" }),
  message: z.string().min(1, { message: "Message is required" }),
});

interface OrderEmailDialogProps {
  orderId: string;
  customerEmail?: string;
  orderReference?: string;
  trigger?: React.ReactNode;
}

export const OrderEmailDialog = ({ 
  orderId, 
  customerEmail, 
  orderReference,
  trigger 
}: OrderEmailDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [loadingCustomerEmail, setLoadingCustomerEmail] = useState(false);
  const { sendOrderEmail, getOrderById } = useOrders();
  const { getContactById } = useContacts();
  const { toast } = useToast();
  
  // Fetch customer email if not provided
  useEffect(() => {
    const fetchCustomerEmail = async () => {
      if (!customerEmail && open) {
        setLoadingCustomerEmail(true);
        // Get order details
        const order = getOrderById(orderId);
        if (order && order.contactId) {
          // Get contact details
          const contact = getContactById(order.contactId);
          if (contact && contact.email) {
            form.setValue("recipient", contact.email);
          }
        }
        setLoadingCustomerEmail(false);
      }
    };
    
    fetchCustomerEmail();
  }, [orderId, customerEmail, open]);
  
  // Get order reference and generate pre-populated email content
  const order = getOrderById(orderId);
  const reference = orderReference || order?.reference || orderId.slice(0, 8);
  const contact = order ? getContactById(order.contactId) : null;
  const contactName = contact?.fullName || contact?.company || "Customer";
  
  // Generate default message with order details
  const generateDefaultMessage = () => {
    if (!order) return "Please find attached the details of your order. Thank you for your business.";
    
    let message = `Dear ${contactName},\n\n`;
    message += `Your order (Ref: ${reference}) from ${format(new Date(order.date), 'MMMM do, yyyy')} has been processed.\n\n`;
    message += "Order Details:\n";
    
    if (order.items && order.items.length > 0) {
      order.items.forEach(item => {
        message += `${item.quantity} x ${item.code || ''} ${item.description}: ${formatCurrency(item.subtotal || 0)}\n`;
      });
    }
    
    message += `\nTotal: ${formatCurrency(order.total)}\n\n`;
    message += "Thank you for your business.";
    
    return message;
  };
  
  const defaultValues = {
    recipient: customerEmail || "",
    cc: "",
    subject: `Order Confirmation - Ref: ${reference}`,
    message: generateDefaultMessage(),
  };
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSending(true);
      
      // Process CC email addresses
      const ccEmails = values.cc ? 
        values.cc.split(',').map(email => email.trim()).filter(email => email) : 
        [];
      
      const sent = await sendOrderEmail(
        orderId,
        values.recipient,
        values.subject,
        values.message,
        ccEmails
      );
      
      if (sent) {
        toast({
          title: "Email Sent",
          description: `Order details sent to ${values.recipient}`,
        });
        setOpen(false);
        form.reset(defaultValues);
      } else {
        toast({
          title: "Failed to Send Email",
          description: "There was an error sending the email. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error sending email:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Mail className="mr-2 h-4 w-4" /> Send Order Email
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Send Order Email</DialogTitle>
          <DialogDescription>
            Send the order details to the customer or your office.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="recipient"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipient Email</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={loadingCustomerEmail ? "Loading customer email..." : "customer@example.com"} 
                      {...field} 
                      disabled={loadingCustomerEmail}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CC (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="email1@example.com, email2@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea rows={10} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSending}>
                {isSending ? "Sending..." : "Send Email"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

// Helper import
import { format } from "date-fns";
import { formatCurrency } from "@/utils/formatting";
