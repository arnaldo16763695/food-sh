import { NextResponse, type NextRequest } from "next/server"

import { getAuthenticatedAdminUser, listAccessibleAdminBranches } from "@/lib/admin-auth"
import { uploadProductImage } from "@/lib/storage"

type RouteContext = {
  params: Promise<{ branchSlug: string; productId: string }>
}

export const runtime = "nodejs"

export async function POST(request: NextRequest, { params }: RouteContext) {
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

  const formData = await request.formData()
  const image = formData.get("image")

  if (!(image instanceof File)) {
    return NextResponse.json({ error: "Debes adjuntar una imagen válida." }, { status: 400 })
  }

  try {
    const result = await uploadProductImage({
      branchSlug,
      productId,
      file: image,
    })

    return NextResponse.json({ data: result })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "No se pudo subir la imagen.",
      },
      { status: 400 },
    )
  }
}
