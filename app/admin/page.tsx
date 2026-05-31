import type { Metadata } from "next"
import Link from "next/link"

import { listAccessibleAdminBranches, requireAdminSession } from "@/lib/admin-auth"

export const metadata: Metadata = {
  title: "Administración | Shanghaipf Commerce",
  description: "Base inicial del dashboard administrativo de Shanghaipf.",
}

export default async function AdminPage() {
  const { profile, user } = await requireAdminSession("/admin")
  const accessibleBranches = await listAccessibleAdminBranches(user.id)
  const branches = accessibleBranches.map((branch) => ({
    slug: branch.branchSlug,
    title: branch.branchTitle,
  }))

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-10 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50 sm:px-8 lg:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="rounded-4xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm font-medium tracking-[0.16em] text-zinc-500 uppercase dark:text-zinc-400">
            Administración
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Selecciona una sucursal</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-600 dark:text-zinc-400">
            El panel administrativo se segmenta por sucursal dentro de una sola empresa. Elige la
            sucursal para entrar al dashboard correspondiente.
          </p>
        </header>

        {branches.length > 0 ? (
          <section className="grid gap-4 md:grid-cols-2">
            {branches.map((branch) => (
              <article
                key={branch.slug}
                className="rounded-4xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <p className="text-sm font-medium tracking-[0.16em] text-zinc-500 uppercase dark:text-zinc-400">
                  Dashboard
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight">{branch.title}</h2>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href={`/admin/${branch.slug}`}
                    className="inline-flex h-11 items-center justify-center rounded-full bg-zinc-950 px-5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-300"
                  >
                    Abrir dashboard
                  </Link>
                  <Link
                    href={`/tienda/${branch.slug}`}
                    className="inline-flex h-11 items-center justify-center rounded-full border border-zinc-300 px-5 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                  >
                    Ver storefront
                  </Link>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <section className="rounded-4xl border border-dashed border-zinc-300 bg-white p-8 dark:border-zinc-700 dark:bg-zinc-900">
            <h2 className="text-lg font-semibold">Sin sucursales asignadas</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-600 dark:text-zinc-400">
              El usuario {profile.fullName || user.email || user.id} no tiene sucursales activas asignadas.
              Crea registros en <code>admin_profiles</code> y <code>admin_branch_access</code> para habilitar el acceso.
            </p>
          </section>
        )}
      </div>
    </main>
  )
}
