
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const sendOrderEmail = async (
  orderId: string, 
  recipient: string, 
  subject: string, 
  message: string,
  cc?: string[]
): Promise<boolean> => {
  try {
    console.log("Sending order email with params:", {
      orderId,
      recipient,
      subject,
      message,
      cc: cc || []
    });
    
    // Make sure we have valid data
    if (!orderId || !recipient || !subject) {
      console.error("Missing required parameters for sending email");
      return false;
    }
    
    // Call the edge function to send the email
    const { data, error } = await supabase.functions.invoke("send-order-email", {
      body: {
        orderId,
        recipient,
        subject,
        message,
        includeOrderDetails: true,
        cc: cc || []
      }
    });

    if (error) {
      console.error("Error sending order email:", error);
      return false;
    }

    console.log("Email sent successfully:", data);
    return true;
  } catch (error) {
    console.error("Unexpected error sending order email:", error);
    return false;
  }
};

// Export a React hook for easier access to the email functionality
export const useOrderEmail = () => {
  const { toast } = useToast();
  
  const sendEmail = async (
    orderId: string,
    recipient: string,
    subject: string,
    message: string,
    cc?: string[]
  ) => {
    try {
      const success = await sendOrderEmail(orderId, recipient, subject, message, cc);
      
      if (success) {
        toast({
          title: "Email Sent",
          description: "The order email was sent successfully",
        });
        return true;
      } else {
        toast({
          title: "Email Failed",
          description: "Failed to send the order email. Please try again.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("Error in sendEmail:", error);
      toast({
        title: "Email Error",
        description: "An unexpected error occurred while sending the email",
        variant: "destructive",
      });
      return false;
    }
  };
  
  return { sendEmail };
};
