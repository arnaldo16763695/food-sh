"use client"

import { Moon, Sun } from "lucide-react"
import { useSyncExternalStore } from "react"

import { useTheme } from "@/components/theme-provider"

function subscribe() {
  return () => {}
}

export function StorefrontThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const mounted = useSyncExternalStore(subscribe, () => true, () => false)

  const isDark = mounted && resolvedTheme === "dark"

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-800 dark:hover:text-white"
      aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
      <span>{isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}</span>
    </button>
  )
}
