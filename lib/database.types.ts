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
      admin_branch_access: {
        Row: {
          branch_id: string
          created_at: string
          id: string
          role: "branch_manager" | "branch_operator"
          updated_at: string
          user_id: string
        }
        Insert: {
          branch_id: string
          created_at?: string
          id?: string
          role: "branch_manager" | "branch_operator"
          updated_at?: string
          user_id: string
        }
        Update: {
          branch_id?: string
          created_at?: string
          id?: string
          role?: "branch_manager" | "branch_operator"
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_branch_access_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_branch_access_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      admin_profiles: {
        Row: {
          created_at: string
          full_name: string
          is_superadmin: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          full_name?: string
          is_superadmin?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          full_name?: string
          is_superadmin?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      branches: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          online_order_mode: "auto" | "force_closed" | "force_open"
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          online_order_mode?: "auto" | "force_closed" | "force_open"
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          online_order_mode?: "auto" | "force_closed" | "force_open"
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      branch_hours: {
        Row: {
          branch_id: string
          closes_at: string | null
          created_at: string
          id: string
          is_closed: boolean
          opens_at: string | null
          updated_at: string
          weekday: number
        }
        Insert: {
          branch_id: string
          closes_at?: string | null
          created_at?: string
          id?: string
          is_closed?: boolean
          opens_at?: string | null
          updated_at?: string
          weekday: number
        }
        Update: {
          branch_id?: string
          closes_at?: string | null
          created_at?: string
          id?: string
          is_closed?: boolean
          opens_at?: string | null
          updated_at?: string
          weekday?: number
        }
        Relationships: [
          {
            foreignKeyName: "branch_hours_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["slug"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          exclusions: string[]
          id: string
          line_total_usd: number
          line_total_ves: number
          note: string
          order_id: string
          product_id: string
          product_name: string
          quantity: number
          sku: string
          unit_price_usd: number
          unit_price_ves: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          exclusions?: string[]
          id?: string
          line_total_usd: number
          line_total_ves: number
          note?: string
          order_id: string
          product_id: string
          product_name: string
          quantity: number
          sku: string
          unit_price_usd: number
          unit_price_ves: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          exclusions?: string[]
          id?: string
          line_total_usd?: number
          line_total_ves?: number
          note?: string
          order_id?: string
          product_id?: string
          product_name?: string
          quantity?: number
          sku?: string
          unit_price_usd?: number
          unit_price_ves?: number
          updated_at?: string
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
          branch_id: string
          created_at: string
          currency: "USD" | "VES"
          customer_email: string
          customer_name: string
          customer_phone: string | null
          fulfillment_type: "pickup" | "delivery"
          id: string
          notes: string
          status: "draft" | "submitted" | "cancelled"
          subtotal_usd: number
          subtotal_ves: number
          updated_at: string
        }
        Insert: {
          branch_id: string
          created_at?: string
          currency: "USD" | "VES"
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          fulfillment_type: "pickup" | "delivery"
          id?: string
          notes?: string
          status?: "draft" | "submitted" | "cancelled"
          subtotal_usd?: number
          subtotal_ves?: number
          updated_at?: string
        }
        Update: {
          branch_id?: string
          created_at?: string
          currency?: "USD" | "VES"
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          fulfillment_type?: "pickup" | "delivery"
          id?: string
          notes?: string
          status?: "draft" | "submitted" | "cancelled"
          subtotal_usd?: number
          subtotal_ves?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["slug"]
          },
        ]
      }
      products: {
        Row: {
          branch_id: string
          created_at: string
          description: string
          external_id: string
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          online_enabled: boolean
          price_usd: number
          price_ves: number
          sku: string
          stock: number
          updated_at: string
          updated_at_source: string
        }
        Insert: {
          branch_id: string
          created_at?: string
          description?: string
          external_id: string
          id?: string
          image_url?: string | null
          is_active: boolean
          name: string
          online_enabled?: boolean
          price_usd: number
          price_ves: number
          sku: string
          stock: number
          updated_at?: string
          updated_at_source: string
        }
        Update: {
          branch_id?: string
          created_at?: string
          description?: string
          external_id?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          online_enabled?: boolean
          price_usd?: number
          price_ves?: number
          sku?: string
          stock?: number
          updated_at?: string
          updated_at_source?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["slug"]
          },
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
