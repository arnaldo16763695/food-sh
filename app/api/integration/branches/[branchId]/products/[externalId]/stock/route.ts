import { jsonError, jsonOk } from "@/lib/api-response"
import { updateIntegrationStock } from "@/lib/catalog-store"
import { verifyIntegrationRequest } from "@/lib/integration-auth"
import { parseJsonBody, validateStockUpdate } from "@/lib/integration-validators"
import { type NextRequest } from "next/server"

export const runtime = "nodejs"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ branchId: string; externalId: string }> },
) {
  const auth = await verifyIntegrationRequest(request)

  if (!auth.ok) {
    return auth.response
  }

  const parsed = parseJsonBody(auth.bodyText)
  if (!parsed.ok) {
    return jsonError(400, parsed.error)
  }

  const validated = validateStockUpdate(parsed.value)
  if (!validated.ok) {
    return jsonError(400, validated.error)
  }

  const { branchId, externalId } = await params
  const product = await updateIntegrationStock(branchId, externalId, validated.value)

  if (!product) {
    return jsonError(404, "Product not found for this branch.")
  }

  return jsonOk(product)
}
