import { createSupabaseAdminClient, createSupabasePublicClient } from "@/lib/supabase"

const DEFAULT_BRANCH_TIMEZONE = "America/Caracas"

type BranchHourRow = {
  branch_id: string
  weekday: number
  opens_at: string | null
  closes_at: string | null
  is_closed: boolean
}

type BranchRow = {
  slug: string
  online_order_mode: "auto" | "force_closed" | "force_open"
}

export type BranchAvailability = {
  branchSlug: string
  isOpen: boolean
  weekday: number
  opensAt: string | null
  closesAt: string | null
  onlineOrderMode: "auto" | "force_closed" | "force_open"
  timezone: string
  message: string
}

export type BranchHour = {
  branchSlug: string
  weekday: number
  opensAt: string | null
  closesAt: string | null
  isClosed: boolean
  isConfigured: boolean
}

type BranchHourInput = Omit<BranchHour, "isConfigured">

const DEFAULT_WEEK_HOURS: BranchHour[] = Array.from({ length: 7 }, (_, weekday) => ({
  branchSlug: "",
  weekday,
  opensAt: "08:00",
  closesAt: "20:00",
  isClosed: false,
  isConfigured: false,
}))

function isMissingBranchHoursTableError(error: { code?: string } | null) {
  return error?.code === "PGRST205"
}

function getCurrentCaracasTimeParts() {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: DEFAULT_BRANCH_TIMEZONE,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })

  const parts = formatter.formatToParts(new Date())
  const weekdayLabel = parts.find((part) => part.type === "weekday")?.value ?? "Sun"
  const hour = parts.find((part) => part.type === "hour")?.value ?? "00"
  const minute = parts.find((part) => part.type === "minute")?.value ?? "00"
  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  }

  return {
    weekday: weekdayMap[weekdayLabel] ?? 0,
    time: `${hour}:${minute}`,
  }
}

function buildAvailability(branch: BranchRow | null, row: BranchHourRow | null): BranchAvailability {
  const { weekday, time } = getCurrentCaracasTimeParts()
  const branchSlug = branch?.slug ?? row?.branch_id ?? ""
  const onlineOrderMode = branch?.online_order_mode ?? "auto"

  if (onlineOrderMode === "force_closed") {
    return {
      branchSlug,
      isOpen: false,
      weekday,
      opensAt: row?.opens_at ?? null,
      closesAt: row?.closes_at ?? null,
      onlineOrderMode,
      timezone: DEFAULT_BRANCH_TIMEZONE,
      message: "Las ventas online están pausadas manualmente para esta sucursal.",
    }
  }

  if (onlineOrderMode === "force_open") {
    return {
      branchSlug,
      isOpen: true,
      weekday,
      opensAt: row?.opens_at ?? null,
      closesAt: row?.closes_at ?? null,
      onlineOrderMode,
      timezone: DEFAULT_BRANCH_TIMEZONE,
      message: "Sucursal disponible por apertura manual de ventas online.",
    }
  }

  if (!row || row.is_closed || !row.opens_at || !row.closes_at) {
    return {
      branchSlug,
      isOpen: false,
      weekday,
      opensAt: row?.opens_at ?? null,
      closesAt: row?.closes_at ?? null,
      onlineOrderMode,
      timezone: DEFAULT_BRANCH_TIMEZONE,
      message: "La sucursal no está disponible en este horario.",
    }
  }

  const opensAt = row.opens_at.slice(0, 5)
  const closesAt = row.closes_at.slice(0, 5)
  const isOpen = time >= opensAt && time < closesAt

  return {
    branchSlug,
    isOpen,
    weekday,
    opensAt: row.opens_at,
    closesAt: row.closes_at,
    onlineOrderMode,
    timezone: DEFAULT_BRANCH_TIMEZONE,
    message: isOpen
      ? `Sucursal abierta hasta las ${closesAt}.`
      : `Sucursal cerrada. Horario de hoy: ${opensAt} - ${closesAt}.`,
  }
}

async function getBranchAvailabilityConfig(branchSlug: string, useAdminClient: boolean) {
  const supabase = useAdminClient ? createSupabaseAdminClient() : createSupabasePublicClient()
  const { data, error } = await supabase
    .from("branches")
    .select("slug, online_order_mode")
    .eq("slug", branchSlug)
    .maybeSingle()

  if (error) {
    if (error.code === "PGRST205") {
      return { slug: branchSlug, online_order_mode: "auto" as const }
    }

    throw error
  }

  return (data as BranchRow | null) ?? { slug: branchSlug, online_order_mode: "auto" as const }
}

function mapBranchHour(row: BranchHourRow): BranchHour {
  return {
    branchSlug: row.branch_id,
    weekday: row.weekday,
    opensAt: row.opens_at,
    closesAt: row.closes_at,
    isClosed: row.is_closed,
    isConfigured: true,
  }
}

async function getBranchHourByWeekday(branchSlug: string, weekday: number, useAdminClient: boolean) {
  const supabase = useAdminClient ? createSupabaseAdminClient() : createSupabasePublicClient()
  const { data, error } = await supabase
    .from("branch_hours")
    .select("branch_id, weekday, opens_at, closes_at, is_closed")
    .eq("branch_id", branchSlug)
    .eq("weekday", weekday)
    .maybeSingle()

  if (error) {
    if (isMissingBranchHoursTableError(error)) {
      return null
    }

    throw error
  }

  return data as BranchHourRow | null
}

export async function getPublicBranchAvailability(branchSlug: string) {
  const { weekday } = getCurrentCaracasTimeParts()
  const branch = await getBranchAvailabilityConfig(branchSlug, false)
  const row = await getBranchHourByWeekday(branchSlug, weekday, false)
  return buildAvailability(branch, row)
}

export async function assertBranchIsOpenForCheckout(branchSlug: string) {
  const { weekday } = getCurrentCaracasTimeParts()
  const branch = await getBranchAvailabilityConfig(branchSlug, true)
  const row = await getBranchHourByWeekday(branchSlug, weekday, true)
  const availability = buildAvailability(branch, row)

  if (!availability.isOpen) {
    throw new Error(availability.message)
  }

  return availability
}

export async function listAdminBranchHours(branchSlug: string) {
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from("branch_hours")
    .select("branch_id, weekday, opens_at, closes_at, is_closed")
    .eq("branch_id", branchSlug)
    .order("weekday", { ascending: true })

  if (error) {
    if (isMissingBranchHoursTableError(error)) {
      return DEFAULT_WEEK_HOURS.map((item) => ({ ...item, branchSlug }))
    }

    throw error
  }

  const rows = data.map((row) => mapBranchHour(row as BranchHourRow))
  const byWeekday = new Map(rows.map((row) => [row.weekday, row]))

  return DEFAULT_WEEK_HOURS.map((fallback) =>
    byWeekday.get(fallback.weekday) ?? { ...fallback, branchSlug },
  )
}

export async function upsertAdminBranchHour({
  branchSlug,
  weekday,
  opensAt,
  closesAt,
  isClosed,
}: BranchHourInput) {
  const supabase = createSupabaseAdminClient()
  const timestamp = new Date().toISOString()
  const payload = {
    branch_id: branchSlug,
    weekday,
    opens_at: isClosed ? null : opensAt,
    closes_at: isClosed ? null : closesAt,
    is_closed: isClosed,
    updated_at: timestamp,
  }

  const { data, error } = await supabase
    .from("branch_hours")
    .upsert(payload, { onConflict: "branch_id,weekday" })
    .select("branch_id, weekday, opens_at, closes_at, is_closed")
    .single()

  if (error) {
    throw error
  }

  return mapBranchHour(data as BranchHourRow)
}

export async function updateBranchOnlineOrderMode({
  branchSlug,
  onlineOrderMode,
}: {
  branchSlug: string
  onlineOrderMode: "auto" | "force_closed" | "force_open"
}) {
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from("branches")
    .update({
      online_order_mode: onlineOrderMode,
      updated_at: new Date().toISOString(),
    })
    .eq("slug", branchSlug)
    .select("slug, online_order_mode")
    .single()

  if (error) {
    throw error
  }

  return data as BranchRow
}
