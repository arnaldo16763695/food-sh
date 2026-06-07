"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"

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
import { Input } from "@/components/ui/input"
import { type AdminOrderDetail } from "@/lib/orders"

type AdminOrderActionsProps = {
  branchSlug: string
  order: AdminOrderDetail
}

function getStatusLabel(order: Pick<AdminOrderDetail, "status" | "pagoValidado" | "posFacturado">) {
  if (order.status === "cancelled") {
    return "Cancelado"
  }

  if (order.posFacturado) {
    return "Facturado en POS"
  }

  if (order.pagoValidado) {
    return "Pago validado"
  }

  return "Recibido"
}

export function AdminOrderActions({ branchSlug, order }: AdminOrderActionsProps) {
  const router = useRouter()
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [paymentReference, setPaymentReference] = useState(order.paymentReference ?? "")
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [statusError, setStatusError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const canValidatePayment = order.status === "submitted" && !order.pagoValidado
  const canCancel = order.status === "submitted" && !order.posFacturado
  const canReopen = order.status === "cancelled"

  function handleValidatePayment() {
    setPaymentError(null)

    startTransition(async () => {
      const response = await fetch(`/api/admin/branches/${branchSlug}/orders/${order.id}/payment-validation`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ paymentReference }),
      })

      const result = (await response.json()) as { error?: string }

      if (!response.ok) {
        setPaymentError(result.error ?? "No se pudo validar el pago.")
        return
      }

      setPaymentDialogOpen(false)
      router.refresh()
    })
  }

  function handleStatusUpdate(status: "submitted" | "cancelled") {
    const confirmationMessage =
      status === "cancelled"
        ? "¿Deseas cancelar este pedido?"
        : "¿Deseas reabrir este pedido y devolverlo a recibido?"

    if (!window.confirm(confirmationMessage)) {
      return
    }

    setStatusError(null)

    startTransition(async () => {
      const response = await fetch(`/api/admin/branches/${branchSlug}/orders/${order.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      const result = (await response.json()) as { error?: string }

      if (!response.ok) {
        setStatusError(result.error ?? "No se pudo actualizar el estado.")
        return
      }

      router.refresh()
    })
  }

  return (
    <section className="rounded-4xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-lg font-semibold">Acciones administrativas</h2>

      <div className="mt-5 space-y-4">
        <div className="rounded-3xl border border-zinc-200 bg-zinc-50 px-4 py-4 dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-xs font-medium tracking-[0.16em] text-zinc-500 uppercase dark:text-zinc-400">Estado operativo</p>
          <p className="mt-2 text-lg font-semibold text-zinc-950 dark:text-zinc-50">{getStatusLabel(order)}</p>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            {order.pagoValidado
              ? `Referencia validada: ${order.paymentReference ?? "sin referencia"}`
              : "El pago aún no ha sido validado administrativamente."}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={!canValidatePayment}>Validar pago</Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Validar pago del pedido</DialogTitle>
                <DialogDescription>
                  Registra la referencia de pago para habilitar el procesamiento del pedido en POS.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4">
                <label className="grid gap-2">
                  <span className="text-sm font-medium">Referencia de pago</span>
                  <Input
                    value={paymentReference}
                    onChange={(event) => setPaymentReference(event.target.value)}
                    placeholder="Ej. PM-582901"
                  />
                </label>

                {paymentError ? (
                  <div className="rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-500/10 dark:text-red-300">
                    {paymentError}
                  </div>
                ) : null}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>Cancelar</Button>
                <Button onClick={handleValidatePayment} disabled={isPending || !paymentReference.trim()}>
                  {isPending ? "Guardando..." : "Confirmar validación"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button variant="outline" onClick={() => handleStatusUpdate("cancelled")} disabled={!canCancel || isPending}>
            Cancelar pedido
          </Button>

          <Button variant="outline" onClick={() => handleStatusUpdate("submitted")} disabled={!canReopen || isPending}>
            Reabrir pedido
          </Button>
        </div>

        {statusError ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-500/10 dark:text-red-300">
            {statusError}
          </div>
        ) : null}
      </div>
    </section>
  )
}
