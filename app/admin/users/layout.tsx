import { requireSuperadminSession } from "@/lib/admin-auth"

type AdminUsersLayoutProps = Readonly<{
  children: React.ReactNode
}>

export default async function AdminUsersLayout({ children }: AdminUsersLayoutProps) {
  await requireSuperadminSession("/admin/users")

  return children
}
