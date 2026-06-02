export function getAppUrl() {
  const explicitUrl = process.env.NEXT_PUBLIC_APP_URL?.trim()

  if (explicitUrl) {
    return explicitUrl.replace(/\/$/, "")
  }

  const vercelUrl = process.env.VERCEL_URL?.trim()

  if (vercelUrl) {
    return `https://${vercelUrl.replace(/\/$/, "")}`
  }

  return "http://localhost:3000"
}
