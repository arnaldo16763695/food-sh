import { NextResponse, type NextRequest } from "next/server"
import { timingSafeEqual } from "node:crypto"

function getRequiredEnv(name: "PAYMENT_VALIDATION_API_KEY") {
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

export async function verifyInternalPaymentRequest(request: NextRequest) {
  let apiKey: string

  try {
    apiKey = getRequiredEnv("PAYMENT_VALIDATION_API_KEY")
  } catch (error) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: "Internal payment auth is not configured on the server." },
        { status: 500 },
      ),
      error,
    }
  }

  const authorization = request.headers.get("authorization")

  if (!authorization?.startsWith("Bearer ")) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: "Missing internal payment Authorization header." },
        { status: 401 },
      ),
    }
  }

  const providedApiKey = authorization.slice("Bearer ".length)

  if (!safeEqual(providedApiKey, apiKey)) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Invalid internal payment API key." }, { status: 401 }),
    }
  }

  return { ok: true as const }
}
