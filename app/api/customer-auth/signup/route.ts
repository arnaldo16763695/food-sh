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
  const password = typeof body.password === "string" ? body.password : ""
  const fullName = typeof body.fullName === "string" ? body.fullName.trim() : ""
  const phone = typeof body.phone === "string" ? body.phone.trim() : ""
  const nextPath = normalizeNextPath(body.nextPath)

  if (!email || !password || password.length < 8 || !fullName || !phone) {
    return NextResponse.json({ error: "Debes completar nombre, teléfono, correo y una contraseña válida." }, { status: 400 })
  }

  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase.auth.admin.generateLink({
    type: "signup",
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone,
      },
      redirectTo: `${getAppUrl()}/tienda/auth?message=email-confirmed&next=${encodeURIComponent(nextPath)}`,
    },
  })

  if (error || !data.properties.action_link) {
    return NextResponse.json(
      {
        error:
          error?.message ??
          "No se pudo crear la cuenta. Si ya existe un usuario con ese correo, intenta iniciar sesión o reenviar la notificación.",
      },
      { status: 400 },
    )
  }

  const result = await sendCustomerActionEmail({
    actionUrl: data.properties.action_link,
    subject: "Confirma tu cuenta en Shanghaipf",
    to: email,
  })

  return NextResponse.json({
    data: {
      deliveryMethod: result.deliveryMethod,
    },
  })
}
