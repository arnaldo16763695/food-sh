"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { calculateBagTotals, useShoppingBagStore } from "@/lib/shopping-bag"

type ShoppingBagSheetProps = {
  branchSlug: string
  customerUserId: string | null
}

export function ShoppingBagSheet({ branchSlug, customerUserId }: ShoppingBagSheetProps) {
  const bagBranchSlug = useShoppingBagStore((state) => state.branchSlug)
  const items = useShoppingBagStore((state) => state.items)
  const removeItem = useShoppingBagStore((state) => state.removeItem)
  const setQuantity = useShoppingBagStore((state) => state.setQuantity)
  const clear = useShoppingBagStore((state) => state.clear)
  const syncCustomer = useShoppingBagStore((state) => state.syncCustomer)
  const totals = calculateBagTotals(items)
  const isCurrentBranch = !bagBranchSlug || bagBranchSlug === branchSlug
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (customerUserId) {
      syncCustomer(customerUserId)
    }
  }, [customerUserId, syncCustomer])

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null

    const handleItemAdded = () => {
      setIsAnimating(false)

      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      requestAnimationFrame(() => {
        setIsAnimating(true)
        timeoutId = setTimeout(() => {
          setIsAnimating(false)
        }, 720)
      })
    }

    window.addEventListener("shopping-bag:item-added", handleItemAdded)

    return () => {
      window.removeEventListener("shopping-bag:item-added", handleItemAdded)
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [])

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          type="button"
          className={[
            "inline-flex h-11 items-center gap-2 rounded-full border border-[color-mix(in_oklab,var(--brand-secondary)_18%,white)] bg-white px-4 text-sm font-medium text-zinc-700 transition-colors hover:bg-(--brand-secondary) hover:text-[var(--brand-secondary-foreground)] dark:border-[color-mix(in_oklab,var(--brand-secondary)_28%,black)] dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-(--brand-secondary)",
            isAnimating ? "shopping-bag-bounce shopping-bag-glow" : "",
          ].join(" ")}
          aria-label="Ver bolsa de compra"
          style={{ borderColor: "color-mix(in oklab, var(--brand-secondary) 18%, white)" }}
        >
          <ShoppingBag className={isAnimating ? "shopping-bag-icon-pop size-4" : "size-4"} />
          <span>Bolsa</span>
          <span
            className={[
              "inline-flex min-w-6 items-center justify-center rounded-full bg-(--brand-primary) px-1.5 py-0.5 text-xs text-[var(--brand-primary-foreground)]",
              isAnimating ? "shopping-bag-badge-pop" : "",
            ].join(" ")}
          >
            {totals.quantity}
          </span>
        </button>
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-md" side="right">
        <SheetHeader>
          <SheetTitle>Bolsa de compra</SheetTitle>
          <SheetDescription>
            Revisa tus productos antes de continuar al checkout.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4">
          {!isCurrentBranch ? (
            <div className="rounded-3xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-500/10 dark:text-amber-300">
              Tu bolsa pertenece a otra sucursal. Vacíala o entra a la sucursal correspondiente para continuar.
            </div>
          ) : items.length > 0 ? (
            <>
              <div className="space-y-3">
                {items.map((item) => (
                  <article key={item.id} className="rounded-3xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="flex gap-3">
                      <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950">
                        {item.imageUrl ? (
                          <Image src={item.imageUrl} alt={item.name} fill sizes="64px" className="object-contain p-1.5" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
                            Sin imagen
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium text-zinc-950 dark:text-zinc-50">{item.name}</p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">{item.sku}</p>
                            {item.exclusions?.length > 0 ? (
                              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                                Sin: {item.exclusions.join(", ")}
                              </p>
                            ) : null}
                            {item.note ? (
                              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Nota: {item.note}</p>
                            ) : null}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="rounded-full p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                            aria-label={`Eliminar ${item.name}`}
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between gap-3">
                          <div className="inline-flex items-center rounded-full border border-zinc-300 dark:border-zinc-700">
                            <button
                              type="button"
                              onClick={() => setQuantity(item.id, item.quantity - 1)}
                              className="p-2"
                              aria-label="Disminuir cantidad"
                            >
                              <Minus className="size-4" />
                            </button>
                            <span className="min-w-8 text-center text-sm font-medium">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => setQuantity(item.id, item.quantity + 1)}
                              className="p-2"
                              aria-label="Aumentar cantidad"
                            >
                              <Plus className="size-4" />
                            </button>
                          </div>

                          <div className="text-right">
                            <p className="font-medium text-[var(--brand-primary)]">USD {(item.priceUsd * item.quantity).toFixed(2)}</p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">VES {(item.priceVes * item.quantity).toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-500 dark:text-zinc-400">Subtotal</span>
                  <div className="text-right">
                    <p className="font-medium text-zinc-950 dark:text-zinc-50">USD {totals.subtotalUsd.toFixed(2)}</p>
                    <p className="text-zinc-500 dark:text-zinc-400">VES {totals.subtotalVes.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-3xl border border-dashed border-zinc-300 px-4 py-10 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
              Tu bolsa está vacía.
            </div>
          )}
        </div>

        <SheetFooter>
          <div className="grid gap-2">
            <Button asChild disabled={!isCurrentBranch || items.length === 0} className="w-full">
              <Link href={`/tienda/${branchSlug}/bolsa`}>Ver bolsa completa</Link>
            </Button>
            <Button variant="outline" onClick={clear} disabled={items.length === 0} className="w-full">
              Vaciar bolsa
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
