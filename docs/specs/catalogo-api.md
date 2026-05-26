# Spec Inicial De API De Catálogo

## Objetivo

Definir una primera API mínima para construir el catálogo online y comenzar la sincronización con el sistema local.

Este documento es intencionalmente tentativo. Su función es servir como base de implementación y conversación con el programador del sistema viejo.

## Alcance

Esta primera versión cubre:

- lectura pública del catálogo por sucursal
- creación o actualización de productos desde el sistema local
- actualización de stock
- actualización de precios en `USD` y `VES`
- activación o desactivación operativa del producto

No cubre todavía:

- categorías finales
- variantes complejas
- promociones
- pedidos
- pagos
- facturación

## Modelo Tentativo De Producto

```json
{
  "id": "uuid-interno",
  "external_id": "P000123",
  "branch_id": "centro",
  "sku": "PAN-CAN-01",
  "name": "Pan canilla",
  "description": "Pan fresco horneado diariamente.",
  "image_url": "https://example.com/productos/pan-canilla.jpg",
  "price_usd": 1.25,
  "price_ves": 110.5,
  "stock": 42,
  "is_active": true,
  "online_enabled": true,
  "updated_at_source": "2026-05-11T10:30:00Z",
  "created_at": "2026-05-11T10:35:00Z",
  "updated_at": "2026-05-11T10:35:00Z"
}
```

## Responsabilidad De Campos

### Controlados por el sistema local

- `external_id`
- `sku`
- `name`
- `price_usd`
- `price_ves`
- `stock`
- `is_active`
- `updated_at_source`

### Controlados por la plataforma online

- `description`
- `image_url`
- `online_enabled`
- campos de merchandising o contenido visual

## Reglas Iniciales

- La clave lógica inicial del producto será `external_id + branch_id`.
- Si un producto ya existe para esa combinación, el endpoint de sincronización debe actualizarlo.
- Si no existe, el endpoint de sincronización debe crearlo.
- `price_usd` y `price_ves` deben llegar explícitamente desde el sistema local.
- `online_enabled` no debe ser sobreescrito por sincronización salvo que esa regla cambie explícitamente después.
- `image_url` y `description` no deben ser sobreescritos por sincronización automática.
- El catálogo público solo debe exponer productos con `is_active = true` y `online_enabled = true`.

## Seguridad De Integración

Las rutas bajo `/api/integration/*` deben tratarse como integración server-to-server y no como API pública.

Requisitos iniciales:

- header `Authorization: Bearer <INTEGRATION_API_KEY>`
- header `X-Integration-Timestamp: <ISO date>`
- header `X-Integration-Signature: sha256=<hex>` o `<hex>`

Firma esperada:

```text
${timestamp}.${method}.${pathname}.${rawBody}
```

Donde:

- `timestamp` es el valor exacto enviado en `X-Integration-Timestamp`
- `method` es el verbo HTTP en mayúsculas
- `pathname` es la ruta, por ejemplo `/api/integration/branches/centro/products/upsert`
- `rawBody` es el body JSON exacto enviado como texto

La firma se calcula con `HMAC-SHA256` usando `INTEGRATION_HMAC_SECRET`.

Reglas iniciales de seguridad:

- rechazar requests sin token o sin firma
- rechazar requests con timestamp vencido
- comparar firma y API key en tiempo constante
- no exponer estas rutas a consumo frontend

## Endpoints Propuestos

## Catálogo público

### `GET /api/catalog/branches/:branchId/products`

Devuelve el catálogo visible de una sucursal.

Parámetros tentativos:

- `branchId`: identificador o slug de la sucursal

Respuesta tentativa:

```json
{
  "data": [
    {
      "id": "uuid-interno",
      "external_id": "P000123",
      "branch_id": "centro",
      "sku": "PAN-CAN-01",
      "name": "Pan canilla",
      "description": "Pan fresco horneado diariamente.",
      "image_url": "https://example.com/productos/pan-canilla.jpg",
      "price_usd": 1.25,
      "price_ves": 110.5,
      "stock": 42
    }
  ]
}
```

### `GET /api/catalog/branches/:branchId/products/:id`

Devuelve el detalle de un producto visible de una sucursal.

## Integración con sistema local

### `POST /api/integration/branches/:branchId/products/upsert`

Crea o actualiza un producto sincronizado desde el sistema local.

Payload tentativo:

```json
{
  "external_id": "P000123",
  "sku": "PAN-CAN-01",
  "name": "Pan canilla",
  "price_usd": 1.25,
  "price_ves": 110.5,
  "stock": 42,
  "is_active": true,
  "updated_at_source": "2026-05-11T10:30:00Z"
}
```

Comportamiento esperado:

- crear si no existe `external_id + branch_id`
- actualizar si ya existe
- conservar campos online propios no enviados por el POS

### `PATCH /api/integration/branches/:branchId/products/:externalId/stock`

Actualiza stock de un producto para una sucursal.

Payload tentativo:

```json
{
  "stock": 37,
  "updated_at_source": "2026-05-11T10:45:00Z"
}
```

### `PATCH /api/integration/branches/:branchId/products/:externalId/price`

Actualiza precios en ambas monedas.

Payload tentativo:

```json
{
  "price_usd": 1.35,
  "price_ves": 118.75,
  "updated_at_source": "2026-05-11T10:46:00Z"
}
```

### `PATCH /api/integration/branches/:branchId/products/:externalId/status`

Activa o desactiva el producto en función del sistema local.

Payload tentativo:

```json
{
  "is_active": false,
  "updated_at_source": "2026-05-11T10:47:00Z"
}
```

## Errores Esperados

La API debería contemplar al menos:

- `400 Bad Request` para payload inválido
- `401 Unauthorized` o `403 Forbidden` para integración no autorizada
- `404 Not Found` cuando el producto o sucursal no exista
- `409 Conflict` si hay un problema de consistencia o versión

## Preguntas Abiertas Para Validar Con El Programador Del Sistema Local

- cuál es el identificador real del producto en el sistema viejo
- si `sku` existe y cómo se usa
- si la sucursal tiene un `id`, un código o un nombre estable
- si stock se maneja como entero o decimal
- si el sistema local tiene categorías reutilizables
- si existen variantes, presentaciones o combinaciones de producto
- si el sistema local envía borrado físico o solo desactivación
- si `updated_at_source` realmente existe o si habrá que introducir una versión lógica

## Siguiente Paso De Implementación

Implementar primero estos endpoints con un modelo interno simple y datos controlados por la plataforma. Luego revisar el contrato con el programador del sistema local y ajustar nombres, restricciones y estructura según la realidad del POS.
