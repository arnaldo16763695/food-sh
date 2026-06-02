"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect } from "react"
import { useMemo, useState, useTransition } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { type BranchAvailability } from "@/lib/branch-hours"
import { type Branch } from "@/lib/branches"
import { calculateBagTotals, useShoppingBagStore } from "@/lib/shopping-bag"

type CheckoutPageProps = {
  branch: Branch
  availability: BranchAvailability
  customerEmail: string
  customerName: string
  customerPhone: string
  customerUserId: string
}

type OrderCurrency = "USD" | "VES"

export function CheckoutPage({
  branch,
  availability,
  customerEmail,
  customerName: initialCustomerName,
  customerPhone: initialCustomerPhone,
  customerUserId,
}: CheckoutPageProps) {
  const bagBranchSlug = useShoppingBagStore((state) => state.branchSlug)
  const items = useShoppingBagStore((state) => state.items)
  const clear = useShoppingBagStore((state) => state.clear)
  const syncCustomer = useShoppingBagStore((state) => state.syncCustomer)
  const totals = calculateBagTotals(items)
  const isCurrentBranch = !bagBranchSlug || bagBranchSlug === branch.slug

  useEffect(() => {
    syncCustomer(customerUserId)
  }, [customerUserId, syncCustomer])

  const [customerName, setCustomerName] = useState(initialCustomerName)
  const [customerPhone, setCustomerPhone] = useState(initialCustomerPhone)
  const [fulfillmentType, setFulfillmentType] = useState<"pickup" | "delivery">("pickup")
  const [currency, setCurrency] = useState<OrderCurrency>("USD")
  const [notes, setNotes] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [successOrderId, setSuccessOrderId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const payloadItems = useMemo(
    () =>
      items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        note: item.note,
        exclusions: item.exclusions,
      })),
    [items],
  )

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    startTransition(async () => {
      const response = await fetch(`/api/checkout/branches/${branch.slug}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerName,
          customerPhone,
          fulfillmentType,
          currency,
          notes,
          items: payloadItems,
        }),
      })

      const result = (await response.json()) as { data?: { orderId: string }; error?: string }

      if (!response.ok) {
        setError(result.error ?? "No se pudo procesar el pedido.")
        return
      }

      clear()
      setSuccessOrderId(result.data?.orderId ?? null)
    })
  }

  if (!isCurrentBranch) {
    return (
      <main className="min-h-screen bg-[linear-gradient(180deg,var(--brand-surface)_0%,#f5f1e8_40%,#fbfaf7_100%)] text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-5 py-8 sm:px-6 lg:px-10 lg:py-10">
          <section className="rounded-4xl border border-amber-200 bg-amber-50 p-8 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-500/10 dark:text-amber-300">
            Tu bolsa pertenece a otra sucursal. Regresa al catálogo correcto antes de continuar al checkout.
          </section>
        </div>
      </main>
    )
  }

  if (successOrderId) {
    return (
      <main className="min-h-screen bg-[linear-gradient(180deg,var(--brand-surface)_0%,#f5f1e8_40%,#fbfaf7_100%)] text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-5 py-8 sm:px-6 lg:px-10 lg:py-10">
          <section className="rounded-4xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-sm font-medium tracking-[0.16em] text-zinc-500 uppercase dark:text-zinc-400">Pedido registrado</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight">Tu pedido fue recibido</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-600 dark:text-zinc-400">
              Registramos tu pedido para {branch.title}. El sistema interno podrá tomarlo en el siguiente ciclo de sincronización.
            </p>
            <div className="mt-6 rounded-3xl border border-zinc-200 bg-zinc-50 px-4 py-4 text-sm dark:border-zinc-800 dark:bg-zinc-950">
              Código de pedido: <strong>{successOrderId}</strong>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild>
                <Link href={`/tienda/${branch.slug}`}>Volver al catálogo</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={`/tienda/${branch.slug}/bolsa`}>Ver bolsa</Link>
              </Button>
            </div>
          </section>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,var(--brand-surface)_0%,#f5f1e8_40%,#fbfaf7_100%)] text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-8 sm:px-6 lg:px-10 lg:py-10">
        <header className="rounded-4xl border border-white/70 bg-white/88 p-8 shadow-[0_20px_60px_rgba(24,24,27,0.08)] backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/88">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-3">
              <p className="text-sm font-medium tracking-[0.16em] text-zinc-500 uppercase dark:text-zinc-400">Checkout</p>
              <h1 className="text-4xl font-semibold tracking-tight">{branch.title}</h1>
              <p className="max-w-2xl text-sm leading-7 text-zinc-600 dark:text-zinc-400">
                Confirma tus datos y revisa el pedido antes de enviarlo al sistema interno.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href={`/tienda/${branch.slug}/bolsa`}>Volver a la bolsa</Link>
            </Button>
          </div>
        </header>

        <section
          className={availability.isOpen
            ? "rounded-4xl border border-emerald-200 bg-emerald-50 px-6 py-4 text-sm text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-500/10 dark:text-emerald-300"
            : "rounded-4xl border border-amber-200 bg-amber-50 px-6 py-4 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-500/10 dark:text-amber-300"
          }
        >
          {availability.message}
        </section>

        <div className="grid gap-6 lg:grid-cols-[1fr_24rem]">
          <form onSubmit={handleSubmit} className="rounded-4xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="grid gap-6">
              <section className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-sm font-medium">Nombre</span>
                  <Input value={customerName} onChange={(event) => setCustomerName(event.target.value)} required />
                </label>
                <label className="grid gap-2">
                  <span className="text-sm font-medium">Correo</span>
                  <Input type="email" value={customerEmail} readOnly disabled />
                </label>
                <label className="grid gap-2">
                  <span className="text-sm font-medium">Teléfono</span>
                  <Input value={customerPhone} onChange={(event) => setCustomerPhone(event.target.value)} required />
                </label>
                <label className="grid gap-2">
                  <span className="text-sm font-medium">Tipo de entrega</span>
                  <select
                    value={fulfillmentType}
                    onChange={(event) => setFulfillmentType(event.target.value === "delivery" ? "delivery" : "pickup")}
                    className="h-10 rounded-3xl border border-zinc-300 bg-white px-4 text-sm outline-none transition-colors focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950"
                  >
                    <option value="pickup">Retiro en sucursal</option>
                    <option value="delivery">Delivery</option>
                  </select>
                </label>
                <label className="grid gap-2">
                  <span className="text-sm font-medium">Moneda de referencia</span>
                  <select
                    value={currency}
                    onChange={(event) => setCurrency(event.target.value === "VES" ? "VES" : "USD")}
                    className="h-10 rounded-3xl border border-zinc-300 bg-white px-4 text-sm outline-none transition-colors focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950"
                  >
                    <option value="USD">USD</option>
                    <option value="VES">VES</option>
                  </select>
                </label>
              </section>

              <label className="grid gap-2">
                <span className="text-sm font-medium">Notas del pedido</span>
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  rows={5}
                  className="min-h-32 w-full rounded-3xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                  placeholder="Indicaciones generales del pedido"
                />
              </label>

              {error ? (
                <div className="rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-500/10 dark:text-red-300">
                  {error}
                </div>
              ) : null}

              <div className="flex justify-end">
                <Button type="submit" disabled={isPending || items.length === 0 || !availability.isOpen}>
                  {isPending ? "Enviando pedido..." : "Confirmar pedido"}
                </Button>
              </div>
            </div>
          </form>

          <aside className="rounded-4xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-lg font-semibold">Resumen del pedido</h2>
            <div className="mt-5 space-y-4">
              {items.map((item) => (
                <article key={item.id} className="flex gap-3 rounded-3xl border border-zinc-200 p-3 dark:border-zinc-800">
                  <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950">
                    {item.imageUrl ? (
                      <Image src={item.imageUrl} alt={item.name} fill sizes="64px" className="object-contain p-1.5" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
                        Sin imagen
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="font-medium text-zinc-950 dark:text-zinc-50">{item.name}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">x{item.quantity}</p>
                    {item.exclusions.length > 0 ? (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">Sin: {item.exclusions.join(", ")}</p>
                    ) : null}
                    {item.note ? <p className="text-xs text-zinc-500 dark:text-zinc-400">Nota: {item.note}</p> : null}
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-6 space-y-3 border-t border-zinc-200 pt-4 text-sm dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">Subtotal USD</span>
                <span className="font-medium">{totals.subtotalUsd.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">Subtotal VES</span>
                <span className="font-medium">{totals.subtotalVes.toFixed(2)}</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
