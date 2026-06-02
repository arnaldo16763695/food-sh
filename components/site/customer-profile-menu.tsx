"use client"

import Link from "next/link"
import { ChevronDown, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { createSupabaseBrowserClient } from "@/lib/supabase-browser"
import { useShoppingBagStore } from "@/lib/shopping-bag"
import { StorefrontThemeToggle } from "@/components/site/storefront-theme-toggle"

type CustomerProfileMenuProps = {
  accountUrl: string
  authUrl: string
  branchSlug: string
  email: string
  fullName: string
  status: "ready" | "unconfirmed" | "needs-profile"
}

const statusMessages: Record<CustomerProfileMenuProps["status"], string> = {
  ready: "Tu cuenta está lista para comprar y revisar próximos pedidos.",
  unconfirmed: "Confirma tu correo para poder agregar productos a la bolsa.",
  "needs-profile": "Completa tu nombre y teléfono para continuar con tu compra.",
}

export function CustomerProfileMenu({ accountUrl, authUrl, branchSlug, email, fullName, status }: CustomerProfileMenuProps) {
  const router = useRouter()
  const clear = useShoppingBagStore((state) => state.clear)
  const [error, setError] = useState<string | null>(null)
  const [isSigningOut, setIsSigningOut] = useState(false)

  async function handleSignOut() {
    setIsSigningOut(true)
    setError(null)

    try {
      const supabase = createSupabaseBrowserClient()
      const { error } = await supabase.auth.signOut()

      if (error) {
        throw error
      }

      clear()
      router.replace(`/tienda/${branchSlug}`)
      router.refresh()
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "No se pudo cerrar la sesión.")
    } finally {
      setIsSigningOut(false)
    }
  }

  return (
    <details className="group relative">
      <summary className="flex h-11 cursor-pointer list-none items-center gap-2 rounded-full border border-[color-mix(in_oklab,var(--brand-deep)_14%,white)] bg-white px-4 text-sm font-medium text-zinc-700 transition-colors hover:bg-(--brand-deep) hover:text-white dark:border-[color-mix(in_oklab,var(--brand-deep)_28%,black)] dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-(--brand-deep)">
        <User className="size-4" />
        <span className="max-w-28 truncate">{fullName}</span>
        <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
      </summary>
      <div className="absolute right-0 bottom-full mb-3 w-64 rounded-3xl border border-zinc-200 bg-white p-2 shadow-[0_18px_40px_rgba(24,24,27,0.14)] md:top-full md:bottom-auto md:mt-3 md:mb-0 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="rounded-2xl border border-zinc-200 px-4 py-3 text-sm dark:border-zinc-800">
          <p className="font-medium text-zinc-950 dark:text-zinc-50">{fullName}</p>
          <p className="mt-1 text-zinc-500 dark:text-zinc-400">{email}</p>
          <p className="mt-3 text-zinc-500 dark:text-zinc-400">{statusMessages[status]}</p>
        </div>
        {error ? (
          <div className="mt-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-500/10 dark:text-red-300">
            {error}
          </div>
        ) : null}
        <div className="mt-1 grid gap-1">
          <StorefrontThemeToggle />
          {status === "ready" ? (
            <Link
              href={accountUrl}
              className="rounded-2xl px-4 py-3 text-left text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-800 dark:hover:text-white"
            >
              Ver mi cuenta
            </Link>
          ) : (
            <Link
              href={authUrl}
              className="rounded-2xl px-4 py-3 text-left text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-800 dark:hover:text-white"
            >
              Resolver acceso
            </Link>
          )}
          <button
            type="button"
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="rounded-2xl px-4 py-3 text-left text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 hover:text-zinc-950 disabled:cursor-not-allowed disabled:opacity-60 dark:text-zinc-100 dark:hover:bg-zinc-800 dark:hover:text-white"
          >
            {isSigningOut ? "Cerrando sesión..." : "Cerrar sesión"}
          </button>
        </div>
      </div>
    </details>
  )
}
