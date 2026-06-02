import { redirect } from "next/navigation"
import { type User } from "@supabase/supabase-js"

import { createSupabaseServerClient } from "@/lib/supabase-server"

export type CustomerProfile = {
  userId: string
  fullName: string
  phone: string
}

export type CustomerAccessState =
  | {
      status: "guest"
      user: null
      profile: null
    }
  | {
      status: "unconfirmed" | "needs-profile"
      user: User
      profile: CustomerProfile | null
    }
  | {
      status: "ready"
      user: User
      profile: CustomerProfile
    }

export type ReadyCustomerAccessState = Extract<CustomerAccessState, { status: "ready" }>

type CustomerAuthError = "auth-required" | "email-not-confirmed" | "profile-incomplete"

function isCustomerProfileComplete(profile: CustomerProfile | null) {
  return Boolean(profile?.fullName.trim()) && Boolean(profile?.phone.trim())
}

export function buildCustomerAuthUrl(nextPath: string, error?: CustomerAuthError) {
  const params = new URLSearchParams({ next: nextPath })

  if (error) {
    params.set("error", error)
  }

  return `/tienda/auth?${params.toString()}`
}

export async function getAuthenticatedCustomerUser() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user
}

export async function getCustomerProfile(userId: string): Promise<CustomerProfile | null> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("customer_profiles")
    .select("user_id, full_name, phone")
    .eq("user_id", userId)
    .maybeSingle()

  if (error) {
    throw error
  }

  if (!data) {
    return null
  }

  return {
    userId: data.user_id,
    fullName: data.full_name,
    phone: data.phone,
  }
}

export async function getCustomerAccessState(): Promise<CustomerAccessState> {
  const user = await getAuthenticatedCustomerUser()

  if (!user) {
    return {
      status: "guest",
      user: null,
      profile: null,
    }
  }

  const profile = await getCustomerProfile(user.id)

  if (!user.email_confirmed_at) {
    return {
      status: "unconfirmed",
      user,
      profile,
    }
  }

  if (!isCustomerProfileComplete(profile)) {
    return {
      status: "needs-profile",
      user,
      profile,
    }
  }

  return {
    status: "ready",
    user,
    profile: profile!,
  }
}

export async function requireReadyCustomerAccess(nextPath: string): Promise<ReadyCustomerAccessState> {
  const access = await getCustomerAccessState()

  if (access.status === "guest") {
    redirect(buildCustomerAuthUrl(nextPath, "auth-required"))
  }

  if (access.status === "unconfirmed") {
    redirect(buildCustomerAuthUrl(nextPath, "email-not-confirmed"))
  }

  if (access.status === "needs-profile") {
    redirect(buildCustomerAuthUrl(nextPath, "profile-incomplete"))
  }

  return access as ReadyCustomerAccessState
}
