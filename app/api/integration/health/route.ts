import { jsonOk } from "@/lib/api-response"
import { verifyIntegrationRequest } from "@/lib/integration-auth"
import { type NextRequest } from "next/server"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  const auth = await verifyIntegrationRequest(request)

  if (!auth.ok) {
    return auth.response
  }

  return jsonOk({ status: "ok" })
}
