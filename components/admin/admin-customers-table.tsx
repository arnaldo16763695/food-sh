"use client"

import { useMemo, useState } from "react"

import { AdminCustomerDetailDialog } from "@/components/admin/admin-customer-detail-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { type AdminBranchCustomerSummary } from "@/lib/admin-customers"

type CustomerFilter = "all" | "recent" | "repeat"

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-VE", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Caracas",
  }).format(new Date(value))
}

function isRecent(date: string) {
  const lastOrderTime = new Date(date).getTime()
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
  return lastOrderTime >= thirtyDaysAgo
}

export function AdminCustomersTable({
  customers,
}: {
  customers: AdminBranchCustomerSummary[]
}) {
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<CustomerFilter>("all")

  const filteredCustomers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return customers.filter((customer) => {
      const matchesQuery =
        !normalizedQuery ||
        customer.fullName.toLowerCase().includes(normalizedQuery) ||
        customer.email.toLowerCase().includes(normalizedQuery) ||
        customer.phone.toLowerCase().includes(normalizedQuery)

      if (!matchesQuery) {
        return false
      }

      if (filter === "recent") {
        return isRecent(customer.lastOrderAt)
      }

      if (filter === "repeat") {
        return customer.ordersCount > 1
      }

      return true
    })
  }, [customers, filter, query])

  return (
    <section className="rounded-4xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-col gap-4 border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <div>
          <h2 className="text-lg font-semibold">Clientes registrados</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {customers.length} clientes con actividad registrada en esta sucursal.
          </p>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por nombre, correo o teléfono"
              className="h-10 rounded-3xl px-4"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => setFilter("all")}
            >
              Todos
            </Button>
            <Button
              type="button"
              variant={filter === "recent" ? "default" : "outline"}
              onClick={() => setFilter("recent")}
            >
              Últimos 30 días
            </Button>
            <Button
              type="button"
              variant={filter === "repeat" ? "default" : "outline"}
              onClick={() => setFilter("repeat")}
            >
              Recurrentes
            </Button>
          </div>
        </div>
      </div>

      {filteredCustomers.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-zinc-50 text-zinc-500 dark:bg-zinc-950 dark:text-zinc-400">
              <tr>
                <th className="px-6 py-4 font-medium">Cliente</th>
                <th className="px-6 py-4 font-medium">Correo</th>
                <th className="px-6 py-4 font-medium">Teléfono</th>
                <th className="px-6 py-4 font-medium">Pedidos</th>
                <th className="px-6 py-4 font-medium">Última compra</th>
                <th className="px-6 py-4 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer.userId} className="border-t border-zinc-200 dark:border-zinc-800">
                  <td className="px-6 py-4 align-top">
                    <div className="space-y-1">
                      <p className="font-medium text-zinc-950 dark:text-zinc-50">{customer.fullName}</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">ID {customer.userId}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top text-zinc-700 dark:text-zinc-300">{customer.email}</td>
                  <td className="px-6 py-4 align-top text-zinc-700 dark:text-zinc-300">
                    {customer.phone || "No indicado"}
                  </td>
                  <td className="px-6 py-4 align-top text-zinc-700 dark:text-zinc-300">
                    {customer.ordersCount}
                  </td>
                  <td className="px-6 py-4 align-top text-zinc-700 dark:text-zinc-300">
                    {formatDate(customer.lastOrderAt)}
                  </td>
                  <td className="px-6 py-4 align-top">
                    <AdminCustomerDetailDialog customer={customer} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="px-6 py-10 text-sm text-zinc-500 dark:text-zinc-400">
          {customers.length === 0
            ? "Aún no hay clientes registrados con compras en esta sucursal."
            : "No se encontraron clientes con los filtros actuales."}
        </div>
      )}
    </section>
  )
}
