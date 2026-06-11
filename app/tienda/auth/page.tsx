import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"

import { CustomerAuthForm } from "@/components/site/customer-auth-form"
import { BrandLogo } from "@/components/site/brand-logo"
import { getCustomerAccessState } from "@/lib/customer-auth"

type CustomerAuthPageProps = {
  searchParams: Promise<{ error?: string; message?: string; mode?: string; next?: string }>
}

export const metadata: Metadata = {
  title: "Acceso de clientes | Shanghaipf Commerce",
  description: "Inicia sesión o crea tu cuenta para comprar en la tienda online.",
}

const errorMessages: Record<string, string> = {
  "auth-required": "Debes iniciar sesión antes de agregar productos a la bolsa.",
  "email-not-confirmed": "Confirma tu correo antes de continuar con tu compra.",
  "profile-incomplete": "Completa tu nombre y teléfono para continuar.",
  "oauth-callback": "No se pudo completar el acceso con Google. Inténtalo de nuevo.",
  "confirmation-link": "El enlace de confirmación no es válido o ya expiró.",
  "recovery-link": "El enlace para restablecer la contraseña no es válido o ya expiró.",
}

const messageMessages: Record<string, string> = {
  "email-confirmed": "Tu correo fue confirmado. Ya puedes continuar con tu compra.",
  "password-reset": "Tu contraseña fue actualizada. Ya puedes volver a entrar.",
  "recovery-confirmed": "Ya puedes definir una nueva contraseña para tu cuenta.",
  "recovery-sent": "Si existe una cuenta con ese correo, te enviamos instrucciones para recuperar el acceso.",
}

export default async function CustomerAuthPage({ searchParams }: CustomerAuthPageProps) {
  const resolvedSearchParams = await searchParams
  const nextPath = resolvedSearchParams.next ?? "/"
  const mode =
    resolvedSearchParams.mode === "signup" ||
    resolvedSearchParams.mode === "recover" ||
    resolvedSearchParams.mode === "reset-password"
      ? resolvedSearchParams.mode
      : "login"
  const access = await getCustomerAccessState()

  if (access.status === "ready" && mode !== "reset-password") {
    redirect(nextPath)
  }

  const errorMessage = resolvedSearchParams.error ? errorMessages[resolvedSearchParams.error] : null
  const messageMessage = resolvedSearchParams.message ? messageMessages[resolvedSearchParams.message] : null

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-10 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50 sm:px-8 lg:px-10">
      <div className="mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <section className="space-y-6 rounded-4xl border border-white/70 bg-white/88 p-8 shadow-[0_20px_60px_rgba(24,24,27,0.08)] dark:border-zinc-800 dark:bg-zinc-900/88">
          <BrandLogo />
          <div className="space-y-4">
            <p className="text-sm font-medium tracking-[0.16em] text-zinc-500 uppercase dark:text-zinc-400">Tienda online</p>
            <h1 className="text-4xl font-semibold tracking-tight">Accede para comprar en la tienda</h1>
            <p className="text-sm leading-7 text-zinc-600 dark:text-zinc-400">
              Tu cuenta es global para toda la empresa. La usaremos para identificar tus pedidos y mantener tu bolsa protegida.
            </p>
          </div>
          <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
            <p>Solicitaremos nombre, teléfono y correo confirmado antes de permitir compras.</p>
            <p>También podrás iniciar sesión con Google y completar tu perfil si hace falta.</p>
          </div>
          <Link
            href={nextPath}
            className="inline-flex text-sm font-medium text-zinc-700 underline-offset-4 hover:underline dark:text-zinc-300"
          >
            Volver a la tienda
          </Link>
        </section>

        <section className="rounded-4xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                {access.status === "needs-profile"
                  ? "Completar perfil"
                  : access.status === "unconfirmed"
                    ? "Confirmar correo"
                    : mode === "signup"
                      ? "Crear cuenta"
                      : mode === "recover"
                        ? "Recuperar contraseña"
                        : mode === "reset-password"
                          ? "Nueva contraseña"
                          : "Iniciar sesión"}
              </h2>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                {mode === "recover"
                  ? "Te enviaremos un enlace para recuperar el acceso a tu cuenta."
                  : mode === "reset-password"
                    ? "Define una nueva contraseña segura para continuar."
                    : access.status === "guest"
                  ? "Usa tu correo y contraseña o continúa con Google."
                  : "Tu sesión existe, pero todavía falta un paso para habilitar la compra."}
              </p>
            </div>

            {errorMessage ? (
              <div className="rounded-3xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-500/10 dark:text-amber-300">
                {errorMessage}
              </div>
            ) : null}

            {messageMessage ? (
              <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-500/10 dark:text-emerald-300">
                {messageMessage}
              </div>
            ) : null}

            <CustomerAuthForm
              initialEmail={access.user?.email ?? ""}
              initialFullName={access.profile?.fullName ?? access.user?.user_metadata?.full_name ?? ""}
              initialMode={mode}
              initialPhone={access.profile?.phone ?? access.user?.user_metadata?.phone ?? ""}
              nextPath={nextPath}
              status={access.status}
            />
          </div>
        </section>
      </div>
    </main>
  )
}
