import { NextResponse, type NextRequest } from "next/server"

import { getAdminProfile, getAuthenticatedAdminUser } from "@/lib/admin-auth"
import { type AdminUserBranchRole, updateAdminUser } from "@/lib/admin-users"

type RouteContext = {
  params: Promise<{ userId: string }>
}

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

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const user = await getAuthenticatedAdminUser()

  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 })
  }

  const profile = await getAdminProfile(user.id)

  if (!profile?.isSuperadmin) {
    return NextResponse.json({ error: "Solo un superadmin puede gestionar usuarios." }, { status: 403 })
  }

  const { userId } = await params
  const body = (await request.json()) as unknown

  if (!isRecord(body)) {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 })
  }

  try {
    await updateAdminUser({
      assignments: parseAssignments(body.assignments),
      fullName: typeof body.fullName === "string" ? body.fullName : "",
      isSuperadmin: body.isSuperadmin === true,
      userId,
    })

    return NextResponse.json({ data: { ok: true } })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudo actualizar el usuario administrativo." },
      { status: 400 },
    )
  }
}
