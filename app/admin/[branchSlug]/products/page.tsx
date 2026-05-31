import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { requireAdminBranchAccess } from "@/lib/admin-auth"
import { getPublicBranchBySlug } from "@/lib/branches"
import { listAdminProductsByBranch } from "@/lib/catalog-store"

type AdminProductsPageProps = {
  params: Promise<{ branchSlug: string }>
}

export async function generateMetadata({ params }: AdminProductsPageProps): Promise<Metadata> {
  const { branchSlug } = await params
  const branch = await getPublicBranchBySlug(branchSlug)

  return {
    title: branch ? `${branch.title} | Productos | Shanghaipf Commerce` : "Productos | Shanghaipf Commerce",
  }
}

export default async function AdminProductsPage({ params }: AdminProductsPageProps) {
  const { branchSlug } = await params
  const branch = await getPublicBranchBySlug(branchSlug)

  if (!branch) {
    notFound()
  }

  await requireAdminBranchAccess(branch.slug)
  const products = await listAdminProductsByBranch(branch.slug)

  return (
    <main className="flex flex-1 flex-col gap-6">
      <header className="rounded-4xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium tracking-[0.16em] text-zinc-500 uppercase dark:text-zinc-400">
              Productos
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">{branch.title}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-600 dark:text-zinc-400">
              Gestiona el catálogo de la sucursal, su disponibilidad online y los campos propios del
              canal e-commerce.
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

      <section className="rounded-4xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between gap-4 border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
          <div>
            <h2 className="text-lg font-semibold">Listado de productos</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{products.length} registros cargados para esta sucursal.</p>
          </div>
        </div>

        {products.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-zinc-50 text-zinc-500 dark:bg-zinc-950 dark:text-zinc-400">
                <tr>
                  <th className="px-6 py-4 font-medium">Producto</th>
                  <th className="px-6 py-4 font-medium">SKU</th>
                  <th className="px-6 py-4 font-medium">USD</th>
                  <th className="px-6 py-4 font-medium">VES</th>
                  <th className="px-6 py-4 font-medium">Stock</th>
                  <th className="px-6 py-4 font-medium">POS</th>
                  <th className="px-6 py-4 font-medium">Online</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-t border-zinc-200 dark:border-zinc-800">
                    <td className="px-6 py-4 align-top">
                      <div className="space-y-1">
                        <p className="font-medium text-zinc-950 dark:text-zinc-50">{product.name}</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">{product.externalId}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top">{product.sku}</td>
                    <td className="px-6 py-4 align-top">{product.priceUsd.toFixed(2)}</td>
                    <td className="px-6 py-4 align-top">{product.priceVes.toFixed(2)}</td>
                    <td className="px-6 py-4 align-top">{product.stock}</td>
                    <td className="px-6 py-4 align-top">
                      <span className={product.isActive ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400"}>
                        {product.isActive ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <span className={product.onlineEnabled ? "text-emerald-700 dark:text-emerald-400" : "text-amber-700 dark:text-amber-400"}>
                        {product.onlineEnabled ? "Visible" : "Oculto"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-10 text-sm text-zinc-500 dark:text-zinc-400">
            No hay productos cargados para esta sucursal.
          </div>
        )}
      </section>
    </main>
  )
}
