import { jsonError, jsonOk } from "@/lib/api-response"
import { verifyIntegrationRequest } from "@/lib/integration-auth"
import { parseJsonBody, validatePosInvoiceUpdate } from "@/lib/integration-validators"
import { OrderAlreadyInvoicedError, markOrderAsPosInvoiced } from "@/lib/orders"
import { type NextRequest } from "next/server"

export const runtime = "nodejs"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ branchId: string; orderId: string }> },
) {
  const auth = await verifyIntegrationRequest(request)

  if (!auth.ok) {
    return auth.response
  }

  const parsed = parseJsonBody(auth.bodyText)
  if (!parsed.ok) {
    return jsonError(400, parsed.error)
  }

  const validated = validatePosInvoiceUpdate(parsed.value)
  if (!validated.ok) {
    return jsonError(400, validated.error)
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
      return jsonError(404, "Order not found for this branch.")
    }

    return jsonOk(order)
  } catch (error) {
    if (error instanceof OrderAlreadyInvoicedError) {
      return jsonError(409, error.message)
    }

    throw error
  }
}
