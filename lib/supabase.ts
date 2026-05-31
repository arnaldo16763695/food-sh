import { createClient } from "@supabase/supabase-js"

import { type Database } from "@/lib/database.types"

type SupabaseKey = "NEXT_PUBLIC_SUPABASE_ANON_KEY" | "SUPABASE_SERVICE_ROLE_KEY"

export function getRequiredEnv(name: "NEXT_PUBLIC_SUPABASE_URL" | SupabaseKey) {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

function createSupabaseClient(keyName: SupabaseKey) {
  return createClient<Database>(
    getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    getRequiredEnv(keyName),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  )
}

export function createSupabasePublicClient() {
  return createSupabaseClient("NEXT_PUBLIC_SUPABASE_ANON_KEY")
}

export function createSupabaseAdminClient() {
  return createSupabaseClient("SUPABASE_SERVICE_ROLE_KEY")
}
