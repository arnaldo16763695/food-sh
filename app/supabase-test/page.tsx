import { createSupabasePublicClient } from "@/lib/supabase"

export const dynamic = "force-dynamic"

type ProductPreview = {
  id: string
  branch_id: string
  external_id: string
  name: string
  is_active: boolean
  online_enabled: boolean
}

async function getSupabaseTestState() {
  try {
    const supabase = createSupabasePublicClient()
    const { data, error, count } = await supabase
      .from("products")
      .select("id, branch_id, external_id, name, is_active, online_enabled", {
        count: "exact",
      })
      .limit(5)

    if (error) {
      return {
        ok: false as const,
        message: error.message,
      }
    }

    return {
      ok: true as const,
      count: count ?? 0,
      data: (data ?? []) as ProductPreview[],
    }
  } catch (error) {
    return {
      ok: false as const,
      message: error instanceof Error ? error.message : "Error desconocido",
    }
  }
}

export default async function SupabaseTestPage() {
  const state = await getSupabaseTestState()

  if (!state.ok) {
    return (
      <main className="min-h-screen bg-zinc-50 px-6 py-16 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
        <div className="mx-auto flex max-w-3xl flex-col gap-6 rounded-2xl border border-red-200 bg-white p-6 dark:border-red-900/60 dark:bg-zinc-900">
          <span className="inline-flex w-fit rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700 dark:bg-red-500/10 dark:text-red-300">
            Conexion fallida
          </span>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">Prueba de Supabase</h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              La app no pudo completar la consulta a Supabase.
            </p>
          </div>
          <div className="rounded-xl bg-zinc-950 p-4 font-mono text-sm text-zinc-100 dark:bg-black">
            {state.message}
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-16 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
      <div className="mx-auto flex max-w-4xl flex-col gap-8">
        <div className="space-y-3">
          <span className="inline-flex w-fit rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
            Conexion exitosa
          </span>
          <h1 className="text-3xl font-semibold tracking-tight">Prueba de Supabase</h1>
          <p className="max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
            La app pudo consultar la tabla <code>products</code> usando el cliente publico y las
            politicas activas de la base de datos.
          </p>
        </div>

        <section className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Filas visibles</p>
            <p className="mt-2 text-3xl font-semibold">{state.count}</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Resultado</p>
            <p className="mt-2 text-3xl font-semibold text-emerald-600 dark:text-emerald-400">OK</p>
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold">Muestra de productos</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-zinc-500 dark:text-zinc-400">
                <tr>
                  <th className="px-3 py-2 font-medium">Sucursal</th>
                  <th className="px-3 py-2 font-medium">External ID</th>
                  <th className="px-3 py-2 font-medium">Nombre</th>
                  <th className="px-3 py-2 font-medium">Activo</th>
                  <th className="px-3 py-2 font-medium">Online</th>
                </tr>
              </thead>
              <tbody>
                {state.data.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-4 text-zinc-500 dark:text-zinc-400">
                      No hay filas visibles para el cliente publico. La conexion funciona, pero la
                      tabla puede estar vacia o RLS puede no permitir lecturas.
                    </td>
                  </tr>
                ) : (
                  state.data.map((product) => (
                    <tr key={product.id} className="border-t border-zinc-200 dark:border-zinc-800">
                      <td className="px-3 py-3">{product.branch_id}</td>
                      <td className="px-3 py-3">{product.external_id}</td>
                      <td className="px-3 py-3">{product.name}</td>
                      <td className="px-3 py-3">{product.is_active ? "Si" : "No"}</td>
                      <td className="px-3 py-3">{product.online_enabled ? "Si" : "No"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  )
}
