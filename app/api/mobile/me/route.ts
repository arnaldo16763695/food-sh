import { type NextRequest } from "next/server"

import { jsonError, jsonOk } from "@/lib/api-response"
import { getMobileCustomerAccessState } from "@/lib/mobile-auth"
import { upsertCustomerProfile } from "@/lib/customer-auth"

function buildMobileMeResponse(access: Awaited<ReturnType<typeof getMobileCustomerAccessState>>) {
  return {
    status: access.status,
    user: access.user
      ? {
          id: access.user.id,
          email: access.user.email ?? null,
          emailConfirmedAt: access.user.email_confirmed_at,
        }
      : null,
    profile: access.profile,
  }
}

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  const access = await getMobileCustomerAccessState(request)

  if (access.status === "guest") {
    return jsonError(401, "No autenticado.")
  }

  return jsonOk(buildMobileMeResponse(access))
}

export async function PATCH(request: NextRequest) {
  const access = await getMobileCustomerAccessState(request)

  if (access.status === "guest") {
    return jsonError(401, "No autenticado.")
  }

  const body = (await request.json()) as { fullName?: unknown; phone?: unknown }
  if (typeof body.fullName !== "string" || typeof body.phone !== "string") {
    return jsonError(400, "Debes enviar nombre completo y teléfono.")
  }

  const fullName = body.fullName.trim()
  const phone = body.phone.trim()

  if (!fullName || !phone) {
    return jsonError(400, "Debes enviar nombre completo y teléfono.")
  }

  const profile = await upsertCustomerProfile({
    userId: access.user.id,
    fullName,
    phone,
  })

  return jsonOk({
    status: access.user.email_confirmed_at ? "ready" : "unconfirmed",
    user: {
      id: access.user.id,
      email: access.user.email ?? null,
      emailConfirmedAt: access.user.email_confirmed_at,
    },
    profile,
  })
}
