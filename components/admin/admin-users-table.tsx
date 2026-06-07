import { AdminUserCreateDialog } from "@/components/admin/admin-user-create-dialog"
import {
  roleLabels,
  type BranchOption,
} from "@/components/admin/admin-user-dialog-shared"
import { AdminUserEditDialog } from "@/components/admin/admin-user-edit-dialog"
import { type AdminUserRecord } from "@/lib/admin-users"

function formatDate(date: string | null) {
  if (!date) {
    return "Sin ingreso registrado"
  }

  const parts = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    hour: "2-digit",
    hour12: true,
    minute: "2-digit",
    month: "2-digit",
    timeZone: "America/Caracas",
    year: "numeric",
  }).formatToParts(new Date(date))

  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? ""
  return `${get("day")}/${get("month")}/${get("year")}, ${get("hour")}:${get("minute")} ${get("dayPeriod").toLowerCase()}`
}

export function AdminUsersTable({
  branches,
  users,
}: {
  branches: BranchOption[]
  users: AdminUserRecord[]
}) {
  return (
    <section className="rounded-4xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between gap-4 border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <div>
          <h2 className="text-lg font-semibold">Usuarios administrativos</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {users.length} usuarios registrados con perfil administrativo.
          </p>
        </div>

        <AdminUserCreateDialog branches={branches} />
      </div>

      {users.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-zinc-50 text-zinc-500 dark:bg-zinc-950 dark:text-zinc-400">
              <tr>
                <th className="px-6 py-4 font-medium">Usuario</th>
                <th className="px-6 py-4 font-medium">Correo</th>
                <th className="px-6 py-4 font-medium">Perfil</th>
                <th className="px-6 py-4 font-medium">Sucursales</th>
                <th className="px-6 py-4 font-medium">Último acceso</th>
                <th className="px-6 py-4 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.userId} className="border-t border-zinc-200 dark:border-zinc-800">
                  <td className="px-6 py-4 align-top">
                    <div className="space-y-1">
                      <p className="font-medium text-zinc-950 dark:text-zinc-50">{user.fullName || user.userId}</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        Alta admin: {formatDate(user.createdAt)}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top text-zinc-700 dark:text-zinc-300">
                    {user.email || "Correo no disponible"}
                  </td>
                  <td className="px-6 py-4 align-top">
                    <span className={user.isSuperadmin ? "text-emerald-700 dark:text-emerald-400" : "text-zinc-700 dark:text-zinc-300"}>
                      {user.isSuperadmin ? "Superadmin" : "Acceso por sucursal"}
                    </span>
                  </td>
                  <td className="px-6 py-4 align-top">
                    {user.isSuperadmin ? (
                      <span className="text-zinc-700 dark:text-zinc-300">Todas las activas</span>
                    ) : user.assignments.length > 0 ? (
                      <div className="space-y-1">
                        {user.assignments.map((assignment) => (
                          <p key={`${user.userId}-${assignment.branchId}`} className="text-xs text-zinc-700 dark:text-zinc-300">
                            {assignment.branchTitle}: {roleLabels[assignment.role]}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <span className="text-amber-700 dark:text-amber-300">Sin sucursales asignadas</span>
                    )}
                  </td>
                  <td className="px-6 py-4 align-top text-zinc-700 dark:text-zinc-300">
                    {formatDate(user.lastSignInAt)}
                  </td>
                  <td className="px-6 py-4 align-top">
                    <AdminUserEditDialog user={user} branches={branches} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="px-6 py-10 text-sm text-zinc-500 dark:text-zinc-400">
          Aún no hay usuarios administrativos registrados.
        </div>
      )}
    </section>
  )
}
