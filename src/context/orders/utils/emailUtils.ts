
import { supabase } from "@/integrations/supabase/client";

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
