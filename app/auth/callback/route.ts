import { NextResponse, type NextRequest } from "next/server"

import { buildCustomerAuthUrl } from "@/lib/customer-auth"
import { createSupabaseServerClient } from "@/lib/supabase-server"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const nextPath = requestUrl.searchParams.get("next") ?? "/"

  if (!code) {
    return NextResponse.redirect(new URL(buildCustomerAuthUrl(nextPath, "auth-required"), request.url))
  }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    const redirectUrl = new URL(buildCustomerAuthUrl(nextPath), request.url)
    redirectUrl.searchParams.set("error", "oauth-callback")
    return NextResponse.redirect(redirectUrl)
  }

  return NextResponse.redirect(new URL(nextPath, request.url))
}
