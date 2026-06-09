import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { CatalogSearch } from "@/components/site/catalog-search"
import { ProductCard } from "@/components/site/product-card"
import { StorefrontHeader } from "@/components/site/storefront-header"
import { StorefrontHero } from "@/components/site/storefront-hero"
import { getPublicBranchBySlug, listPublicBranches } from "@/lib/branches"
import { listPublicProductsByBranch } from "@/lib/catalog-store"
import { buildCustomerAuthUrl, getCustomerAccessState } from "@/lib/customer-auth"

type BranchStorePageProps = {
  params: Promise<{ branchSlug: string }>
  searchParams: Promise<{ q?: string }>
}

function normalizeCatalogSearchQuery(query: string | undefined) {
  return query?.trim().replace(/\s+/g, " ") ?? ""
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

export default async function BranchStorePage({ params, searchParams }: BranchStorePageProps) {
  const { branchSlug } = await params
  const { q } = await searchParams
  const selectedBranch = await getPublicBranchBySlug(branchSlug)
  const searchQuery = normalizeCatalogSearchQuery(q)

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

  const currentProducts = currentBranch.ok ? await listPublicProductsByBranch(selectedBranch.slug, searchQuery) : []
  const customerAccessState = await getCustomerAccessState()
  const catalogPath = searchQuery ? `/tienda/${selectedBranch.slug}?q=${encodeURIComponent(searchQuery)}` : `/tienda/${selectedBranch.slug}`
  const authUrl = buildCustomerAuthUrl(
    catalogPath,
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
          searchQuery={searchQuery}
        />

        <section className="mt-4">
          <div className="mb-6 flex flex-col gap-4">
            <div>
              
              {searchQuery ? (
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                  Resultados para <span className="font-medium text-zinc-700 dark:text-zinc-200">{searchQuery}</span>.
                </p>
              ) : null}
            </div>

            <div className="flex justify-end">
              <CatalogSearch key={searchQuery} initialQuery={searchQuery} />
            </div>
          </div>

          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {currentProducts.length} productos visibles en {selectedBranch.title}.
            </p>
            {searchQuery ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Comparte esta URL para abrir el mismo filtro.</p>
            ) : null}
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
                {searchQuery
                  ? `No encontramos productos para "${searchQuery}" en esta sucursal.`
                  : "Esta sucursal todavía no tiene productos visibles en el catálogo online."}
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
