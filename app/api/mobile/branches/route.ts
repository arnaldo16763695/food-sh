import { jsonOk } from "@/lib/api-response"
import { listPublicBranches } from "@/lib/branches"

export const runtime = "nodejs"

export async function GET() {
  return jsonOk(await listPublicBranches())
}
