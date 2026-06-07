import type { Metadata } from "next"

import { AdminBranchesTable } from "@/components/admin/admin-branches-table"
import { AdminShell } from "@/components/admin/admin-shell"
import { listAdminBranchesOverview } from "@/lib/admin-branches"

export const metadata: Metadata = {
  title: "Sucursales | Shanghaipf Commerce",
  description: "Vista central de sucursales activas y su estado operativo.",
}

export default async function AdminBranchesPage() {
  const branches = await listAdminBranchesOverview()

  return (
    <AdminShell currentLabel="Sucursales">
      <main className="flex flex-1 flex-col gap-6">
        <header className="rounded-4xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm font-medium tracking-[0.16em] text-zinc-500 uppercase dark:text-zinc-400">
            Operación central
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Sucursales</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-600 dark:text-zinc-400">
            Supervisa el estado operativo de cada sucursal y accede rápidamente a su dashboard local, horarios y storefront público.
          </p>
        </header>

        <AdminBranchesTable branches={branches} />
      </main>
    </AdminShell>
  )
}
