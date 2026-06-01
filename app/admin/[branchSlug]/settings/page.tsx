import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { BranchHoursForm } from "@/components/admin/branch-hours-form"
import { requireAdminBranchAccess } from "@/lib/admin-auth"
import { getPublicBranchBySlug } from "@/lib/branches"
import { listAdminBranchHours } from "@/lib/branch-hours"

type AdminSettingsPageProps = {
  params: Promise<{ branchSlug: string }>
}

export async function generateMetadata({ params }: AdminSettingsPageProps): Promise<Metadata> {
  const { branchSlug } = await params
  const branch = await getPublicBranchBySlug(branchSlug)

  return {
    title: branch ? `${branch.title} | Horarios | Shanghaipf Commerce` : "Horarios | Shanghaipf Commerce",
  }
}

export default async function AdminSettingsPage({ params }: AdminSettingsPageProps) {
  const { branchSlug } = await params
  const branch = await getPublicBranchBySlug(branchSlug)

  if (!branch) {
    notFound()
  }

  await requireAdminBranchAccess(branch.slug)
  const hours = await listAdminBranchHours(branch.slug)

  return (
    <main className="flex flex-1 flex-col gap-6">
      <header className="rounded-4xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-sm font-medium tracking-[0.16em] text-zinc-500 uppercase dark:text-zinc-400">
          Horarios
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">{branch.title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-600 dark:text-zinc-400">
          Define el horario de apertura y cierre por día. El checkout solo permitirá pedidos cuando la sucursal esté disponible.
        </p>
      </header>

      <BranchHoursForm branch={branch} initialHours={hours} />
    </main>
  )
}
