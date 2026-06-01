import { jsonError, jsonOk } from "@/lib/api-response"
import { updateIntegrationStock } from "@/lib/catalog-store"
import { verifyIntegrationRequest } from "@/lib/integration-auth"
import { createIntegrationOptionsResponse, withIntegrationCors } from "@/lib/integration-cors"
import { parseJsonBody, validateStockUpdate } from "@/lib/integration-validators"
import { type NextRequest } from "next/server"

export const runtime = "nodejs"

export function OPTIONS(request: NextRequest) {
  return createIntegrationOptionsResponse(request, ["PATCH"])
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ branchId: string; externalId: string }> },
) {
  const auth = await verifyIntegrationRequest(request)

  if (!auth.ok) {
    return withIntegrationCors(request, auth.response, ["PATCH", "OPTIONS"])
  }

  const parsed = parseJsonBody(auth.bodyText)
  if (!parsed.ok) {
    return withIntegrationCors(request, jsonError(400, parsed.error), ["PATCH", "OPTIONS"])
  }

  const validated = validateStockUpdate(parsed.value)
  if (!validated.ok) {
    return withIntegrationCors(request, jsonError(400, validated.error), ["PATCH", "OPTIONS"])
  }

  const { branchId, externalId } = await params
  const product = await updateIntegrationStock(branchId, externalId, validated.value)

  if (!product) {
    return withIntegrationCors(request, jsonError(404, "Product not found for this branch."), ["PATCH", "OPTIONS"])
  }

  return withIntegrationCors(request, jsonOk(product), ["PATCH", "OPTIONS"])
}
