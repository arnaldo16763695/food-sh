import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { AdminCustomersTable } from "@/components/admin/admin-customers-table"
import { requireAdminBranchAccess } from "@/lib/admin-auth"
import { listAdminCustomersByBranch } from "@/lib/admin-customers"
import { getPublicBranchBySlug } from "@/lib/branches"

type AdminCustomersPageProps = {
  params: Promise<{ branchSlug: string }>
}

export async function generateMetadata({ params }: AdminCustomersPageProps): Promise<Metadata> {
  const { branchSlug } = await params
  const branch = await getPublicBranchBySlug(branchSlug)

  return {
    title: branch ? `${branch.title} | Clientes | Shanghaipf Commerce` : "Clientes | Shanghaipf Commerce",
  }
}

export default async function AdminCustomersPage({ params }: AdminCustomersPageProps) {
  const { branchSlug } = await params
  const branch = await getPublicBranchBySlug(branchSlug)

  if (!branch) {
    notFound()
  }

  await requireAdminBranchAccess(branch.slug)
  const customers = await listAdminCustomersByBranch(branch.slug)

  return (
    <main className="flex flex-1 flex-col gap-6">
      <header className="rounded-4xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium tracking-[0.16em] text-zinc-500 uppercase dark:text-zinc-400">
              Clientes
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">{branch.title}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-600 dark:text-zinc-400">
              Revisa los clientes registrados que ya compraron en esta sucursal y consulta su historial reciente.
            </p>
          </div>
        </div>
      </header>

      <AdminCustomersTable customers={customers} />
    </main>
  )
}
