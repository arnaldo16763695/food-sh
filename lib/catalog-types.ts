export type CatalogProduct = {
  id: string
  externalId: string
  branchId: string
  sku: string
  name: string
  description: string
  imageUrl: string | null
  priceUsd: number
  priceVes: number
  stock: number
  isActive: boolean
  onlineEnabled: boolean
  updatedAtSource: string
  createdAt: string
  updatedAt: string
}

export type IntegrationProductUpsert = {
  external_id: string
  sku: string
  name: string
  price_usd: number
  price_ves: number
  stock: number
  is_active: boolean
  updated_at_source: string
}

export type IntegrationStockUpdate = {
  stock: number
  updated_at_source: string
}

export type IntegrationPriceUpdate = {
  price_usd: number
  price_ves: number
  updated_at_source: string
}

export type IntegrationStatusUpdate = {
  is_active: boolean
  updated_at_source: string
}
