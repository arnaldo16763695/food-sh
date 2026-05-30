type HeroBranch = {
  slug: string
  title: string
  productCount: number
}

type StorefrontHeroProps = {
  selectedBranchSlug: string
  selectedBranchTitle: string
  branches: HeroBranch[]
}

export function StorefrontHero({
  selectedBranchSlug,
  selectedBranchTitle,
  branches,
}: StorefrontHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-[2.5rem] border border-white/70 bg-[linear-gradient(135deg,#fffdf9_0%,#fff7eb_50%,#f8fff5_100%)] px-6 py-7 shadow-[0_24px_70px_rgba(24,24,27,0.07)] dark:border-zinc-800 dark:bg-[linear-gradient(135deg,#11131d_0%,#17171d_52%,#0f1428_100%)] sm:px-8 lg:px-10 lg:py-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,color-mix(in_oklab,var(--brand-accent)_22%,white),transparent_28%),radial-gradient(circle_at_top_right,color-mix(in_oklab,var(--brand-primary)_14%,white),transparent_30%),radial-gradient(circle_at_bottom_right,color-mix(in_oklab,var(--brand-secondary)_12%,white),transparent_26%)] dark:bg-[radial-gradient(circle_at_top_left,color-mix(in_oklab,var(--brand-accent)_10%,black),transparent_28%),radial-gradient(circle_at_top_right,color-mix(in_oklab,var(--brand-primary)_14%,black),transparent_30%),radial-gradient(circle_at_bottom_right,color-mix(in_oklab,var(--brand-secondary)_12%,black),transparent_26%)]" />

      <div className="relative grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="space-y-3">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[color:color-mix(in_oklab,var(--brand-secondary)_22%,white)] bg-white/84 px-3 py-1 text-xs font-semibold tracking-[0.16em] text-[var(--brand-secondary)] uppercase backdrop-blur dark:border-[color:color-mix(in_oklab,var(--brand-secondary)_24%,black)] dark:bg-black/15 dark:text-[color:color-mix(in_oklab,var(--brand-secondary)_80%,white)]">
            <span className="size-2 rounded-full bg-(--brand-secondary)" />
            Online
          </span>

          <div className="space-y-1.5">
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Sucursal</p>
            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-[3.4rem]">
              {selectedBranchTitle}
            </h1>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:w-[320px] lg:grid-cols-1">
          {branches.map((branch) => {
            const isSelected = branch.slug === selectedBranchSlug

            return (
              <div
                key={branch.slug}
                className={[
                  "rounded-[1.65rem] border px-4 py-4 transition-all duration-200",
                  isSelected
                    ? "text-white"
                    : "bg-white/88 text-zinc-800 shadow-sm backdrop-blur dark:bg-zinc-950/80 dark:text-zinc-200",
                ].join(" ")}
                style={
                  isSelected
                    ? {
                        background:
                          "linear-gradient(135deg, color-mix(in oklab, var(--brand-deep) 88%, black) 0%, var(--brand-deep) 46%, color-mix(in oklab, var(--brand-primary) 26%, var(--brand-deep)) 100%)",
                        borderColor: "color-mix(in oklab, var(--brand-primary) 28%, var(--brand-deep))",
                      }
                    : {
                        borderColor: "color-mix(in oklab, var(--brand-secondary) 18%, white)",
                      }
                }
              >
                <p className="text-sm font-medium tracking-[0.02em]">{branch.title}</p>
                <p className={["mt-1.5 text-xs", isSelected ? "text-white/75" : "text-zinc-500 dark:text-zinc-400"].join(" ")}>
                  {branch.productCount} productos visibles
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
