import { createSupabaseAdminClient } from "@/lib/supabase"

type OrderStatus = "draft" | "submitted" | "cancelled"
type FulfillmentType = "pickup" | "delivery"
type OrderCurrency = "USD" | "VES"

type AdminCustomerOrderRow = {
  branch_id: string
  created_at: string
  currency: OrderCurrency
  customer_email: string
  customer_name: string
  customer_phone: string | null
  customer_user_id: string | null
  fulfillment_type: FulfillmentType
  id: string
  pago_validado: boolean
  pos_facturado: boolean
  status: OrderStatus
  subtotal_usd: number
  subtotal_ves: number
}

export type AdminCustomerOrderSummary = {
  branchSlug: string
  createdAt: string
  currency: OrderCurrency
  fulfillmentType: FulfillmentType
  id: string
  pagoValidado: boolean
  posFacturado: boolean
  status: OrderStatus
  subtotalUsd: number
  subtotalVes: number
}

export type AdminBranchCustomerSummary = {
  email: string
  fullName: string
  lastOrderAt: string
  orders: AdminCustomerOrderSummary[]
  ordersCount: number
  phone: string
  totalUsd: number
  totalVes: number
  userId: string
}

export type AdminGlobalCustomerBranchSummary = {
  branchSlug: string
  lastOrderAt: string
  ordersCount: number
  totalUsd: number
  totalVes: number
}

export type AdminGlobalCustomerSummary = {
  activeBranches: AdminGlobalCustomerBranchSummary[]
  email: string
  fullName: string
  lastOrderAt: string | null
  orders: AdminCustomerOrderSummary[]
  ordersCount: number
  phone: string
  totalUsd: number
  totalVes: number
  userId: string
}

function mapOrder(row: AdminCustomerOrderRow): AdminCustomerOrderSummary {
  return {
    branchSlug: row.branch_id,
    createdAt: row.created_at,
    currency: row.currency,
    fulfillmentType: row.fulfillment_type,
    id: row.id,
    pagoValidado: row.pago_validado,
    posFacturado: row.pos_facturado,
    status: row.status,
    subtotalUsd: row.subtotal_usd,
    subtotalVes: row.subtotal_ves,
  }
}

export async function listAdminCustomersByBranch(branchSlug: string): Promise<AdminBranchCustomerSummary[]> {
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, branch_id, customer_user_id, customer_name, customer_email, customer_phone, status, pago_validado, pos_facturado, fulfillment_type, currency, subtotal_usd, subtotal_ves, created_at",
    )
    .eq("branch_id", branchSlug)
    .not("customer_user_id", "is", null)
    .order("created_at", { ascending: false })

  if (error) {
    throw error
  }

  const customersById = new Map<string, AdminBranchCustomerSummary>()

  for (const row of data as AdminCustomerOrderRow[]) {
    if (!row.customer_user_id) {
      continue
    }

    const existing = customersById.get(row.customer_user_id)
    const order = mapOrder(row)

    if (!existing) {
      customersById.set(row.customer_user_id, {
        email: row.customer_email,
        fullName: row.customer_name,
        lastOrderAt: row.created_at,
        orders: [order],
        ordersCount: 1,
        phone: row.customer_phone ?? "",
        totalUsd: row.subtotal_usd,
        totalVes: row.subtotal_ves,
        userId: row.customer_user_id,
      })
      continue
    }

    existing.orders.push(order)
    existing.ordersCount += 1
    existing.totalUsd += row.subtotal_usd
    existing.totalVes += row.subtotal_ves

    if (row.created_at > existing.lastOrderAt) {
      existing.lastOrderAt = row.created_at
      existing.email = row.customer_email
      existing.fullName = row.customer_name
      existing.phone = row.customer_phone ?? existing.phone
    }
  }

  return Array.from(customersById.values())
    .map((customer) => ({
      ...customer,
      orders: customer.orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 8),
    }))
    .sort((a, b) => b.lastOrderAt.localeCompare(a.lastOrderAt))
}

type AuthUserSummary = {
  email: string
  id: string
}

async function listAllAuthUsers() {
  const supabase = createSupabaseAdminClient()
  const users: AuthUserSummary[] = []
  let page = 1
  const perPage = 200

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage })

    if (error) {
      throw error
    }

    const pageUsers = data.users.map((user) => ({
      email: user.email?.trim().toLowerCase() ?? "",
      id: user.id,
    }))

    users.push(...pageUsers)

    if (pageUsers.length < perPage) {
      break
    }

    page += 1
  }

  return users
}

export async function listGlobalAdminCustomers(): Promise<AdminGlobalCustomerSummary[]> {
  const supabase = createSupabaseAdminClient()
  const [authUsers, profilesResult, ordersResult, adminProfilesResult] = await Promise.all([
    listAllAuthUsers(),
    supabase.from("customer_profiles").select("user_id, full_name, phone, created_at"),
    supabase
      .from("orders")
      .select(
        "id, branch_id, customer_user_id, customer_name, customer_email, customer_phone, status, pago_validado, pos_facturado, fulfillment_type, currency, subtotal_usd, subtotal_ves, created_at",
      )
      .not("customer_user_id", "is", null)
      .order("created_at", { ascending: false }),
    supabase.from("admin_profiles").select("user_id"),
  ])

  if (profilesResult.error) {
    throw profilesResult.error
  }

  if (ordersResult.error) {
    throw ordersResult.error
  }

  if (adminProfilesResult.error) {
    throw adminProfilesResult.error
  }

  const authUserMap = new Map(authUsers.map((user) => [user.id, user]))
  const adminUserIds = new Set(adminProfilesResult.data.map((profile) => profile.user_id))
  const customersById = new Map<string, AdminGlobalCustomerSummary>()

  for (const profile of profilesResult.data) {
    if (adminUserIds.has(profile.user_id)) {
      continue
    }

    const authUser = authUserMap.get(profile.user_id)

    customersById.set(profile.user_id, {
      activeBranches: [],
      email: authUser?.email ?? "",
      fullName: profile.full_name,
      lastOrderAt: null,
      orders: [],
      ordersCount: 0,
      phone: profile.phone,
      totalUsd: 0,
      totalVes: 0,
      userId: profile.user_id,
    })
  }

  for (const row of ordersResult.data as AdminCustomerOrderRow[]) {
    if (!row.customer_user_id || adminUserIds.has(row.customer_user_id)) {
      continue
    }

    const existing = customersById.get(row.customer_user_id) ?? {
      activeBranches: [],
      email: row.customer_email,
      fullName: row.customer_name,
      lastOrderAt: null,
      orders: [],
      ordersCount: 0,
      phone: row.customer_phone ?? "",
      totalUsd: 0,
      totalVes: 0,
      userId: row.customer_user_id,
    }

    const order = mapOrder(row)
    existing.orders.push(order)
    existing.ordersCount += 1
    existing.totalUsd += row.subtotal_usd
    existing.totalVes += row.subtotal_ves

    if (!existing.lastOrderAt || row.created_at > existing.lastOrderAt) {
      existing.lastOrderAt = row.created_at
      existing.email = row.customer_email
      existing.fullName = row.customer_name
      existing.phone = row.customer_phone ?? existing.phone
    }

    const branchSummary = existing.activeBranches.find((branch) => branch.branchSlug === row.branch_id)

    if (!branchSummary) {
      existing.activeBranches.push({
        branchSlug: row.branch_id,
        lastOrderAt: row.created_at,
        ordersCount: 1,
        totalUsd: row.subtotal_usd,
        totalVes: row.subtotal_ves,
      })
    } else {
      branchSummary.ordersCount += 1
      branchSummary.totalUsd += row.subtotal_usd
      branchSummary.totalVes += row.subtotal_ves

      if (row.created_at > branchSummary.lastOrderAt) {
        branchSummary.lastOrderAt = row.created_at
      }
    }

    customersById.set(row.customer_user_id, existing)
  }

  return Array.from(customersById.values())
    .map((customer) => ({
      ...customer,
      orders: customer.orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 10),
      activeBranches: customer.activeBranches.sort((a, b) => b.lastOrderAt.localeCompare(a.lastOrderAt)),
    }))
    .sort((a, b) => {
      if (a.lastOrderAt && b.lastOrderAt) {
        return b.lastOrderAt.localeCompare(a.lastOrderAt)
      }

      if (a.lastOrderAt) {
        return -1
      }

      if (b.lastOrderAt) {
        return 1
      }

      return a.fullName.localeCompare(b.fullName, "es")
    })
}
