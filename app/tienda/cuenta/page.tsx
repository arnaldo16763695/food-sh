import type { Metadata } from "next"
import Link from "next/link"

import { BrandLogo } from "@/components/site/brand-logo"
import { requireReadyCustomerAccess } from "@/lib/customer-auth"
import { listCustomerOrders } from "@/lib/orders"

export const metadata: Metadata = {
  title: "Mi cuenta | Shanghaipf Commerce",
  description: "Consulta tus datos y pedidos recientes en la tienda online.",
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-VE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

function getOrderStatusLabel({
  pagoValidado,
  posFacturado,
  status,
}: {
  pagoValidado: boolean
  posFacturado: boolean
  status: "draft" | "submitted" | "cancelled"
}) {
  if (status === "cancelled") {
    return "Cancelado"
  }

  if (posFacturado) {
    return "Facturado en POS"
  }

  if (pagoValidado) {
    return "Pago validado"
  }

  if (status === "submitted") {
    return "Recibido"
  }

  return "Borrador"
}

export default async function CustomerAccountPage() {
  const access = await requireReadyCustomerAccess("/tienda/cuenta")
  const orders = await listCustomerOrders(access.user.id)

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-10 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50 sm:px-8 lg:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="flex flex-col gap-6 rounded-4xl border border-white/70 bg-white/88 p-8 shadow-[0_20px_60px_rgba(24,24,27,0.08)] dark:border-zinc-800 dark:bg-zinc-900/88 md:flex-row md:items-end md:justify-between">
          <div className="space-y-4">
            <BrandLogo />
            <div>
              <p className="text-sm font-medium tracking-[0.16em] text-zinc-500 uppercase dark:text-zinc-400">Mi cuenta</p>
              <h1 className="mt-2 text-4xl font-semibold tracking-tight">{access.profile.fullName}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-600 dark:text-zinc-400">
                Tu cuenta está activa para comprar en cualquier sucursal de la empresa y centraliza el historial de tus pedidos online.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex h-11 items-center justify-center rounded-full border border-zinc-300 px-5 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              Ir al inicio
            </Link>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[22rem_1fr]">
          <aside className="rounded-4xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-lg font-semibold">Datos del cliente</h2>
            <div className="mt-5 space-y-4 text-sm">
              <div>
                <p className="text-zinc-500 dark:text-zinc-400">Nombre</p>
                <p className="mt-1 font-medium">{access.profile.fullName}</p>
              </div>
              <div>
                <p className="text-zinc-500 dark:text-zinc-400">Correo</p>
                <p className="mt-1 font-medium">{access.user.email}</p>
              </div>
              <div>
                <p className="text-zinc-500 dark:text-zinc-400">Teléfono</p>
                <p className="mt-1 font-medium">{access.profile.phone}</p>
              </div>
            </div>

            <div className="mt-6 rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-500/10 dark:text-emerald-300">
              Correo confirmado y perfil completo. Ya puedes comprar en la tienda online.
            </div>
          </aside>

          <section className="rounded-4xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm font-medium tracking-[0.16em] text-zinc-500 uppercase dark:text-zinc-400">Pedidos</p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight">Historial reciente</h2>
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{orders.length} pedidos registrados</p>
            </div>

            {orders.length > 0 ? (
              <div className="mt-6 grid gap-4">
                {orders.map((order) => (
                  <article key={order.id} className="rounded-3xl border border-zinc-200 p-5 dark:border-zinc-800">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold">Pedido {order.id}</h3>
                          <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                            {getOrderStatusLabel(order)}
                          </span>
                        </div>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Sucursal: {order.branchSlug}</p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Creado: {formatDate(order.createdAt)}</p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                          Entrega: {order.fulfillmentType === "delivery" ? "Delivery" : "Retiro en sucursal"}
                        </p>
                      </div>

                      <div className="min-w-52 rounded-3xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm dark:border-zinc-800 dark:bg-zinc-950">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-zinc-500 dark:text-zinc-400">Subtotal USD</span>
                          <span className="font-medium">{order.subtotalUsd.toFixed(2)}</span>
                        </div>
                        <div className="mt-2 flex items-center justify-between gap-4">
                          <span className="text-zinc-500 dark:text-zinc-400">Subtotal VES</span>
                          <span className="font-medium">{order.subtotalVes.toFixed(2)}</span>
                        </div>
                        <div className="mt-2 flex items-center justify-between gap-4">
                          <span className="text-zinc-500 dark:text-zinc-400">Moneda</span>
                          <span className="font-medium">{order.currency}</span>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-4xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-10 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-400">
                Todavía no tienes pedidos registrados. Cuando completes tu primera compra, la verás aquí.
              </div>
            )}
          </section>
        </section>
      </div>
    </main>
  )
}
