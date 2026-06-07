"use client"

import * as React from "react"

type Theme = "light" | "dark" | "system"
type ResolvedTheme = "light" | "dark"

type ThemeContextValue = {
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
  theme: Theme
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null)

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

function getStoredTheme(defaultTheme: Theme): Theme {
  if (typeof window === "undefined") {
    return defaultTheme
  }

  const storedTheme = window.localStorage.getItem("theme") as Theme | null
  return storedTheme ?? defaultTheme
}

function applyThemeToDocument(theme: ResolvedTheme) {
  const root = document.documentElement
  root.classList.remove("light", "dark")
  root.classList.add(theme)
  root.style.colorScheme = theme
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
}: {
  attribute?: string
  children: React.ReactNode
  defaultTheme?: Theme
  disableTransitionOnChange?: boolean
  enableSystem?: boolean
}) {
  const [theme, setThemeState] = React.useState<Theme>(() => getStoredTheme(defaultTheme))
  const [resolvedTheme, setResolvedTheme] = React.useState<ResolvedTheme>(() => {
    if (typeof window === "undefined") {
      return "light"
    }

    const initialTheme = getStoredTheme(defaultTheme)
    return initialTheme === "system" ? getSystemTheme() : initialTheme
  })

  React.useEffect(() => {
    const currentTheme = theme === "system" ? getSystemTheme() : theme
    applyThemeToDocument(currentTheme)

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const handleChange = () => {
      if (theme !== "system") {
        return
      }

      const systemTheme = getSystemTheme()
      setResolvedTheme(systemTheme)
      applyThemeToDocument(systemTheme)
    }

    mediaQuery.addEventListener("change", handleChange)

    return () => {
      mediaQuery.removeEventListener("change", handleChange)
    }
  }, [theme])

  const setTheme = React.useCallback((nextTheme: Theme) => {
    setThemeState(nextTheme)
    window.localStorage.setItem("theme", nextTheme)

    const nextResolvedTheme = nextTheme === "system" ? getSystemTheme() : nextTheme
    setResolvedTheme(nextResolvedTheme)
    applyThemeToDocument(nextResolvedTheme)
  }, [])

  const value = React.useMemo(
    () => ({
      resolvedTheme,
      setTheme,
      theme,
    }),
    [resolvedTheme, setTheme, theme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = React.useContext(ThemeContext)

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider.")
  }

  return context
}
