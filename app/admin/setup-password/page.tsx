import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { AdminPasswordSetupForm } from "@/components/admin/admin-password-setup-form"
import { BrandLogo } from "@/components/site/brand-logo"
import { getAdminProfile, getAuthenticatedAdminUser } from "@/lib/admin-auth"

export const metadata: Metadata = {
  title: "Configurar Acceso Admin | Shanghaipf Commerce",
  description: "Configura la contraseña de acceso administrativo.",
}

export default async function AdminSetupPasswordPage() {
  const user = await getAuthenticatedAdminUser()

  if (!user) {
    redirect("/admin/login?error=confirmation-link")
  }

  const profile = await getAdminProfile(user.id)

  if (!profile) {
    redirect("/admin/login?error=no-admin-access")
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-10 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50 sm:px-8 lg:px-10">
      <div className="mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <section className="space-y-6 rounded-4xl border border-white/70 bg-white/88 p-8 shadow-[0_20px_60px_rgba(24,24,27,0.08)] dark:border-zinc-800 dark:bg-zinc-900/88">
          <BrandLogo />
          <div className="space-y-4">
            <p className="text-sm font-medium tracking-[0.16em] text-zinc-500 uppercase dark:text-zinc-400">
              Administración
            </p>
            <h1 className="text-4xl font-semibold tracking-tight">Configura tu contraseña</h1>
            <p className="text-sm leading-7 text-zinc-600 dark:text-zinc-400">
              Define la contraseña con la que entrarás al panel administrativo de Shanghaipf.
            </p>
          </div>
        </section>

        <section className="rounded-4xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Crear contraseña</h2>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                Después de guardarla podrás entrar directamente al panel con tu correo.
              </p>
            </div>

            <AdminPasswordSetupForm />
          </div>
        </section>
      </div>
    </main>
  )
}
