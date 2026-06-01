import { jsonError, jsonOk } from "@/lib/api-response"
import { verifyInternalPaymentRequest } from "@/lib/internal-api-auth"
import { parseJsonBody, validatePaymentValidationUpdate } from "@/lib/integration-validators"
import { markOrderPaymentValidated } from "@/lib/orders"
import { type NextRequest } from "next/server"

export const runtime = "nodejs"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const auth = await verifyInternalPaymentRequest(request)

  if (!auth.ok) {
    return auth.response
  }

  const parsed = parseJsonBody(await request.text())
  if (!parsed.ok) {
    return jsonError(400, parsed.error)
  }

  const validated = validatePaymentValidationUpdate(parsed.value)
  if (!validated.ok) {
    return jsonError(400, validated.error)
  }

  const { orderId } = await params
  const order = await markOrderPaymentValidated({
    orderId,
    paymentReference: validated.value.payment_reference,
    paymentValidatedAt: validated.value.payment_validated_at ?? new Date().toISOString(),
  })

  if (!order) {
    return jsonError(404, "Order not found.")
  }

  return jsonOk(order)
}
