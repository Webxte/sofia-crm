
// Re-export from hooks/use-toast to avoid circular dependencies
import { useToast, toast } from "@/hooks/use-toast";
export type { Toast } from "@/hooks/use-toast";

export { useToast, toast };
