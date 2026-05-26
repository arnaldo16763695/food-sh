import { jsonOk } from "@/lib/api-response"
import { listPublicProductsByBranch } from "@/lib/catalog-store"

export const runtime = "nodejs"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ branchId: string }> },
) {
  const { branchId } = await params
  return jsonOk(await listPublicProductsByBranch(branchId))
}
