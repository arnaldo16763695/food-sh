const [, , orderIdArg, bodyArg] = process.argv

if (!orderIdArg) {
  console.error(
    "Uso: node scripts/payment-validation-request.mjs <ORDER_ID> [JSON_BODY con payment_reference y payment_validated_at]",
  )
  process.exit(1)
}

const apiKey = process.env.PAYMENT_VALIDATION_API_KEY
const baseUrl = process.env.INTERNAL_API_BASE_URL ?? "http://localhost:3000"

if (!apiKey) {
  console.error("Falta PAYMENT_VALIDATION_API_KEY en el entorno.")
  process.exit(1)
}

const orderId = orderIdArg
const defaultBody = JSON.stringify({
  payment_reference: `PM-${orderId.slice(0, 8)}`,
  payment_validated_at: new Date().toISOString(),
})

const bodyText = bodyArg ?? defaultBody
const response = await fetch(`${baseUrl}/api/internal/orders/${orderId}/payment-validation`, {
  method: "PATCH",
  headers: {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  },
  body: bodyText,
})

const responseText = await response.text()

console.log(`HTTP ${response.status} ${response.statusText}`)

try {
  console.log(JSON.stringify(JSON.parse(responseText), null, 2))
} catch {
  console.log(responseText)
}
