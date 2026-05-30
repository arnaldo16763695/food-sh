import Link from "next/link"
import { ChevronDown, ShoppingBag, User } from "lucide-react"

import { BrandLogo } from "@/components/site/brand-logo"

export function StorefrontHeader() {
  return (
    <header className="sticky top-5 z-20 mb-8 rounded-4xl border border-white/70 bg-white/85 px-5 py-4 shadow-[0_20px_60px_rgba(24,24,27,0.08)] backdrop-blur dark:border-zinc-800/80 dark:bg-zinc-900/85">
      <div className="flex items-center justify-between gap-4">
        <Link href="/" className="min-w-0">
          <BrandLogo />
        </Link>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="inline-flex h-11 items-center gap-2 rounded-full border border-[color-mix(in_oklab,var(--brand-secondary)_18%,white)] bg-white px-4 text-sm font-medium text-zinc-700 transition-colors hover:bg-(--brand-secondary) hover:text-[var(--brand-secondary-foreground)] dark:border-[color-mix(in_oklab,var(--brand-secondary)_28%,black)] dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-(--brand-secondary)"
            aria-label="Ver bolsa de compra"
            style={{
              borderColor: "color-mix(in oklab, var(--brand-secondary) 18%, white)",
            }}
          >
            <ShoppingBag className="size-4" />
            <span>Bolsa</span>
            <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-(--brand-primary) px-1.5 py-0.5 text-xs text-[var(--brand-primary-foreground)]">
              0
            </span>
          </button>

          <details className="group relative">
            <summary className="flex h-11 cursor-pointer list-none items-center gap-2 rounded-full border border-[color-mix(in_oklab,var(--brand-deep)_14%,white)] bg-white px-4 text-sm font-medium text-zinc-700 transition-colors hover:bg-(--brand-deep) hover:text-white dark:border-[color-mix(in_oklab,var(--brand-deep)_28%,black)] dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-(--brand-deep)">
              <User className="size-4" />
              <span className="hidden sm:inline">Mi perfil</span>
              <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
            </summary>
            <div className="absolute right-0 mt-3 w-56 rounded-3xl border border-zinc-200 bg-white p-2 shadow-[0_18px_40px_rgba(24,24,27,0.14)] dark:border-zinc-800 dark:bg-zinc-900">
              <div className="rounded-2xl px-4 py-3 text-sm text-zinc-500 dark:text-zinc-400">
                Próximamente podrás iniciar sesión, ver tus pedidos y guardar direcciones.
              </div>
              <div className="mt-1 grid gap-1">
                <button
                  type="button"
                  className="rounded-2xl px-4 py-3 text-left text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-800 dark:hover:text-white"
                >
                  Iniciar sesión
                </button>
                <button
                  type="button"
                  className="rounded-2xl px-4 py-3 text-left text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-800 dark:hover:text-white"
                >
                  Crear cuenta
                </button>
              </div>
            </div>
          </details>
        </div>
      </div>
    </header>
  )
}
