import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { CheckoutPage } from "@/components/site/checkout-page"
import { getPublicBranchAvailability } from "@/lib/branch-hours"
import { getPublicBranchBySlug } from "@/lib/branches"

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

  return <CheckoutPage branch={branch} availability={availability} />
}
