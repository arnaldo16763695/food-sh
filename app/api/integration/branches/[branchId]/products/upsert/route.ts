import { jsonError, jsonOk } from "@/lib/api-response"
import { upsertIntegrationProduct } from "@/lib/catalog-store"
import { verifyIntegrationRequest } from "@/lib/integration-auth"
import { createIntegrationOptionsResponse, withIntegrationCors } from "@/lib/integration-cors"
import { parseJsonBody, validateProductUpsert } from "@/lib/integration-validators"
import { type NextRequest } from "next/server"

export const runtime = "nodejs"

export function OPTIONS(request: NextRequest) {
  return createIntegrationOptionsResponse(request, ["POST"])
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ branchId: string }> },
) {
  const auth = await verifyIntegrationRequest(request)

  if (!auth.ok) {
    return withIntegrationCors(request, auth.response, ["POST", "OPTIONS"])
  }

  const parsed = parseJsonBody(auth.bodyText)
  if (!parsed.ok) {
    return withIntegrationCors(request, jsonError(400, parsed.error), ["POST", "OPTIONS"])
  }

  const validated = validateProductUpsert(parsed.value)
  if (!validated.ok) {
    return withIntegrationCors(request, jsonError(400, validated.error), ["POST", "OPTIONS"])
  }

  const { branchId } = await params
  return withIntegrationCors(
    request,
    jsonOk(await upsertIntegrationProduct(branchId, validated.value)),
    ["POST", "OPTIONS"],
  )
}
