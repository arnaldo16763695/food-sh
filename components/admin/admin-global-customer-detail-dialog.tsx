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
import { type AdminGlobalCustomerSummary } from "@/lib/admin-customers"

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

export function AdminGlobalCustomerDetailDialog({ customer }: { customer: AdminGlobalCustomerSummary }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon-sm" aria-label={`Ver ${customer.fullName || customer.email}`}>
          <Eye />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cliente global del sistema</DialogTitle>
          <DialogDescription>
            Revisión consolidada del perfil y actividad cross-sucursal de <strong>{customer.fullName || customer.email}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <p className="text-xs font-medium tracking-[0.16em] text-zinc-500 uppercase">Nombre</p>
              <div className="rounded-3xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm dark:border-zinc-800 dark:bg-zinc-950">
                {customer.fullName || "Sin nombre registrado"}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium tracking-[0.16em] text-zinc-500 uppercase">Correo</p>
              <div className="rounded-3xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm dark:border-zinc-800 dark:bg-zinc-950">
                {customer.email || "Correo no disponible"}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium tracking-[0.16em] text-zinc-500 uppercase">Teléfono</p>
              <div className="rounded-3xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm dark:border-zinc-800 dark:bg-zinc-950">
                {customer.phone || "No indicado"}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium tracking-[0.16em] text-zinc-500 uppercase">Última compra global</p>
              <div className="rounded-3xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm dark:border-zinc-800 dark:bg-zinc-950">
                {customer.lastOrderAt ? formatDate(customer.lastOrderAt) : "Sin compras registradas"}
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-zinc-200 bg-zinc-50 px-4 py-4 dark:border-zinc-800 dark:bg-zinc-950">
              <p className="text-xs font-medium tracking-[0.16em] text-zinc-500 uppercase">Pedidos totales</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight">{customer.ordersCount}</p>
            </div>
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
            <h3 className="text-sm font-medium">Actividad por sucursal</h3>
            <div className="mt-3 grid gap-3">
              {customer.activeBranches.length > 0 ? (
                customer.activeBranches.map((branch) => (
                  <article key={branch.branchSlug} className="rounded-3xl border border-zinc-200 p-4 dark:border-zinc-800">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-zinc-950 dark:text-zinc-50">{branch.branchSlug}</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">Última compra: {formatDate(branch.lastOrderAt)}</p>
                      </div>
                      <div className="text-right text-sm text-zinc-600 dark:text-zinc-400">
                        <p>{branch.ordersCount} pedidos</p>
                        <p>USD {branch.totalUsd.toFixed(2)}</p>
                        <p>VES {branch.totalVes.toFixed(2)}</p>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-zinc-300 px-4 py-4 text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                  Sin compras registradas en sucursales.
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium">Pedidos recientes globales</h3>
            <div className="mt-3 space-y-3">
              {customer.orders.length > 0 ? (
                customer.orders.map((order) => (
                  <article key={order.id} className="rounded-3xl border border-zinc-200 p-4 dark:border-zinc-800">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="font-medium text-zinc-950 dark:text-zinc-50">Pedido {order.id}</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">{formatDate(order.createdAt)}</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">Sucursal: {order.branchSlug}</p>
                      </div>
                      <div className="text-right text-sm">
                        <p className="font-medium">{getOrderStatusLabel(order)}</p>
                        <p className="text-zinc-500 dark:text-zinc-400">USD {order.subtotalUsd.toFixed(2)}</p>
                        <p className="text-zinc-500 dark:text-zinc-400">VES {order.subtotalVes.toFixed(2)}</p>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-zinc-300 px-4 py-4 text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                  Este cliente aún no tiene compras globales registradas.
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
