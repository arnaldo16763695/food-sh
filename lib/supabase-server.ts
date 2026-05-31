import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

import { type Database } from "@/lib/database.types"
import { getRequiredEnv } from "@/lib/supabase"

export async function createSupabaseServerClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    getRequiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // Server Components may read auth state without being able to persist cookie changes.
          }
        },
      },
    },
  )
}
