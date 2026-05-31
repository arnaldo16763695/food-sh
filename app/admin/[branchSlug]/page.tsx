import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { requireAdminBranchAccess } from "@/lib/admin-auth"
import { getPublicBranchBySlug } from "@/lib/branches"

type AdminBranchPageProps = {
  params: Promise<{ branchSlug: string }>
}

const guideSections = [
  "Resumen operativo",
  "Pedidos",
  "Productos",
  "Sucursales",
  "Horarios",
  "Clientes",
  "Integraciones",
]

export async function generateMetadata({ params }: AdminBranchPageProps): Promise<Metadata> {
  const { branchSlug } = await params
  const branch = await getPublicBranchBySlug(branchSlug)

  if (!branch) {
    return {
      title: "Administración | Shanghaipf Commerce",
    }
  }

  return {
    title: `${branch.title} | Administración | Shanghaipf Commerce`,
    description: `Dashboard administrativo de ${branch.title}.`,
  }
}

export default async function AdminBranchPage({ params }: AdminBranchPageProps) {
  const { branchSlug } = await params
  const branch = await getPublicBranchBySlug(branchSlug)

  if (!branch) {
    notFound()
  }

  await requireAdminBranchAccess(branch.slug)

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-10 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50 sm:px-8 lg:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="rounded-4xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium tracking-[0.16em] text-zinc-500 uppercase dark:text-zinc-400">
                Administración
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight">{branch.title}</h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-600 dark:text-zinc-400">
                Esta página funciona como punto de partida del dashboard administrativo de la sucursal.
                Aquí irá el panel principal para operar productos, pedidos, horarios e integración.
              </p>
            </div>

            <Link
              href={`/tienda/${branch.slug}`}
              className="inline-flex h-11 items-center justify-center rounded-full border border-zinc-300 px-5 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              Ver storefront
            </Link>
          </div>
        </header>

        <section className="rounded-4xl border border-dashed border-zinc-300 bg-white p-8 dark:border-zinc-700 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold">Módulos previstos</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {guideSections.map((section) => (
              <div
                key={section}
                className="rounded-3xl border border-zinc-200 bg-zinc-50 px-4 py-4 text-sm font-medium text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300"
              >
                {section}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
