import {
  type CatalogProduct,
  type IntegrationPriceUpdate,
  type IntegrationProductUpsert,
  type IntegrationStatusUpdate,
  type IntegrationStockUpdate,
} from "@/lib/catalog-types"
import { type Database } from "@/lib/database.types"
import { createSupabaseAdminClient, createSupabasePublicClient } from "@/lib/supabase"

type ProductRow = Database["public"]["Tables"]["products"]["Row"]

function nowIso() {
  return new Date().toISOString()
}

function mapProduct(row: ProductRow): CatalogProduct {
  return {
    id: row.id,
    externalId: row.external_id,
    branchId: row.branch_id,
    sku: row.sku,
    name: row.name,
    description: row.description,
    imageUrl: row.image_url,
    priceUsd: row.price_usd,
    priceVes: row.price_ves,
    stock: row.stock,
    isActive: row.is_active,
    onlineEnabled: row.online_enabled,
    updatedAtSource: row.updated_at_source,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

async function getProductForIntegration(branchId: string, externalId: string) {
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("branch_id", branchId)
    .eq("external_id", externalId)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data
}

export async function listPublicProductsByBranch(branchId: string) {
  const supabase = createSupabasePublicClient()
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("branch_id", branchId)
    .eq("is_active", true)
    .eq("online_enabled", true)
    .order("updated_at", { ascending: false })

  if (error) {
    throw error
  }

  return data.map(mapProduct)
}

export async function listAdminProductsByBranch(branchId: string) {
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("branch_id", branchId)
    .order("updated_at", { ascending: false })

  if (error) {
    throw error
  }

  return data.map(mapProduct)
}

export async function getPublicProductById(branchId: string, id: string) {
  const supabase = createSupabasePublicClient()
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("branch_id", branchId)
    .eq("id", id)
    .eq("is_active", true)
    .eq("online_enabled", true)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data ? mapProduct(data) : null
}

export async function upsertIntegrationProduct(branchId: string, input: IntegrationProductUpsert) {
  const supabase = createSupabaseAdminClient()
  const existing = await getProductForIntegration(branchId, input.external_id)
  const updatedAt = nowIso()

  if (existing) {
    const { data, error } = await supabase
      .from("products")
      .update({
        is_active: input.is_active,
        name: input.name,
        price_usd: input.price_usd,
        price_ves: input.price_ves,
        sku: input.sku,
        stock: input.stock,
        updated_at: updatedAt,
        updated_at_source: input.updated_at_source,
      })
      .eq("id", existing.id)
      .select("*")
      .single()

    if (error) {
      throw error
    }

    return mapProduct(data)
  }

  const createdAt = nowIso()
  const { data, error } = await supabase
    .from("products")
    .insert({
      branch_id: branchId,
      created_at: createdAt,
      description: "",
      external_id: input.external_id,
      is_active: input.is_active,
      name: input.name,
      online_enabled: true,
      price_usd: input.price_usd,
      price_ves: input.price_ves,
      sku: input.sku,
      stock: input.stock,
      updated_at: createdAt,
      updated_at_source: input.updated_at_source,
    })
    .select("*")
    .single()

  if (error) {
    throw error
  }

  return mapProduct(data)
}

export async function updateIntegrationStock(branchId: string, externalId: string, input: IntegrationStockUpdate) {
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from("products")
    .update({
      stock: input.stock,
      updated_at: nowIso(),
      updated_at_source: input.updated_at_source,
    })
    .eq("branch_id", branchId)
    .eq("external_id", externalId)
    .select("*")
    .maybeSingle()

  if (error) {
    throw error
  }

  return data ? mapProduct(data) : null
}

export async function updateIntegrationPrice(branchId: string, externalId: string, input: IntegrationPriceUpdate) {
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from("products")
    .update({
      price_usd: input.price_usd,
      price_ves: input.price_ves,
      updated_at: nowIso(),
      updated_at_source: input.updated_at_source,
    })
    .eq("branch_id", branchId)
    .eq("external_id", externalId)
    .select("*")
    .maybeSingle()

  if (error) {
    throw error
  }

  return data ? mapProduct(data) : null
}

export async function updateIntegrationStatus(branchId: string, externalId: string, input: IntegrationStatusUpdate) {
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from("products")
    .update({
      is_active: input.is_active,
      updated_at: nowIso(),
      updated_at_source: input.updated_at_source,
    })
    .eq("branch_id", branchId)
    .eq("external_id", externalId)
    .select("*")
    .maybeSingle()

  if (error) {
    throw error
  }

  return data ? mapProduct(data) : null
}
