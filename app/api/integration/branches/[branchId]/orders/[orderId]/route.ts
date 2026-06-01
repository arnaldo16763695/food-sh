import { jsonError, jsonOk } from "@/lib/api-response"
import { verifyIntegrationRequest } from "@/lib/integration-auth"
import { getIntegrationOrderById } from "@/lib/orders"
import { type NextRequest } from "next/server"

export const runtime = "nodejs"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ branchId: string; orderId: string }> },
) {
  const auth = await verifyIntegrationRequest(request)

  if (!auth.ok) {
    return auth.response
  }

  const { branchId, orderId } = await params
  const order = await getIntegrationOrderById(branchId, orderId)

  if (!order) {
    return jsonError(404, "Order not found for this branch.")
  }

  return jsonOk(order)
}
