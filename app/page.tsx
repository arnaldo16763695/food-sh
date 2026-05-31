import Link from "next/link"

import { BrandLogo } from "@/components/site/brand-logo"
import { listPublicBranches } from "@/lib/branches"

export default async function Home() {
  const branches = await listPublicBranches()

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,var(--brand-surface)_0%,#f5f1e8_40%,#fbfaf7_100%)] text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 py-8 sm:px-6 lg:px-10 lg:py-10">
        <header className="rounded-4xl border border-white/70 bg-white/88 p-8 shadow-[0_20px_60px_rgba(24,24,27,0.08)] backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/88">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-5">
              <BrandLogo />
              <div className="space-y-3">
                <p className="text-sm font-medium tracking-[0.16em] text-zinc-500 uppercase dark:text-zinc-400">
                  Acceso inicial
                </p>
                <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                  Selecciona una sucursal para continuar.
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-zinc-600 dark:text-zinc-400">
                  La tienda pública y el panel administrativo operan con contexto de sucursal para
                  evitar confusiones y preparar la base para autenticación, autorización y permisos.
                </p>
              </div>
            </div>

            <Link
              href="/admin"
              className="inline-flex h-11 items-center justify-center rounded-full border border-zinc-300 px-5 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              Ir al selector de admin
            </Link>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          {branches.map((branch) => (
            <article
              key={branch.slug}
              className="rounded-4xl border border-white/70 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <p className="text-sm font-medium tracking-[0.16em] text-zinc-500 uppercase dark:text-zinc-400">
                Sucursal
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight">{branch.title}</h2>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={`/tienda/${branch.slug}`}
                  className="inline-flex h-11 items-center justify-center rounded-full bg-zinc-950 px-5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-300"
                >
                  Ver storefront
                </Link>
                <Link
                  href={`/admin/${branch.slug}`}
                  className="inline-flex h-11 items-center justify-center rounded-full border border-zinc-300 px-5 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                >
                  Ver dashboard
                </Link>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  )
}
