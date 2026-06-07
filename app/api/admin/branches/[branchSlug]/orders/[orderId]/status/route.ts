import { NextResponse, type NextRequest } from "next/server"

import { getAuthenticatedAdminUser, listAccessibleAdminBranches } from "@/lib/admin-auth"
import { updateAdminOrderStatus } from "@/lib/orders"

type RouteContext = {
  params: Promise<{ branchSlug: string; orderId: string }>
}

export const runtime = "nodejs"

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const user = await getAuthenticatedAdminUser()

  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 })
  }

  const { branchSlug, orderId } = await params
  const accessibleBranches = await listAccessibleAdminBranches(user.id)
  const hasAccess = accessibleBranches.some((branch) => branch.branchSlug === branchSlug)

  if (!hasAccess) {
    return NextResponse.json({ error: "No autorizado para esta sucursal." }, { status: 403 })
  }

  const body = (await request.json()) as { status?: unknown }

  if (body.status !== "submitted" && body.status !== "cancelled") {
    return NextResponse.json({ error: "Estado inválido." }, { status: 400 })
  }

  try {
    const result = await updateAdminOrderStatus({
      branchSlug,
      orderId,
      status: body.status,
    })

    if (!result) {
      return NextResponse.json({ error: "Pedido no encontrado." }, { status: 404 })
    }

    return NextResponse.json({ data: result })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudo actualizar el estado del pedido." },
      { status: 400 },
    )
  }
}
