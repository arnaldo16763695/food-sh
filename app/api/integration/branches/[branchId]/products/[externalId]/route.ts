import { jsonError, jsonOk } from "@/lib/api-response"
import { getIntegrationProductByExternalId } from "@/lib/catalog-store"
import { verifyIntegrationRequest } from "@/lib/integration-auth"
import { type NextRequest } from "next/server"

export const runtime = "nodejs"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ branchId: string; externalId: string }> },
) {
  const auth = await verifyIntegrationRequest(request)

  if (!auth.ok) {
    return auth.response
  }

  const { branchId, externalId } = await params
  const product = await getIntegrationProductByExternalId(branchId, externalId)

  if (!product) {
    return jsonError(404, "Product not found for this branch.")
  }

  return jsonOk(product)
}
