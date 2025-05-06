
// Import React fully and explicitly
import * as React from "react";

// Forward export - be explicit about what we're exporting
// Using a more explicit approach to avoid any circular dependencies
import { toast, useToast, type Toast } from "@/hooks/use-toast";

// Re-export the imports to maintain compatibility
export { toast, useToast, type Toast };
