import { NextResponse, type NextRequest } from "next/server"

import { buildCustomerAuthUrl } from "@/lib/customer-auth"
import { createSupabaseServerClient } from "@/lib/supabase-server"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const tokenHash = requestUrl.searchParams.get("token_hash")
  const type = requestUrl.searchParams.get("type")
  const nextPath = requestUrl.searchParams.get("next") ?? "/"

  if (!tokenHash || !type) {
    const redirectUrl = new URL(buildCustomerAuthUrl(nextPath), request.url)
    redirectUrl.searchParams.set("error", "confirmation-link")
    return NextResponse.redirect(redirectUrl)
  }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: type as "email" | "recovery" | "invite" | "email_change" | "magiclink",
  })

  if (error) {
    const redirectUrl = new URL(buildCustomerAuthUrl(nextPath), request.url)
    redirectUrl.searchParams.set("error", "confirmation-link")
    return NextResponse.redirect(redirectUrl)
  }

  const redirectUrl = new URL(nextPath, request.url)
  redirectUrl.searchParams.set("message", "email-confirmed")
  return NextResponse.redirect(redirectUrl)
}
