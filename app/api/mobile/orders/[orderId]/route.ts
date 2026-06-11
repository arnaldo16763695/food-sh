import { type NextRequest } from "next/server"

import { jsonError, jsonOk } from "@/lib/api-response"
import { getMobileCustomerAccessState } from "@/lib/mobile-auth"
import { getCustomerOrderById } from "@/lib/orders"

export const runtime = "nodejs"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const access = await getMobileCustomerAccessState(request)

  if (access.status === "guest") {
    return jsonError(401, "No autenticado.")
  }

  const { orderId } = await params
  const order = await getCustomerOrderById(access.user.id, orderId)

  if (!order) {
    return jsonError(404, "Pedido no encontrado.")
  }

  return jsonOk(order)
}
