import { jsonError, jsonOk } from "@/lib/api-response"
import { getIntegrationProductByExternalId } from "@/lib/catalog-store"
import { verifyIntegrationRequest } from "@/lib/integration-auth"
import { createIntegrationOptionsResponse, withIntegrationCors } from "@/lib/integration-cors"
import { type NextRequest } from "next/server"

export const runtime = "nodejs"

export function OPTIONS(request: NextRequest) {
  return createIntegrationOptionsResponse(request, ["GET"])
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ branchId: string; externalId: string }> },
) {
  const auth = await verifyIntegrationRequest(request)

  if (!auth.ok) {
    return withIntegrationCors(request, auth.response, ["GET", "OPTIONS"])
  }

  const { branchId, externalId } = await params
  const product = await getIntegrationProductByExternalId(branchId, externalId)

  if (!product) {
    return withIntegrationCors(request, jsonError(404, "Product not found for this branch."), ["GET", "OPTIONS"])
  }

  return withIntegrationCors(request, jsonOk(product), ["GET", "OPTIONS"])
}
