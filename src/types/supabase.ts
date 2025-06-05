
// Supabase-specific types for database operations
import { Database } from "@/integrations/supabase/types";

// Export database types for easy access
export type Tables = Database["public"]["Tables"];
export type TablesInsert<T extends keyof Tables> = Tables[T]["Insert"];
export type TablesUpdate<T extends keyof Tables> = Tables[T]["Update"];
export type TablesRow<T extends keyof Tables> = Tables[T]["Row"];

// Specific table row types
export type ContactRow = TablesRow<"contacts">;
export type MeetingRow = TablesRow<"meetings">;
export type TaskRow = TablesRow<"tasks">;
export type OrderRow = TablesRow<"orders">;
export type OrderItemRow = TablesRow<"order_items">;
export type ProductRow = TablesRow<"products">;
export type SettingsRow = TablesRow<"settings">;
export type AnalyticsEventRow = TablesRow<"analytics_events">;

// Insert types
export type ContactInsert = TablesInsert<"contacts">;
export type MeetingInsert = TablesInsert<"meetings">;
export type TaskInsert = TablesInsert<"tasks">;
export type OrderInsert = TablesInsert<"orders">;
export type OrderItemInsert = TablesInsert<"order_items">;
export type ProductInsert = TablesInsert<"products">;
export type SettingsInsert = TablesInsert<"settings">;
export type AnalyticsEventInsert = TablesInsert<"analytics_events">;

// Update types
export type ContactUpdate = TablesUpdate<"contacts">;
export type MeetingUpdate = TablesUpdate<"meetings">;
export type TaskUpdate = TablesUpdate<"tasks">;
export type OrderUpdate = TablesUpdate<"orders">;
export type OrderItemUpdate = TablesUpdate<"order_items">;
export type ProductUpdate = TablesUpdate<"products">;
export type SettingsUpdate = TablesUpdate<"settings">;
export type AnalyticsEventUpdate = TablesUpdate<"analytics_events">;

// Database function types
export interface DatabaseFunctions {
  get_current_user_role: {
    Args: Record<PropertyKey, never>;
    Returns: string;
  };
}

// RPC function call types
export type RpcCall<T extends keyof DatabaseFunctions> = {
  fn: T;
  args: DatabaseFunctions[T]["Args"];
};

// Query result types
export interface QueryResult<T> {
  data: T | null;
  error: Error | null;
  count?: number;
}

export interface QueryListResult<T> {
  data: T[] | null;
  error: Error | null;
  count?: number;
}

// Subscription types
export interface RealtimeSubscription {
  channel: string;
  event: "INSERT" | "UPDATE" | "DELETE";
  schema: "public";
  table: string;
  filter?: string;
}

export interface RealtimePayload<T = any> {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new: T;
  old: T;
  errors: string[] | null;
}
