import { type Database } from "@/lib/database.types"
import { createSupabasePublicClient } from "@/lib/supabase"

type BranchRow = Database["public"]["Tables"]["branches"]["Row"]

const DEFAULT_BRANCHES: Branch[] = [
  {
    id: "fallback-centro",
    slug: "centro",
    title: "Sucursal Centro",
    isActive: true,
  },
  {
    id: "fallback-norte",
    slug: "norte",
    title: "Sucursal Norte",
    isActive: true,
  },
]

export type Branch = {
  id: string
  slug: string
  title: string
  isActive: boolean
}

function mapBranch(row: BranchRow): Branch {
  return {
    id: row.id,
    slug: row.slug,
    title: row.name,
    isActive: row.is_active,
  }
}

function isMissingBranchesTableError(error: { code?: string } | null) {
  return error?.code === "PGRST205"
}

export async function listPublicBranches() {
  const supabase = createSupabasePublicClient()
  const { data, error } = await supabase
    .from("branches")
    .select("*")
    .eq("is_active", true)
    .order("name", { ascending: true })

  if (error) {
    if (isMissingBranchesTableError(error)) {
      return DEFAULT_BRANCHES
    }

    throw error
  }

  return data.map(mapBranch)
}

export async function getPublicBranchBySlug(branchSlug: string) {
  const supabase = createSupabasePublicClient()
  const { data, error } = await supabase
    .from("branches")
    .select("*")
    .eq("slug", branchSlug)
    .eq("is_active", true)
    .maybeSingle()

  if (error) {
    if (isMissingBranchesTableError(error)) {
      return DEFAULT_BRANCHES.find((branch) => branch.slug === branchSlug) ?? null
    }

    throw error
  }

  return data ? mapBranch(data) : null
}
