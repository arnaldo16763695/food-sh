"use client"

import { useEffect } from "react"

export function AdminBranchContextSync({ branchSlug }: { branchSlug: string }) {
  useEffect(() => {
    document.cookie = `admin_context_branch=${encodeURIComponent(branchSlug)}; path=/; max-age=2592000; samesite=lax`
  }, [branchSlug])

  return null
}
