import type { Metadata } from "next"
import Link from "next/link"

import { AdminShell } from "@/components/admin/admin-shell"
import { getAdminIntegrationsOverview } from "@/lib/admin-integrations"

export const metadata: Metadata = {
  title: "Integraciones | Shanghaipf Commerce",
  description: "Estado global de integraciones, autenticación técnica y documentación operativa.",
}

function StatusBadge({ active, activeLabel, inactiveLabel }: { active: boolean; activeLabel: string; inactiveLabel: string }) {
  return (
    <span
      className={active
        ? "inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-100"
        : "inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800 dark:border-amber-900/70 dark:bg-amber-950/40 dark:text-amber-100"
      }
    >
      {active ? activeLabel : inactiveLabel}
    </span>
  )
}

export default async function AdminIntegrationsPage() {
  const overview = getAdminIntegrationsOverview()

  return (
    <AdminShell currentLabel="Integraciones">
      <main className="flex flex-1 flex-col gap-6">
        <header className="rounded-4xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm font-medium tracking-[0.16em] text-zinc-500 uppercase dark:text-zinc-400">
            Operación central
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Integraciones</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-600 dark:text-zinc-400">
            Estado central de autenticación técnica, documentación disponible y endpoints expuestos para la integración con POS y servicios internos.
          </p>
        </header>

        <section className="grid gap-4 lg:grid-cols-2">
          <article className="rounded-4xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium tracking-[0.16em] text-zinc-500 uppercase dark:text-zinc-400">Autenticación de integración</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">Seguridad server-to-server</h2>
              </div>
              <StatusBadge
                active={overview.integration.apiKeyConfigured && overview.integration.hmacConfigured}
                activeLabel="Lista"
                inactiveLabel="Incompleta"
              />
            </div>

            <dl className="mt-5 space-y-4 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-zinc-600 dark:text-zinc-400">API key de integración</dt>
                <dd>
                  <StatusBadge active={overview.integration.apiKeyConfigured} activeLabel="Configurada" inactiveLabel="No configurada" />
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-zinc-600 dark:text-zinc-400">Firma HMAC</dt>
                <dd>
                  <StatusBadge active={overview.integration.hmacConfigured} activeLabel="Configurada" inactiveLabel="No configurada" />
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-zinc-600 dark:text-zinc-400">CORS integración</dt>
                <dd>
                  <StatusBadge active={overview.integration.corsEnabled} activeLabel="Habilitado" inactiveLabel="Deshabilitado" />
                </dd>
              </div>
            </dl>
          </article>

          <article className="rounded-4xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium tracking-[0.16em] text-zinc-500 uppercase dark:text-zinc-400">Servicios internos</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">Canales auxiliares</h2>
              </div>
              <StatusBadge
                active={overview.internal.paymentValidationApiConfigured}
                activeLabel="Operativo"
                inactiveLabel="Revisar"
              />
            </div>

            <dl className="mt-5 space-y-4 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-zinc-600 dark:text-zinc-400">Validación interna de pagos</dt>
                <dd>
                  <StatusBadge
                    active={overview.internal.paymentValidationApiConfigured}
                    activeLabel="Configurada"
                    inactiveLabel="No configurada"
                  />
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-zinc-600 dark:text-zinc-400">Healthcheck expuesto</dt>
                <dd>
                  <StatusBadge active={overview.endpoints.healthcheckPublished} activeLabel="Publicado" inactiveLabel="Oculto" />
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-zinc-600 dark:text-zinc-400">OpenAPI expuesto</dt>
                <dd>
                  <StatusBadge active={overview.endpoints.openApiPublished} activeLabel="Publicado" inactiveLabel="Oculto" />
                </dd>
              </div>
            </dl>
          </article>
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-4xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-sm font-medium tracking-[0.16em] text-zinc-500 uppercase dark:text-zinc-400">Documentación técnica</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">Entradas disponibles</h2>
            <div className="mt-5 grid gap-3">
              <Link href="/integration-api" className="rounded-3xl border border-zinc-200 bg-zinc-50 px-4 py-4 text-sm font-medium text-zinc-950 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900">
                Swagger UI: {overview.documentation.swaggerUrl}
              </Link>
              <a href={overview.documentation.openApiUrl} className="rounded-3xl border border-zinc-200 bg-zinc-50 px-4 py-4 text-sm font-medium text-zinc-950 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900">
                OpenAPI JSON: {overview.documentation.openApiUrl}
              </a>
              <div className="rounded-3xl border border-zinc-200 bg-zinc-50 px-4 py-4 text-sm dark:border-zinc-800 dark:bg-zinc-950">
                Base de la API: <span className="font-medium text-zinc-950 dark:text-zinc-50">{overview.documentation.apiBaseUrl}</span>
              </div>
            </div>
          </article>

          <article className="rounded-4xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-sm font-medium tracking-[0.16em] text-zinc-500 uppercase dark:text-zinc-400">Cobertura publicada</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">Endpoints activos</h2>
            <div className="mt-5 space-y-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              <div className="rounded-3xl border border-zinc-200 bg-zinc-50 px-4 py-4 dark:border-zinc-800 dark:bg-zinc-950">
                {overview.endpoints.branchRoutesPublished} rutas publicadas para productos y pedidos por sucursal.
              </div>
              <div className="rounded-3xl border border-zinc-200 bg-zinc-50 px-4 py-4 dark:border-zinc-800 dark:bg-zinc-950">
                Healthcheck operativo para validar credenciales y conectividad técnica.
              </div>
              <div className="rounded-3xl border border-zinc-200 bg-zinc-50 px-4 py-4 dark:border-zinc-800 dark:bg-zinc-950">
                Contrato OpenAPI disponible para clientes técnicos e integración con POS.
              </div>
            </div>
          </article>
        </section>
      </main>
    </AdminShell>
  )
}
