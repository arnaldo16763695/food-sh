import Image from "next/image"

import { AddToBagButton } from "@/components/site/add-to-bag-button"
import { type CatalogProduct } from "@/lib/catalog-types"

type ProductCardProps = {
  authUrl: string
  branchSlug: string
  canAddToBag: boolean
  customerUserId: string | null
  product: CatalogProduct
}

export function ProductCard({ authUrl, branchSlug, canAddToBag, customerUserId, product }: ProductCardProps) {
  const hasImage = Boolean(product.imageUrl)

  return (
    <article className="group overflow-hidden rounded-4xl border border-white/70 bg-white shadow-[0_20px_50px_rgba(24,24,27,0.05)] transition-transform duration-200 hover:-translate-y-1 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="relative aspect-4/3 overflow-hidden">
        {hasImage ? (
          <div className="absolute inset-0 bg-[linear-gradient(135deg,color-mix(in_oklab,var(--brand-accent)_16%,white)_0%,white_52%,color-mix(in_oklab,var(--brand-secondary)_10%,white)_100%)] dark:bg-[linear-gradient(135deg,color-mix(in_oklab,var(--brand-deep)_70%,black)_0%,#17171d_55%,color-mix(in_oklab,var(--brand-secondary)_26%,black)_100%)]" />
        ) : null}

        {hasImage ? (
          <div className="absolute inset-0 p-4 transition-transform duration-500 group-hover:scale-[1.03]">
            <div className="relative h-full w-full overflow-hidden rounded-3xl bg-white/80 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.7)] backdrop-blur-sm dark:bg-black/10 dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]">
              <Image
                src={product.imageUrl!}
                alt={product.name}
                fill
                sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
                className="object-contain p-3"
              />
            </div>
          </div>
        ) : null}

        <div
          className="absolute inset-0"
          style={{
            background: hasImage
              ? "linear-gradient(180deg, rgba(24, 24, 27, 0.02) 0%, rgba(24, 24, 27, 0.08) 55%, rgba(24, 24, 27, 0.22) 100%)"
              : "linear-gradient(135deg, color-mix(in oklab, var(--brand-accent) 26%, white) 0%, color-mix(in oklab, var(--brand-primary) 10%, white) 100%)",
          }}
        />

        {!hasImage ? (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,color-mix(in_oklab,var(--brand-secondary)_16%,white),transparent_30%),radial-gradient(circle_at_bottom_right,color-mix(in_oklab,var(--brand-primary)_18%,white),transparent_34%)] dark:bg-[radial-gradient(circle_at_top_left,color-mix(in_oklab,var(--brand-secondary)_22%,black),transparent_30%),radial-gradient(circle_at_bottom_right,color-mix(in_oklab,var(--brand-primary)_26%,black),transparent_34%)]" />
        ) : null}

        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
          <span className="inline-flex rounded-full border border-white/60 bg-white/88 px-2.5 py-1 text-[11px] font-medium tracking-[0.16em] text-zinc-700 uppercase shadow-sm backdrop-blur dark:border-white/10 dark:bg-zinc-950/75 dark:text-zinc-200">
            {product.sku}
          </span>

          <span className="rounded-full bg-(--brand-secondary) px-2.5 py-1 text-[11px] font-medium text-var(--brand-secondary-foreground)">
            Stock {product.stock}
          </span>
        </div>

        {!hasImage ? (
          <div className="absolute inset-x-0 bottom-0 p-4">
            <div className="w-fit rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-zinc-600 backdrop-blur dark:bg-zinc-950/60 dark:text-zinc-300">
              Imagen del producto pendiente
            </div>
          </div>
        ) : null}
      </div>

      <div className="space-y-4 p-5">
        <h3 className="text-lg font-semibold leading-tight">{product.name}</h3>

        <div className="space-y-1.5">
          <p className="text-xs font-medium tracking-[0.14em] text-zinc-500 uppercase dark:text-zinc-400">
            Ingredientes
          </p>
          <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            {product.description || "Producto disponible para compra online."}
          </p>
        </div>

        <div className="border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <p className="text-xs uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">Precio</p>
          <p className="mt-1 text-lg font-semibold text-var(--brand-primary)">USD {product.priceUsd.toFixed(2)}</p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">VES {product.priceVes.toFixed(2)}</p>
        </div>

        <div className="pt-1">
          <AddToBagButton
            authUrl={authUrl}
            branchSlug={branchSlug}
            canAddToBag={canAddToBag}
            customerUserId={customerUserId}
            product={product}
          />
        </div>
      </div>
    </article>
  )
}
