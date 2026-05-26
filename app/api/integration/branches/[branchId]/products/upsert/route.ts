import { jsonError, jsonOk } from "@/lib/api-response"
import { upsertIntegrationProduct } from "@/lib/catalog-store"
import { verifyIntegrationRequest } from "@/lib/integration-auth"
import { parseJsonBody, validateProductUpsert } from "@/lib/integration-validators"
import { type NextRequest } from "next/server"

export const runtime = "nodejs"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ branchId: string }> },
) {
  const auth = await verifyIntegrationRequest(request)

  if (!auth.ok) {
    return auth.response
  }

  const parsed = parseJsonBody(auth.bodyText)
  if (!parsed.ok) {
    return jsonError(400, parsed.error)
  }

  const validated = validateProductUpsert(parsed.value)
  if (!validated.ok) {
    return jsonError(400, validated.error)
  }

  const { branchId } = await params
  return jsonOk(await upsertIntegrationProduct(branchId, validated.value))
}
