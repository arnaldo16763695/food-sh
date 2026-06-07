import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"

import { AdminShell } from "@/components/admin/admin-shell"
import { listAccessibleAdminBranches, requireAdminSession } from "@/lib/admin-auth"

export const metadata: Metadata = {
  title: "Administración | Shanghaipf Commerce",
  description: "Dashboard central del panel administrativo de Shanghaipf.",
}

export default async function AdminPage() {
  const { profile, user } = await requireAdminSession("/admin")
  const accessibleBranches = await listAccessibleAdminBranches(user.id)

  if (!profile.isSuperadmin) {
    const firstBranch = accessibleBranches[0]

    if (!firstBranch) {
      return (
        <main className="min-h-screen bg-zinc-50 px-6 py-10 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50 sm:px-8 lg:px-10">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
            <section className="rounded-4xl border border-dashed border-zinc-300 bg-white p-8 dark:border-zinc-700 dark:bg-zinc-900">
              <h2 className="text-lg font-semibold">Sin sucursales asignadas</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-600 dark:text-zinc-400">
                El usuario {profile.fullName || user.email || user.id} no tiene sucursales activas asignadas.
                Crea registros en <code>admin_profiles</code> y <code>admin_branch_access</code> para habilitar el acceso.
              </p>
            </section>
          </div>
        </main>
      )
    }

    redirect(`/admin/${firstBranch.branchSlug}`)
  }

  const branches = accessibleBranches.map((branch) => ({
    slug: branch.branchSlug,
    title: branch.branchTitle,
  }))

  return (
    <AdminShell currentLabel="Operación central">
      <main className="flex flex-1 flex-col gap-6">
        <header className="rounded-4xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium tracking-[0.16em] text-zinc-500 uppercase dark:text-zinc-400">
                Operación central
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight">Dashboard de superadmin</h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-600 dark:text-zinc-400">
                Gestiona la operación global de la empresa, administra usuarios del sistema, clientes globales y accede a cada sucursal desde un espacio centralizado.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/admin/users"
                className="inline-flex h-11 items-center justify-center rounded-full bg-zinc-950 px-5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-300"
              >
                Gestionar usuarios
              </Link>
              <Link
                href="/admin/customers"
                className="inline-flex h-11 items-center justify-center rounded-full border border-zinc-300 px-5 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
              >
                Ver clientes globales
              </Link>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-4xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-sm font-medium tracking-[0.16em] text-zinc-500 uppercase dark:text-zinc-400">Usuarios</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">Sistema administrativo</h2>
            <p className="mt-3 text-sm leading-7 text-zinc-600 dark:text-zinc-400">
              Administra superadmins, encargados y operadores por sucursal desde una sola vista global.
            </p>
            <div className="mt-6">
              <Link href="/admin/users" className="text-sm font-medium text-zinc-950 underline-offset-4 hover:underline dark:text-zinc-50">
                Ir a usuarios
              </Link>
            </div>
          </article>

          <article className="rounded-4xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-sm font-medium tracking-[0.16em] text-zinc-500 uppercase dark:text-zinc-400">Clientes</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">Base global</h2>
            <p className="mt-3 text-sm leading-7 text-zinc-600 dark:text-zinc-400">
              Consulta clientes del sistema con actividad consolidada entre sucursales y detalle cross-sucursal.
            </p>
            <div className="mt-6">
              <Link href="/admin/customers" className="text-sm font-medium text-zinc-950 underline-offset-4 hover:underline dark:text-zinc-50">
                Ir a clientes
              </Link>
            </div>
          </article>

          <article className="rounded-4xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-sm font-medium tracking-[0.16em] text-zinc-500 uppercase dark:text-zinc-400">Sucursales</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">{branches.length}</h2>
            <p className="mt-3 text-sm leading-7 text-zinc-600 dark:text-zinc-400">
              Sucursales activas disponibles para monitoreo y gestión operativa desde el panel administrativo.
            </p>
          </article>
        </section>

        <section className="rounded-4xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between gap-4 border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
            <div>
              <h2 className="text-lg font-semibold">Sucursales activas</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Accesos directos a dashboards operativos por sucursal.</p>
            </div>
          </div>

          {branches.length > 0 ? (
            <div className="grid gap-4 p-6 md:grid-cols-2">
              {branches.map((branch) => (
                <article
                  key={branch.slug}
                  className="rounded-4xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <p className="text-sm font-medium tracking-[0.16em] text-zinc-500 uppercase dark:text-zinc-400">Sucursal</p>
                  <h3 className="mt-3 text-2xl font-semibold tracking-tight">{branch.title}</h3>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      href={`/admin/${branch.slug}`}
                      className="inline-flex h-11 items-center justify-center rounded-full bg-zinc-950 px-5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-300"
                    >
                      Abrir dashboard
                    </Link>
                    <Link
                      href={`/tienda/${branch.slug}`}
                      className="inline-flex h-11 items-center justify-center rounded-full border border-zinc-300 px-5 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                    >
                      Ver storefront
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="px-6 py-10 text-sm text-zinc-500 dark:text-zinc-400">
              No hay sucursales activas disponibles para este superadmin.
            </div>
          )}
        </section>
      </main>
    </AdminShell>
  )
}
