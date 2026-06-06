import { requireAdminBranchAccess } from "@/lib/admin-auth"
import { AdminBranchContextSync } from "@/components/admin/admin-branch-context-sync"
import { AdminShell } from "@/components/admin/admin-shell"

type AdminLayoutProps = Readonly<{
  children: React.ReactNode
  params: Promise<{ branchSlug: string }>
}>

export default async function AdminLayout({
  children,
  params,
}: AdminLayoutProps) {
  const { branchSlug } = await params
  const { currentBranch } = await requireAdminBranchAccess(branchSlug)

  return (
    <AdminShell branchSlug={currentBranch.branchSlug} currentLabel={currentBranch.branchTitle}>
      <AdminBranchContextSync branchSlug={currentBranch.branchSlug} />
      {children}
    </AdminShell>
  )
}
