"use client"

import { Plus } from "lucide-react"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"

import {
  AdminUserAssignmentsEditor,
  AdminUserBaseFields,
  createEmptyAssignment,
  getAssignmentsPayload,
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

export function AdminUserCreateDialog({ branches }: { branches: BranchOption[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [form, setForm] = useState({
    email: "",
    fullName: "",
    isSuperadmin: false,
    password: "",
  })
  const [assignments, setAssignments] = useState<AssignmentDraft[]>([createEmptyAssignment()])

  function resetForm() {
    setForm({ email: "", fullName: "", isSuperadmin: false, password: "" })
    setAssignments([createEmptyAssignment()])
    setError(null)
    setSuccess(null)
  }

  function handleOpenChange(nextOpen: boolean) {
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
    setSuccess(null)

    startTransition(async () => {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assignments: getAssignmentsPayload(assignments, form.isSuperadmin),
          email: form.email,
          fullName: form.fullName,
          isSuperadmin: form.isSuperadmin,
          password: form.password,
        }),
      })

      const result = (await response.json()) as {
        data?: { deliveryMethod?: "console" | "resend" }
        error?: string
      }

      if (!response.ok) {
        setError(result.error ?? "No se pudo crear el usuario.")
        return
      }

      setSuccess(
        result.data?.deliveryMethod === "console"
          ? "Usuario guardado. Revisa la consola del servidor para copiar el enlace de acceso."
          : "Usuario guardado. Se envió el enlace de acceso por correo.",
      )
      router.refresh()
      window.setTimeout(() => {
        setOpen(false)
      }, 900)
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Agregar usuario
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agregar usuario administrativo</DialogTitle>
          <DialogDescription>
            Crea un usuario nuevo o promueve uno existente por correo. El sistema enviará un enlace para configurar el acceso.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5">
          <AdminUserBaseFields
            fullName={form.fullName}
            email={form.email}
            password={form.password}
            isSuperadmin={form.isSuperadmin}
            onFullNameChange={(value) => setForm((current) => ({ ...current, fullName: value }))}
            onEmailChange={(value) => setForm((current) => ({ ...current, email: value }))}
            onPasswordChange={(value) => setForm((current) => ({ ...current, password: value }))}
            onIsSuperadminChange={(value) => setForm((current) => ({ ...current, isSuperadmin: value }))}
            showEmail
            showPassword
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

          {error ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-500/10 dark:text-red-300">
              {error}
            </div>
          ) : null}

          {success ? (
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-500/10 dark:text-emerald-300">
              {success}
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? "Guardando..." : "Guardar usuario"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
