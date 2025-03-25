
import { useState } from "react";
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
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  recipient: z.string().email({ message: "Please enter a valid email address" }),
  subject: z.string().min(1, { message: "Subject is required" }),
  message: z.string().min(1, { message: "Message is required" }),
});

interface OrderEmailDialogProps {
  orderId: string;
  customerEmail?: string;
  orderReference?: string;
}

export const OrderEmailDialog = ({ orderId, customerEmail, orderReference }: OrderEmailDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { sendOrderEmail } = useOrders();
  const { toast } = useToast();
  
  const defaultValues = {
    recipient: customerEmail || "",
    subject: `Order ${orderReference || orderId.slice(0, 8)}`,
    message: "Please find attached the details of your order. Thank you for your business.",
  };
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSending(true);
      
      const sent = await sendOrderEmail(
        orderId,
        values.recipient,
        values.subject,
        values.message
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
        <Button variant="outline" size="sm">
          <Mail className="mr-2 h-4 w-4" /> Send Order Email
        </Button>
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
                    <Input placeholder="customer@example.com" {...field} />
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
                    <Textarea rows={5} {...field} />
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
