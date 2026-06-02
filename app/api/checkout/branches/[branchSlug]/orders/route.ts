import { NextResponse, type NextRequest } from "next/server"

import { getCustomerAccessState } from "@/lib/customer-auth"
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
  const access = await getCustomerAccessState()

  if (access.status === "guest") {
    return NextResponse.json({ error: "Debes iniciar sesión para continuar." }, { status: 401 })
  }

  if (access.status === "unconfirmed") {
    return NextResponse.json({ error: "Debes confirmar tu correo antes de continuar." }, { status: 403 })
  }

  if (access.status === "needs-profile") {
    return NextResponse.json({ error: "Completa tu perfil antes de continuar." }, { status: 403 })
  }

  const body = (await request.json()) as unknown

  if (!isRecord(body)) {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 })
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
    return NextResponse.json({ error: "Faltan datos requeridos para el pedido." }, { status: 400 })
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

    return NextResponse.json({ data: order })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "No se pudo crear el pedido.",
      },
      { status: 400 },
    )
  }
}
