import { jsonError, jsonOk } from "@/lib/api-response"
import { getPublicBranchBySlug } from "@/lib/branches"
import { getPublicProductById } from "@/lib/catalog-store"

export const runtime = "nodejs"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ branchSlug: string; id: string }> },
) {
  const { branchSlug, id } = await params
  const branch = await getPublicBranchBySlug(branchSlug)

  if (!branch) {
    return jsonError(404, "Sucursal no encontrada.")
  }

  const product = await getPublicProductById(branchSlug, id)

  if (!product) {
    return jsonError(404, "Producto no encontrado para esta sucursal.")
  }

  return jsonOk(product)
}
