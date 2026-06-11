import { type NextRequest } from "next/server"

import { jsonError, jsonOk } from "@/lib/api-response"
import { getMobileCustomerAccessState } from "@/lib/mobile-auth"
import { createSubmittedOrder } from "@/lib/orders"

type RouteContext = {
  params: Promise<{ branchSlug: string }>
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

export const runtime = "nodejs"

export async function POST(request: NextRequest, { params }: RouteContext) {
  const { branchSlug } = await params
  const access = await getMobileCustomerAccessState(request)

  if (access.status === "guest") {
    return jsonError(401, "Debes iniciar sesión para continuar.")
  }

  if (access.status === "unconfirmed") {
    return jsonError(403, "Debes confirmar tu correo antes de continuar.")
  }

  if (access.status === "needs-profile") {
    return jsonError(403, "Completa tu perfil antes de continuar.")
  }

  const body = (await request.json()) as unknown

  if (!isRecord(body)) {
    return jsonError(400, "Payload inválido.")
  }

  const items = Array.isArray(body.items) ? body.items : []

  if (
    typeof body.customerName !== "string" ||
    typeof body.customerPhone !== "string" ||
    typeof body.fulfillmentType !== "string" ||
    typeof body.notes !== "string" ||
    typeof body.currency !== "string" ||
    items.length === 0
  ) {
    return jsonError(400, "Faltan datos requeridos para el pedido.")
  }

  try {
    const order = await createSubmittedOrder({
      branchSlug,
      customerUserId: access.user.id,
      customerName: body.customerName,
      customerEmail: access.user.email ?? "",
      customerPhone: body.customerPhone,
      fulfillmentType: body.fulfillmentType === "delivery" ? "delivery" : "pickup",
      notes: body.notes,
      currency: body.currency === "VES" ? "VES" : "USD",
      items: items.map((item) => {
        if (!isRecord(item) || typeof item.productId !== "string") {
          throw new Error("Uno de los productos enviados es inválido.")
        }

        return {
          productId: item.productId,
          quantity: typeof item.quantity === "number" ? item.quantity : 1,
          note: typeof item.note === "string" ? item.note : "",
          exclusions: Array.isArray(item.exclusions)
            ? item.exclusions.filter((entry): entry is string => typeof entry === "string")
            : [],
        }
      }),
    })

    return jsonOk(order)
  } catch (error) {
    return jsonError(400, error instanceof Error ? error.message : "No se pudo crear el pedido.")
  }
}
