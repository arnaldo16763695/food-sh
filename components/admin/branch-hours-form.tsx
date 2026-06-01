"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { type BranchHour } from "@/lib/branch-hours"
import { type Branch } from "@/lib/branches"

const weekdayLabels = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
]

type BranchHoursFormProps = {
  branch: Branch
  initialHours: BranchHour[]
}

type EditableHour = BranchHour & {
  error: string | null
}

export function BranchHoursForm({ branch, initialHours }: BranchHoursFormProps) {
  const router = useRouter()
  const [hours, setHours] = useState<EditableHour[]>(() =>
    initialHours.map((hour) => ({ ...hour, error: null })),
  )
  const [onlineOrderMode, setOnlineOrderMode] = useState(branch.onlineOrderMode)
  const [onlineModeError, setOnlineModeError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function updateHour(weekday: number, patch: Partial<EditableHour>) {
    setHours((current) =>
      current.map((hour) => (hour.weekday === weekday ? { ...hour, ...patch } : hour)),
    )
  }

  function handleSave(hour: EditableHour) {
    updateHour(hour.weekday, { error: null })

    startTransition(async () => {
      const response = await fetch(`/api/admin/branches/${branch.slug}/hours/${hour.weekday}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          opensAt: hour.opensAt,
          closesAt: hour.closesAt,
          isClosed: hour.isClosed,
        }),
      })

      const result = (await response.json()) as { error?: string }

      if (!response.ok) {
        updateHour(hour.weekday, { error: result.error ?? "No se pudo guardar." })
        return
      }

      router.refresh()
    })
  }

  function handleSaveOnlineMode() {
    setOnlineModeError(null)

    startTransition(async () => {
      const response = await fetch(`/api/admin/branches/${branch.slug}/online-order-mode`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ onlineOrderMode }),
      })

      const result = (await response.json()) as { error?: string }

      if (!response.ok) {
        setOnlineModeError(result.error ?? "No se pudo guardar el modo online.")
        return
      }

      router.refresh()
    })
  }

  return (
    <div className="grid gap-4">
      <section className="rounded-4xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h3 className="text-lg font-semibold">Estado manual de ventas online</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Usa este control para pausar o forzar temporalmente las ventas online sin modificar el horario semanal.
            </p>
          </div>

          <div className="grid gap-2 sm:min-w-72">
            <label className="grid gap-2">
              <span className="text-sm font-medium">Modo online</span>
              <select
                value={onlineOrderMode}
                onChange={(event) => setOnlineOrderMode(event.target.value as Branch["onlineOrderMode"])}
                className="h-10 rounded-3xl border border-zinc-300 bg-white px-4 text-sm outline-none transition-colors focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950"
              >
                <option value="auto">Automático por horario</option>
                <option value="force_closed">Pausar ventas online</option>
                <option value="force_open">Forzar apertura online</option>
              </select>
            </label>

            <div className="flex justify-end">
              <Button onClick={handleSaveOnlineMode} disabled={isPending}>
                {isPending ? "Guardando..." : "Guardar modo"}
              </Button>
            </div>
          </div>
        </div>

        {onlineModeError ? <p className="mt-3 text-sm text-red-600 dark:text-red-400">{onlineModeError}</p> : null}
      </section>

      {hours.map((hour) => (
        <article key={hour.weekday} className="rounded-4xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-lg font-semibold">{weekdayLabels[hour.weekday]}</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {hour.isClosed
                  ? "Sucursal cerrada este día."
                  : `Horario actual: ${hour.opensAt ?? "--:--"} - ${hour.closesAt ?? "--:--"}`}
              </p>
            </div>

            <label className="inline-flex items-center gap-3 rounded-full border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700">
              <input
                type="checkbox"
                checked={hour.isClosed}
                onChange={(event) => updateHour(hour.weekday, { isClosed: event.target.checked })}
              />
              Cerrar este día
            </label>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_auto]">
            <label className="grid gap-2">
              <span className="text-sm font-medium">Apertura</span>
              <Input
                type="time"
                value={hour.opensAt ?? "08:00"}
                disabled={hour.isClosed}
                onChange={(event) => updateHour(hour.weekday, { opensAt: event.target.value })}
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-medium">Cierre</span>
              <Input
                type="time"
                value={hour.closesAt ?? "20:00"}
                disabled={hour.isClosed}
                onChange={(event) => updateHour(hour.weekday, { closesAt: event.target.value })}
              />
            </label>

            <div className="flex items-end">
              <Button onClick={() => handleSave(hour)} disabled={isPending} className="w-full xl:w-auto">
                {isPending ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </div>

          {hour.error ? <p className="mt-3 text-sm text-red-600 dark:text-red-400">{hour.error}</p> : null}
        </article>
      ))}
    </div>
  )
}
