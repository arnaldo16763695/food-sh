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
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
