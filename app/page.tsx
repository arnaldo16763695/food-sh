import { ProductCard } from "@/components/site/product-card"
import { StorefrontHeader } from "@/components/site/storefront-header"
import { StorefrontHero } from "@/components/site/storefront-hero"
import { listPublicProductsByBranch } from "@/lib/catalog-store"

type BranchPreview = {
  slug: string
  title: string
}

const branchPreviews: BranchPreview[] = [
  { slug: "centro", title: "Sucursal Centro" },
  { slug: "norte", title: "Sucursal Norte" },
]

async function getBranchCatalogPreview(branch: BranchPreview) {
  try {
    const products = await listPublicProductsByBranch(branch.slug)

    return {
      ...branch,
      ok: true as const,
      products,
    }
  } catch (error) {
    return {
      ...branch,
      ok: false as const,
      message:
        error instanceof Error
          ? error.message
          : "No se pudo consultar el catálogo desde Supabase.",
    }
  }
}

export default async function Home() {
  const branches = await Promise.all(branchPreviews.map(getBranchCatalogPreview))
  const selectedBranch = branches.find((branch) => branch.slug === "centro") ?? branches[0]
  const selectedBranchTitle = selectedBranch.title
  const selectedBranchProducts = selectedBranch.ok ? selectedBranch.products : []
  const heroBranches = branches.map((branch) => ({
    slug: branch.slug,
    title: branch.title,
    productCount: branch.ok ? branch.products.length : 0,
  }))

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,var(--brand-surface)_0%,#f5f1e8_40%,#fbfaf7_100%)] text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
      <div className="mx-auto flex w-full max-w-7xl flex-col px-5 pb-14 pt-5 sm:px-6 lg:px-10">
        <StorefrontHeader />

        <StorefrontHero
          selectedBranchSlug={selectedBranch.slug}
          selectedBranchTitle={selectedBranchTitle}
          branches={heroBranches}
        />

        <section className="mt-10">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Catálogo</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">Productos disponibles</h2>
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {selectedBranchProducts.length} productos visibles en {selectedBranchTitle}.
            </p>
          </div>

          {selectedBranch.ok ? (
            selectedBranchProducts.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {selectedBranchProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="rounded-4xl border border-dashed border-zinc-300 bg-white/70 p-8 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
                Esta sucursal todavía no tiene productos visibles en el catálogo online.
              </div>
            )
          ) : (
            <div className="rounded-4xl border border-red-200 bg-red-50 p-8 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-500/10 dark:text-red-300">
              {selectedBranch.message}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
