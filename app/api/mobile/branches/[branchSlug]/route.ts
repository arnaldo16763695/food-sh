import { jsonError, jsonOk } from "@/lib/api-response"
import { getPublicBranchBySlug } from "@/lib/branches"

export const runtime = "nodejs"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ branchSlug: string }> },
) {
  const { branchSlug } = await params
  const branch = await getPublicBranchBySlug(branchSlug)

  if (!branch) {
    return jsonError(404, "Sucursal no encontrada.")
  }

  return jsonOk(branch)
}
