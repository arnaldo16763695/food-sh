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
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
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
