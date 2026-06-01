import Link from "next/link"
import { ChevronDown, User } from "lucide-react"

import { BrandLogo } from "@/components/site/brand-logo"
import { ShoppingBagSheet } from "@/components/site/shopping-bag-sheet"

type StorefrontHeaderProps = {
  branchSlug: string
}

function ProfileMenu() {
  return (
    <details className="group relative">
      <summary className="flex h-11 cursor-pointer list-none items-center gap-2 rounded-full border border-[color-mix(in_oklab,var(--brand-deep)_14%,white)] bg-white px-4 text-sm font-medium text-zinc-700 transition-colors hover:bg-(--brand-deep) hover:text-white dark:border-[color-mix(in_oklab,var(--brand-deep)_28%,black)] dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-(--brand-deep)">
        <User className="size-4" />
        <span>Mi perfil</span>
        <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
      </summary>
      <div className="absolute right-0 bottom-full mb-3 w-56 rounded-3xl border border-zinc-200 bg-white p-2 shadow-[0_18px_40px_rgba(24,24,27,0.14)] md:top-full md:bottom-auto md:mt-3 md:mb-0 dark:border-zinc-800 dark:bg-zinc-900">
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
  )
}

export function StorefrontHeader({ branchSlug }: StorefrontHeaderProps) {
  return (
    <>
      <header className="sticky top-5 z-20 mb-8 rounded-4xl border border-white/70 bg-white/85 px-5 py-4 shadow-[0_20px_60px_rgba(24,24,27,0.08)] backdrop-blur dark:border-zinc-800/80 dark:bg-zinc-900/85">
        <div className="flex items-center justify-between gap-4">
          <Link href={`/tienda/${branchSlug}`} className="min-w-0">
            <BrandLogo />
          </Link>

          <div className="hidden items-center gap-3 md:flex">
            <ShoppingBagSheet branchSlug={branchSlug} />
            <ProfileMenu />
          </div>
        </div>
      </header>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-zinc-200/80 bg-white/92 px-4 py-3 shadow-[0_-18px_40px_rgba(24,24,27,0.08)] backdrop-blur md:hidden dark:border-zinc-800/80 dark:bg-zinc-950/92">
        <div className="mx-auto flex max-w-md items-center justify-center gap-3">
          <div className="flex-1">
            <ShoppingBagSheet branchSlug={branchSlug} />
          </div>
          <div className="flex-1">
            <ProfileMenu />
          </div>
        </div>
      </div>
    </>
  )
}
