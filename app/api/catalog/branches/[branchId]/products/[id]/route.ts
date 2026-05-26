import { jsonError, jsonOk } from "@/lib/api-response"
import { getPublicProductById } from "@/lib/catalog-store"

export const runtime = "nodejs"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ branchId: string; id: string }> },
) {
  const { branchId, id } = await params
  const product = await getPublicProductById(branchId, id)

  if (!product) {
    return jsonError(404, "Product not found for this branch.")
  }

  return jsonOk(product)
}
