import { createSupabaseAdminClient } from "@/lib/supabase"
import { getAppUrl } from "@/lib/app-url"
import { sendAdminActionEmail } from "@/lib/admin-email"

export type AdminUserBranchRole = "branch_manager" | "branch_operator"

export type AdminUserAssignment = {
  branchId: string
  branchSlug: string
  branchTitle: string
  role: AdminUserBranchRole
}

export type AdminUserRecord = {
  userId: string
  email: string
  fullName: string
  isSuperadmin: boolean
  createdAt: string
  lastSignInAt: string | null
  assignments: AdminUserAssignment[]
}

export type AdminInviteDelivery = "console" | "resend"

export type AdminUserUpsertInput = {
  email: string
  password?: string
  fullName: string
  isSuperadmin: boolean
  assignments: {
    branchId: string
    role: AdminUserBranchRole
  }[]
}

export type AdminUserUpdateInput = {
  userId: string
  fullName: string
  isSuperadmin: boolean
  assignments: {
    branchId: string
    role: AdminUserBranchRole
  }[]
}

type AuthUserSummary = {
  email: string
  id: string
  lastSignInAt: string | null
  userMetadata: Record<string, unknown>
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function normalizeAssignments(assignments: AdminUserUpsertInput["assignments"]) {
  const byBranchId = new Map<string, { branchId: string; role: AdminUserBranchRole }>()

  for (const assignment of assignments) {
    const branchId = assignment.branchId.trim()

    if (!branchId) {
      continue
    }

    byBranchId.set(branchId, {
      branchId,
      role: assignment.role,
    })
  }

  return Array.from(byBranchId.values())
}

async function listAllAuthUsers() {
  const supabase = createSupabaseAdminClient()
  const users: AuthUserSummary[] = []
  let page = 1
  const perPage = 200

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage })

    if (error) {
      throw error
    }

    const pageUsers = data.users.map((user) => ({
      email: user.email?.trim().toLowerCase() ?? "",
      id: user.id,
      lastSignInAt: user.last_sign_in_at ?? null,
      userMetadata:
        typeof user.user_metadata === "object" && user.user_metadata !== null
          ? (user.user_metadata as Record<string, unknown>)
          : {},
    }))

    users.push(...pageUsers)

    if (pageUsers.length < perPage) {
      break
    }

    page += 1
  }

  return users
}

function createTemporaryPassword() {
  return `${crypto.randomUUID()}Aa1!`
}

async function findAuthUserByEmail(email: string) {
  const normalizedEmail = normalizeEmail(email)
  const users = await listAllAuthUsers()
  return users.find((user) => user.email === normalizedEmail) ?? null
}

async function replaceAdminAssignments(userId: string, assignments: AdminUserUpsertInput["assignments"]) {
  const supabase = createSupabaseAdminClient()
  const timestamp = new Date().toISOString()

  const { error: deleteError } = await supabase
    .from("admin_branch_access")
    .delete()
    .eq("user_id", userId)

  if (deleteError) {
    throw deleteError
  }

  if (!assignments.length) {
    return
  }

  const { error: insertError } = await supabase.from("admin_branch_access").insert(
    assignments.map((assignment) => ({
      branch_id: assignment.branchId,
      created_at: timestamp,
      role: assignment.role,
      updated_at: timestamp,
      user_id: userId,
    })),
  )

  if (insertError) {
    throw insertError
  }
}

async function generateAdminAccessLink(email: string) {
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase.auth.admin.generateLink({
    type: "recovery",
    email,
    options: {
      redirectTo: `${getAppUrl()}/admin/setup-password`,
    },
  })

  if (error || !data.properties.action_link) {
    throw new Error(error?.message ?? "No se pudo generar el enlace de acceso administrativo.")
  }

  return data.properties.action_link
}

async function updateAuthUserMetadata(userId: string, fullName: string, userMetadata: Record<string, unknown>) {
  const supabase = createSupabaseAdminClient()
  const { error } = await supabase.auth.admin.updateUserById(userId, {
    user_metadata: {
      ...userMetadata,
      full_name: fullName,
    },
  })

  if (error) {
    throw error
  }
}

async function saveAdminProfile({
  userId,
  fullName,
  isSuperadmin,
}: {
  userId: string
  fullName: string
  isSuperadmin: boolean
}) {
  const supabase = createSupabaseAdminClient()
  const timestamp = new Date().toISOString()
  const { data: existingProfile, error: existingProfileError } = await supabase
    .from("admin_profiles")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle()

  if (existingProfileError) {
    throw existingProfileError
  }

  if (existingProfile) {
    const { error } = await supabase
      .from("admin_profiles")
      .update({
        full_name: fullName,
        is_superadmin: isSuperadmin,
        updated_at: timestamp,
      })
      .eq("user_id", userId)

    if (error) {
      throw error
    }

    return
  }

  const { error } = await supabase.from("admin_profiles").insert({
    created_at: timestamp,
    full_name: fullName,
    is_superadmin: isSuperadmin,
    updated_at: timestamp,
    user_id: userId,
  })

  if (error) {
    throw error
  }
}

export async function listAdminUsers(): Promise<AdminUserRecord[]> {
  const supabase = createSupabaseAdminClient()
  const [{ data: profiles, error: profilesError }, { data: accessRows, error: accessError }, { data: branches, error: branchesError }, authUsers] = await Promise.all([
    supabase
      .from("admin_profiles")
      .select("user_id, full_name, is_superadmin, created_at")
      .order("full_name", { ascending: true }),
    supabase.from("admin_branch_access").select("user_id, branch_id, role"),
    supabase.from("branches").select("id, slug, name").order("name", { ascending: true }),
    listAllAuthUsers(),
  ])

  if (profilesError) {
    throw profilesError
  }

  if (accessError) {
    throw accessError
  }

  if (branchesError) {
    throw branchesError
  }

  const authUserMap = new Map(authUsers.map((user) => [user.id, user]))
  const branchMap = new Map(branches.map((branch) => [branch.id, branch]))
  const assignmentsByUserId = new Map<string, AdminUserAssignment[]>()

  for (const row of accessRows) {
    const branch = branchMap.get(row.branch_id)

    if (!branch) {
      continue
    }

    const current = assignmentsByUserId.get(row.user_id) ?? []
    current.push({
      branchId: branch.id,
      branchSlug: branch.slug,
      branchTitle: branch.name,
      role: row.role,
    })
    assignmentsByUserId.set(row.user_id, current)
  }

  return profiles.map((profile) => {
    const authUser = authUserMap.get(profile.user_id)

    return {
      userId: profile.user_id,
      email: authUser?.email ?? "",
      fullName: profile.full_name,
      isSuperadmin: profile.is_superadmin,
      createdAt: profile.created_at,
      lastSignInAt: authUser?.lastSignInAt ?? null,
      assignments: (assignmentsByUserId.get(profile.user_id) ?? []).sort((a, b) =>
        a.branchTitle.localeCompare(b.branchTitle, "es"),
      ),
    }
  })
}

export async function createAdminUser(input: AdminUserUpsertInput) {
  const supabase = createSupabaseAdminClient()
  const email = normalizeEmail(input.email)
  const fullName = input.fullName.trim()

  if (!email || !fullName) {
    throw new Error("Debes indicar correo y nombre completo.")
  }

  const assignments = input.isSuperadmin ? [] : normalizeAssignments(input.assignments)
  let authUser = await findAuthUserByEmail(email)

  if (!authUser) {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      email_confirm: true,
      password: input.password && input.password.length >= 8 ? input.password : createTemporaryPassword(),
      user_metadata: {
        full_name: fullName,
      },
    })

    if (error || !data.user) {
      throw new Error(error?.message ?? "No se pudo crear el usuario en autenticación.")
    }

    authUser = {
      email,
      id: data.user.id,
      lastSignInAt: data.user.last_sign_in_at ?? null,
      userMetadata:
        typeof data.user.user_metadata === "object" && data.user.user_metadata !== null
          ? (data.user.user_metadata as Record<string, unknown>)
          : {},
    }
  } else {
    await updateAuthUserMetadata(authUser.id, fullName, authUser.userMetadata)
  }

  await saveAdminProfile({
    fullName,
    isSuperadmin: input.isSuperadmin,
    userId: authUser.id,
  })
  await replaceAdminAssignments(authUser.id, assignments)

  const actionUrl = await generateAdminAccessLink(email)
  const delivery = await sendAdminActionEmail({
    actionUrl,
    subject: "Activa tu acceso administrativo en Shanghaipf",
    to: email,
  })

  return {
    deliveryMethod: delivery.deliveryMethod as AdminInviteDelivery,
  }
}

export async function updateAdminUser(input: AdminUserUpdateInput) {
  const supabase = createSupabaseAdminClient()
  const fullName = input.fullName.trim()

  if (!fullName) {
    throw new Error("Debes indicar el nombre completo.")
  }

  const authUsers = await listAllAuthUsers()
  const authUser = authUsers.find((user) => user.id === input.userId)

  if (!authUser) {
    throw new Error("No se encontró el usuario en autenticación.")
  }

  await updateAuthUserMetadata(authUser.id, fullName, authUser.userMetadata)

  const assignments = input.isSuperadmin ? [] : normalizeAssignments(input.assignments)
  const timestamp = new Date().toISOString()
  const { error: profileError } = await supabase
    .from("admin_profiles")
    .update({
      full_name: fullName,
      is_superadmin: input.isSuperadmin,
      updated_at: timestamp,
    })
    .eq("user_id", input.userId)

  if (profileError) {
    throw profileError
  }

  await replaceAdminAssignments(input.userId, assignments)
}

export async function resendAdminAccessSetup(userId: string) {
  const authUsers = await listAllAuthUsers()
  const authUser = authUsers.find((user) => user.id === userId)

  if (!authUser?.email) {
    throw new Error("No se encontró un correo válido para este usuario.")
  }

  const actionUrl = await generateAdminAccessLink(authUser.email)
  const delivery = await sendAdminActionEmail({
    actionUrl,
    subject: "Configura tu acceso administrativo en Shanghaipf",
    to: authUser.email,
  })

  return {
    deliveryMethod: delivery.deliveryMethod as AdminInviteDelivery,
  }
}
