
import * as React from "react";

// Correctly re-export everything from the main implementation
import { toast, useToast, type ToasterToast, type ToastProps } from "@/hooks/use-toast";

// Re-export these types and functions
export { toast, useToast };
export type { ToasterToast, ToastProps };
