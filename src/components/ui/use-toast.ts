
// Re-export everything from the main implementation
import { toast, useToast } from "@/hooks/use-toast";
import type { ToasterToast, ToastProps } from "@/hooks/use-toast";

// Re-export these types and functions
export { toast, useToast };
export type { ToasterToast, ToastProps };
