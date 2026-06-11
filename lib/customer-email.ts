import { getAppUrl } from "@/lib/app-url"

type CustomerEmailInput = {
  actionUrl: string
  ctaLabel?: string
  heading?: string
  intro?: string
  subject: string
  to: string
}

function getResendConfig() {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  const fromEmail = process.env.RESEND_FROM_EMAIL?.trim()
  const fromName = process.env.RESEND_FROM_NAME?.trim() || "Shanghaipf"

  return {
    apiKey,
    configured: Boolean(apiKey && fromEmail),
    fromEmail,
    fromName,
  }
}

function buildEmailHtml({
  actionUrl,
  ctaLabel = "Continuar",
  heading = "Confirma tu acceso a Shanghaipf",
  intro = "Usa el siguiente enlace para continuar con tu solicitud en la tienda online.",
}: Pick<CustomerEmailInput, "actionUrl" | "ctaLabel" | "heading" | "intro">) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #18181b;">
      <h1 style="font-size: 24px; margin-bottom: 16px;">${heading}</h1>
      <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
        ${intro}
      </p>
      <p style="margin-bottom: 24px;">
        <a
          href="${actionUrl}"
          style="display: inline-block; background: #18181b; color: #ffffff; padding: 14px 22px; border-radius: 999px; text-decoration: none; font-weight: 600;"
        >
          ${ctaLabel}
        </a>
      </p>
      <p style="font-size: 14px; line-height: 1.6; color: #52525b; margin-bottom: 8px;">
        Si el botón no funciona, copia y pega esta URL en tu navegador:
      </p>
      <p style="font-size: 14px; line-height: 1.6; color: #18181b; word-break: break-all;">
        ${actionUrl}
      </p>
      <p style="font-size: 12px; line-height: 1.6; color: #71717a; margin-top: 24px;">
        Este enlace fue generado para ${getAppUrl()}.
      </p>
    </div>
  `
}

export async function sendCustomerActionEmail({ actionUrl, ctaLabel, heading, intro, subject, to }: CustomerEmailInput) {
  const config = getResendConfig()

  if (!config.configured || !config.apiKey || !config.fromEmail) {
    console.info(`[customer-auth] Resend no configurado. URL para ${to}: ${actionUrl}`)

    return {
      deliveryMethod: "console" as const,
    }
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `${config.fromName} <${config.fromEmail}>`,
      html: buildEmailHtml({ actionUrl, ctaLabel, heading, intro }),
      subject,
      to: [to],
    }),
  })

  if (!response.ok) {
    const bodyText = await response.text()
    throw new Error(`No se pudo enviar el correo con Resend. ${bodyText}`)
  }

  return {
    deliveryMethod: "resend" as const,
  }
}
