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
    return NextResponse.json({ error: "Debes indicar tu correo." }, { status: 400 })
  }

  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase.auth.admin.generateLink({
    type: "recovery",
    email,
    options: {
      redirectTo: `${getAppUrl()}/auth/confirm?next=${encodeURIComponent(nextPath)}`,
    },
  })

  if (error || !data.properties.action_link) {
    return NextResponse.json({
      data: {
        deliveryMethod: "unknown",
      },
    })
  }

  const result = await sendCustomerActionEmail({
    actionUrl: data.properties.action_link,
    ctaLabel: "Restablecer contraseña",
    heading: "Recupera tu acceso a Shanghaipf",
    intro: "Usa este enlace para definir una nueva contraseña y volver a entrar a tu cuenta.",
    subject: "Restablece tu contraseña en Shanghaipf",
    to: email,
  })

  return NextResponse.json({
    data: {
      deliveryMethod: result.deliveryMethod,
    },
  })
}
