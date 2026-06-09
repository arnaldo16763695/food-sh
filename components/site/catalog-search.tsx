"use client"

import { Search } from "lucide-react"
import { useCallback, useEffect, useRef, useState, useTransition } from "react"
import { usePathname, useRouter } from "next/navigation"

import { Input } from "@/components/ui/input"

type CatalogSearchProps = {
  initialQuery: string
}

function normalizeQuery(value: string) {
  return value.trim().replace(/\s+/g, " ")
}

function buildCatalogHref(pathname: string, query: string) {
  const params = new URLSearchParams()

  if (query) {
    params.set("q", query)
  }

  const nextSearch = params.toString()
  return nextSearch ? `${pathname}?${nextSearch}` : pathname
}

export function CatalogSearch({ initialQuery }: CatalogSearchProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [value, setValue] = useState(initialQuery)
  const lastAppliedQueryRef = useRef(initialQuery)

  const applySearch = useCallback((rawValue: string) => {
    const nextQuery = normalizeQuery(rawValue)

    if (nextQuery === lastAppliedQueryRef.current) {
      return
    }

    lastAppliedQueryRef.current = nextQuery

    startTransition(() => {
      router.replace(buildCatalogHref(pathname, nextQuery))
    })
  }, [pathname, router])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      applySearch(value)
    }, 400)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [applySearch, value])

  return (
    <div className="relative w-full max-w-md">
      <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-zinc-400" />
      <Input
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key !== "Enter") {
            return
          }

          event.preventDefault()
          applySearch(value)
        }}
        placeholder="Busca por nombre, descripción o SKU"
        aria-label="Buscar productos por nombre, descripción o SKU"
        className="h-12 rounded-full border-zinc-300 bg-white pr-4 pl-11 text-sm shadow-none dark:border-zinc-700 dark:bg-zinc-950"
      />
    </div>
  )
}
