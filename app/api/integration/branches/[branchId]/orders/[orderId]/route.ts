import { jsonError, jsonOk } from "@/lib/api-response"
import { verifyIntegrationRequest } from "@/lib/integration-auth"
import { createIntegrationOptionsResponse, withIntegrationCors } from "@/lib/integration-cors"
import { getIntegrationOrderById } from "@/lib/orders"
import { type NextRequest } from "next/server"

export const runtime = "nodejs"

export function OPTIONS(request: NextRequest) {
  return createIntegrationOptionsResponse(request, ["GET"])
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ branchId: string; orderId: string }> },
) {
  const auth = await verifyIntegrationRequest(request)

  if (!auth.ok) {
    return withIntegrationCors(request, auth.response, ["GET", "OPTIONS"])
  }

  const { branchId, orderId } = await params
  const order = await getIntegrationOrderById(branchId, orderId)

  if (!order) {
    return withIntegrationCors(request, jsonError(404, "Order not found for this branch."), ["GET", "OPTIONS"])
  }

  return withIntegrationCors(request, jsonOk(order), ["GET", "OPTIONS"])
}
