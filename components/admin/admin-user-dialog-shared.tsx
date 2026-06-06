import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { type AdminUserBranchRole } from "@/lib/admin-users"

export type BranchOption = {
  id: string
  slug: string
  title: string
}

export type AssignmentDraft = {
  branchId: string
  role: AdminUserBranchRole
}

export const roleLabels: Record<AdminUserBranchRole, string> = {
  branch_manager: "Encargado de sucursal",
  branch_operator: "Operador de sucursal",
}

export function createEmptyAssignment(): AssignmentDraft {
  return {
    branchId: "",
    role: "branch_operator",
  }
}

export function getAssignmentsPayload(assignments: AssignmentDraft[], isSuperadmin: boolean) {
  if (isSuperadmin) {
    return []
  }

  return assignments.filter((assignment) => assignment.branchId)
}

export function AdminUserAssignmentsEditor({
  assignments,
  branches,
  onAdd,
  onChange,
  onRemove,
}: {
  assignments: AssignmentDraft[]
  branches: BranchOption[]
  onAdd: () => void
  onChange: (index: number, patch: Partial<AssignmentDraft>) => void
  onRemove: (index: number) => void
}) {
  return (
    <div className="rounded-3xl border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-medium">Sucursales y roles</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Asigna una o varias sucursales con su rol operativo.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={onAdd}>
          Agregar sucursal
        </Button>
      </div>

      <div className="mt-4 grid gap-3">
        {assignments.map((assignment, index) => (
          <div
            key={`assignment-${index}`}
            className="grid gap-3 rounded-3xl border border-zinc-200 p-3 md:grid-cols-[1fr_1fr_auto] dark:border-zinc-800"
          >
            <label className="grid gap-2">
              <span className="text-sm font-medium">Sucursal</span>
              <select
                value={assignment.branchId}
                onChange={(event) => onChange(index, { branchId: event.target.value })}
                className="h-10 rounded-3xl border border-zinc-300 bg-white px-4 text-sm outline-none transition-colors focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950"
              >
                <option value="">Selecciona una sucursal</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.title} ({branch.slug})
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium">Rol</span>
              <select
                value={assignment.role}
                onChange={(event) => onChange(index, { role: event.target.value as AdminUserBranchRole })}
                className="h-10 rounded-3xl border border-zinc-300 bg-white px-4 text-sm outline-none transition-colors focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950"
              >
                <option value="branch_operator">Operador de sucursal</option>
                <option value="branch_manager">Encargado de sucursal</option>
              </select>
            </label>

            <div className="flex items-end">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onRemove(index)}
                disabled={assignments.length === 1}
              >
                Quitar
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function AdminUserBaseFields({
  fullName,
  email,
  password,
  isSuperadmin,
  onFullNameChange,
  onEmailChange,
  onPasswordChange,
  onIsSuperadminChange,
  showEmail,
  showPassword,
}: {
  fullName: string
  email?: string
  password?: string
  isSuperadmin: boolean
  onFullNameChange: (value: string) => void
  onEmailChange?: (value: string) => void
  onPasswordChange?: (value: string) => void
  onIsSuperadminChange: (value: boolean) => void
  showEmail: boolean
  showPassword: boolean
}) {
  return (
    <>
      <div className={`grid gap-4 ${showEmail || showPassword ? "md:grid-cols-2 xl:grid-cols-3" : "md:grid-cols-2"}`}>
        <label className="grid gap-2">
          <span className="text-sm font-medium">Nombre completo</span>
          <Input required value={fullName} onChange={(event) => onFullNameChange(event.target.value)} />
        </label>

        {showEmail ? (
          <label className="grid gap-2">
            <span className="text-sm font-medium">Correo electrónico</span>
            <Input
              required
              type="email"
              value={email}
              onChange={(event) => onEmailChange?.(event.target.value)}
              placeholder="usuario@empresa.com"
            />
          </label>
        ) : null}

        {showPassword ? (
          <label className="grid gap-2">
            <span className="text-sm font-medium">Contraseña inicial</span>
            <Input
              type="password"
              value={password}
              onChange={(event) => onPasswordChange?.(event.target.value)}
              placeholder="Opcional. Si la omites, se genera una temporal"
            />
          </label>
        ) : null}
      </div>

      <label className="inline-flex items-center gap-3 rounded-3xl border border-zinc-200 px-4 py-3 text-sm dark:border-zinc-800">
        <input
          type="checkbox"
          checked={isSuperadmin}
          onChange={(event) => onIsSuperadminChange(event.target.checked)}
        />
        Conceder perfil de superadmin
      </label>
    </>
  )
}
