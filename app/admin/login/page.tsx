import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"

import { AdminLoginForm } from "@/components/admin/admin-login-form"
import { BrandLogo } from "@/components/site/brand-logo"
import { getAuthenticatedAdminUser } from "@/lib/admin-auth"

type AdminLoginPageProps = {
  searchParams: Promise<{ error?: string; next?: string }>
}

export const metadata: Metadata = {
  title: "Login Admin | Shanghaipf Commerce",
  description: "Acceso administrativo de Shanghaipf.",
}

const errorMessages: Record<string, string> = {
  "branch-access": "Tu usuario no tiene permiso para acceder a esa sucursal.",
  "no-admin-access": "Tu usuario no tiene perfil administrativo asignado.",
}

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const user = await getAuthenticatedAdminUser()
  const resolvedSearchParams = await searchParams
  const nextPath = resolvedSearchParams.next ?? "/admin"
  const errorMessage = resolvedSearchParams.error ? errorMessages[resolvedSearchParams.error] : null

  if (user) {
    redirect(nextPath)
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
            <h1 className="text-4xl font-semibold tracking-tight">Acceso al panel administrativo</h1>
            <p className="text-sm leading-7 text-zinc-600 dark:text-zinc-400">
              Inicia sesión con un usuario autorizado para gestionar sucursales, productos, pedidos e
              integración con el sistema local.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex text-sm font-medium text-zinc-700 underline-offset-4 hover:underline dark:text-zinc-300"
          >
            Volver al selector principal
          </Link>
        </section>

        <section className="rounded-4xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Iniciar sesión</h2>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                Usa tu correo y contraseña de Supabase Auth.
              </p>
            </div>

            {errorMessage ? (
              <div className="rounded-3xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-500/10 dark:text-amber-300">
                {errorMessage}
              </div>
            ) : null}

            <AdminLoginForm nextPath={nextPath} />
          </div>
        </section>
      </div>
    </main>
  )
}
