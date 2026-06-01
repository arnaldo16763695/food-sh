import { integrationOpenApiSpec } from "@/lib/integration-openapi"

export const runtime = "nodejs"

export async function GET() {
  return Response.json(integrationOpenApiSpec)
}
