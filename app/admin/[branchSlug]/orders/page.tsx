import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { AdminOrdersTable } from "@/components/admin/admin-orders-table"
import { requireAdminBranchAccess } from "@/lib/admin-auth"
import { getPublicBranchBySlug } from "@/lib/branches"
import { listAdminOrdersByBranch } from "@/lib/orders"

type AdminOrdersPageProps = {
  params: Promise<{ branchSlug: string }>
}

export async function generateMetadata({ params }: AdminOrdersPageProps): Promise<Metadata> {
  const { branchSlug } = await params
  const branch = await getPublicBranchBySlug(branchSlug)

  return {
    title: branch ? `${branch.title} | Pedidos | Shanghaipf Commerce` : "Pedidos | Shanghaipf Commerce",
  }
}

export default async function AdminOrdersPage({ params }: AdminOrdersPageProps) {
  const { branchSlug } = await params
  const branch = await getPublicBranchBySlug(branchSlug)

  if (!branch) {
    notFound()
  }

  await requireAdminBranchAccess(branch.slug)
  const orders = await listAdminOrdersByBranch(branch.slug)

  return (
    <main className="flex flex-1 flex-col gap-6">
      <header className="rounded-4xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium tracking-[0.16em] text-zinc-500 uppercase dark:text-zinc-400">
              Pedidos
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">{branch.title}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-600 dark:text-zinc-400">
              Revisa los pedidos enviados desde la tienda online y su estado actual antes de que el sistema interno los procese.
            </p>
          </div>
        </div>
      </header>

      <AdminOrdersTable branchSlug={branch.slug} orders={orders} />
    </main>
  )
}
