"use client"

import Image from "next/image"
import { useState } from "react"

export function BrandLogo() {
  const [hasError, setHasError] = useState(false)

  if (!hasError) {
    return (
      <Image
        src="/images/logo.png"
        alt="Shanghaipf"
        width={220}
        height={72}
        className="h-14 w-auto sm:h-16"
        priority
        onError={() => setHasError(true)}
      />
    )
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex size-10 items-center justify-center rounded-2xl bg-zinc-950 text-sm font-semibold tracking-[0.24em] text-white dark:bg-zinc-100 dark:text-zinc-950">
        SF
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-semibold leading-none tracking-[0.22em] uppercase">
          Shanghaipf
        </span>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">Panadería y restaurante</span>
      </div>
    </div>
  )
}
