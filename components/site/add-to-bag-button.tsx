"use client"

import Image from "next/image"
import { useMemo, useState } from "react"

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
import { type CatalogProduct } from "@/lib/catalog-types"
import { useShoppingBagStore } from "@/lib/shopping-bag"

type AddToBagButtonProps = {
  branchSlug: string
  product: CatalogProduct
}

export function AddToBagButton({ branchSlug, product }: AddToBagButtonProps) {
  const addItem = useShoppingBagStore((state) => state.addItem)
  const forceStartBranch = useShoppingBagStore((state) => state.forceStartBranch)
  const [open, setOpen] = useState(false)
  const [note, setNote] = useState("")
  const [exclusionsText, setExclusionsText] = useState("")

  const payload = useMemo(
    () => ({
      id: "",
      productId: product.id,
      branchSlug,
      externalId: product.externalId,
      sku: product.sku,
      name: product.name,
      imageUrl: product.imageUrl,
      priceUsd: product.priceUsd,
      priceVes: product.priceVes,
      note: "",
      exclusions: [],
    }),
    [branchSlug, product],
  )

  function resetForm() {
    setNote("")
    setExclusionsText("")
  }

  function handleConfirm() {
    const exclusions = exclusionsText
      .split(/\n|,/)
      .map((item) => item.trim())
      .filter(Boolean)

    const result = addItem({
      ...payload,
      note: note.trim(),
      exclusions,
    })

    if (!result.ok && result.reason === "branch-conflict") {
      const shouldReplace = window.confirm(
        "Tu bolsa contiene productos de otra sucursal. ¿Deseas vaciarla y comenzar una nueva bolsa para esta sucursal?",
      )

      if (!shouldReplace) {
        return
      }

      forceStartBranch(branchSlug)
      addItem({
        ...payload,
        note: note.trim(),
        exclusions,
      })
    }

    window.dispatchEvent(
      new CustomEvent("shopping-bag:item-added", {
        detail: {
          productName: product.name,
        },
      }),
    )

    resetForm()
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          className="h-11 w-full rounded-full"
          style={{
            backgroundColor: "var(--brand-primary)",
            color: "var(--brand-primary-foreground)",
          }}
        >
          Agregar
        </Button>
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-md" side="right">
        <SheetHeader>
          <SheetTitle>Personaliza tu producto</SheetTitle>
          <SheetDescription>
            Añade exclusiones, notas u otras especificaciones antes de confirmar.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 pb-4">
          <div className="flex gap-4 rounded-3xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="relative h-20 w-20 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950">
              {product.imageUrl ? (
                <Image src={product.imageUrl} alt={product.name} fill sizes="80px" className="object-contain p-2" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
                  Sin imagen
                </div>
              )}
            </div>

            <div className="min-w-0 space-y-2">
              <div>
                <p className="font-medium text-zinc-950 dark:text-zinc-50">{product.name}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{product.sku}</p>
              </div>
              <div className="text-sm text-zinc-600 dark:text-zinc-400">
                <p>USD {product.priceUsd.toFixed(2)}</p>
                <p>VES {product.priceVes.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Exclusiones o cambios</label>
            <textarea
              value={exclusionsText}
              onChange={(event) => setExclusionsText(event.target.value)}
              rows={4}
              className="min-h-28 w-full rounded-3xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              placeholder="Ejemplo: sin cebolla, sin salsa, extra queso"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Nota adicional</label>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={4}
              className="min-h-28 w-full rounded-3xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              placeholder="Ejemplo: bien tostado, empacar aparte, entregar con cuidado"
            />
          </div>
        </div>

        <SheetFooter>
          <div className="grid gap-2">
            <Button onClick={handleConfirm}>Confirmar y agregar</Button>
            <Button
              variant="outline"
              onClick={() => {
                resetForm()
                setOpen(false)
              }}
            >
              Cancelar
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
