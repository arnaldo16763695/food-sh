"use client"

import { Pencil } from "lucide-react"
import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"

import { AdminProductImageUpload } from "@/components/admin/admin-product-image-upload"
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
import { type CatalogProduct } from "@/lib/catalog-types"

type AdminProductEditDialogProps = {
  branchSlug: string
  product: CatalogProduct
}

export function AdminProductEditDialog({ branchSlug, product }: AdminProductEditDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [description, setDescription] = useState(product.description)
  const [onlineEnabled, setOnlineEnabled] = useState(product.onlineEnabled)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const hasUnsavedChanges = useMemo(() => {
    return description !== product.description || onlineEnabled !== product.onlineEnabled
  }, [description, onlineEnabled, product.description, product.onlineEnabled])

  function resetForm() {
    setDescription(product.description)
    setOnlineEnabled(product.onlineEnabled)
    setError(null)
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

  function handleSave() {
    setError(null)

    startTransition(async () => {
      const response = await fetch(`/api/admin/branches/${branchSlug}/products/${product.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description,
          onlineEnabled,
        }),
      })

      const result = (await response.json()) as { error?: string }

      if (!response.ok) {
        setError(result.error ?? "No se pudo actualizar el producto.")
        return
      }

      setOpen(false)
      router.refresh()
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon-sm" aria-label={`Editar ${product.name}`}>
          <Pencil />
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar producto</DialogTitle>
          <DialogDescription>
            Ajusta los campos propios del canal online para <strong>{product.name}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <p className="text-xs font-medium tracking-[0.16em] text-zinc-500 uppercase">Producto</p>
              <div className="rounded-3xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm dark:border-zinc-800 dark:bg-zinc-950">
                {product.name}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium tracking-[0.16em] text-zinc-500 uppercase">SKU</p>
              <div className="rounded-3xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm dark:border-zinc-800 dark:bg-zinc-950">
                {product.sku}
              </div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_0.88fr]">
            <div className="space-y-2">
              <label className="text-sm font-medium">Descripción online</label>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={6}
                className="min-h-32 w-full rounded-3xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                placeholder="Describe el producto para la tienda online."
              />
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Visibilidad online</label>
                <label className="flex items-center gap-3 rounded-3xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm dark:border-zinc-800 dark:bg-zinc-950">
                  <Input
                    type="checkbox"
                    checked={onlineEnabled}
                    onChange={(event) => setOnlineEnabled(event.target.checked)}
                    className="size-4 rounded-md border-zinc-300 p-0 dark:border-zinc-700"
                  />
                  <span>{onlineEnabled ? "Producto visible en la tienda" : "Producto oculto en la tienda"}</span>
                </label>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Imagen del producto</p>
                <AdminProductImageUpload
                  branchSlug={branchSlug}
                  productId={product.id}
                  imageUrl={product.imageUrl}
                />
              </div>
            </div>
          </div>

          {error ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-500/10 dark:text-red-300">
              {error}
            </div>
          ) : null}
        </div>

        <DialogFooter>
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
