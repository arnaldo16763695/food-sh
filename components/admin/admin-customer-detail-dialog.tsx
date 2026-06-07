"use client"

import { Eye } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { type AdminBranchCustomerSummary } from "@/lib/admin-customers"

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-VE", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Caracas",
  }).format(new Date(value))
}

function getOrderStatusLabel(order: {
  pagoValidado: boolean
  posFacturado: boolean
  status: "draft" | "submitted" | "cancelled"
}) {
  if (order.status === "cancelled") {
    return "Cancelado"
  }

  if (order.posFacturado) {
    return "Facturado en POS"
  }

  if (order.pagoValidado) {
    return "Pago validado"
  }

  if (order.status === "submitted") {
    return "Recibido"
  }

  return "Borrador"
}

export function AdminCustomerDetailDialog({ customer }: { customer: AdminBranchCustomerSummary }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon-sm" aria-label={`Ver ${customer.fullName}`}>
          <Eye />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalle del cliente</DialogTitle>
          <DialogDescription>
            Resumen del perfil y compras recientes de <strong>{customer.fullName}</strong> en esta sucursal.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <p className="text-xs font-medium tracking-[0.16em] text-zinc-500 uppercase">Nombre</p>
              <div className="rounded-3xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm dark:border-zinc-800 dark:bg-zinc-950">
                {customer.fullName}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium tracking-[0.16em] text-zinc-500 uppercase">Correo</p>
              <div className="rounded-3xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm dark:border-zinc-800 dark:bg-zinc-950">
                {customer.email}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium tracking-[0.16em] text-zinc-500 uppercase">Teléfono</p>
              <div className="rounded-3xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm dark:border-zinc-800 dark:bg-zinc-950">
                {customer.phone || "No indicado"}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium tracking-[0.16em] text-zinc-500 uppercase">Actividad</p>
              <div className="rounded-3xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm dark:border-zinc-800 dark:bg-zinc-950">
                {customer.ordersCount} pedidos · Último: {formatDate(customer.lastOrderAt)}
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-zinc-200 bg-zinc-50 px-4 py-4 dark:border-zinc-800 dark:bg-zinc-950">
              <p className="text-xs font-medium tracking-[0.16em] text-zinc-500 uppercase">Acumulado USD</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight">{customer.totalUsd.toFixed(2)}</p>
            </div>

            <div className="rounded-3xl border border-zinc-200 bg-zinc-50 px-4 py-4 dark:border-zinc-800 dark:bg-zinc-950">
              <p className="text-xs font-medium tracking-[0.16em] text-zinc-500 uppercase">Acumulado VES</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight">{customer.totalVes.toFixed(2)}</p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium">Pedidos recientes</h3>
            <div className="mt-3 space-y-3">
              {customer.orders.map((order) => (
                <article key={order.id} className="rounded-3xl border border-zinc-200 p-4 dark:border-zinc-800">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="font-medium text-zinc-950 dark:text-zinc-50">Pedido {order.id}</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">{formatDate(order.createdAt)}</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {order.fulfillmentType === "delivery" ? "Delivery" : "Retiro en sucursal"}
                      </p>
                    </div>

                    <div className="text-right text-sm">
                      <p className="font-medium">{getOrderStatusLabel(order)}</p>
                      <p className="text-zinc-500 dark:text-zinc-400">USD {order.subtotalUsd.toFixed(2)}</p>
                      <p className="text-zinc-500 dark:text-zinc-400">VES {order.subtotalVes.toFixed(2)}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
