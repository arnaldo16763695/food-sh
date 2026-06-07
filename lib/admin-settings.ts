import { getAppUrl } from "@/lib/app-url"

export type AdminSystemSettingsOverview = {
  app: {
    publicUrl: string
    supabaseProjectHost: string | null
  }
  company: {
    displayName: string
    supportChannel: string
  }
  email: {
    fromEmail: string | null
    fromName: string | null
    resendConfigured: boolean
  }
  integration: {
    apiKeyConfigured: boolean
    hmacConfigured: boolean
  }
}

function getSupabaseProjectHost() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()

  if (!url) {
    return null
  }

  try {
    return new URL(url).host
  } catch {
    return null
  }
}

export function getAdminSystemSettingsOverview(): AdminSystemSettingsOverview {
  const resendApiKey = process.env.RESEND_API_KEY?.trim()
  const fromEmail = process.env.RESEND_FROM_EMAIL?.trim() ?? null
  const fromName = process.env.RESEND_FROM_NAME?.trim() ?? null
  const integrationApiKey = process.env.INTEGRATION_API_KEY?.trim()
  const integrationHmacSecret = process.env.INTEGRATION_HMAC_SECRET?.trim()

  return {
    app: {
      publicUrl: getAppUrl(),
      supabaseProjectHost: getSupabaseProjectHost(),
    },
    company: {
      displayName: fromName || "Shanghaipf",
      supportChannel: fromEmail || "No configurado",
    },
    email: {
      fromEmail,
      fromName,
      resendConfigured: Boolean(resendApiKey && fromEmail),
    },
    integration: {
      apiKeyConfigured: Boolean(integrationApiKey),
      hmacConfigured: Boolean(integrationHmacSecret),
    },
  }
}
