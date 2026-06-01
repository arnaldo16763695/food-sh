import { createHmac } from "node:crypto"

const [, , methodArg, pathArg, bodyArg] = process.argv

if (!methodArg || !pathArg) {
  console.error("Uso: node scripts/integration-request.mjs <METHOD> <PATH> [JSON_BODY]")
  process.exit(1)
}

const apiKey = process.env.INTEGRATION_API_KEY
const hmacSecret = process.env.INTEGRATION_HMAC_SECRET
const baseUrl = process.env.INTEGRATION_BASE_URL ?? "http://localhost:3000"

if (!apiKey || !hmacSecret) {
  console.error("Faltan INTEGRATION_API_KEY o INTEGRATION_HMAC_SECRET en el entorno.")
  process.exit(1)
}

const method = methodArg.toUpperCase()
const pathname = pathArg.startsWith("/") ? pathArg : `/${pathArg}`
const bodyText = bodyArg ?? ""
const timestamp = new Date().toISOString()
const payload = `${timestamp}.${method}.${pathname}.${bodyText}`
const signature = createHmac("sha256", hmacSecret).update(payload).digest("hex")

const response = await fetch(`${baseUrl}${pathname}`, {
  method,
  headers: {
    Authorization: `Bearer ${apiKey}`,
    "X-Integration-Timestamp": timestamp,
    "X-Integration-Signature": `sha256=${signature}`,
    ...(bodyText ? { "Content-Type": "application/json" } : {}),
  },
  body: bodyText || undefined,
})

const responseText = await response.text()

console.log(`HTTP ${response.status} ${response.statusText}`)

try {
  console.log(JSON.stringify(JSON.parse(responseText), null, 2))
} catch {
  console.log(responseText)
}
