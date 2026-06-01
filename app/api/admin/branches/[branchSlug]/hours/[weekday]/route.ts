import { NextResponse, type NextRequest } from "next/server"

import { getAuthenticatedAdminUser, listAccessibleAdminBranches } from "@/lib/admin-auth"
import { upsertAdminBranchHour } from "@/lib/branch-hours"

type RouteContext = {
  params: Promise<{ branchSlug: string; weekday: string }>
}

function isValidTime(value: unknown): value is string {
  return typeof value === "string" && /^\d{2}:\d{2}$/.test(value)
}

export const runtime = "nodejs"

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const user = await getAuthenticatedAdminUser()

  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 })
  }

  const { branchSlug, weekday: weekdayParam } = await params
  const weekday = Number.parseInt(weekdayParam, 10)

  if (!Number.isInteger(weekday) || weekday < 0 || weekday > 6) {
    return NextResponse.json({ error: "Día inválido." }, { status: 400 })
  }

  const accessibleBranches = await listAccessibleAdminBranches(user.id)
  const hasAccess = accessibleBranches.some((branch) => branch.branchSlug === branchSlug)

  if (!hasAccess) {
    return NextResponse.json({ error: "No autorizado para esta sucursal." }, { status: 403 })
  }

  const body = (await request.json()) as {
    opensAt?: unknown
    closesAt?: unknown
    isClosed?: unknown
  }

  if (typeof body.isClosed !== "boolean") {
    return NextResponse.json({ error: "Estado inválido." }, { status: 400 })
  }

  if (!body.isClosed && (!isValidTime(body.opensAt) || !isValidTime(body.closesAt))) {
    return NextResponse.json({ error: "Debes indicar hora de apertura y cierre válidas." }, { status: 400 })
  }

  try {
    const result = await upsertAdminBranchHour({
      branchSlug,
      weekday,
      opensAt: body.isClosed ? null : (body.opensAt as string),
      closesAt: body.isClosed ? null : (body.closesAt as string),
      isClosed: body.isClosed,
    })

    return NextResponse.json({ data: result })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudo guardar el horario." },
      { status: 400 },
    )
  }
}
