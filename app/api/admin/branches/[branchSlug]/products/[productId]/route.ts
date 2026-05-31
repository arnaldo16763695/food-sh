import { NextResponse, type NextRequest } from "next/server"

import { getAuthenticatedAdminUser, listAccessibleAdminBranches } from "@/lib/admin-auth"
import { updateAdminProduct } from "@/lib/catalog-store"

type RouteContext = {
  params: Promise<{ branchSlug: string; productId: string }>
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

export const runtime = "nodejs"

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const user = await getAuthenticatedAdminUser()

  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 })
  }

  const { branchSlug, productId } = await params
  const accessibleBranches = await listAccessibleAdminBranches(user.id)
  const hasAccess = accessibleBranches.some((branch) => branch.branchSlug === branchSlug)

  if (!hasAccess) {
    return NextResponse.json({ error: "No autorizado para esta sucursal." }, { status: 403 })
  }

  const body = (await request.json()) as unknown

  if (!isRecord(body) || typeof body.description !== "string" || typeof body.onlineEnabled !== "boolean") {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 })
  }

  try {
    const product = await updateAdminProduct({
      branchId: branchSlug,
      productId,
      description: body.description.trim(),
      onlineEnabled: body.onlineEnabled,
    })

    return NextResponse.json({ data: product })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudo actualizar el producto." },
      { status: 400 },
    )
  }
}
