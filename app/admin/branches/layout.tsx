import { requireSuperadminSession } from "@/lib/admin-auth"

type AdminBranchesLayoutProps = Readonly<{
  children: React.ReactNode
}>

export default async function AdminBranchesLayout({ children }: AdminBranchesLayoutProps) {
  await requireSuperadminSession("/admin/branches")

  return children
}
