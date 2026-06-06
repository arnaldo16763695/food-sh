import { NextResponse, type NextRequest } from "next/server"

import { getAdminProfile, getAuthenticatedAdminUser } from "@/lib/admin-auth"
import { createAdminUser, type AdminUserBranchRole } from "@/lib/admin-users"

export const runtime = "nodejs"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function parseAssignments(value: unknown) {
  if (!Array.isArray(value)) {
    return []
  }

  return value.flatMap((item) => {
    if (!isRecord(item)) {
      return []
    }

    const branchId = typeof item.branchId === "string" ? item.branchId.trim() : ""
    const role = item.role

    if (!branchId || (role !== "branch_manager" && role !== "branch_operator")) {
      return []
    }

    return {
      branchId,
      role: role as AdminUserBranchRole,
    }
  })
}

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedAdminUser()

  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 })
  }

  const profile = await getAdminProfile(user.id)

  if (!profile?.isSuperadmin) {
    return NextResponse.json({ error: "Solo un superadmin puede gestionar usuarios." }, { status: 403 })
  }

  const body = (await request.json()) as unknown

  if (!isRecord(body)) {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 })
  }

  try {
    const result = await createAdminUser({
      assignments: parseAssignments(body.assignments),
      email: typeof body.email === "string" ? body.email : "",
      fullName: typeof body.fullName === "string" ? body.fullName : "",
      isSuperadmin: body.isSuperadmin === true,
      password: typeof body.password === "string" ? body.password : undefined,
    })

    return NextResponse.json({ data: result })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudo crear el usuario administrativo." },
      { status: 400 },
    )
  }
}
