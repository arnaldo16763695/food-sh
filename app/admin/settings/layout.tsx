import { requireSuperadminSession } from "@/lib/admin-auth"

type AdminSettingsLayoutProps = Readonly<{
  children: React.ReactNode
}>

export default async function AdminSettingsLayout({ children }: AdminSettingsLayoutProps) {
  await requireSuperadminSession("/admin/settings")

  return children
}
