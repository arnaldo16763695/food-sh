import { jsonOk } from "@/lib/api-response"
import { listIntegrationProductsByBranch } from "@/lib/catalog-store"
import { verifyIntegrationRequest } from "@/lib/integration-auth"
import { createIntegrationOptionsResponse, withIntegrationCors } from "@/lib/integration-cors"
import { type NextRequest } from "next/server"

export const runtime = "nodejs"

export function OPTIONS(request: NextRequest) {
  return createIntegrationOptionsResponse(request, ["GET"])
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ branchId: string }> },
) {
  const auth = await verifyIntegrationRequest(request)

  if (!auth.ok) {
    return withIntegrationCors(request, auth.response, ["GET", "OPTIONS"])
  }

  const { branchId } = await params
  return withIntegrationCors(request, jsonOk(await listIntegrationProductsByBranch(branchId)), ["GET", "OPTIONS"])
}
