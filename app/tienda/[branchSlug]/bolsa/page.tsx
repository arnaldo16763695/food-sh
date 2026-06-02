import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ShoppingBagPage } from "@/components/site/shopping-bag-page"
import { getPublicBranchBySlug } from "@/lib/branches"
import { requireReadyCustomerAccess } from "@/lib/customer-auth"

type ShoppingBagRouteProps = {
  params: Promise<{ branchSlug: string }>
}

export async function generateMetadata({ params }: ShoppingBagRouteProps): Promise<Metadata> {
  const { branchSlug } = await params
  const branch = await getPublicBranchBySlug(branchSlug)

  return {
    title: branch ? `${branch.title} | Bolsa | Shanghaipf Commerce` : "Bolsa | Shanghaipf Commerce",
  }
}

export default async function ShoppingBagRoute({ params }: ShoppingBagRouteProps) {
  const { branchSlug } = await params
  const branch = await getPublicBranchBySlug(branchSlug)

  if (!branch) {
    notFound()
  }

  const access = await requireReadyCustomerAccess(`/tienda/${branch.slug}/bolsa`)

  return <ShoppingBagPage branch={branch} customerUserId={access.user.id} />
}
