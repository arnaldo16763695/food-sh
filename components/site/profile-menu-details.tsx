"use client"

import { useEffect, useRef } from "react"

type ProfileMenuDetailsProps = {
  children: React.ReactNode
  className?: string
}

export function ProfileMenuDetails({ children, className }: ProfileMenuDetailsProps) {
  const detailsRef = useRef<HTMLDetailsElement>(null)

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      const details = detailsRef.current

      if (!details?.open) {
        return
      }

      if (event.target instanceof Node && !details.contains(event.target)) {
        details.open = false
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && detailsRef.current?.open) {
        detailsRef.current.open = false
      }
    }

    document.addEventListener("pointerdown", handlePointerDown)
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  return (
    <details ref={detailsRef} className={className}>
      {children}
    </details>
  )
}
