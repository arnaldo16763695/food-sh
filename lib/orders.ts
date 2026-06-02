import { createSupabaseAdminClient } from "@/lib/supabase"
import { assertBranchIsOpenForCheckout } from "@/lib/branch-hours"

type OrderCurrency = "USD" | "VES"
type FulfillmentType = "pickup" | "delivery"
type OrderStatus = "draft" | "submitted" | "cancelled"

type DraftOrderItemInput = {
  productId: string
  quantity: number
  note: string
  exclusions: string[]
}

export type AdminOrderListItem = {
  id: string
  branchSlug: string
  customerName: string
  customerEmail: string
  customerPhone: string | null
  fulfillmentType: FulfillmentType
  currency: OrderCurrency
  status: OrderStatus
  pagoValidado: boolean
  paymentReference: string | null
  paymentValidatedAt: string | null
  posFacturado: boolean
  posFacturadoAt: string | null
  posReference: string | null
  subtotalUsd: number
  subtotalVes: number
  createdAt: string
  updatedAt: string
}

export type AdminOrderDetail = AdminOrderListItem & {
  notes: string
  items: {
    id: string
    productId: string
    productName: string
    sku: string
    quantity: number
    note: string
    exclusions: string[]
    unitPriceUsd: number
    unitPriceVes: number
    lineTotalUsd: number
    lineTotalVes: number
  }[]
}

function mapAdminOrder(order: {
  id: string
  branch_id: string
  customer_name: string
  customer_email: string
  customer_phone: string | null
  fulfillment_type: FulfillmentType
  currency: OrderCurrency
  status: OrderStatus
  pago_validado: boolean
  payment_reference: string | null
  payment_validated_at: string | null
  pos_facturado: boolean
  pos_facturado_at: string | null
  pos_reference: string | null
  subtotal_usd: number
  subtotal_ves: number
  created_at: string
  updated_at: string
}) {
  return {
    id: order.id,
    branchSlug: order.branch_id,
    customerName: order.customer_name,
    customerEmail: order.customer_email,
    customerPhone: order.customer_phone,
    fulfillmentType: order.fulfillment_type,
    currency: order.currency,
    status: order.status,
    pagoValidado: order.pago_validado,
    paymentReference: order.payment_reference,
    paymentValidatedAt: order.payment_validated_at,
    posFacturado: order.pos_facturado,
    posFacturadoAt: order.pos_facturado_at,
    posReference: order.pos_reference,
    subtotalUsd: order.subtotal_usd,
    subtotalVes: order.subtotal_ves,
    createdAt: order.created_at,
    updatedAt: order.updated_at,
  }
}

export type IntegrationOrderListItem = AdminOrderListItem
export type IntegrationOrderDetail = AdminOrderDetail

export type CustomerOrderListItem = Pick<
  AdminOrderListItem,
  | "id"
  | "branchSlug"
  | "currency"
  | "customerEmail"
  | "customerName"
  | "customerPhone"
  | "createdAt"
  | "fulfillmentType"
  | "pagoValidado"
  | "paymentReference"
  | "paymentValidatedAt"
  | "posFacturado"
  | "posFacturadoAt"
  | "posReference"
  | "status"
  | "subtotalUsd"
  | "subtotalVes"
  | "updatedAt"
>

export class OrderAlreadyInvoicedError extends Error {
  constructor() {
    super("Order already invoiced in POS.")
    this.name = "OrderAlreadyInvoicedError"
  }
}

const ORDER_LIST_FIELDS =
  "id, branch_id, customer_name, customer_email, customer_phone, fulfillment_type, currency, status, pago_validado, payment_reference, payment_validated_at, pos_facturado, pos_facturado_at, pos_reference, subtotal_usd, subtotal_ves, created_at, updated_at" as const

const ORDER_DETAIL_FIELDS = `${ORDER_LIST_FIELDS}, notes` as const

export async function listAdminOrdersByBranch(branchSlug: string): Promise<AdminOrderListItem[]> {
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_LIST_FIELDS)
    .eq("branch_id", branchSlug)
    .order("created_at", { ascending: false })

  if (error) {
    throw error
  }

  return data.map(mapAdminOrder)
}

export async function listCustomerOrders(userId: string): Promise<CustomerOrderListItem[]> {
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_LIST_FIELDS)
    .eq("customer_user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    throw error
  }

  return data.map(mapAdminOrder)
}

export async function getAdminOrderById(branchSlug: string, orderId: string): Promise<AdminOrderDetail | null> {
  const supabase = createSupabaseAdminClient()
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select(ORDER_DETAIL_FIELDS)
    .eq("branch_id", branchSlug)
    .eq("id", orderId)
    .maybeSingle()

  if (orderError) {
    throw orderError
  }

  if (!order) {
    return null
  }

  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select(
      "id, product_id, product_name, sku, quantity, note, exclusions, unit_price_usd, unit_price_ves, line_total_usd, line_total_ves",
    )
    .eq("order_id", orderId)
    .order("created_at", { ascending: true })

  if (itemsError) {
    throw itemsError
  }

  return {
    ...mapAdminOrder(order),
    notes: order.notes,
    items: items.map((item) => ({
      id: item.id,
      productId: item.product_id,
      productName: item.product_name,
      sku: item.sku,
      quantity: item.quantity,
      note: item.note,
      exclusions: item.exclusions,
      unitPriceUsd: item.unit_price_usd,
      unitPriceVes: item.unit_price_ves,
      lineTotalUsd: item.line_total_usd,
      lineTotalVes: item.line_total_ves,
    })),
  }
}

export async function listIntegrationOrdersByBranch(branchSlug: string): Promise<IntegrationOrderListItem[]> {
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_LIST_FIELDS)
    .eq("branch_id", branchSlug)
    .eq("status", "submitted")
    .eq("pago_validado", true)
    .eq("pos_facturado", false)
    .order("created_at", { ascending: true })

  if (error) {
    throw error
  }

  return data.map(mapAdminOrder)
}

export async function getIntegrationOrderById(
  branchSlug: string,
  orderId: string,
): Promise<IntegrationOrderDetail | null> {
  const order = await getAdminOrderById(branchSlug, orderId)

  if (!order || order.status !== "submitted" || !order.pagoValidado) {
    return null
  }

  return order
}

export async function markOrderAsPosInvoiced({
  branchSlug,
  orderId,
  posReference,
  facturadoAt,
}: {
  branchSlug: string
  orderId: string
  posReference: string
  facturadoAt: string
}) {
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from("orders")
    .update({
      pos_facturado: true,
      pos_facturado_at: facturadoAt,
      pos_reference: posReference.trim(),
      updated_at: new Date().toISOString(),
    })
    .eq("branch_id", branchSlug)
    .eq("id", orderId)
    .eq("status", "submitted")
    .eq("pago_validado", true)
    .eq("pos_facturado", false)
    .select(ORDER_LIST_FIELDS)
    .maybeSingle()

  if (error) {
    throw error
  }

  if (!data) {
    const existing = await getAdminOrderById(branchSlug, orderId)

    if (existing?.posFacturado) {
      throw new OrderAlreadyInvoicedError()
    }

    return null
  }

  return mapAdminOrder(data)
}

export async function markOrderPaymentValidated({
  orderId,
  paymentReference,
  paymentValidatedAt,
}: {
  orderId: string
  paymentReference: string
  paymentValidatedAt: string
}) {
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from("orders")
    .update({
      pago_validado: true,
      payment_reference: paymentReference.trim(),
      payment_validated_at: paymentValidatedAt,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .eq("status", "submitted")
    .eq("pago_validado", false)
    .select(ORDER_LIST_FIELDS)
    .maybeSingle()

  if (error) {
    throw error
  }

  if (data) {
    return mapAdminOrder(data)
  }

  const { data: existing, error: existingError } = await supabase
    .from("orders")
    .select(ORDER_LIST_FIELDS)
    .eq("id", orderId)
    .maybeSingle()

  if (existingError) {
    throw existingError
  }

  return existing ? mapAdminOrder(existing) : null
}

export async function createSubmittedOrder({
  branchSlug,
  customerUserId,
  customerName,
  customerEmail,
  customerPhone,
  fulfillmentType,
  notes,
  currency,
  items,
}: {
  branchSlug: string
  customerUserId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  fulfillmentType: FulfillmentType
  notes: string
  currency: OrderCurrency
  items: DraftOrderItemInput[]
}) {
  const supabase = createSupabaseAdminClient()

  await assertBranchIsOpenForCheckout(branchSlug)

  const productIds = items.map((item) => item.productId)
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, branch_id, name, sku, price_usd, price_ves, is_active, online_enabled")
    .eq("branch_id", branchSlug)
    .in("id", productIds)

  if (productsError) {
    throw productsError
  }

  const productMap = new Map(products.map((product) => [product.id, product]))
  const normalizedItems = items.map((item) => {
    const product = productMap.get(item.productId)

    if (!product || !product.is_active || !product.online_enabled) {
      throw new Error("Uno o más productos ya no están disponibles para compra online.")
    }

    const quantity = Math.max(1, item.quantity)

    return {
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      quantity,
      note: item.note.trim(),
      exclusions: item.exclusions.map((entry) => entry.trim()).filter(Boolean),
      unitPriceUsd: product.price_usd,
      unitPriceVes: product.price_ves,
      lineTotalUsd: product.price_usd * quantity,
      lineTotalVes: product.price_ves * quantity,
    }
  })

  const subtotalUsd = normalizedItems.reduce((acc, item) => acc + item.lineTotalUsd, 0)
  const subtotalVes = normalizedItems.reduce((acc, item) => acc + item.lineTotalVes, 0)

  const timestamp = new Date().toISOString()
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      branch_id: branchSlug,
      customer_user_id: customerUserId,
      customer_name: customerName.trim(),
      customer_email: customerEmail.trim(),
      customer_phone: customerPhone.trim() || null,
      fulfillment_type: fulfillmentType,
      notes: notes.trim(),
      currency,
      pago_validado: false,
      payment_reference: null,
      payment_validated_at: null,
      pos_facturado: false,
      pos_facturado_at: null,
      pos_reference: null,
      subtotal_usd: subtotalUsd,
      subtotal_ves: subtotalVes,
      status: "submitted",
      created_at: timestamp,
      updated_at: timestamp,
    })
    .select("id")
    .single()

  if (orderError) {
    throw orderError
  }

  const { error: itemsError } = await supabase.from("order_items").insert(
    normalizedItems.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      product_name: item.productName,
      sku: item.sku,
      quantity: item.quantity,
      note: item.note,
      exclusions: item.exclusions,
      unit_price_usd: item.unitPriceUsd,
      unit_price_ves: item.unitPriceVes,
      line_total_usd: item.lineTotalUsd,
      line_total_ves: item.lineTotalVes,
      created_at: timestamp,
      updated_at: timestamp,
    })),
  )

  if (itemsError) {
    await supabase.from("orders").delete().eq("id", order.id)
    throw itemsError
  }

  return {
    orderId: order.id,
    subtotalUsd,
    subtotalVes,
    currency,
  }
}
