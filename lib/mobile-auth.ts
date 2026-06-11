import { type User } from "@supabase/supabase-js"
import { type NextRequest } from "next/server"

import {
  getCustomerProfileByUserId,
  isCustomerProfileComplete,
  type CustomerProfile,
} from "@/lib/customer-auth"
import { createSupabasePublicClient } from "@/lib/supabase"

export type MobileCustomerAccessState =
  | {
      status: "guest"
      user: null
      profile: null
      accessToken: null
    }
  | {
      status: "unconfirmed" | "needs-profile"
      user: User
      profile: CustomerProfile | null
      accessToken: string
    }
  | {
      status: "ready"
      user: User
      profile: CustomerProfile
      accessToken: string
    }

function getBearerToken(request: NextRequest) {
  const authorization = request.headers.get("authorization")

  if (!authorization?.startsWith("Bearer ")) {
    return null
  }

  const token = authorization.slice("Bearer ".length).trim()
  return token || null
}

export async function getMobileCustomerAccessState(
  request: NextRequest,
): Promise<MobileCustomerAccessState> {
  const accessToken = getBearerToken(request)

  if (!accessToken) {
    return {
      status: "guest",
      user: null,
      profile: null,
      accessToken: null,
    }
  }

  const supabase = createSupabasePublicClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(accessToken)

  if (error || !user) {
    return {
      status: "guest",
      user: null,
      profile: null,
      accessToken: null,
    }
  }

  const profile = await getCustomerProfileByUserId(user.id)

  if (!user.email_confirmed_at) {
    return {
      status: "unconfirmed",
      user,
      profile,
      accessToken,
    }
  }

  if (!isCustomerProfileComplete(profile)) {
    return {
      status: "needs-profile",
      user,
      profile,
      accessToken,
    }
  }

  return {
    status: "ready",
    user,
    profile: profile!,
    accessToken,
  }
}
