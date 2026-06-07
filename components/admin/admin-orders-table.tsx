"use client"

import Link from "next/link"
import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { type AdminOrderListItem } from "@/lib/orders"

type OrderFilter = "all" | "received" | "validated" | "invoiced" | "cancelled"

function formatDate(value: string) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    hour: "2-digit",
    hour12: true,
    minute: "2-digit",
    month: "2-digit",
    timeZone: "America/Caracas",
    year: "numeric",
  }).formatToParts(new Date(value))

  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? ""
  const day = get("day")
  const month = get("month")
  const year = get("year")
  const hour = get("hour")
  const minute = get("minute")
  const dayPeriod = get("dayPeriod").toLowerCase()

  return `${day}/${month}/${year}, ${hour}:${minute} ${dayPeriod}`
}

function getOrderStatusLabel(order: {
  pagoValidado: boolean
  posFacturado: boolean
  status: "draft" | "submitted" | "cancelled"
}) {
  if (order.status === "cancelled") {
    return {
      className: "text-red-700 dark:text-red-400",
      key: "cancelled" as const,
      label: "Cancelado",
    }
  }

  if (order.posFacturado) {
    return {
      className: "text-emerald-700 dark:text-emerald-400",
      key: "invoiced" as const,
      label: "Facturado en POS",
    }
  }

  if (order.pagoValidado) {
    return {
      className: "text-sky-700 dark:text-sky-400",
      key: "validated" as const,
      label: "Pago validado",
    }
  }

  if (order.status === "submitted") {
    return {
      className: "text-amber-700 dark:text-amber-400",
      key: "received" as const,
      label: "Recibido",
    }
  }

  return {
    className: "text-zinc-700 dark:text-zinc-300",
    key: "all" as const,
    label: "Borrador",
  }
}

export function AdminOrdersTable({
  branchSlug,
  orders,
}: {
  branchSlug: string
  orders: AdminOrderListItem[]
}) {
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<OrderFilter>("all")

  const filteredOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return orders.filter((order) => {
      const status = getOrderStatusLabel(order)
      const matchesQuery =
        !normalizedQuery ||
        order.id.toLowerCase().includes(normalizedQuery) ||
        order.customerName.toLowerCase().includes(normalizedQuery) ||
        order.customerEmail.toLowerCase().includes(normalizedQuery)

      if (!matchesQuery) {
        return false
      }

      if (filter === "all") {
        return true
      }

      return status.key === filter
    })
  }, [filter, orders, query])

  return (
    <section className="rounded-4xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-col gap-4 border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <div>
          <h2 className="text-lg font-semibold">Pedidos registrados</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{orders.length} pedidos encontrados para esta sucursal.</p>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por pedido, cliente o correo"
            className="h-10 rounded-3xl px-4"
          />

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>
              Todos
            </Button>
            <Button type="button" variant={filter === "received" ? "default" : "outline"} onClick={() => setFilter("received")}>
              Recibidos
            </Button>
            <Button type="button" variant={filter === "validated" ? "default" : "outline"} onClick={() => setFilter("validated")}>
              Pago validado
            </Button>
            <Button type="button" variant={filter === "invoiced" ? "default" : "outline"} onClick={() => setFilter("invoiced")}>
              Facturados
            </Button>
            <Button type="button" variant={filter === "cancelled" ? "default" : "outline"} onClick={() => setFilter("cancelled")}>
              Cancelados
            </Button>
          </div>
        </div>
      </div>

      {filteredOrders.length > 0 ? (
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
              {filteredOrders.map((order) => {
                const status = getOrderStatusLabel(order)

                return (
                  <tr key={order.id} className="border-t border-zinc-200 dark:border-zinc-800">
                    <td className="px-6 py-4 align-top">
                      <Link href={`/admin/${branchSlug}/orders/${order.id}`} className="font-medium text-zinc-950 underline-offset-4 hover:underline dark:text-zinc-50">
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
                      <span className={status.className}>{status.label}</span>
                    </td>
                    <td className="px-6 py-4 align-top">{formatDate(order.createdAt)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="px-6 py-10 text-sm text-zinc-500 dark:text-zinc-400">
          {orders.length === 0 ? "Aún no hay pedidos registrados para esta sucursal." : "No se encontraron pedidos con los filtros actuales."}
        </div>
      )}
    </section>
  )
}
