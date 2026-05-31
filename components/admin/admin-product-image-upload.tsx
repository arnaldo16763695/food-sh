"use client"

import Image from "next/image"
import { useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"

type AdminProductImageUploadProps = {
  branchSlug: string
  productId: string
  imageUrl: string | null
}

export function AdminProductImageUpload({
  branchSlug,
  productId,
  imageUrl,
}: AdminProductImageUploadProps) {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const formData = new FormData(event.currentTarget)

    startTransition(async () => {
      const response = await fetch(`/api/admin/branches/${branchSlug}/products/${productId}/image`, {
        method: "POST",
        body: formData,
      })

      const result = (await response.json()) as { error?: string }

      if (!response.ok) {
        setError(result.error ?? "No se pudo subir la imagen.")
        return
      }

      formRef.current?.reset()
      router.refresh()
    })
  }

  return (
    <div className="space-y-3">
      <div className="relative h-14 w-14 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt="Producto"
            fill
            sizes="56px"
            className="object-contain p-1.5"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
            Sin imagen
          </div>
        )}
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-2">
        <input
          name="image"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="block w-full text-xs text-zinc-500 file:mr-3 file:rounded-full file:border-0 file:bg-zinc-950 file:px-3 file:py-2 file:text-xs file:font-medium file:text-white dark:text-zinc-400 dark:file:bg-zinc-100 dark:file:text-zinc-950"
          required
        />
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-9 items-center justify-center rounded-full border border-zinc-300 px-3 text-xs font-medium transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          {isPending ? "Subiendo..." : imageUrl ? "Reemplazar imagen" : "Subir imagen"}
        </button>
      </form>

      {error ? <p className="text-xs text-red-600 dark:text-red-400">{error}</p> : null}
    </div>
  )
}
