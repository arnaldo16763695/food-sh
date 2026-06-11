# API Mobile

## Objetivo

Esta API sirve a la app Flutter para clientes compradores.

La autenticación del cliente ocurre directamente en Supabase. La app móvil obtiene su sesión con `Supabase Auth` y luego envía el access token a los endpoints autenticados de este backend.

## Autenticación

Endpoints autenticados:

- enviar `Authorization: Bearer <access_token>`

El token debe provenir de la sesión activa de Supabase del cliente móvil.

## Contrato OpenAPI

La definición OpenAPI de esta API se expone en:

- `/api/mobile/openapi`
- `/mobile-api`

La spec ya incluye ejemplos de requests y responses para los endpoints principales, pensados para acelerar la integración desde Flutter.

## Formato De Respuesta

Éxito:

```json
{
  "data": {}
}
```

Error:

```json
{
  "error": "Mensaje de error",
  "details": null
}
```

## Estados HTTP Esperados

- `200 OK`
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`

## Endpoints Disponibles

### Públicos

#### `GET /api/mobile/branches`

Lista sucursales públicas activas.

#### `GET /api/mobile/branches/:branchSlug`

Obtiene el detalle básico de una sucursal.

#### `GET /api/mobile/branches/:branchSlug/availability`

Devuelve la disponibilidad operativa actual de la sucursal.

#### `GET /api/mobile/branches/:branchSlug/products`

Lista productos visibles para compra online.

Query params:

- `search`: filtro opcional por nombre, descripción o SKU

#### `GET /api/mobile/branches/:branchSlug/products/:id`

Devuelve el detalle de un producto visible en la sucursal.

### Autenticados

#### `GET /api/mobile/me`

Devuelve el estado de acceso del cliente autenticado.

Respuesta tentativa:

```json
{
  "data": {
    "status": "ready",
    "user": {
      "id": "uuid",
      "email": "cliente@example.com",
      "emailConfirmedAt": "2026-06-10T10:00:00Z"
    },
    "profile": {
      "userId": "uuid",
      "fullName": "Nombre Apellido",
      "phone": "+584120000000"
    }
  }
}
```

Estados posibles en `status`:

- `unconfirmed`
- `needs-profile`
- `ready`

#### `PATCH /api/mobile/me`

Actualiza o crea el perfil operativo del cliente.

Payload:

```json
{
  "fullName": "Nombre Apellido",
  "phone": "+584120000000"
}
```

#### `GET /api/mobile/orders`

Lista los pedidos del cliente autenticado.

#### `GET /api/mobile/orders/:orderId`

Devuelve el detalle de un pedido del cliente autenticado.

#### `POST /api/mobile/branches/:branchSlug/orders`

Crea un pedido enviado por el cliente autenticado.

Reglas actuales:

- requiere sesión válida
- requiere correo confirmado
- requiere perfil completo
- valida que la sucursal esté disponible para checkout
- valida que los productos sigan activos y habilitados online

Payload tentativo:

```json
{
  "customerName": "Nombre Apellido",
  "customerPhone": "+584120000000",
  "fulfillmentType": "pickup",
  "notes": "Sin cebolla",
  "currency": "USD",
  "items": [
    {
      "productId": "uuid-del-producto",
      "quantity": 2,
      "note": "Bien tostado",
      "exclusions": ["mayonesa"]
    }
  ]
}
```

Respuesta tentativa:

```json
{
  "data": {
    "orderId": "uuid",
    "subtotalUsd": 12.5,
    "subtotalVes": 1250,
    "currency": "USD"
  }
}
```

## Notas De Implementación Para Flutter

- usar siempre `branchSlug` como identificador de sucursal
- no consumir `/api/integration/*`
- no consumir `/api/admin/*`
- no enviar claves privadas del backend
- manejar `401` como sesión ausente o vencida
- manejar `403` como restricción operativa o cuenta incompleta
