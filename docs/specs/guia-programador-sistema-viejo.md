# Guia De Pruebas Para El Sistema Viejo

## Objetivo

Esta guia explica como probar la API de integracion que consumira el sistema actual local.

La API sirve para:

- consultar productos
- crear o actualizar productos
- actualizar stock, precio y estado de productos
- consultar pedidos listos para facturar en POS
- marcar pedidos como facturados por POS

## Datos Que Debes Recibir

Antes de probar, debes contar con estos datos:

1. URL base del ambiente
2. `branchSlug` de la sucursal a probar
3. `INTEGRATION_API_KEY`
4. `INTEGRATION_HMAC_SECRET`
5. URL de documentacion Swagger

Ejemplo:

```text
Base URL: http://localhost:3000
branchSlug: centro
Swagger: http://localhost:3000/integration-api
```

## Autenticacion Requerida

Todas las rutas bajo `/api/integration/*` usan estos headers:

```http
Authorization: Bearer <INTEGRATION_API_KEY>
X-Integration-Timestamp: <ISO date>
X-Integration-Signature: sha256=<hex>
Content-Type: application/json
```

## Como Se Calcula La Firma

La firma se calcula con este payload exacto:

```text
${timestamp}.${method}.${pathname}.${rawBody}
```

Donde:

- `timestamp`: el mismo valor enviado en `X-Integration-Timestamp`
- `method`: verbo HTTP en mayusculas
- `pathname`: ruta exacta sin dominio
- `rawBody`: body JSON exacto enviado como texto

Luego se aplica:

```text
HMAC-SHA256(payload, INTEGRATION_HMAC_SECRET)
```

Y el resultado se envia en:

```http
X-Integration-Signature: sha256=<hex>
```

## Regla Importante Para GET

En requests `GET`, el `rawBody` debe ser una cadena vacia:

```text
""
```

Entonces el payload de firma para health seria algo como:

```text
2026-06-01T15:40:00Z.GET./api/integration/health.
```

## Orden Recomendado De Pruebas

1. probar `health`
2. listar productos
3. consultar un producto
4. hacer `upsert` de producto
5. actualizar stock, precio y estado
6. consultar pedidos listos para POS
7. consultar detalle de pedido
8. marcar pedido como facturado por POS

## Endpoints Disponibles

### Health

```http
GET /api/integration/health
```

Respuesta esperada:

```json
{
  "data": {
    "status": "ok"
  }
}
```

### Listar Productos

```http
GET /api/integration/branches/:branchSlug/products
```

Ejemplo:

```http
GET /api/integration/branches/centro/products
```

### Obtener Producto Por `externalId`

```http
GET /api/integration/branches/:branchSlug/products/:externalId
```

Ejemplo:

```http
GET /api/integration/branches/centro/products/P000123
```

### Crear O Actualizar Producto

```http
POST /api/integration/branches/:branchSlug/products/upsert
```

Body de ejemplo:

```json
{
  "external_id": "P000123",
  "sku": "PAN-CAN-01",
  "name": "Pan canilla",
  "price_usd": 1.25,
  "price_ves": 110.5,
  "stock": 42,
  "is_active": true,
  "updated_at_source": "2026-06-01T15:40:00Z"
}
```

### Actualizar Stock

```http
PATCH /api/integration/branches/:branchSlug/products/:externalId/stock
```

Body de ejemplo:

```json
{
  "stock": 30,
  "updated_at_source": "2026-06-01T15:45:00Z"
}
```

### Actualizar Precio

```http
PATCH /api/integration/branches/:branchSlug/products/:externalId/price
```

Body de ejemplo:

```json
{
  "price_usd": 1.35,
  "price_ves": 120,
  "updated_at_source": "2026-06-01T15:46:00Z"
}
```

### Activar O Desactivar Producto

No existe `DELETE` fisico. La baja se hace con `is_active = false`.

```http
PATCH /api/integration/branches/:branchSlug/products/:externalId/status
```

Body de ejemplo:

```json
{
  "is_active": false,
  "updated_at_source": "2026-06-01T15:47:00Z"
}
```

### Listar Pedidos Listos Para POS

```http
GET /api/integration/branches/:branchSlug/orders
```

Este endpoint devuelve solo pedidos que cumplan:

- `status = submitted`
- `pago_validado = true`
- `pos_facturado = false`

Ejemplo:

```http
GET /api/integration/branches/centro/orders
```

### Obtener Detalle De Pedido

```http
GET /api/integration/branches/:branchSlug/orders/:orderId
```

Ejemplo:

```http
GET /api/integration/branches/centro/orders/3f0d1ac8-0b48-4717-a91e-9c440fbf27b4
```

### Marcar Pedido Como Facturado Por POS

```http
PATCH /api/integration/branches/:branchSlug/orders/:orderId/pos-invoice
```

Body de ejemplo:

```json
{
  "pos_reference": "FAC-1001",
  "facturado_at": "2026-06-01T15:50:00Z"
}
```

Si el pedido ya fue marcado antes, la API responde:

```http
409 Conflict
```

## Flujo Real De Pedidos

El flujo esperado es este:

1. la tienda online crea el pedido
2. la tienda online valida el pago movil
3. la tienda marca internamente `pago_validado = true`
4. el sistema viejo consulta `/orders`
5. el sistema viejo factura en POS
6. el sistema viejo llama a `/pos-invoice`
7. el pedido deja de salir en el listado de pendientes

## Cosas Que El Sistema Viejo No Debe Hacer

- no debe cambiar manualmente `status`
- no debe validar el pago movil
- no debe borrar productos fisicamente
- no debe tomar pedidos aun no pagados

## Errores Esperados

- `400 Bad Request`: body invalido
- `401 Unauthorized`: auth o firma invalidas
- `404 Not Found`: recurso no encontrado
- `409 Conflict`: pedido ya facturado por POS

## Recomendacion Para Insomnia

El punto critico es generar bien `X-Integration-Signature`.

La recomendacion es:

1. probar primero `GET /api/integration/health`
2. validar que la firma HMAC sea correcta
3. recien despues probar `products` y `orders`

Si prefieres una referencia interactiva, usa:

```text
http://localhost:3000/integration-api
```
