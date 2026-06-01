"use client"

import { useState, useTransition } from "react"
import { usePathname, useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useShoppingBagStore } from "@/lib/shopping-bag"

type HeroBranch = {
  slug: string
  title: string
  productCount: number
}

type StorefrontHeroProps = {
  selectedBranchSlug: string
  selectedBranchTitle: string
  branches: HeroBranch[]
}

export function StorefrontHero({
  selectedBranchSlug,
  selectedBranchTitle,
  branches,
}: StorefrontHeroProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingBranchSlug, setPendingBranchSlug] = useState<string | null>(null)
  const bagBranchSlug = useShoppingBagStore((state) => state.branchSlug)
  const itemCount = useShoppingBagStore((state) => state.items.length)
  const forceStartBranch = useShoppingBagStore((state) => state.forceStartBranch)

  function buildBranchHref(nextBranchSlug: string) {
    const currentPrefix = `/tienda/${selectedBranchSlug}`

    if (pathname.startsWith(currentPrefix)) {
      return pathname.replace(currentPrefix, `/tienda/${nextBranchSlug}`)
    }

    return `/tienda/${nextBranchSlug}`
  }

  function handleBranchChange(nextBranchSlug: string) {
    if (!nextBranchSlug || nextBranchSlug === selectedBranchSlug) {
      return
    }

    if (itemCount > 0 && bagBranchSlug && bagBranchSlug !== nextBranchSlug) {
      setPendingBranchSlug(nextBranchSlug)
      setConfirmOpen(true)
      return
    }

    startTransition(() => {
      router.push(buildBranchHref(nextBranchSlug))
    })
  }

  function handleConfirmBranchChange() {
    if (!pendingBranchSlug) {
      return
    }

    forceStartBranch(pendingBranchSlug)
    setConfirmOpen(false)

    startTransition(() => {
      router.push(buildBranchHref(pendingBranchSlug))
      setPendingBranchSlug(null)
    })
  }

  const selectedBranch = branches.find((branch) => branch.slug === selectedBranchSlug)

  return (
    <>
      <section className="relative overflow-hidden rounded-[2.5rem] border border-white/70 bg-[linear-gradient(135deg,#fffdf9_0%,#fff7eb_50%,#f8fff5_100%)] px-6 py-7 shadow-[0_24px_70px_rgba(24,24,27,0.07)] dark:border-zinc-800 dark:bg-[linear-gradient(135deg,#11131d_0%,#17171d_52%,#0f1428_100%)] sm:px-8 lg:px-10 lg:py-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,color-mix(in_oklab,var(--brand-accent)_22%,white),transparent_28%),radial-gradient(circle_at_top_right,color-mix(in_oklab,var(--brand-primary)_14%,white),transparent_30%),radial-gradient(circle_at_bottom_right,color-mix(in_oklab,var(--brand-secondary)_12%,white),transparent_26%)] dark:bg-[radial-gradient(circle_at_top_left,color-mix(in_oklab,var(--brand-accent)_10%,black),transparent_28%),radial-gradient(circle_at_top_right,color-mix(in_oklab,var(--brand-primary)_14%,black),transparent_30%),radial-gradient(circle_at_bottom_right,color-mix(in_oklab,var(--brand-secondary)_12%,black),transparent_26%)]" />

        <div className="relative grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="space-y-3">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[color:color-mix(in_oklab,var(--brand-secondary)_22%,white)] bg-white/84 px-3 py-1 text-xs font-semibold tracking-[0.16em] text-[var(--brand-secondary)] uppercase backdrop-blur dark:border-[color:color-mix(in_oklab,var(--brand-secondary)_24%,black)] dark:bg-black/15 dark:text-[color:color-mix(in_oklab,var(--brand-secondary)_80%,white)]">
              <span className="size-2 rounded-full bg-(--brand-secondary)" />
              Online
            </span>

            <div className="space-y-1.5">
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Sucursal</p>
              <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-[3.4rem]">
                {selectedBranchTitle}
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {selectedBranch?.productCount ?? 0} productos visibles en esta sucursal.
              </p>
            </div>
          </div>

          <label
            className="grid gap-2 rounded-[1.65rem] border bg-white/84 p-4 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80 lg:w-[320px]"
            style={{ borderColor: "color-mix(in oklab, var(--brand-secondary) 18%, white)" }}
          >
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">Cambiar sucursal</span>
            <select
              value={selectedBranchSlug}
              onChange={(event) => handleBranchChange(event.target.value)}
              disabled={isPending}
              className="h-11 rounded-3xl border border-zinc-300 bg-white px-4 text-sm text-zinc-900 outline-none transition-colors focus:border-zinc-500 disabled:cursor-wait disabled:opacity-70 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
            >
              {branches.map((branch) => (
                <option key={branch.slug} value={branch.slug}>
                  {branch.title} ({branch.productCount})
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <Dialog
        open={confirmOpen}
        onOpenChange={(open) => {
          setConfirmOpen(open)

          if (!open) {
            setPendingBranchSlug(null)
          }
        }}
      >
        <DialogContent showCloseButton={false} className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cambiar de sucursal</DialogTitle>
            <DialogDescription>
              Tu bolsa contiene productos de otra sucursal. Si continúas, vaciaremos la bolsa actual para empezar una nueva en la sucursal seleccionada.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmBranchChange}>
              Vaciar bolsa y cambiar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
