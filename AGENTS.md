<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Commands

- Use `npm` in this repo. `package-lock.json` is present and `package.json` only defines `npm run dev`, `npm run build`, `npm run start`, and `npm run lint`.
- There is no dedicated typecheck or test script yet. Do not assume `npm test` or `npm run typecheck` exists.

## Structure

- This is a single Next.js 16 app using the App Router. The current root entrypoints are `app/layout.tsx` and `app/page.tsx`.
- Public storefront routes are being organized under `app/tienda/[branchSlug]/`; admin routes are being organized under `app/admin/[branchSlug]/`.
- The repo uses no `src/` directory. The TypeScript path alias `@/*` resolves from the repository root.
- `CLAUDE.md` only points to `@AGENTS.md`, so keep this file as the canonical repo instruction file.

## UI And Styling

- Tailwind is set up in the Tailwind v4 style via CSS imports in `app/globals.css`; there is no `tailwind.config.*` file to edit.
- `app/globals.css` imports `tailwindcss`, `tw-animate-css`, and `shadcn/tailwind.css`. Preserve those imports unless intentionally changing the styling stack.
- shadcn is configured in `components.json` with `style: radix-nova`, `rsc: true`, and aliases for `@/components`, `@/components/ui`, `@/lib`, and `@/lib/utils`.
- Reuse `cn()` from `lib/utils.ts` for className composition. Existing shadcn UI components live under `components/ui/`.
- Prefer Tailwind's canonical utilities over arbitrary values when an exact built-in utility already exists; for example use `rounded-4xl` instead of `rounded-[2rem]`, use `border-[color-mix(...)]` instead of the redundant `border-[color:color-mix(...)]` form, and prefer variable shorthands like `bg-(--brand-secondary)` instead of `bg-[var(--brand-secondary)]` when supported.
- Any user-facing frontend copy written in Spanish must use correct grammar, accents, punctuation, and opening question/exclamation marks (`¿`, `¡`). Do not ship placeholder or unaccented Spanish text.

## Linting

- ESLint uses `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript` from `eslint.config.mjs`.
- `.next/**`, `out/**`, `build/**`, and `next-env.d.ts` are ignored by ESLint; do not treat generated output as source files to edit.
