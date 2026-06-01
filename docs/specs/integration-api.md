# API De Integracion

## Fuente Del Contrato

La definicion fuente de la API de integracion vive en OpenAPI y se expone en:

- `/api/integration/openapi`
- `/integration-api`

La UI Swagger sirve como referencia operativa para el tecnico del sistema local.

## Pruebas Desde Cliente

El repo incluye dos clientes CLI simples:

- `npm run integration:request -- GET /api/integration/health`
- `npm run payment:validate:test -- <ORDER_ID>`

Ejemplos:

```bash
npm run integration:request -- GET /api/integration/branches/centro/products
```

```bash
npm run integration:request -- PATCH /api/integration/branches/centro/orders/<ORDER_ID>/pos-invoice '{"pos_reference":"FAC-1001","facturado_at":"2026-06-01T15:40:00Z"}'
```

```bash
npm run payment:validate:test -- <ORDER_ID>
```

El segundo comando simula el paso interno donde la tienda online confirma el pago y deja el pedido listo para que el POS lo tome.

## Autenticacion

Todas las rutas bajo `/api/integration/*`, salvo la spec OpenAPI, usan:

- `Authorization: Bearer <INTEGRATION_API_KEY>`
- `X-Integration-Timestamp: <ISO date>`
- `X-Integration-Signature: sha256=<hex>` o `<hex>`

La firma se calcula con:

```text
${timestamp}.${method}.${pathname}.${rawBody}
```

Donde `pathname` debe coincidir exactamente con la ruta solicitada.

## CORS Para Pruebas Desde Navegador

Las rutas de integracion ahora responden preflight `OPTIONS` y devuelven headers CORS.

Configuracion:

- `INTEGRATION_ENABLE_CORS=false` desactiva completamente CORS en estas rutas
- `INTEGRATION_ALLOWED_ORIGINS` opcional, separada por comas
- si no se define, la API responde con `Access-Control-Allow-Origin: *`
- si pruebas desde un archivo HTML abierto directamente en el navegador, el origin puede ser `null`
- en ese caso puedes usar por ejemplo `INTEGRATION_ALLOWED_ORIGINS=null,http://localhost:5500`

Nota importante:

- esta API sigue pensada para integracion server-to-server
- exponer `INTEGRATION_API_KEY` y `INTEGRATION_HMAC_SECRET` en JavaScript del navegador no es seguro para produccion

## Flujo Actual De Orders

- la tienda online crea el pedido con `pago_validado = false`
- la tienda online actualizara `pago_validado`, `payment_reference` y `payment_validated_at` despues de validar el pago movil con la API externa
- el sistema POS local consulta periodicamente solo pedidos `submitted`, `pago_validado = true` y `pos_facturado = false`
- el sistema POS local marca el pedido como facturado via `PATCH /orders/:orderId/pos-invoice`

## Regla De Baja De Productos

No existe `DELETE` fisico para productos en la API de integracion.

La baja logica se hace con:

- `PATCH /products/:externalId/status`
- payload con `is_active = false`
