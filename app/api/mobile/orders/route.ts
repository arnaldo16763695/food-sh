import { type NextRequest } from "next/server"

import { jsonError, jsonOk } from "@/lib/api-response"
import { getMobileCustomerAccessState } from "@/lib/mobile-auth"
import { listCustomerOrders } from "@/lib/orders"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  const access = await getMobileCustomerAccessState(request)

  if (access.status === "guest") {
    return jsonError(401, "No autenticado.")
  }

  return jsonOk(await listCustomerOrders(access.user.id))
}
