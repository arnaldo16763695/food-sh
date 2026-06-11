import { mobileOpenApiSpec } from "@/lib/mobile-openapi"

export const runtime = "nodejs"

export async function GET() {
  return Response.json(mobileOpenApiSpec)
}
