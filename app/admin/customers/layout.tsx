import { requireSuperadminSession } from "@/lib/admin-auth"

type AdminCustomersLayoutProps = Readonly<{
  children: React.ReactNode
}>

export default async function AdminCustomersLayout({ children }: AdminCustomersLayoutProps) {
  await requireSuperadminSession("/admin/customers")

  return children
}
