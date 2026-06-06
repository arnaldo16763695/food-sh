import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { requireAdminBranchAccess } from "@/lib/admin-auth"
import { getPublicBranchAvailability, listAdminBranchHours } from "@/lib/branch-hours"
import { getPublicBranchBySlug } from "@/lib/branches"
import { listAdminProductsByBranch } from "@/lib/catalog-store"
import { listAdminOrdersByBranch } from "@/lib/orders"

type AdminBranchPageProps = {
  params: Promise<{ branchSlug: string }>
}

const TIMEZONE = "America/Caracas"

const weekdayLabels = [
  "domingo",
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábado",
]

function formatCaracasDate(date: string) {
  return new Intl.DateTimeFormat("es-VE", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: TIMEZONE,
  }).format(new Date(date))
}

function getCaracasDayKey(date: Date | string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date))
}

function formatTimeRange(opensAt: string | null, closesAt: string | null) {
  if (!opensAt || !closesAt) {
    return "Sin horario configurado"
  }

  return `${opensAt.slice(0, 5)} - ${closesAt.slice(0, 5)}`
}

function getOnlineModeLabel(mode: "auto" | "force_closed" | "force_open") {
  switch (mode) {
    case "force_open":
      return "Apertura manual"
    case "force_closed":
      return "Cierre manual"
    default:
      return "Horario automático"
  }
}

function getMetricTone(isPositive: boolean) {
  return isPositive
    ? "text-emerald-700 dark:text-emerald-400"
    : "text-amber-700 dark:text-amber-400"
}

export async function generateMetadata({ params }: AdminBranchPageProps): Promise<Metadata> {
  const { branchSlug } = await params
  const branch = await getPublicBranchBySlug(branchSlug)

  if (!branch) {
    return {
      title: "Administración | Shanghaipf Commerce",
    }
  }

  return {
    title: `${branch.title} | Administración | Shanghaipf Commerce`,
    description: `Dashboard administrativo de ${branch.title}.`,
  }
}

export default async function AdminBranchPage({ params }: AdminBranchPageProps) {
  const { branchSlug } = await params
  const branch = await getPublicBranchBySlug(branchSlug)

  if (!branch) {
    notFound()
  }

  await requireAdminBranchAccess(branch.slug)

  const [availability, hours, orders, products] = await Promise.all([
    getPublicBranchAvailability(branch.slug),
    listAdminBranchHours(branch.slug),
    listAdminOrdersByBranch(branch.slug),
    listAdminProductsByBranch(branch.slug),
  ])

  const todayKey = getCaracasDayKey(new Date())
  const todaysOrders = orders.filter((order) => getCaracasDayKey(order.createdAt) === todayKey)
  const submittedOrders = orders.filter((order) => order.status === "submitted")
  const readyForPosOrders = submittedOrders.filter((order) => order.pagoValidado && !order.posFacturado)
  const pendingPaymentOrders = submittedOrders.filter((order) => !order.pagoValidado)
  const visibleProducts = products.filter((product) => product.isActive && product.onlineEnabled)
  const hiddenProducts = products.filter((product) => product.isActive && !product.onlineEnabled)
  const outOfStockVisibleProducts = visibleProducts.filter((product) => product.stock <= 0)
  const currentDayHours = hours.find((hour) => hour.weekday === availability.weekday)

  const metrics = [
    {
      label: "Canal online",
      value: availability.isOpen ? "Abierto" : "Cerrado",
      hint: `${getOnlineModeLabel(availability.onlineOrderMode)} · ${availability.message}`,
      tone: getMetricTone(availability.isOpen),
    },
    {
      label: "Pedidos de hoy",
      value: todaysOrders.length.toString(),
      hint:
        todaysOrders.length > 0
          ? `Último registro: ${formatCaracasDate(todaysOrders[0].createdAt)}`
          : "Sin pedidos registrados hoy",
      tone: "text-zinc-950 dark:text-zinc-50",
    },
    {
      label: "Listos para POS",
      value: readyForPosOrders.length.toString(),
      hint:
        readyForPosOrders.length > 0
          ? "Pedidos validados pendientes de facturación"
          : "No hay pedidos pendientes de facturación",
      tone: readyForPosOrders.length > 0 ? "text-amber-700 dark:text-amber-400" : "text-zinc-950 dark:text-zinc-50",
    },
    {
      label: "Catálogo visible",
      value: `${visibleProducts.length}/${products.length}`,
      hint:
        outOfStockVisibleProducts.length > 0
          ? `${outOfStockVisibleProducts.length} productos visibles sin stock`
          : "Todos los visibles tienen stock disponible",
      tone:
        outOfStockVisibleProducts.length > 0 ? "text-amber-700 dark:text-amber-400" : "text-zinc-950 dark:text-zinc-50",
    },
  ]

  const alerts = [
    !availability.isOpen
      ? `El canal online está cerrado. Estado actual: ${availability.message}`
      : null,
    pendingPaymentOrders.length > 0
      ? `${pendingPaymentOrders.length} pedidos enviados siguen pendientes de validación de pago.`
      : null,
    readyForPosOrders.length > 0
      ? `${readyForPosOrders.length} pedidos ya validados todavía no se marcaron como facturados en POS.`
      : null,
    outOfStockVisibleProducts.length > 0
      ? `${outOfStockVisibleProducts.length} productos siguen visibles online con stock en cero.`
      : null,
    hiddenProducts.length > 0
      ? `${hiddenProducts.length} productos activos están ocultos del catálogo online.`
      : null,
  ].filter(Boolean)

  const quickLinks = [
    {
      title: "Pedidos",
      description: "Revisar pedidos, validaciones de pago y detalle operativo.",
      href: `/admin/${branch.slug}/orders`,
      cta: "Abrir pedidos",
    },
    {
      title: "Productos",
      description: "Gestionar visibilidad online, contenido e imágenes del catálogo.",
      href: `/admin/${branch.slug}/products`,
      cta: "Abrir productos",
    },
    {
      title: "Horarios",
      description: "Ajustar disponibilidad semanal y modo manual del canal online.",
      href: `/admin/${branch.slug}/settings`,
      cta: "Abrir horarios",
    },
  ]

  return (
    <main className="flex flex-1 flex-col gap-6">
      <header className="rounded-4xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium tracking-[0.16em] text-zinc-500 uppercase dark:text-zinc-400">
              Resumen operativo
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight">{branch.title}</h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-600 dark:text-zinc-400">
              Vista rápida del canal online para la sucursal: pedidos entrantes, estado de atención,
              catálogo visible y accesos de gestión para el equipo administrativo.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={`/admin/${branch.slug}/orders`}
              className="inline-flex h-11 items-center justify-center rounded-full bg-zinc-950 px-5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              Ver pedidos
            </Link>
            <Link
              href={`/tienda/${branch.slug}`}
              className="inline-flex h-11 items-center justify-center rounded-full border border-zinc-300 px-5 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              Ver storefront
            </Link>
          </div>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <article
            key={metric.label}
            className="rounded-4xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          >
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{metric.label}</p>
            <p className={`mt-3 text-3xl font-semibold tracking-tight ${metric.tone}`}>{metric.value}</p>
            <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{metric.hint}</p>
          </article>
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-4xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium tracking-[0.16em] text-zinc-500 uppercase dark:text-zinc-400">
                Alertas y seguimiento
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">Qué revisar ahora</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-600 dark:text-zinc-400">
                Señales rápidas para detectar fricciones operativas antes de entrar a cada módulo.
              </p>
            </div>
          </div>

          {alerts.length > 0 ? (
            <div className="mt-6 space-y-3">
              {alerts.map((alert) => (
                <article
                  key={alert}
                  className="rounded-3xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-6 text-amber-950 dark:border-amber-900/70 dark:bg-amber-950/40 dark:text-amber-100"
                >
                  {alert}
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm leading-6 text-emerald-950 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-100">
              No hay alertas inmediatas. La sucursal tiene el canal online operando sin pendientes críticos visibles.
            </div>
          )}

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
              <p className="text-xs font-medium tracking-[0.16em] text-zinc-500 uppercase dark:text-zinc-400">
                Estado del día
              </p>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-zinc-600 dark:text-zinc-400">Horario de hoy</dt>
                  <dd className="font-medium text-zinc-950 dark:text-zinc-50">
                    {currentDayHours?.isClosed
                      ? "Cerrado"
                      : formatTimeRange(currentDayHours?.opensAt ?? null, currentDayHours?.closesAt ?? null)}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-zinc-600 dark:text-zinc-400">Día operativo</dt>
                  <dd className="font-medium text-zinc-950 dark:text-zinc-50">
                    {weekdayLabels[availability.weekday]}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-zinc-600 dark:text-zinc-400">Modo online</dt>
                  <dd className="font-medium text-zinc-950 dark:text-zinc-50">
                    {getOnlineModeLabel(availability.onlineOrderMode)}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
              <p className="text-xs font-medium tracking-[0.16em] text-zinc-500 uppercase dark:text-zinc-400">
                Pedidos
              </p>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-zinc-600 dark:text-zinc-400">Enviados</dt>
                  <dd className="font-medium text-zinc-950 dark:text-zinc-50">{submittedOrders.length}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-zinc-600 dark:text-zinc-400">Pendientes de pago</dt>
                  <dd className="font-medium text-zinc-950 dark:text-zinc-50">{pendingPaymentOrders.length}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-zinc-600 dark:text-zinc-400">Facturados en POS</dt>
                  <dd className="font-medium text-zinc-950 dark:text-zinc-50">
                    {orders.filter((order) => order.posFacturado).length}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <article className="rounded-4xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-sm font-medium tracking-[0.16em] text-zinc-500 uppercase dark:text-zinc-400">
              Catálogo
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">Cobertura online</h2>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-zinc-600 dark:text-zinc-400">Productos activos</dt>
                <dd className="font-medium text-zinc-950 dark:text-zinc-50">
                  {products.filter((product) => product.isActive).length}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-zinc-600 dark:text-zinc-400">Visibles online</dt>
                <dd className="font-medium text-zinc-950 dark:text-zinc-50">{visibleProducts.length}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-zinc-600 dark:text-zinc-400">Ocultos</dt>
                <dd className="font-medium text-zinc-950 dark:text-zinc-50">{hiddenProducts.length}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-zinc-600 dark:text-zinc-400">Sin stock visible</dt>
                <dd className="font-medium text-zinc-950 dark:text-zinc-50">
                  {outOfStockVisibleProducts.length}
                </dd>
              </div>
            </dl>
          </article>

          <article className="rounded-4xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-sm font-medium tracking-[0.16em] text-zinc-500 uppercase dark:text-zinc-400">
              Accesos rápidos
            </p>
            <div className="mt-5 space-y-3">
              {quickLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded-3xl border border-zinc-200 px-4 py-4 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-950"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-zinc-950 dark:text-zinc-50">{item.title}</p>
                      <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                        {item.description}
                      </p>
                    </div>
                    <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{item.cta}</span>
                  </div>
                </Link>
              ))}
            </div>
          </article>
        </section>
      </div>
    </main>
  )
}
