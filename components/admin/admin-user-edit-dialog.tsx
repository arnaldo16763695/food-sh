"use client"

import { Pencil } from "lucide-react"
import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"

import {
  AdminUserAssignmentsEditor,
  AdminUserBaseFields,
  createEmptyAssignment,
  getAssignmentsPayload,
  roleLabels,
  type AssignmentDraft,
  type BranchOption,
} from "@/components/admin/admin-user-dialog-shared"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { type AdminUserRecord } from "@/lib/admin-users"

export function AdminUserEditDialog({
  user,
  branches,
}: {
  user: AdminUserRecord
  branches: BranchOption[]
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [form, setForm] = useState({
    fullName: user.fullName,
    isSuperadmin: user.isSuperadmin,
  })
  const [assignments, setAssignments] = useState<AssignmentDraft[]>(
    user.assignments.length > 0
      ? user.assignments.map((assignment) => ({ branchId: assignment.branchId, role: assignment.role }))
      : [createEmptyAssignment()],
  )

  const hasUnsavedChanges = useMemo(() => {
    const baseChanged = form.fullName !== user.fullName || form.isSuperadmin !== user.isSuperadmin
    const currentAssignments = JSON.stringify(getAssignmentsPayload(assignments, form.isSuperadmin))
    const initialAssignments = JSON.stringify(
      getAssignmentsPayload(
        user.assignments.length > 0
          ? user.assignments.map((assignment) => ({ branchId: assignment.branchId, role: assignment.role }))
          : [createEmptyAssignment()],
        user.isSuperadmin,
      ),
    )

    return baseChanged || currentAssignments !== initialAssignments
  }, [assignments, form.fullName, form.isSuperadmin, user])

  function resetForm() {
    setForm({
      fullName: user.fullName,
      isSuperadmin: user.isSuperadmin,
    })
    setAssignments(
      user.assignments.length > 0
        ? user.assignments.map((assignment) => ({ branchId: assignment.branchId, role: assignment.role }))
        : [createEmptyAssignment()],
    )
    setError(null)
    setFeedback(null)
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && hasUnsavedChanges) {
      const shouldClose = window.confirm("Hay cambios sin guardar. ¿Deseas cerrar igualmente?")

      if (!shouldClose) {
        return
      }
    }

    if (!nextOpen) {
      resetForm()
    }

    setOpen(nextOpen)
  }

  function updateAssignment(index: number, patch: Partial<AssignmentDraft>) {
    setAssignments((current) =>
      current.map((assignment, currentIndex) =>
        currentIndex === index ? { ...assignment, ...patch } : assignment,
      ),
    )
  }

  function handleSave() {
    setError(null)
    setFeedback(null)

    startTransition(async () => {
      const response = await fetch(`/api/admin/users/${user.userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assignments: getAssignmentsPayload(assignments, form.isSuperadmin),
          fullName: form.fullName,
          isSuperadmin: form.isSuperadmin,
        }),
      })

      const result = (await response.json()) as { error?: string }

      if (!response.ok) {
        setError(result.error ?? "No se pudo actualizar el usuario.")
        return
      }

      setOpen(false)
      router.refresh()
    })
  }

  function handleResendInvite() {
    setError(null)
    setFeedback(null)

    startTransition(async () => {
      const response = await fetch(`/api/admin/users/${user.userId}/invite`, {
        method: "POST",
      })

      const result = (await response.json()) as {
        data?: { deliveryMethod?: "console" | "resend" }
        error?: string
      }

      if (!response.ok) {
        setError(result.error ?? "No se pudo reenviar el acceso.")
        return
      }

      setFeedback(
        result.data?.deliveryMethod === "console"
          ? "Enlace regenerado. Revisa la consola del servidor para copiarlo."
          : "Enlace de acceso reenviado correctamente por correo.",
      )
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon-sm" aria-label={`Editar ${user.fullName || user.email}`}>
          <Pencil />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar usuario</DialogTitle>
          <DialogDescription>
            Ajusta el perfil administrativo y los permisos de <strong>{user.fullName || user.email}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <p className="text-xs font-medium tracking-[0.16em] text-zinc-500 uppercase">Correo</p>
              <div className="rounded-3xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm dark:border-zinc-800 dark:bg-zinc-950">
                {user.email || "Correo no disponible"}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium tracking-[0.16em] text-zinc-500 uppercase">Acceso actual</p>
              <div className="rounded-3xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm dark:border-zinc-800 dark:bg-zinc-950">
                {user.isSuperadmin
                  ? "Superadmin"
                  : user.assignments.length > 0
                    ? user.assignments.map((assignment) => `${assignment.branchTitle}: ${roleLabels[assignment.role]}`).join(" | ")
                    : "Sin sucursales asignadas"}
              </div>
            </div>
          </div>

          <AdminUserBaseFields
            fullName={form.fullName}
            isSuperadmin={form.isSuperadmin}
            onFullNameChange={(value) => setForm((current) => ({ ...current, fullName: value }))}
            onIsSuperadminChange={(value) => setForm((current) => ({ ...current, isSuperadmin: value }))}
            showEmail={false}
            showPassword={false}
          />

          {!form.isSuperadmin ? (
            <AdminUserAssignmentsEditor
              assignments={assignments}
              branches={branches}
              onAdd={() => setAssignments((current) => [...current, createEmptyAssignment()])}
              onChange={updateAssignment}
              onRemove={(index) => setAssignments((current) => current.filter((_, currentIndex) => currentIndex !== index))}
            />
          ) : null}

          {feedback ? (
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-500/10 dark:text-emerald-300">
              {feedback}
            </div>
          ) : null}

          {error ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-500/10 dark:text-red-300">
              {error}
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleResendInvite} disabled={isPending}>
            Reenviar acceso
          </Button>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isPending || !hasUnsavedChanges}>
            {isPending ? "Guardando..." : "Guardar cambios"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
