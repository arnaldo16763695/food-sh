import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ProductCard } from "@/components/site/product-card"
import { StorefrontHeader } from "@/components/site/storefront-header"
import { StorefrontHero } from "@/components/site/storefront-hero"
import { getPublicBranchBySlug, listPublicBranches } from "@/lib/branches"
import { listPublicProductsByBranch } from "@/lib/catalog-store"
import { buildCustomerAuthUrl, getCustomerAccessState } from "@/lib/customer-auth"

type BranchStorePageProps = {
  params: Promise<{ branchSlug: string }>
}

async function getBranchCatalogPreview(branchSlug: string) {
  try {
    const products = await listPublicProductsByBranch(branchSlug)

    return {
      ok: true as const,
      products,
    }
  } catch (error) {
    return {
      ok: false as const,
      message:
        error instanceof Error
          ? error.message
          : "No se pudo consultar el catálogo desde Supabase.",
    }
  }
}

export async function generateMetadata({ params }: BranchStorePageProps): Promise<Metadata> {
  const { branchSlug } = await params
  const branch = await getPublicBranchBySlug(branchSlug)

  if (!branch) {
    return {
      title: "Tienda | Shanghaipf Commerce",
    }
  }

  return {
    title: `${branch.title} | Shanghaipf Commerce`,
    description: `Catálogo online de ${branch.title}.`,
  }
}

export default async function BranchStorePage({ params }: BranchStorePageProps) {
  const { branchSlug } = await params
  const selectedBranch = await getPublicBranchBySlug(branchSlug)

  if (!selectedBranch) {
    notFound()
  }

  const availableBranches = await listPublicBranches()
  const branchResults = await Promise.all(
    availableBranches.map(async (branch) => ({
      ...branch,
      ...(await getBranchCatalogPreview(branch.slug)),
    })),
  )

  const currentBranch = branchResults.find((branch) => branch.slug === selectedBranch.slug)

  if (!currentBranch) {
    notFound()
  }

  const heroBranches = branchResults.map((branch) => ({
    slug: branch.slug,
    title: branch.title,
    productCount: branch.ok ? branch.products.length : 0,
  }))

  const currentProducts = currentBranch.ok ? currentBranch.products : []
  const customerAccessState = await getCustomerAccessState()
  const authUrl = buildCustomerAuthUrl(
    `/tienda/${selectedBranch.slug}`,
    customerAccessState.status === "guest"
      ? "auth-required"
      : customerAccessState.status === "unconfirmed"
        ? "email-not-confirmed"
        : customerAccessState.status === "needs-profile"
          ? "profile-incomplete"
          : undefined,
  )
  const customerAccess = {
    accountUrl: "/tienda/cuenta",
    authUrl,
    email: customerAccessState.user?.email ?? null,
    fullName:
      customerAccessState.profile?.fullName ??
      (typeof customerAccessState.user?.user_metadata?.full_name === "string"
        ? customerAccessState.user.user_metadata.full_name
        : null),
    status: customerAccessState.status,
    userId: customerAccessState.user?.id ?? null,
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,var(--brand-surface)_0%,#f5f1e8_40%,#fbfaf7_100%)] text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
      <div className="mx-auto flex w-full max-w-7xl flex-col px-5 pb-14 pt-5 sm:px-6 lg:px-10">
        <StorefrontHeader branchSlug={selectedBranch.slug} customerAccess={customerAccess} />

        <StorefrontHero
          selectedBranchSlug={selectedBranch.slug}
          selectedBranchTitle={selectedBranch.title}
          branches={heroBranches}
        />

        <section className="mt-10">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Catálogo</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">Productos disponibles</h2>
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {currentProducts.length} productos visibles en {selectedBranch.title}.
            </p>
          </div>

          {currentBranch.ok ? (
            currentProducts.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {currentProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    authUrl={authUrl}
                    branchSlug={selectedBranch.slug}
                    canAddToBag={customerAccess.status === "ready"}
                    customerUserId={customerAccess.userId}
                    product={product}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-4xl border border-dashed border-zinc-300 bg-white/70 p-8 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
                Esta sucursal todavía no tiene productos visibles en el catálogo online.
              </div>
            )
          ) : (
            <div className="rounded-4xl border border-red-200 bg-red-50 p-8 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-500/10 dark:text-red-300">
              {currentBranch.message}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
