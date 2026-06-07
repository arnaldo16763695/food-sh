import type { Metadata } from "next"

import { AdminGlobalCustomersTable } from "@/components/admin/admin-global-customers-table"
import { AdminShell } from "@/components/admin/admin-shell"
import { listGlobalAdminCustomers } from "@/lib/admin-customers"

export const metadata: Metadata = {
  title: "Clientes Globales | Shanghaipf Commerce",
  description: "Vista global de clientes registrados en el sistema.",
}

export default async function AdminGlobalCustomersPage() {
  const customers = await listGlobalAdminCustomers()

  return (
    <AdminShell currentLabel="Clientes globales">
      <main className="flex flex-1 flex-col gap-6">
        <header className="rounded-4xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm font-medium tracking-[0.16em] text-zinc-500 uppercase dark:text-zinc-400">
            Operación central
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Clientes del sistema</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-600 dark:text-zinc-400">
            Consulta la base global de clientes registrados y revisa su actividad consolidada entre sucursales.
          </p>
        </header>

        <AdminGlobalCustomersTable customers={customers} />
      </main>
    </AdminShell>
  )
}
