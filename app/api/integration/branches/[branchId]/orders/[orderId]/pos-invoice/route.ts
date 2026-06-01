import { jsonError, jsonOk } from "@/lib/api-response"
import { verifyIntegrationRequest } from "@/lib/integration-auth"
import { createIntegrationOptionsResponse, withIntegrationCors } from "@/lib/integration-cors"
import { parseJsonBody, validatePosInvoiceUpdate } from "@/lib/integration-validators"
import { OrderAlreadyInvoicedError, markOrderAsPosInvoiced } from "@/lib/orders"
import { type NextRequest } from "next/server"

export const runtime = "nodejs"

export function OPTIONS(request: NextRequest) {
  return createIntegrationOptionsResponse(request, ["PATCH"])
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ branchId: string; orderId: string }> },
) {
  const auth = await verifyIntegrationRequest(request)

  if (!auth.ok) {
    return withIntegrationCors(request, auth.response, ["PATCH", "OPTIONS"])
  }

  const parsed = parseJsonBody(auth.bodyText)
  if (!parsed.ok) {
    return withIntegrationCors(request, jsonError(400, parsed.error), ["PATCH", "OPTIONS"])
  }

  const validated = validatePosInvoiceUpdate(parsed.value)
  if (!validated.ok) {
    return withIntegrationCors(request, jsonError(400, validated.error), ["PATCH", "OPTIONS"])
  }

  const { branchId, orderId } = await params

  try {
    const order = await markOrderAsPosInvoiced({
      branchSlug: branchId,
      orderId,
      posReference: validated.value.pos_reference,
      facturadoAt: validated.value.facturado_at,
    })

    if (!order) {
      return withIntegrationCors(request, jsonError(404, "Order not found for this branch."), ["PATCH", "OPTIONS"])
    }

    return withIntegrationCors(request, jsonOk(order), ["PATCH", "OPTIONS"])
  } catch (error) {
    if (error instanceof OrderAlreadyInvoicedError) {
      return withIntegrationCors(request, jsonError(409, error.message), ["PATCH", "OPTIONS"])
    }

    throw error
  }
}
