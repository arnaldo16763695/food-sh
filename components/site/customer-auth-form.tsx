"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useShoppingBagStore } from "@/lib/shopping-bag"
import { createSupabaseBrowserClient } from "@/lib/supabase-browser"

type CustomerAuthFormProps = {
  initialEmail: string
  initialFullName: string
  initialMode: "login" | "signup" | "recover" | "reset-password"
  initialPhone: string
  nextPath: string
  status: "guest" | "unconfirmed" | "needs-profile" | "ready"
}

export function CustomerAuthForm({
  initialEmail,
  initialFullName,
  initialMode,
  initialPhone,
  nextPath,
  status,
}: CustomerAuthFormProps) {
  const router = useRouter()
  const clear = useShoppingBagStore((state) => state.clear)
  const [mode, setMode] = useState<"login" | "signup" | "recover" | "reset-password">(initialMode)
  const [fullName, setFullName] = useState(initialFullName)
  const [phone, setPhone] = useState(initialPhone)
  const [email, setEmail] = useState(initialEmail)
  const [password, setPassword] = useState("")
  const [passwordConfirmation, setPasswordConfirmation] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [resendMessage, setResendMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)

  function resetFeedback() {
    setError(null)
    setMessage(null)
    setResendMessage(null)
  }

  async function handleResendNotification() {
    setError(null)
    setResendMessage(null)
    setIsResending(true)

    try {
      const response = await fetch("/api/customer-auth/resend-confirmation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          nextPath,
        }),
      })

      const result = (await response.json()) as { data?: { deliveryMethod: "console" | "resend" }; error?: string }

      if (!response.ok) {
        setError(result.error ?? "No se pudo reenviar la notificación.")
        return
      }

      setResendMessage(
        result.data?.deliveryMethod === "console"
          ? "No hay Resend configurado. Imprimimos la URL de confirmación en la consola del servidor."
          : "Te reenviamos la notificación al correo indicado.",
      )
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "No se pudo reenviar la notificación.")
    } finally {
      setIsResending(false)
    }
  }

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    resetFeedback()
    setIsSubmitting(true)

    try {
      const supabase = createSupabaseBrowserClient()
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (signInError) {
        setError(signInError.message)
        return
      }

      router.replace(nextPath)
      router.refresh()
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "No se pudo iniciar sesión.")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleSignup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    resetFeedback()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/customer-auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          fullName: fullName.trim(),
          nextPath,
          password,
          phone: phone.trim(),
        }),
      })

      const result = (await response.json()) as { data?: { deliveryMethod: "console" | "resend" }; error?: string }

      if (!response.ok) {
        setError(result.error ?? "No se pudo crear la cuenta.")
        return
      }

      setPassword("")
      setMode("login")
      setMessage(
        result.data?.deliveryMethod === "console"
          ? "No hay Resend configurado todavía. Imprimimos la URL de confirmación en la consola del servidor para esta prueba."
          : "Te enviamos un enlace para confirmar tu correo antes de continuar con la compra.",
      )
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "No se pudo crear la cuenta.")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleGoogleLogin() {
    resetFeedback()
    setIsGoogleLoading(true)

    try {
      const supabase = createSupabaseBrowserClient()
      const { error: googleError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
        },
      })

      if (googleError) {
        setError(googleError.message)
        setIsGoogleLoading(false)
      }
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "No se pudo iniciar con Google.")
      setIsGoogleLoading(false)
    }
  }

  async function handleCompleteProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    resetFeedback()
    setIsSubmitting(true)

    try {
      const supabase = createSupabaseBrowserClient()
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        setError(userError?.message ?? "Tu sesión ya no está disponible. Inicia sesión de nuevo.")
        return
      }

      const { error: profileError } = await supabase.from("customer_profiles").upsert({
        user_id: user.id,
        full_name: fullName.trim(),
        phone: phone.trim(),
        updated_at: new Date().toISOString(),
      })

      if (profileError) {
        setError(profileError.message)
        return
      }

      router.replace(nextPath)
      router.refresh()
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "No se pudo actualizar tu perfil.")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleSignOut() {
    resetFeedback()
    setIsSigningOut(true)

    try {
      const supabase = createSupabaseBrowserClient()
      const { error: signOutError } = await supabase.auth.signOut()

      if (signOutError) {
        setError(signOutError.message)
        return
      }

      clear()
      router.replace(`/tienda/auth?next=${encodeURIComponent(nextPath)}`)
      router.refresh()
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "No se pudo cerrar la sesión.")
    } finally {
      setIsSigningOut(false)
    }
  }

  async function handleRecoveryRequest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    resetFeedback()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/customer-auth/recover-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          nextPath,
        }),
      })

      const result = (await response.json()) as { data?: { deliveryMethod: "console" | "resend" | "unknown" }; error?: string }

      if (!response.ok) {
        setError(result.error ?? "No se pudo iniciar la recuperación de contraseña.")
        return
      }

      setMessage(
        result.data?.deliveryMethod === "console"
          ? "No hay Resend configurado todavía. Imprimimos la URL de recuperación en la consola del servidor para esta prueba."
          : "Si existe una cuenta con ese correo, te enviamos instrucciones para recuperar el acceso.",
      )
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "No se pudo iniciar la recuperación de contraseña.")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleResetPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    resetFeedback()

    if (password.length < 8) {
      setError("La nueva contraseña debe tener al menos 8 caracteres.")
      return
    }

    if (password !== passwordConfirmation) {
      setError("La confirmación de la contraseña no coincide.")
      return
    }

    setIsSubmitting(true)

    try {
      const supabase = createSupabaseBrowserClient()
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      })

      if (updateError) {
        setError(updateError.message)
        return
      }

      setPassword("")
      setPasswordConfirmation("")
      setMessage("Tu contraseña fue actualizada. Ya puedes continuar con tu compra o iniciar sesión de nuevo.")
      setMode("login")
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "No se pudo actualizar la contraseña.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (status === "unconfirmed") {
    return (
      <div className="grid gap-5">
        <div className="rounded-3xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-500/10 dark:text-amber-300">
          Revisa tu correo y abre el enlace de confirmación antes de agregar productos a la bolsa.
        </div>

        {resendMessage ? <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-500/10 dark:text-emerald-300">{resendMessage}</div> : null}
        {error ? <div className="rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-500/10 dark:text-red-300">{error}</div> : null}

        <div className="grid gap-3 sm:grid-cols-3">
          <Button type="button" variant="outline" onClick={handleResendNotification} disabled={isResending || !email.trim()}>
            {isResending ? "Reenviando..." : "Reenviar notificación"}
          </Button>
          <Button type="button" variant="outline" onClick={handleSignOut} disabled={isSigningOut}>
            {isSigningOut ? "Cerrando sesión..." : "Cerrar sesión"}
          </Button>
          <Button asChild>
            <Link href={nextPath}>Volver a la tienda</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (status === "needs-profile") {
    return (
      <form onSubmit={handleCompleteProfile} className="grid gap-4">
        <div className="rounded-3xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-500/10 dark:text-amber-300">
          Completa tu nombre y teléfono para continuar con tu compra.
        </div>

        <label className="grid gap-2">
          <span className="text-sm font-medium">Nombre completo</span>
          <Input value={fullName} onChange={(event) => setFullName(event.target.value)} required />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium">Teléfono</span>
          <Input value={phone} onChange={(event) => setPhone(event.target.value)} required />
        </label>

        {error ? <div className="rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-500/10 dark:text-red-300">{error}</div> : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : "Guardar y continuar"}
          </Button>
          <Button type="button" variant="outline" onClick={handleSignOut} disabled={isSigningOut}>
            {isSigningOut ? "Cerrando sesión..." : "Cerrar sesión"}
          </Button>
        </div>
      </form>
    )
  }

  if (mode === "reset-password") {
    return (
      <form onSubmit={handleResetPassword} className="grid gap-4">
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-500/10 dark:text-emerald-300">
          Define una nueva contraseña para recuperar el acceso a tu cuenta.
        </div>

        <label className="grid gap-2">
          <span className="text-sm font-medium">Nueva contraseña</span>
          <Input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={8}
            required
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium">Confirmar contraseña</span>
          <Input
            type="password"
            autoComplete="new-password"
            value={passwordConfirmation}
            onChange={(event) => setPasswordConfirmation(event.target.value)}
            minLength={8}
            required
          />
        </label>

        {message ? <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-500/10 dark:text-emerald-300">{message}</div> : null}
        {error ? <div className="rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-500/10 dark:text-red-300">{error}</div> : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Actualizando..." : "Guardar nueva contraseña"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setMode("login")
              setPassword("")
              setPasswordConfirmation("")
              resetFeedback()
            }}
          >
            Volver al acceso
          </Button>
        </div>
      </form>
    )
  }

  if (mode === "recover") {
    return (
      <div className="grid gap-6">
        <form onSubmit={handleRecoveryRequest} className="grid gap-4">
          <label className="grid gap-2">
            <span className="text-sm font-medium">Correo electrónico</span>
            <Input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>

          {message ? <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-500/10 dark:text-emerald-300">{message}</div> : null}
          {error ? <div className="rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-500/10 dark:text-red-300">{error}</div> : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Enviando..." : "Enviar enlace de recuperación"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setMode("login")
                setPassword("")
                resetFeedback()
              }}
            >
              Volver al acceso
            </Button>
          </div>
        </form>
      </div>
    )
  }

  const isSignup = mode === "signup"

  return (
    <div className="grid gap-6">
      <div className="inline-flex rounded-full border border-zinc-200 bg-zinc-100 p-1 dark:border-zinc-800 dark:bg-zinc-950">
        <button
          type="button"
          onClick={() => {
            setMode("login")
            resetFeedback()
          }}
          className={[
            "rounded-full px-4 py-2 text-sm font-medium transition-colors",
            !isSignup ? "bg-white text-zinc-950 shadow-sm dark:bg-zinc-900 dark:text-zinc-50" : "text-zinc-500 dark:text-zinc-400",
          ].join(" ")}
        >
          Iniciar sesión
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("signup")
            resetFeedback()
          }}
          className={[
            "rounded-full px-4 py-2 text-sm font-medium transition-colors",
            isSignup ? "bg-white text-zinc-950 shadow-sm dark:bg-zinc-900 dark:text-zinc-50" : "text-zinc-500 dark:text-zinc-400",
          ].join(" ")}
        >
          Crear cuenta
        </button>
      </div>

      <Button type="button" variant="outline" onClick={handleGoogleLogin} disabled={isGoogleLoading}>
        {isGoogleLoading ? "Redirigiendo a Google..." : "Continuar con Google"}
      </Button>

        <div className="relative text-center text-xs uppercase tracking-[0.18em] text-zinc-400">
        <span className="bg-white px-3 dark:bg-zinc-900">o continúa con tu correo</span>
        <div className="absolute inset-x-0 top-1/2 -z-10 border-t border-zinc-200 dark:border-zinc-800" />
      </div>

        <form onSubmit={isSignup ? handleSignup : handleLogin} className="grid gap-4">
        {isSignup ? (
          <>
            <label className="grid gap-2">
              <span className="text-sm font-medium">Nombre completo</span>
              <Input value={fullName} onChange={(event) => setFullName(event.target.value)} required />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium">Teléfono</span>
              <Input value={phone} onChange={(event) => setPhone(event.target.value)} required />
            </label>
          </>
        ) : null}

        <label className="grid gap-2">
          <span className="text-sm font-medium">Correo electrónico</span>
          <Input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium">Contraseña</span>
          <Input
            type="password"
            autoComplete={isSignup ? "new-password" : "current-password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={8}
            required
          />
        </label>

        {!isSignup ? (
          <button
            type="button"
            onClick={() => {
              setMode("recover")
              setPassword("")
              resetFeedback()
            }}
            className="w-fit text-sm font-medium text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-300"
          >
            Olvidé mi contraseña
          </button>
        ) : null}

        {message ? <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-500/10 dark:text-emerald-300">{message}</div> : null}
        {resendMessage ? <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-500/10 dark:text-emerald-300">{resendMessage}</div> : null}
        {error ? <div className="rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-500/10 dark:text-red-300">{error}</div> : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (isSignup ? "Creando cuenta..." : "Ingresando...") : isSignup ? "Crear cuenta" : "Iniciar sesión"}
          </Button>
          {isSignup || message ? (
            <Button type="button" variant="outline" onClick={handleResendNotification} disabled={isResending || !email.trim()}>
              {isResending ? "Reenviando..." : "Reenviar notificación"}
            </Button>
          ) : null}
        </div>
      </form>
    </div>
  )
}
