import Link from "next/link"

import { type AdminBranchOverview } from "@/lib/admin-branches"

function getOnlineModeLabel(mode: AdminBranchOverview["onlineOrderMode"]) {
  switch (mode) {
    case "force_open":
      return "Apertura manual"
    case "force_closed":
      return "Cierre manual"
    default:
      return "Horario automático"
  }
}

export function AdminBranchesTable({ branches }: { branches: AdminBranchOverview[] }) {
  return (
    <section className="rounded-4xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between gap-4 border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <div>
          <h2 className="text-lg font-semibold">Sucursales activas</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {branches.length} sucursales disponibles para operación y supervisión central.
          </p>
        </div>
      </div>

      {branches.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-zinc-50 text-zinc-500 dark:bg-zinc-950 dark:text-zinc-400">
              <tr>
                <th className="px-6 py-4 font-medium">Sucursal</th>
                <th className="px-6 py-4 font-medium">Canal online</th>
                <th className="px-6 py-4 font-medium">Modo</th>
                <th className="px-6 py-4 font-medium">Días configurados</th>
                <th className="px-6 py-4 font-medium">Estado</th>
                <th className="px-6 py-4 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {branches.map((branch) => (
                <tr key={branch.slug} className="border-t border-zinc-200 dark:border-zinc-800">
                  <td className="px-6 py-4 align-top">
                    <div className="space-y-1">
                      <p className="font-medium text-zinc-950 dark:text-zinc-50">{branch.title}</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">{branch.slug}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <span className={branch.isOpen ? "text-emerald-700 dark:text-emerald-400" : "text-amber-700 dark:text-amber-400"}>
                      {branch.isOpen ? "Abierto" : "Cerrado"}
                    </span>
                  </td>
                  <td className="px-6 py-4 align-top text-zinc-700 dark:text-zinc-300">
                    {getOnlineModeLabel(branch.onlineOrderMode)}
                  </td>
                  <td className="px-6 py-4 align-top text-zinc-700 dark:text-zinc-300">
                    {branch.configuredDays}/7
                  </td>
                  <td className="px-6 py-4 align-top text-zinc-700 dark:text-zinc-300">
                    {branch.message}
                  </td>
                  <td className="px-6 py-4 align-top">
                    <div className="flex flex-wrap gap-3">
                      <Link
                        href={`/admin/${branch.slug}`}
                        className="text-sm font-medium text-zinc-950 underline-offset-4 hover:underline dark:text-zinc-50"
                      >
                        Dashboard
                      </Link>
                      <Link
                        href={`/admin/${branch.slug}/settings`}
                        className="text-sm font-medium text-zinc-950 underline-offset-4 hover:underline dark:text-zinc-50"
                      >
                        Configurar
                      </Link>
                      <Link
                        href={`/tienda/${branch.slug}`}
                        className="text-sm font-medium text-zinc-950 underline-offset-4 hover:underline dark:text-zinc-50"
                      >
                        Storefront
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="px-6 py-10 text-sm text-zinc-500 dark:text-zinc-400">
          No hay sucursales activas registradas en el sistema.
        </div>
      )}
    </section>
  )
}
