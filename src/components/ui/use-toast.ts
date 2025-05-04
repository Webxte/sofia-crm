
// Re-export from hooks/use-toast to avoid circular dependencies
import { useToast, toast, Toast } from "@/hooks/use-toast";

export { useToast, toast };
export type { Toast };
