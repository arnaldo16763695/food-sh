import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { CheckoutPage } from "@/components/site/checkout-page"
import { getPublicBranchAvailability } from "@/lib/branch-hours"
import { getPublicBranchBySlug } from "@/lib/branches"
import { requireReadyCustomerAccess } from "@/lib/customer-auth"

type CheckoutRouteProps = {
  params: Promise<{ branchSlug: string }>
}

export async function generateMetadata({ params }: CheckoutRouteProps): Promise<Metadata> {
  const { branchSlug } = await params
  const branch = await getPublicBranchBySlug(branchSlug)

  return {
    title: branch ? `${branch.title} | Checkout | Shanghaipf Commerce` : "Checkout | Shanghaipf Commerce",
  }
}

export default async function CheckoutRoute({ params }: CheckoutRouteProps) {
  const { branchSlug } = await params
  const branch = await getPublicBranchBySlug(branchSlug)

  if (!branch) {
    notFound()
  }

  const availability = await getPublicBranchAvailability(branch.slug)
  const access = await requireReadyCustomerAccess(`/tienda/${branch.slug}/checkout`)

  return (
    <CheckoutPage
      availability={availability}
      branch={branch}
      customerEmail={access.user.email ?? ""}
      customerName={access.profile.fullName}
      customerPhone={access.profile.phone}
      customerUserId={access.user.id}
    />
  )
}
