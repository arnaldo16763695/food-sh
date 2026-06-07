import { requireSuperadminSession } from "@/lib/admin-auth"

type AdminIntegrationsLayoutProps = Readonly<{
  children: React.ReactNode
}>

export default async function AdminIntegrationsLayout({ children }: AdminIntegrationsLayoutProps) {
  await requireSuperadminSession("/admin/integrations")

  return children
}
