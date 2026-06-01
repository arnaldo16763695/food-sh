import { NextResponse, type NextRequest } from "next/server"

const DEFAULT_ALLOWED_HEADERS = [
  "Authorization",
  "Content-Type",
  "X-Integration-Signature",
  "X-Integration-Timestamp",
]

function isIntegrationCorsEnabled() {
  return process.env.INTEGRATION_ENABLE_CORS !== "false"
}

function getAllowedOrigins() {
  const raw = process.env.INTEGRATION_ALLOWED_ORIGINS?.trim()

  if (!raw) {
    return ["*"]
  }

  return raw
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
}

function resolveAllowOrigin(request: NextRequest) {
  const allowedOrigins = getAllowedOrigins()
  const origin = request.headers.get("origin")

  if (allowedOrigins.includes("*")) {
    return "*"
  }

  if (origin && allowedOrigins.includes(origin)) {
    return origin
  }

  if (origin === "null" && allowedOrigins.includes("null")) {
    return "null"
  }

  return null
}

function buildCorsHeaders(request: NextRequest, methods: string[]) {
  if (!isIntegrationCorsEnabled()) {
    return null
  }

  const allowOrigin = resolveAllowOrigin(request)

  if (!allowOrigin) {
    return null
  }

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": methods.join(", "),
    "Access-Control-Allow-Headers": DEFAULT_ALLOWED_HEADERS.join(", "),
    Vary: allowOrigin === "*" ? "Origin" : "Origin, Access-Control-Request-Headers",
  }
}

export function withIntegrationCors(request: NextRequest, response: NextResponse, methods: string[]) {
  const headers = buildCorsHeaders(request, methods)

  if (!headers) {
    return response
  }

  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  return response
}

export function createIntegrationOptionsResponse(request: NextRequest, methods: string[]) {
  if (!isIntegrationCorsEnabled()) {
    return new NextResponse(null, { status: 204 })
  }

  const headers = buildCorsHeaders(request, [...methods, "OPTIONS"])

  if (!headers) {
    return NextResponse.json({ error: "Origin not allowed." }, { status: 403 })
  }

  return new NextResponse(null, {
    status: 204,
    headers,
  })
}
