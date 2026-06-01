import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

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

      <section className="rounded-4xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between gap-4 border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
          <div>
            <h2 className="text-lg font-semibold">Pedidos registrados</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{orders.length} pedidos encontrados para esta sucursal.</p>
          </div>
        </div>

        {orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-zinc-50 text-zinc-500 dark:bg-zinc-950 dark:text-zinc-400">
                <tr>
                  <th className="px-6 py-4 font-medium">Pedido</th>
                  <th className="px-6 py-4 font-medium">Cliente</th>
                  <th className="px-6 py-4 font-medium">Tipo</th>
                  <th className="px-6 py-4 font-medium">Moneda</th>
                  <th className="px-6 py-4 font-medium">Total</th>
                  <th className="px-6 py-4 font-medium">Estado</th>
                  <th className="px-6 py-4 font-medium">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-t border-zinc-200 dark:border-zinc-800">
                    <td className="px-6 py-4 align-top">
                      <Link href={`/admin/${branch.slug}/orders/${order.id}`} className="font-medium text-zinc-950 underline-offset-4 hover:underline dark:text-zinc-50">
                        {order.id}
                      </Link>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <div className="space-y-1">
                        <p className="font-medium text-zinc-950 dark:text-zinc-50">{order.customerName}</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">{order.customerEmail}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top">{order.fulfillmentType === "pickup" ? "Retiro" : "Delivery"}</td>
                    <td className="px-6 py-4 align-top">{order.currency}</td>
                    <td className="px-6 py-4 align-top">
                      {order.currency === "USD" ? order.subtotalUsd.toFixed(2) : order.subtotalVes.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 align-top">
                      <span className="text-emerald-700 dark:text-emerald-400">{order.status}</span>
                    </td>
                    <td className="px-6 py-4 align-top">{new Date(order.createdAt).toLocaleString("es-VE")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-10 text-sm text-zinc-500 dark:text-zinc-400">Aún no hay pedidos registrados para esta sucursal.</div>
        )}
      </section>
    </main>
  )
}
