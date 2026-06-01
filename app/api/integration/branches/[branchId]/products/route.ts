import { jsonOk } from "@/lib/api-response"
import { listIntegrationProductsByBranch } from "@/lib/catalog-store"
import { verifyIntegrationRequest } from "@/lib/integration-auth"
import { type NextRequest } from "next/server"

export const runtime = "nodejs"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ branchId: string }> },
) {
  const auth = await verifyIntegrationRequest(request)

  if (!auth.ok) {
    return auth.response
  }

  const { branchId } = await params
  return jsonOk(await listIntegrationProductsByBranch(branchId))
}
