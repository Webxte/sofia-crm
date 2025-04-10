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
          source: string | null
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
          source?: string | null
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
          source?: string | null
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
          catalog_url: string | null
          company_address: string | null
          company_email: string | null
          company_name: string | null
          company_phone: string | null
          created_at: string
          custom_links: Json | null
          default_contact_email_message: string | null
          default_email_message: string | null
          default_email_subject: string | null
          default_terms_and_conditions: string | null
          default_vat_rate: number | null
          email_footer: string | null
          email_sender_name: string | null
          id: string
          price_list_url: string | null
          terms_enabled: boolean | null
          updated_at: string
        }
        Insert: {
          catalog_url?: string | null
          company_address?: string | null
          company_email?: string | null
          company_name?: string | null
          company_phone?: string | null
          created_at?: string
          custom_links?: Json | null
          default_contact_email_message?: string | null
          default_email_message?: string | null
          default_email_subject?: string | null
          default_terms_and_conditions?: string | null
          default_vat_rate?: number | null
          email_footer?: string | null
          email_sender_name?: string | null
          id?: string
          price_list_url?: string | null
          terms_enabled?: boolean | null
          updated_at?: string
        }
        Update: {
          catalog_url?: string | null
          company_address?: string | null
          company_email?: string | null
          company_name?: string | null
          company_phone?: string | null
          created_at?: string
          custom_links?: Json | null
          default_contact_email_message?: string | null
          default_email_message?: string | null
          default_email_subject?: string | null
          default_terms_and_conditions?: string | null
          default_vat_rate?: number | null
          email_footer?: string | null
          email_sender_name?: string | null
          id?: string
          price_list_url?: string | null
          terms_enabled?: boolean | null
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
