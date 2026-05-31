import { redirect } from "next/navigation"

import { createSupabaseAdminClient } from "@/lib/supabase"
import { createSupabaseServerClient } from "@/lib/supabase-server"

export type AdminBranchAccess = {
  branchId: string
  branchSlug: string
  branchTitle: string
  role: "superadmin" | "branch_manager" | "branch_operator"
}

type AdminProfile = {
  fullName: string
  isSuperadmin: boolean
  userId: string
}

function buildLoginUrl(nextPath: string, error?: string) {
  const params = new URLSearchParams({ next: nextPath })
  if (error) {
    params.set("error", error)
  }

  return `/admin/login?${params.toString()}`
}

export async function getAuthenticatedAdminUser() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user
}

export async function getAdminProfile(userId: string): Promise<AdminProfile | null> {
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from("admin_profiles")
    .select("user_id, full_name, is_superadmin")
    .eq("user_id", userId)
    .maybeSingle()

  if (error) {
    throw error
  }

  if (!data) {
    return null
  }

  return {
    fullName: data.full_name,
    isSuperadmin: data.is_superadmin,
    userId: data.user_id,
  }
}

export async function listAccessibleAdminBranches(userId: string): Promise<AdminBranchAccess[]> {
  const supabase = createSupabaseAdminClient()
  const profile = await getAdminProfile(userId)

  if (!profile) {
    return []
  }

  if (profile.isSuperadmin) {
    const { data, error } = await supabase
      .from("branches")
      .select("id, slug, name")
      .eq("is_active", true)
      .order("name", { ascending: true })

    if (error) {
      throw error
    }

    return data.map((branch) => ({
      branchId: branch.id,
      branchSlug: branch.slug,
      branchTitle: branch.name,
      role: "superadmin",
    }))
  }

  const { data: accessRows, error: accessError } = await supabase
    .from("admin_branch_access")
    .select("branch_id, role")
    .eq("user_id", userId)

  if (accessError) {
    throw accessError
  }

  if (!accessRows.length) {
    return []
  }

  const branchIds = accessRows.map((row) => row.branch_id)
  const { data: branchRows, error: branchesError } = await supabase
    .from("branches")
    .select("id, slug, name")
    .in("id", branchIds)
    .eq("is_active", true)

  if (branchesError) {
    throw branchesError
  }

  const branchMap = new Map(branchRows.map((branch) => [branch.id, branch]))

  return accessRows.flatMap((row) => {
    const branch = branchMap.get(row.branch_id)

    if (!branch) {
      return []
    }

    return {
      branchId: branch.id,
      branchSlug: branch.slug,
      branchTitle: branch.name,
      role: row.role,
    }
  })
}

export async function requireAdminSession(nextPath: string) {
  const user = await getAuthenticatedAdminUser()

  if (!user) {
    redirect(buildLoginUrl(nextPath))
  }

  const profile = await getAdminProfile(user.id)

  if (!profile) {
    redirect(buildLoginUrl(nextPath, "no-admin-access"))
  }

  return {
    profile,
    user,
  }
}

export async function requireAdminBranchAccess(branchSlug: string) {
  const { profile, user } = await requireAdminSession(`/admin/${branchSlug}`)
  const accessibleBranches = await listAccessibleAdminBranches(user.id)
  const currentBranch = accessibleBranches.find((branch) => branch.branchSlug === branchSlug)

  if (!currentBranch) {
    redirect("/admin?error=branch-access")
  }

  return {
    accessibleBranches,
    currentBranch,
    profile,
    user,
  }
}
