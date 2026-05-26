# Facturacion Shanghai

App Next.js 16 con integración de Supabase para catálogo e ingestión desde el sistema local.

## Variables de entorno

Duplica `.env.example` a tu archivo `.env.local` o `.env` y completa:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
INTEGRATION_API_KEY=
INTEGRATION_HMAC_SECRET=
```

## Desarrollo

```bash
npm run dev
```

## Supabase local

El proyecto ya incluye `supabase/config.toml`, una migración inicial y un seed de ejemplo.

```bash
npm run supabase:start
npm run db:reset
npm run supabase:status
```

## Migraciones

Crear una migración nueva:

```bash
npm run migration:new -- nombre_de_la_migracion
```

Aplicar migraciones al proyecto vinculado:

```bash
npm run db:push
```

Traer cambios remotos como migración:

```bash
npm run db:pull
```

## Esquema actual

La migración inicial crea `public.products` con:

- clave única por `branch_id + external_id`
- índice parcial para el catálogo público visible
- RLS habilitado para lectura pública solo de productos activos y online

## Lint

```bash
npm run lint
```
