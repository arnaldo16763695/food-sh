import { getPublicBranchAvailability, listAdminBranchHours } from "@/lib/branch-hours"
import { listPublicBranches } from "@/lib/branches"

export type AdminBranchOverview = {
  configuredDays: number
  isActive: boolean
  isOpen: boolean
  message: string
  onlineOrderMode: "auto" | "force_closed" | "force_open"
  slug: string
  title: string
}

export async function listAdminBranchesOverview(): Promise<AdminBranchOverview[]> {
  const branches = await listPublicBranches()

  const overviews = await Promise.all(
    branches.map(async (branch) => {
      const [availability, hours] = await Promise.all([
        getPublicBranchAvailability(branch.slug),
        listAdminBranchHours(branch.slug),
      ])

      return {
        configuredDays: hours.filter((hour) => hour.isConfigured).length,
        isActive: branch.isActive,
        isOpen: availability.isOpen,
        message: availability.message,
        onlineOrderMode: branch.onlineOrderMode,
        slug: branch.slug,
        title: branch.title,
      }
    }),
  )

  return overviews.sort((a, b) => a.title.localeCompare(b.title, "es"))
}
