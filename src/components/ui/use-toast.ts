
// Import React fully and explicitly
import * as React from "react";

// Forward export - be explicit about what we're exporting
// Using a more explicit approach to avoid any circular dependencies
export { toast, useToast } from "@/hooks/use-toast";
export type { Toast } from "@/hooks/use-toast";
