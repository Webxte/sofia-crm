
// Simple re-export from hooks/use-toast to avoid circular dependencies
import * as React from "react";

// Forward export - be explicit about what we're exporting
export { toast, useToast, type Toast } from "@/hooks/use-toast";
