"use client"

import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { type Branch } from "@/lib/branches"
import { calculateBagTotals, useShoppingBagStore } from "@/lib/shopping-bag"

type ShoppingBagPageProps = {
  branch: Branch
}

export function ShoppingBagPage({ branch }: ShoppingBagPageProps) {
  const bagBranchSlug = useShoppingBagStore((state) => state.branchSlug)
  const items = useShoppingBagStore((state) => state.items)
  const removeItem = useShoppingBagStore((state) => state.removeItem)
  const setQuantity = useShoppingBagStore((state) => state.setQuantity)
  const clear = useShoppingBagStore((state) => state.clear)
  const totals = calculateBagTotals(items)
  const isCurrentBranch = !bagBranchSlug || bagBranchSlug === branch.slug

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,var(--brand-surface)_0%,#f5f1e8_40%,#fbfaf7_100%)] text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-8 sm:px-6 lg:px-10 lg:py-10">
        <header className="rounded-4xl border border-white/70 bg-white/88 p-8 shadow-[0_20px_60px_rgba(24,24,27,0.08)] backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/88">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-3">
              <p className="text-sm font-medium tracking-[0.16em] text-zinc-500 uppercase dark:text-zinc-400">
                Bolsa de compra
              </p>
              <h1 className="text-4xl font-semibold tracking-tight">{branch.title}</h1>
              <p className="max-w-2xl text-sm leading-7 text-zinc-600 dark:text-zinc-400">
                Revisa tus productos, ajusta cantidades y prepárate para continuar al checkout.
              </p>
            </div>

            <Button asChild variant="outline">
              <Link href={`/tienda/${branch.slug}`}>Volver al catálogo</Link>
            </Button>
          </div>
        </header>

        {!isCurrentBranch ? (
          <section className="rounded-4xl border border-amber-200 bg-amber-50 p-8 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-500/10 dark:text-amber-300">
            Tu bolsa pertenece a otra sucursal. Vacíala o regresa a la sucursal correcta para continuar.
          </section>
        ) : items.length > 0 ? (
          <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
            <section className="rounded-4xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
                <h2 className="text-lg font-semibold">Productos en tu bolsa</h2>
              </div>

              <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {items.map((item) => (
                  <article key={item.id} className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex gap-4">
                      <div className="relative h-24 w-24 overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950">
                        {item.imageUrl ? (
                          <Image src={item.imageUrl} alt={item.name} fill sizes="96px" className="object-contain p-2" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
                            Sin imagen
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div>
                          <h3 className="text-lg font-semibold">{item.name}</h3>
                          <p className="text-sm text-zinc-500 dark:text-zinc-400">SKU: {item.sku}</p>
                          {item.exclusions?.length > 0 ? (
                            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                              Sin: {item.exclusions.join(", ")}
                            </p>
                          ) : null}
                          {item.note ? (
                            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Nota: {item.note}</p>
                          ) : null}
                        </div>
                        <div className="text-sm text-zinc-600 dark:text-zinc-400">
                          <p>USD {item.priceUsd.toFixed(2)}</p>
                          <p>VES {item.priceVes.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                      <div className="inline-flex items-center rounded-full border border-zinc-300 dark:border-zinc-700">
                        <button type="button" onClick={() => setQuantity(item.id, item.quantity - 1)} className="p-2">
                          <Minus className="size-4" />
                        </button>
                        <span className="min-w-10 text-center text-sm font-medium">{item.quantity}</span>
                        <button type="button" onClick={() => setQuantity(item.id, item.quantity + 1)} className="p-2">
                          <Plus className="size-4" />
                        </button>
                      </div>

                      <div className="min-w-28 text-right">
                        <p className="font-medium text-[var(--brand-primary)]">USD {(item.priceUsd * item.quantity).toFixed(2)}</p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">VES {(item.priceVes * item.quantity).toFixed(2)}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="rounded-full p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <aside className="rounded-4xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="text-lg font-semibold">Resumen</h2>
              <div className="mt-5 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 dark:text-zinc-400">Productos</span>
                  <span>{totals.quantity}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 dark:text-zinc-400">Subtotal USD</span>
                  <span className="font-medium">{totals.subtotalUsd.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 dark:text-zinc-400">Subtotal VES</span>
                  <span className="font-medium">{totals.subtotalVes.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-6 grid gap-2">
                <Button disabled>Continuar al checkout</Button>
                <Button variant="outline" onClick={clear}>Vaciar bolsa</Button>
              </div>

              <p className="mt-4 text-xs leading-6 text-zinc-500 dark:text-zinc-400">
                En el siguiente paso validaremos stock, precios y horario de la sucursal antes de confirmar el pedido.
              </p>
            </aside>
          </div>
        ) : (
          <section className="rounded-4xl border border-dashed border-zinc-300 bg-white/70 p-10 text-center dark:border-zinc-700 dark:bg-zinc-900">
            <div className="mx-auto flex max-w-md flex-col items-center gap-4 text-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-300">
                <ShoppingBag className="size-6" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold">Tu bolsa está vacía</h2>
                <p className="text-sm leading-7 text-zinc-500 dark:text-zinc-400">
                  Explora el catálogo de la sucursal y agrega productos para comenzar tu compra.
                </p>
              </div>
              <Button asChild>
                <Link href={`/tienda/${branch.slug}`}>Volver al catálogo</Link>
              </Button>
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
