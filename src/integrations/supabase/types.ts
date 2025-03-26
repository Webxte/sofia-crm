export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      contacts: {
        Row: {
          address: string | null
          agent_id: string | null
          agent_name: string | null
          company: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          mobile: string | null
          notes: string | null
          phone: string | null
          position: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          agent_id?: string | null
          agent_name?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          mobile?: string | null
          notes?: string | null
          phone?: string | null
          position?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          agent_id?: string | null
          agent_name?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          mobile?: string | null
          notes?: string | null
          phone?: string | null
          position?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      meetings: {
        Row: {
          agent_id: string | null
          agent_name: string | null
          contact_id: string
          created_at: string
          date: string
          follow_up_date: string | null
          follow_up_notes: string | null
          follow_up_scheduled: boolean
          follow_up_time: string | null
          id: string
          location: string | null
          next_steps: string[] | null
          notes: string
          time: string
          type: string
          updated_at: string
        }
        Insert: {
          agent_id?: string | null
          agent_name?: string | null
          contact_id: string
          created_at?: string
          date: string
          follow_up_date?: string | null
          follow_up_notes?: string | null
          follow_up_scheduled?: boolean
          follow_up_time?: string | null
          id?: string
          location?: string | null
          next_steps?: string[] | null
          notes: string
          time: string
          type: string
          updated_at?: string
        }
        Update: {
          agent_id?: string | null
          agent_name?: string | null
          contact_id?: string
          created_at?: string
          date?: string
          follow_up_date?: string | null
          follow_up_notes?: string | null
          follow_up_scheduled?: boolean
          follow_up_time?: string | null
          id?: string
          location?: string | null
          next_steps?: string[] | null
          notes?: string
          time?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "meetings_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          code: string
          created_at: string
          description: string
          id: string
          order_id: string
          price: number
          product_id: string
          quantity: number
          subtotal: number
          updated_at: string
          vat: number | null
        }
        Insert: {
          code: string
          created_at?: string
          description: string
          id?: string
          order_id: string
          price: number
          product_id: string
          quantity: number
          subtotal: number
          updated_at?: string
          vat?: number | null
        }
        Update: {
          code?: string
          created_at?: string
          description?: string
          id?: string
          order_id?: string
          price?: number
          product_id?: string
          quantity?: number
          subtotal?: number
          updated_at?: string
          vat?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          agent_id: string | null
          agent_name: string | null
          contact_id: string
          created_at: string
          date: string
          id: string
          notes: string | null
          reference: string | null
          status: string
          terms_and_conditions: string | null
          total: number
          updated_at: string
          vat_total: number | null
        }
        Insert: {
          agent_id?: string | null
          agent_name?: string | null
          contact_id: string
          created_at?: string
          date: string
          id?: string
          notes?: string | null
          reference?: string | null
          status: string
          terms_and_conditions?: string | null
          total: number
          updated_at?: string
          vat_total?: number | null
        }
        Update: {
          agent_id?: string | null
          agent_name?: string | null
          contact_id?: string
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          reference?: string | null
          status?: string
          terms_and_conditions?: string | null
          total?: number
          updated_at?: string
          vat_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          case_quantity: number | null
          code: string
          cost: number
          created_at: string
          description: string
          first_order_commission: number | null
          id: string
          next_orders_commission: number | null
          price: number
          updated_at: string
          vat: number | null
        }
        Insert: {
          case_quantity?: number | null
          code: string
          cost: number
          created_at?: string
          description: string
          first_order_commission?: number | null
          id?: string
          next_orders_commission?: number | null
          price: number
          updated_at?: string
          vat?: number | null
        }
        Update: {
          case_quantity?: number | null
          code?: string
          cost?: number
          created_at?: string
          description?: string
          first_order_commission?: number | null
          id?: string
          next_orders_commission?: number | null
          price?: number
          updated_at?: string
          vat?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          name: string
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          name: string
          role: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          company_address: string | null
          company_email: string | null
          company_name: string | null
          company_phone: string | null
          created_at: string
          default_terms_and_conditions: string | null
          default_vat_rate: number | null
          id: string
          updated_at: string
        }
        Insert: {
          company_address?: string | null
          company_email?: string | null
          company_name?: string | null
          company_phone?: string | null
          created_at?: string
          default_terms_and_conditions?: string | null
          default_vat_rate?: number | null
          id?: string
          updated_at?: string
        }
        Update: {
          company_address?: string | null
          company_email?: string | null
          company_name?: string | null
          company_phone?: string | null
          created_at?: string
          default_terms_and_conditions?: string | null
          default_vat_rate?: number | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          agent_id: string | null
          agent_name: string | null
          contact_id: string | null
          created_at: string
          description: string | null
          due_date: string | null
          due_time: string | null
          id: string
          priority: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          agent_id?: string | null
          agent_name?: string | null
          contact_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          due_time?: string | null
          id?: string
          priority: string
          status: string
          title: string
          updated_at?: string
        }
        Update: {
          agent_id?: string | null
          agent_name?: string | null
          contact_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          due_time?: string | null
          id?: string
          priority?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
