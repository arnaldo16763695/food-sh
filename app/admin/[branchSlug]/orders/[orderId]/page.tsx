import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { requireAdminBranchAccess } from "@/lib/admin-auth"
import { getPublicBranchBySlug } from "@/lib/branches"
import { getAdminOrderById } from "@/lib/orders"

type AdminOrderDetailPageProps = {
  params: Promise<{ branchSlug: string; orderId: string }>
}

export async function generateMetadata({ params }: AdminOrderDetailPageProps): Promise<Metadata> {
  const { branchSlug, orderId } = await params
  const branch = await getPublicBranchBySlug(branchSlug)

  return {
    title: branch ? `${branch.title} | Pedido ${orderId} | Shanghaipf Commerce` : `Pedido ${orderId}`,
  }
}

export default async function AdminOrderDetailPage({ params }: AdminOrderDetailPageProps) {
  const { branchSlug, orderId } = await params
  const branch = await getPublicBranchBySlug(branchSlug)

  if (!branch) {
    notFound()
  }

  await requireAdminBranchAccess(branch.slug)
  const order = await getAdminOrderById(branch.slug, orderId)

  if (!order) {
    notFound()
  }

  return (
    <main className="flex flex-1 flex-col gap-6">
      <header className="rounded-4xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium tracking-[0.16em] text-zinc-500 uppercase dark:text-zinc-400">Detalle de pedido</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">{order.id}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-600 dark:text-zinc-400">
              Revisión del pedido enviado desde la tienda online para {branch.title}.
            </p>
          </div>

          <Link
            href={`/admin/${branch.slug}/orders`}
            className="inline-flex h-11 items-center justify-center rounded-full border border-zinc-300 px-5 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            Volver a pedidos
          </Link>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-4xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold">Datos del cliente</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">Nombre</p>
              <p className="mt-1 font-medium">{order.customerName}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">Correo</p>
              <p className="mt-1 font-medium">{order.customerEmail}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">Teléfono</p>
              <p className="mt-1 font-medium">{order.customerPhone || "No indicado"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">Tipo</p>
              <p className="mt-1 font-medium">{order.fulfillmentType === "pickup" ? "Retiro" : "Delivery"}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">Estado</p>
              <p className="mt-1 font-medium text-emerald-700 dark:text-emerald-400">{order.status}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">Fecha</p>
              <p className="mt-1 font-medium">{new Date(order.createdAt).toLocaleString("es-VE")}</p>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-xs uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">Notas</p>
            <p className="mt-2 text-sm leading-7 text-zinc-600 dark:text-zinc-400">{order.notes || "Sin notas generales."}</p>
          </div>
        </section>

        <section className="rounded-4xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold">Items del pedido</h2>
          <div className="mt-5 space-y-4">
            {order.items.map((item) => (
              <article key={item.id} className="rounded-3xl border border-zinc-200 p-4 dark:border-zinc-800">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{item.sku}</p>
                    {item.exclusions.length > 0 ? (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">Sin: {item.exclusions.join(", ")}</p>
                    ) : null}
                    {item.note ? <p className="text-xs text-zinc-500 dark:text-zinc-400">Nota: {item.note}</p> : null}
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-medium">x{item.quantity}</p>
                    <p className="text-zinc-500 dark:text-zinc-400">USD {item.lineTotalUsd.toFixed(2)}</p>
                    <p className="text-zinc-500 dark:text-zinc-400">VES {item.lineTotalVes.toFixed(2)}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-6 border-t border-zinc-200 pt-4 dark:border-zinc-800">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-500 dark:text-zinc-400">Subtotal USD</span>
              <span className="font-medium">{order.subtotalUsd.toFixed(2)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-zinc-500 dark:text-zinc-400">Subtotal VES</span>
              <span className="font-medium">{order.subtotalVes.toFixed(2)}</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
