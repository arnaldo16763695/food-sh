import type { Metadata } from "next"

import { AdminShell } from "@/components/admin/admin-shell"
import { getAdminSystemSettingsOverview } from "@/lib/admin-settings"

export const metadata: Metadata = {
  title: "Configuración General | Shanghaipf Commerce",
  description: "Parámetros y estado general del sistema administrativo.",
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

export default async function AdminSettingsPage() {
  const overview = getAdminSystemSettingsOverview()

  return (
    <AdminShell currentLabel="Configuración general">
      <main className="flex flex-1 flex-col gap-6">
        <header className="rounded-4xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm font-medium tracking-[0.16em] text-zinc-500 uppercase dark:text-zinc-400">
            Operación central
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Configuración general</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-600 dark:text-zinc-400">
            Vista central de los parámetros base del sistema, servicios conectados y puntos de configuración que afectan a toda la operación.
          </p>
        </header>

        <section className="grid gap-4 lg:grid-cols-2">
          <article className="rounded-4xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium tracking-[0.16em] text-zinc-500 uppercase dark:text-zinc-400">Empresa</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">Identidad operativa</h2>
              </div>
              <StatusBadge active activeLabel="Base activa" inactiveLabel="Inactiva" />
            </div>

            <dl className="mt-5 space-y-4 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-zinc-600 dark:text-zinc-400">Nombre visible</dt>
                <dd className="font-medium text-zinc-950 dark:text-zinc-50">{overview.company.displayName}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-zinc-600 dark:text-zinc-400">Canal de soporte</dt>
                <dd className="font-medium text-zinc-950 dark:text-zinc-50">{overview.company.supportChannel}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-zinc-600 dark:text-zinc-400">URL pública</dt>
                <dd className="font-medium text-zinc-950 dark:text-zinc-50">{overview.app.publicUrl}</dd>
              </div>
            </dl>
          </article>

          <article className="rounded-4xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium tracking-[0.16em] text-zinc-500 uppercase dark:text-zinc-400">Infraestructura</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">Servicios base</h2>
              </div>
              <StatusBadge active={Boolean(overview.app.supabaseProjectHost)} activeLabel="Operativa" inactiveLabel="Revisar" />
            </div>

            <dl className="mt-5 space-y-4 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-zinc-600 dark:text-zinc-400">Proyecto Supabase</dt>
                <dd className="font-medium text-zinc-950 dark:text-zinc-50">{overview.app.supabaseProjectHost ?? "No configurado"}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-zinc-600 dark:text-zinc-400">Resend</dt>
                <dd>
                  <StatusBadge
                    active={overview.email.resendConfigured}
                    activeLabel="Configurado"
                    inactiveLabel="No configurado"
                  />
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-zinc-600 dark:text-zinc-400">API de integración</dt>
                <dd>
                  <StatusBadge
                    active={overview.integration.apiKeyConfigured && overview.integration.hmacConfigured}
                    activeLabel="Configurada"
                    inactiveLabel="Incompleta"
                  />
                </dd>
              </div>
            </dl>
          </article>
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-4xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-sm font-medium tracking-[0.16em] text-zinc-500 uppercase dark:text-zinc-400">Correo transaccional</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">Emisor administrativo</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-zinc-200 bg-zinc-50 px-4 py-4 dark:border-zinc-800 dark:bg-zinc-950">
                <p className="text-xs font-medium tracking-[0.16em] text-zinc-500 uppercase dark:text-zinc-400">Nombre remitente</p>
                <p className="mt-2 font-medium text-zinc-950 dark:text-zinc-50">{overview.email.fromName ?? "No configurado"}</p>
              </div>
              <div className="rounded-3xl border border-zinc-200 bg-zinc-50 px-4 py-4 dark:border-zinc-800 dark:bg-zinc-950">
                <p className="text-xs font-medium tracking-[0.16em] text-zinc-500 uppercase dark:text-zinc-400">Correo remitente</p>
                <p className="mt-2 font-medium text-zinc-950 dark:text-zinc-50">{overview.email.fromEmail ?? "No configurado"}</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-zinc-600 dark:text-zinc-400">
              Este bloque centraliza la configuración actual usada para correos administrativos y de acceso al sistema.
            </p>
          </article>

          <article className="rounded-4xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-sm font-medium tracking-[0.16em] text-zinc-500 uppercase dark:text-zinc-400">Próximos pasos</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">Módulo en expansión</h2>
            <div className="mt-5 space-y-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              <div className="rounded-3xl border border-zinc-200 bg-zinc-50 px-4 py-4 dark:border-zinc-800 dark:bg-zinc-950">
                Configuración editable de marca y datos fiscales de la empresa.
              </div>
              <div className="rounded-3xl border border-zinc-200 bg-zinc-50 px-4 py-4 dark:border-zinc-800 dark:bg-zinc-950">
                Parámetros globales de notificaciones, integraciones y políticas del e-commerce.
              </div>
              <div className="rounded-3xl border border-zinc-200 bg-zinc-50 px-4 py-4 dark:border-zinc-800 dark:bg-zinc-950">
                Administración central de sucursales como recurso independiente del dashboard operativo.
              </div>
            </div>
          </article>
        </section>
      </main>
    </AdminShell>
  )
}
