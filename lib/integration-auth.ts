import { NextResponse, type NextRequest } from "next/server"
import { createHmac, timingSafeEqual } from "node:crypto"

const MAX_SIGNATURE_AGE_MS = 5 * 60 * 1000

function getRequiredEnv(name: "INTEGRATION_API_KEY" | "INTEGRATION_HMAC_SECRET") {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

function safeEqual(a: string, b: string) {
  const aBuffer = Buffer.from(a)
  const bBuffer = Buffer.from(b)

  if (aBuffer.length !== bBuffer.length) {
    return false
  }

  return timingSafeEqual(aBuffer, bBuffer)
}

function normalizeSignature(signature: string) {
  return signature.startsWith("sha256=") ? signature.slice(7) : signature
}

function buildSignaturePayload(request: NextRequest, timestamp: string, bodyText: string) {
  const pathname = request.nextUrl.pathname
  return `${timestamp}.${request.method.toUpperCase()}.${pathname}.${bodyText}`
}

function signPayload(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("hex")
}

export async function verifyIntegrationRequest(request: NextRequest) {
  let apiKey: string
  let hmacSecret: string

  try {
    apiKey = getRequiredEnv("INTEGRATION_API_KEY")
    hmacSecret = getRequiredEnv("INTEGRATION_HMAC_SECRET")
  } catch (error) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: "Integration auth is not configured on the server." },
        { status: 500 },
      ),
      error,
    }
  }

  const authorization = request.headers.get("authorization")
  const timestamp = request.headers.get("x-integration-timestamp")
  const signatureHeader = request.headers.get("x-integration-signature")

  if (!authorization?.startsWith("Bearer ") || !timestamp || !signatureHeader) {
    return {
      ok: false as const,
      response: NextResponse.json(
        {
          error:
            "Missing integration auth headers. Expected Authorization, X-Integration-Timestamp, and X-Integration-Signature.",
        },
        { status: 401 },
      ),
    }
  }

  const providedApiKey = authorization.slice("Bearer ".length)

  if (!safeEqual(providedApiKey, apiKey)) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Invalid integration API key." }, { status: 401 }),
    }
  }

  const timestampMs = Date.parse(timestamp)

  if (Number.isNaN(timestampMs) || Math.abs(Date.now() - timestampMs) > MAX_SIGNATURE_AGE_MS) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: "Expired or invalid integration timestamp." },
        { status: 401 },
      ),
    }
  }

  const bodyText = await request.text()
  const expectedSignature = signPayload(buildSignaturePayload(request, timestamp, bodyText), hmacSecret)
  const providedSignature = normalizeSignature(signatureHeader)

  if (!safeEqual(providedSignature, expectedSignature)) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Invalid integration signature." }, { status: 401 }),
    }
  }

  return {
    ok: true as const,
    bodyText,
  }
}

export function createSignatureExample(method: string, pathname: string, bodyText: string, timestamp: string) {
  const secret = process.env.INTEGRATION_HMAC_SECRET
  if (!secret) {
    return null
  }

  return signPayload(`${timestamp}.${method.toUpperCase()}.${pathname}.${bodyText}`, secret)
}
