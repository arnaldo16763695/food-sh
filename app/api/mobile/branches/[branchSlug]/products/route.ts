import { type NextRequest } from "next/server"

import { jsonError, jsonOk } from "@/lib/api-response"
import { getPublicBranchBySlug } from "@/lib/branches"
import { listPublicProductsByBranch } from "@/lib/catalog-store"

export const runtime = "nodejs"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ branchSlug: string }> },
) {
  const { branchSlug } = await params
  const branch = await getPublicBranchBySlug(branchSlug)

  if (!branch) {
    return jsonError(404, "Sucursal no encontrada.")
  }

  const search = request.nextUrl.searchParams.get("search") ?? undefined
  return jsonOk(await listPublicProductsByBranch(branchSlug, search))
}
