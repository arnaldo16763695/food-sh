# Plan Inicial

## Objetivo

Construir una plataforma de venta online para Shanghaipf que conviva con el sistema local actual de facturación y stock.

La plataforma online debe permitir:

- catálogo por sucursal
- bolsa de compra
- pedidos web
- pagos online
- panel administrativo
- futura app móvil consumiendo la misma API

## Contexto Actual

- El sistema actual corre localmente con Windows Server y SQL Server.
- El sistema actual es la fuente maestra de stock, precios, productos base y facturación fiscal.
- La nueva plataforma online expondrá una API pública para que el sistema local consulte pedidos y envíe sincronizaciones.
- La factura fiscal seguirá siendo generada e impresa por el sistema viejo.

## Decisiones Confirmadas

- La aplicación principal será `Next.js`.
- La base de datos online será `Supabase Postgres`.
- La autenticación online será `Supabase Auth`.
- El storefront usará `Tailwind CSS`.
- El panel administrativo usará `shadcn/ui`.
- La bolsa de compra usará `Zustand`.
- Habrá una tienda por sucursal.
- Cada pedido pertenecerá a una sola sucursal.
- El stock se manejará por sucursal.
- La plataforma debe soportar `USD` y `VES`.
- El sistema local debe enviar ambos precios explícitamente: `price_usd` y `price_ves`.
- La plataforma online podrá tener campos propios no controlados por el sistema local, por ejemplo imágenes y contenido comercial.

## Fuentes De Verdad

### Sistema local

- productos base
- stock
- precios en `USD` y `VES`
- estado operativo del producto en el POS
- facturación fiscal

### Plataforma online

- usuarios y autenticación
- imágenes del catálogo
- descripciones comerciales
- visibilidad online de productos
- horarios de apertura y cierre por sucursal
- bolsa de compra
- pedidos web
- estado de pagos

## Principios De Integración

- La web no debe consultar el sistema local en tiempo real para renderizar el catálogo.
- El catálogo público debe servirse desde la base online.
- La sincronización con el sistema local será bidireccional.
- El sistema local consultará periódicamente los pedidos listos para facturar.
- El sistema local notificará cambios de stock, precio, producto y estado del pedido mediante la API online.
- La validación final de precio, stock, sucursal y horario debe ocurrir en backend al confirmar una compra.

## Alcance Del Primer Entregable

El primer entregable debe enfocarse en el catálogo y en una sincronización mínima funcional.

Incluye:

- modelo inicial de producto online
- endpoints de integración para crear y actualizar productos
- endpoint público para consultar catálogo por sucursal
- datos de prueba manuales o sembrados localmente
- primera pantalla de catálogo consumiendo la API propia
- documentación suficiente para revisar con el programador del sistema local

No incluye todavía:

- flujo completo de pedidos
- pagos online reales
- facturación online
- conciliación de pagos
- app móvil

## Modelo Inicial Del Producto

El modelo inicial no necesita coincidir al cien por ciento con el sistema viejo. Debe funcionar como entidad puente mientras se ajusta el contrato real.

Campos tentativos:

- `id`
- `external_id`
- `branch_id`
- `sku`
- `name`
- `description`
- `image_url`
- `price_usd`
- `price_ves`
- `stock`
- `is_active`
- `online_enabled`
- `updated_at_source`
- `created_at`
- `updated_at`

## Reglas Iniciales Del Catálogo

- El sistema local controla `external_id`, `sku`, `name`, `price_usd`, `price_ves`, `stock`, `is_active` y `updated_at_source`.
- La plataforma online controla `description`, `image_url`, `online_enabled`, etiquetas, orden visual y contenido comercial.
- Un producto público solo se mostrará si `is_active = true` y `online_enabled = true`.
- Los precios en `USD` y `VES` deben llegar explícitamente desde el sistema local; no se calcularán por conversión automática en esta etapa.

## Roadmap Sugerido

### Fase 1: Catálogo

- definir el modelo tentativo de producto
- implementar endpoints de catálogo público
- implementar endpoints de sincronización de producto, stock, precio y estado
- construir una primera pantalla de listado

### Fase 2: Sucursales y horarios

- modelar sucursales
- modelar horarios y cierres manuales
- bloquear compras fuera de horario

### Fase 3: Bolsa y checkout

- implementar bolsa con `Zustand`
- asociar bolsa a una sola sucursal
- validar stock, precio y horario en backend

### Fase 4: Pedidos

- crear tabla de pedidos
- exponer pedidos listos para el sistema local
- recibir confirmaciones y cambios de estado

### Fase 5: Pagos online

- integrar pagos automáticos
- integrar pagos con confirmación manual
- separar estado de pago y estado de pedido

### Fase 6: Operación y endurecimiento

- logs de integración
- reintentos
- idempotencia
- monitoreo de errores de sincronización

### Fase 7: App móvil

- reutilizar la misma API
- adaptar autenticación, catálogo, bolsa y pedidos al canal móvil

## Riesgos Principales

- desincronización de stock
- diferencia entre precios online y precios del POS
- pedidos pagados que luego no puedan facturarse
- duplicación de eventos por reintentos
- falta de identificadores estables entre sistemas

## Próximos Pasos Inmediatos

- documentar el contrato mínimo del catálogo
- implementar una primera versión de la API aunque el modelo aún sea tentativo
- presentarle la API al programador del sistema local
- ajustar campos, nombres y restricciones según el contrato real del POS
