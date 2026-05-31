import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

type ShoppingBagItem = {
  id: string
  productId: string
  branchSlug: string
  externalId: string
  sku: string
  name: string
  imageUrl: string | null
  priceUsd: number
  priceVes: number
  note: string
  exclusions: string[]
  quantity: number
}

type AddItemInput = Omit<ShoppingBagItem, "quantity">

type AddItemResult =
  | { ok: true }
  | { ok: false; reason: "branch-conflict" }

type ShoppingBagState = {
  branchSlug: string | null
  items: ShoppingBagItem[]
  addItem: (item: AddItemInput) => AddItemResult
  forceStartBranch: (branchSlug: string) => void
  removeItem: (itemId: string) => void
  setQuantity: (itemId: string, quantity: number) => void
  clear: () => void
}

type PersistedShoppingBagState = {
  branchSlug: string | null
  items: Array<Partial<ShoppingBagItem> & { id: string }>
}

function normalizeExclusions(exclusions: string[]) {
  return exclusions.map((item) => item.trim()).filter(Boolean)
}

function normalizeShoppingBagItem(item: Partial<ShoppingBagItem> & { id: string }): ShoppingBagItem {
  return {
    id: item.id,
    productId: item.productId ?? item.id,
    branchSlug: item.branchSlug ?? "",
    externalId: item.externalId ?? "",
    sku: item.sku ?? "",
    name: item.name ?? "Producto",
    imageUrl: item.imageUrl ?? null,
    priceUsd: item.priceUsd ?? 0,
    priceVes: item.priceVes ?? 0,
    note: item.note ?? "",
    exclusions: normalizeExclusions(item.exclusions ?? []),
    quantity: item.quantity ?? 1,
  }
}

function buildShoppingBagItemId({
  productId,
  note,
  exclusions,
}: {
  productId: string
  note: string
  exclusions: string[]
}) {
  const normalizedNote = note.trim().toLowerCase()
  const normalizedExclusions = normalizeExclusions(exclusions)
    .map((item) => item.toLowerCase())
    .sort()
    .join("|")

  return `${productId}::${normalizedNote}::${normalizedExclusions}`
}

export function calculateBagTotals(items: ShoppingBagItem[]) {
  return items.reduce(
    (acc, item) => {
      acc.quantity += item.quantity
      acc.subtotalUsd += item.priceUsd * item.quantity
      acc.subtotalVes += item.priceVes * item.quantity
      return acc
    },
    {
      quantity: 0,
      subtotalUsd: 0,
      subtotalVes: 0,
    },
  )
}

export type { ShoppingBagItem, AddItemInput }

export const useShoppingBagStore = create<ShoppingBagState>()(
  persist(
    (set, get) => ({
      branchSlug: null,
      items: [],
      addItem: (item) => {
        const state = get()

        if (state.branchSlug && state.branchSlug !== item.branchSlug) {
          return { ok: false, reason: "branch-conflict" }
        }

        const lineId = buildShoppingBagItemId({
          productId: item.productId,
          note: item.note,
          exclusions: item.exclusions,
        })

        const normalizedExclusions = normalizeExclusions(item.exclusions)
        const nextItem = {
          ...item,
          id: lineId,
          exclusions: normalizedExclusions,
        }

        const existing = state.items.find((entry) => entry.id === lineId)

        if (existing) {
          set({
            branchSlug: item.branchSlug,
            items: state.items.map((entry) =>
              entry.id === lineId ? { ...entry, quantity: entry.quantity + 1 } : entry,
            ),
          })

          return { ok: true }
        }

        set({
          branchSlug: item.branchSlug,
          items: [...state.items, { ...nextItem, quantity: 1 }],
        })

        return { ok: true }
      },
      forceStartBranch: (branchSlug) => {
        set({ branchSlug, items: [] })
      },
      removeItem: (itemId) => {
        const nextItems = get().items.filter((item) => item.id !== itemId)
        set({
          branchSlug: nextItems.length > 0 ? get().branchSlug : null,
          items: nextItems,
        })
      },
      setQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId)
          return
        }

        set({
          items: get().items.map((item) =>
            item.id === itemId ? { ...item, quantity } : item,
          ),
        })
      },
      clear: () => set({ branchSlug: null, items: [] }),
    }),
    {
      name: "shopping-bag-store",
      storage: createJSONStorage(() => localStorage),
      merge: (persistedState, currentState) => {
        const state = persistedState as PersistedShoppingBagState | undefined

        if (!state) {
          return currentState
        }

        return {
          ...currentState,
          ...state,
          branchSlug: state.branchSlug ?? null,
          items: Array.isArray(state.items) ? state.items.map(normalizeShoppingBagItem) : [],
        }
      },
    },
  ),
)
