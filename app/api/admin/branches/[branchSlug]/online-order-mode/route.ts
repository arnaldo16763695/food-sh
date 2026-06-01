import { NextResponse, type NextRequest } from "next/server"

import { getAuthenticatedAdminUser, listAccessibleAdminBranches } from "@/lib/admin-auth"
import { updateBranchOnlineOrderMode } from "@/lib/branch-hours"

type RouteContext = {
  params: Promise<{ branchSlug: string }>
}

export const runtime = "nodejs"

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  ) {
    return (error as { message: string }).message
  }

  return "No se pudo actualizar el modo online."
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const user = await getAuthenticatedAdminUser()

  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 })
  }

  const { branchSlug } = await params
  const accessibleBranches = await listAccessibleAdminBranches(user.id)
  const hasAccess = accessibleBranches.some((branch) => branch.branchSlug === branchSlug)

  if (!hasAccess) {
    return NextResponse.json({ error: "No autorizado para esta sucursal." }, { status: 403 })
  }

  const body = (await request.json()) as { onlineOrderMode?: unknown }

  if (
    body.onlineOrderMode !== "auto" &&
    body.onlineOrderMode !== "force_closed" &&
    body.onlineOrderMode !== "force_open"
  ) {
    return NextResponse.json({ error: "Modo inválido." }, { status: 400 })
  }

  try {
    const result = await updateBranchOnlineOrderMode({
      branchSlug,
      onlineOrderMode: body.onlineOrderMode,
    })

    return NextResponse.json({ data: result })
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 400 },
    )
  }
}
