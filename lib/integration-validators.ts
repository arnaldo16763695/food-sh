import {
  type IntegrationPriceUpdate,
  type IntegrationProductUpsert,
  type IntegrationStatusUpdate,
  type IntegrationStockUpdate,
} from "@/lib/catalog-types"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value)
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean"
}

function isIsoDateString(value: unknown): value is string {
  return isNonEmptyString(value) && !Number.isNaN(Date.parse(value))
}

export function parseJsonBody(bodyText: string) {
  try {
    return { ok: true as const, value: JSON.parse(bodyText) as unknown }
  } catch {
    return { ok: false as const, error: "Invalid JSON body." }
  }
}

export function validateProductUpsert(value: unknown) {
  if (!isRecord(value)) {
    return { ok: false as const, error: "Body must be a JSON object." }
  }

  const payload: IntegrationProductUpsert = {
    external_id: value.external_id as string,
    sku: value.sku as string,
    name: value.name as string,
    price_usd: value.price_usd as number,
    price_ves: value.price_ves as number,
    stock: value.stock as number,
    is_active: value.is_active as boolean,
    updated_at_source: value.updated_at_source as string,
  }

  if (
    !isNonEmptyString(payload.external_id) ||
    !isNonEmptyString(payload.sku) ||
    !isNonEmptyString(payload.name) ||
    !isFiniteNumber(payload.price_usd) ||
    !isFiniteNumber(payload.price_ves) ||
    !isFiniteNumber(payload.stock) ||
    !isBoolean(payload.is_active) ||
    !isIsoDateString(payload.updated_at_source)
  ) {
    return { ok: false as const, error: "Body does not match the expected product upsert payload." }
  }

  return { ok: true as const, value: payload }
}

export function validateStockUpdate(value: unknown) {
  if (!isRecord(value)) {
    return { ok: false as const, error: "Body must be a JSON object." }
  }

  const payload: IntegrationStockUpdate = {
    stock: value.stock as number,
    updated_at_source: value.updated_at_source as string,
  }

  if (!isFiniteNumber(payload.stock) || !isIsoDateString(payload.updated_at_source)) {
    return { ok: false as const, error: "Body does not match the expected stock update payload." }
  }

  return { ok: true as const, value: payload }
}

export function validatePriceUpdate(value: unknown) {
  if (!isRecord(value)) {
    return { ok: false as const, error: "Body must be a JSON object." }
  }

  const payload: IntegrationPriceUpdate = {
    price_usd: value.price_usd as number,
    price_ves: value.price_ves as number,
    updated_at_source: value.updated_at_source as string,
  }

  if (
    !isFiniteNumber(payload.price_usd) ||
    !isFiniteNumber(payload.price_ves) ||
    !isIsoDateString(payload.updated_at_source)
  ) {
    return { ok: false as const, error: "Body does not match the expected price update payload." }
  }

  return { ok: true as const, value: payload }
}

export function validateStatusUpdate(value: unknown) {
  if (!isRecord(value)) {
    return { ok: false as const, error: "Body must be a JSON object." }
  }

  const payload: IntegrationStatusUpdate = {
    is_active: value.is_active as boolean,
    updated_at_source: value.updated_at_source as string,
  }

  if (!isBoolean(payload.is_active) || !isIsoDateString(payload.updated_at_source)) {
    return { ok: false as const, error: "Body does not match the expected status update payload." }
  }

  return { ok: true as const, value: payload }
}

export function validatePosInvoiceUpdate(value: unknown) {
  if (!isRecord(value)) {
    return { ok: false as const, error: "Body must be a JSON object." }
  }

  const payload = {
    pos_reference: value.pos_reference as string,
    facturado_at: value.facturado_at as string,
  }

  if (!isNonEmptyString(payload.pos_reference) || !isIsoDateString(payload.facturado_at)) {
    return { ok: false as const, error: "Body does not match the expected POS invoice payload." }
  }

  return { ok: true as const, value: payload }
}

export function validatePaymentValidationUpdate(value: unknown) {
  if (!isRecord(value)) {
    return { ok: false as const, error: "Body must be a JSON object." }
  }

  const payload = {
    payment_reference: value.payment_reference as string,
    payment_validated_at: value.payment_validated_at as string | undefined,
  }

  if (
    !isNonEmptyString(payload.payment_reference) ||
    (payload.payment_validated_at !== undefined && !isIsoDateString(payload.payment_validated_at))
  ) {
    return { ok: false as const, error: "Body does not match the expected payment validation payload." }
  }

  return {
    ok: true as const,
    value: {
      payment_reference: payload.payment_reference,
      payment_validated_at: payload.payment_validated_at,
    },
  }
}
