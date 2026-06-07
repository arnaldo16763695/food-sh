import type { Metadata } from "next"

import { AdminShell } from "@/components/admin/admin-shell"
import { AdminUsersTable } from "@/components/admin/admin-users-table"
import { listAdminUsers } from "@/lib/admin-users"
import { listPublicBranches } from "@/lib/branches"

export const metadata: Metadata = {
  title: "Usuarios Admin | Shanghaipf Commerce",
  description: "Gestión de usuarios y permisos administrativos.",
}

export default async function AdminUsersPage() {
  const [users, branches] = await Promise.all([listAdminUsers(), listPublicBranches()])

  return (
    <AdminShell currentLabel="Usuarios del sistema">
      <main className="flex flex-1 flex-col gap-6">
        <header className="rounded-4xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm font-medium tracking-[0.16em] text-zinc-500 uppercase dark:text-zinc-400">
            Operación central
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Usuarios del sistema</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-600 dark:text-zinc-400">
            Crea usuarios administrativos, define si tendrán acceso total como superadmin o si
            operarán sucursales específicas con perfil de encargado u operador.
          </p>
        </header>

        <AdminUsersTable
          branches={branches.map((branch) => ({
            id: branch.id,
            slug: branch.slug,
            title: branch.title,
          }))}
          users={users}
        />
      </main>
    </AdminShell>
  )
}
