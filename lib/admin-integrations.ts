import { getAppUrl } from "@/lib/app-url"

export type AdminIntegrationsOverview = {
  documentation: {
    apiBaseUrl: string
    openApiUrl: string
    swaggerUrl: string
  }
  endpoints: {
    branchRoutesPublished: number
    healthcheckPublished: boolean
    openApiPublished: boolean
  }
  integration: {
    apiKeyConfigured: boolean
    corsEnabled: boolean
    hmacConfigured: boolean
  }
  internal: {
    paymentValidationApiConfigured: boolean
  }
}

function isCorsEnabled() {
  return process.env.INTEGRATION_ENABLE_CORS !== "false"
}

export function getAdminIntegrationsOverview(): AdminIntegrationsOverview {
  const baseUrl = getAppUrl()

  return {
    documentation: {
      apiBaseUrl: `${baseUrl}/api/integration`,
      openApiUrl: `${baseUrl}/api/integration/openapi`,
      swaggerUrl: `${baseUrl}/integration-api`,
    },
    endpoints: {
      branchRoutesPublished: 8,
      healthcheckPublished: true,
      openApiPublished: true,
    },
    integration: {
      apiKeyConfigured: Boolean(process.env.INTEGRATION_API_KEY?.trim()),
      corsEnabled: isCorsEnabled(),
      hmacConfigured: Boolean(process.env.INTEGRATION_HMAC_SECRET?.trim()),
    },
    internal: {
      paymentValidationApiConfigured: Boolean(process.env.PAYMENT_VALIDATION_API_KEY?.trim()),
    },
  }
}
