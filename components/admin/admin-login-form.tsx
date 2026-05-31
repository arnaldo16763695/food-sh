"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { createSupabaseBrowserClient } from "@/lib/supabase-browser"

type AdminLoginFormProps = {
  nextPath: string
}

export function AdminLoginForm({ nextPath }: AdminLoginFormProps) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    let signInError: { message: string } | null = null

    try {
      const supabase = createSupabaseBrowserClient()
      const result = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      signInError = result.error
    } catch (error) {
      setIsSubmitting(false)
      setError(
        error instanceof Error
          ? error.message
          : "No se pudo inicializar la autenticación de Supabase.",
      )
      return
    }

    setIsSubmitting(false)

    if (signInError) {
      setError(signInError.message)
      return
    }

    router.replace(nextPath)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <label className="grid gap-2">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Correo electrónico</span>
        <input
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="h-12 rounded-3xl border border-zinc-300 bg-white px-4 text-sm outline-none transition-colors focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          placeholder="admin@empresa.com"
        />
      </label>

      <label className="grid gap-2">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Contraseña</span>
        <input
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="h-12 rounded-3xl border border-zinc-300 bg-white px-4 text-sm outline-none transition-colors focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          placeholder="Tu contraseña"
        />
      </label>

      {error ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex h-12 items-center justify-center rounded-full bg-zinc-950 px-5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-300"
      >
        {isSubmitting ? "Ingresando..." : "Iniciar sesión"}
      </button>
    </form>
  )
}
