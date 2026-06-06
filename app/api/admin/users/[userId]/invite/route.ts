import { NextResponse } from "next/server"

import { getAdminProfile, getAuthenticatedAdminUser } from "@/lib/admin-auth"
import { resendAdminAccessSetup } from "@/lib/admin-users"

type RouteContext = {
  params: Promise<{ userId: string }>
}

export const runtime = "nodejs"

export async function POST(_request: Request, { params }: RouteContext) {
  const user = await getAuthenticatedAdminUser()

  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 })
  }

  const profile = await getAdminProfile(user.id)

  if (!profile?.isSuperadmin) {
    return NextResponse.json({ error: "Solo un superadmin puede gestionar usuarios." }, { status: 403 })
  }

  const { userId } = await params

  try {
    const result = await resendAdminAccessSetup(userId)
    return NextResponse.json({ data: result })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudo reenviar el acceso administrativo." },
      { status: 400 },
    )
  }
}
