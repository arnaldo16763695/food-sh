import { NextResponse, type NextRequest } from "next/server"

import { getAppUrl } from "@/lib/app-url"
import { sendCustomerActionEmail } from "@/lib/customer-email"
import { createSupabaseAdminClient } from "@/lib/supabase"

export const runtime = "nodejs"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function normalizeNextPath(value: unknown) {
  return typeof value === "string" && value.startsWith("/") ? value : "/"
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as unknown

  if (!isRecord(body)) {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 })
  }

  const email = typeof body.email === "string" ? body.email.trim() : ""
  const nextPath = normalizeNextPath(body.nextPath)

  if (!email) {
    return NextResponse.json({ error: "Debes indicar el correo del cliente." }, { status: 400 })
  }

  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: {
      redirectTo: `${getAppUrl()}/tienda/auth?mode=login&message=email-confirmed&next=${encodeURIComponent(nextPath)}`,
    },
  })

  if (error || !data.properties.action_link) {
    return NextResponse.json(
      {
        error: error?.message ?? "No se pudo generar el enlace de acceso.",
      },
      { status: 400 },
    )
  }

  const result = await sendCustomerActionEmail({
    actionUrl: data.properties.action_link,
    subject: "Tu enlace de acceso a Shanghaipf",
    to: email,
  })

  return NextResponse.json({
    data: {
      deliveryMethod: result.deliveryMethod,
    },
  })
}
