# Alcance Funcional Del Sistema

## Objetivo

Definir de forma explícita el alcance funcional de la plataforma para evitar malentendidos comerciales y técnicos durante el desarrollo, la cotización y la ejecución del proyecto.

Este documento describe qué funcionalidades contempla el sistema, cuáles quedan fuera del alcance base y qué dependencias externas deben ser validadas con el cliente o con proveedores terceros.

## Resumen General Del Sistema

La solución contempla una plataforma digital para ventas online por sucursal, integrada con el sistema local actual de facturación y operación.

El sistema estará compuesto por:

- plataforma web pública para clientes
- panel administrativo web por sucursal
- API e integración con el sistema local/POS
- gestión de catálogo, clientes, horarios y pedidos
- módulo de pagos sujeto al método definitivo aprobado
- app móvil para clientes como módulo adicional

## Actores Del Sistema

- cliente final
- operador administrativo de sucursal
- sistema local/POS
- servicios externos de mensajería y pagos

## Módulos Incluidos

## 1. Plataforma Web Pública

Incluye:

- catálogo online por sucursal
- visualización de productos disponibles
- precios en `USD` y `VES`
- acceso a tienda segmentado por sucursal
- bolsa de compra
- checkout
- selección del tipo de entrega
- registro e inicio de sesión de clientes
- confirmación de correo del cliente
- perfil del cliente
- historial de pedidos del cliente
- consulta del estado actual de cada pedido desde el perfil

No incluye:

- marketplace multiempresa
- programa de puntos
- cupones y promociones avanzadas
- chat en vivo
- facturación fiscal desde la web

## 2. Gestión De Clientes

Incluye:

- registro de cliente con correo y teléfono
- autenticación de cliente
- perfil básico del cliente
- historial de pedidos
- canal preferido de notificación por cliente
- visualización del estado actualizado de sus pedidos

Pendiente de definición detallada:

- si el canal preferido se configura solo desde el perfil o también durante checkout
- si el cliente podrá gestionar múltiples direcciones guardadas

No incluye por defecto:

- programa de fidelización
- lista de favoritos
- repetición automática de pedidos
- CRM comercial avanzado

## 3. Catálogo Y Productos

Incluye:

- catálogo por sucursal
- sincronización de productos desde el sistema local
- sincronización de stock
- sincronización de precios
- sincronización del estado activo/inactivo del producto
- visibilidad online controlada desde la plataforma
- edición de descripción comercial
- carga y actualización de imágenes

No incluye por defecto:

- variantes complejas
- combos promocionales
- reglas avanzadas de merchandising
- promociones automáticas

## 4. Sucursales Y Horarios

Incluye:

- operación por sucursal
- horarios de apertura y cierre por sucursal
- habilitación o bloqueo del canal online por sucursal
- validación del horario antes de permitir el checkout

No incluye por defecto:

- reglas logísticas avanzadas por zona
- costos de envío por sector
- cobertura geográfica automatizada

## 5. Bolsa Y Checkout

Incluye:

- bolsa de compra asociada a una sola sucursal por pedido
- edición de cantidades
- notas por producto
- exclusiones o indicaciones simples por producto
- confirmación de datos del cliente antes de enviar el pedido
- selección de moneda de referencia `USD` o `VES`
- selección del tipo de entrega: retiro o delivery
- captura de datos mínimos de entrega cuando el pedido sea `delivery`

Debe contemplar:

- validación de disponibilidad operativa antes de confirmar la compra
- validación de datos mínimos obligatorios del cliente
- validación de datos obligatorios de entrega cuando corresponda

## Alcance Base De Delivery

Incluye:

- opción de `delivery` como tipo de entrega en el checkout
- captura de dirección de entrega
- campo de referencia o punto de ubicación
- campo de observaciones para la entrega
- uso del teléfono del cliente como dato obligatorio de contacto
- visualización de la información de entrega en el panel administrativo
- visualización de la información de entrega en el pedido consumido por el sistema local/POS, si la integración lo requiere

Alcance operativo inicial:

- el sistema registrará el pedido como `delivery`, pero no asignará automáticamente repartidores
- la coordinación operativa de despacho podrá realizarse manualmente por el negocio en la primera etapa
- el estado `listo para retiro o entrega` cubrirá también los pedidos preparados para despacho

Pendiente de definición comercial y técnica:

- si existirá costo de envío calculado dentro del sistema
- si el costo de envío será fijo, manual o por zona
- si se limitará el delivery por cobertura geográfica
- si se permitirá guardar varias direcciones por cliente

No incluye por defecto:

- cálculo automático de tarifa por distancia
- geolocalización en mapa
- tracking en tiempo real
- asignación automática de motorizado o repartidor
- optimización de rutas

## 6. Módulo De Pedidos

Incluye:

- creación de pedidos desde la plataforma online
- asociación del pedido a una sola sucursal
- almacenamiento de datos del cliente
- almacenamiento de datos de entrega cuando el pedido sea `delivery`
- almacenamiento de productos, cantidades, notas y exclusiones
- almacenamiento de subtotales en `USD` y `VES`
- disponibilidad del pedido para consumo por parte del sistema local, según flujo operativo definido
- consulta del pedido desde el perfil del cliente
- consulta del pedido desde el panel administrativo

## Estados Del Pedido

El sistema debe contemplar una estructura operativa de estados para soportar perfil de cliente, operación administrativa y notificaciones.

La definición funcional debe separar:

- estados visibles para el comprador
- estados operativos internos para administración, integración y sistema local/POS
- reglas de mapeo entre ambos niveles

## Estados Visibles Para El Comprador

Son los estados que el cliente verá en su perfil y en las notificaciones automáticas.

Estados funcionales previstos para cliente:

- recibido
- pago validado
- listo para retiro o entrega
- entregado o cerrado
- cancelado

Objetivo de estos estados:

- comunicar el avance del pedido de forma simple
- evitar exponer complejidad técnica del sistema interno
- servir como base para notificaciones automáticas y seguimiento desde el perfil

## Estados Operativos Internos

Son los estados o condiciones internas que utilizará el sistema para operación, administración e integración con el POS.

Estados operativos previstos:

- pedido recibido en plataforma
- pago pendiente de validación
- pago validado
- pedido listo para procesar o facturar en POS
- pedido facturado en POS
- pedido listo para retiro o entrega
- pedido entregado o cerrado
- pedido cancelado

Nota operativa:

Estos estados internos podrán implementarse mediante campos, banderas, timestamps o estados compuestos, según la arquitectura técnica del sistema.

## Reglas De Mapeo Entre Estados

El comprador no necesariamente verá el mismo nivel de detalle que maneja el sistema interno.

Ejemplos de mapeo funcional:

- un pedido recibido en plataforma y aún no validado en pago podrá mostrarse al cliente como `recibido`
- un pedido con pago validado podrá mostrarse como `pago validado`
- un pedido ya preparado para despacho o retiro podrá mostrarse como `listo para retiro o entrega`
- un pedido facturado y concluido podrá mostrarse como `entregado o cerrado`, según el flujo definitivo aprobado

Nota:

La implementación técnica podrá mapear estos estados a campos internos o a estados compuestos, pero funcionalmente deben existir por separado para usuario y operación.

No incluye por defecto:

- tracking GPS
- gestión de repartidores
- logística de última milla

## 7. Módulo De Pagos

Incluye:

- asociación del pago con el pedido
- estructura para validación de pago
- preparación del pedido para ser procesado luego de validación

Actualmente debe asumirse que:

- el método de pago definitivo aún debe confirmarse con el cliente
- la integración exacta dependerá del proveedor o mecanismo aprobado

Debe aclararse comercialmente:

- si el cliente requiere pagos automáticos, conciliación automática, webhooks o integración con proveedor externo, ese alcance debe quedar expresamente definido

No incluye por defecto:

- pasarela compleja no especificada
- reembolsos automáticos
- conciliación bancaria avanzada

## 8. Notificaciones Automáticas Al Cliente

Incluye:

- uso del teléfono del cliente como dato operativo obligatorio del pedido
- almacenamiento de un canal preferido de notificación por cliente
- notificaciones automáticas por `WhatsApp` y/o `SMS`, sujetas a factibilidad técnica y económica
- envío automático de notificaciones en eventos clave del pedido

Eventos de notificación aprobados para el alcance funcional:

- pedido recibido
- pago validado
- pedido listo para retiro o entrega

Comportamiento esperado:

- el sistema intentará notificar al cliente usando su canal preferido
- la disponibilidad final de `WhatsApp`, `SMS` o ambos dependerá del proveedor seleccionado, costos operativos, cobertura y aprobaciones requeridas

Dependencias externas:

- proveedor de `SMS`
- proveedor o API oficial de `WhatsApp`
- costos por mensaje o por conversación
- validación de cuenta empresarial, plantillas o remitentes cuando aplique

No incluye por defecto:

- chatbot conversacional
- bandeja interna de atención al cliente
- campañas masivas
- cambio automático de canal si uno falla
- garantías de entrega ajenas al proveedor

## 9. Panel Administrativo Web

Incluye:

- acceso administrativo por sucursal
- visualización de productos por sucursal
- edición de campos online del catálogo
- carga de imágenes
- revisión de pedidos registrados
- consulta del detalle de pedidos
- revisión del estado del pedido
- configuración de horarios
- habilitación o cierre del canal online por sucursal

Pendiente de definición detallada:

- alcance exacto del dashboard principal
- acciones administrativas sobre estados del pedido
- módulo de clientes en backoffice
- módulo de integraciones y logs operativos visibles desde interfaz

No incluye por defecto:

- ERP completo
- módulo contable
- CRM avanzado
- reportes financieros complejos

## 10. Integración Con Sistema Local / POS

Incluye:

- API de integración ya contemplada como mecanismo oficial de comunicación con el sistema local/POS
- autenticación de integración
- sincronización de productos
- sincronización de stock
- sincronización de precios
- sincronización del estado del producto
- consulta de pedidos listos para procesar en POS
- marcado de pedidos como facturados desde el sistema local
- documentación técnica de integración

Alcance funcional de esta integración:

- el sistema local/POS consumirá la API para consultar y procesar información operativa
- la plataforma online expondrá endpoints controlados para catálogo, pedidos e interacción operativa
- la facturación fiscal seguirá dependiendo del sistema local/POS
- la API será el punto formal de intercambio entre la plataforma online y el sistema actual del cliente

No incluye:

- modificación interna del sistema legacy del cliente
- desarrollo dentro del software actual de terceros
- soporte del código fuente del sistema viejo si no forma parte de este proyecto

## 11. Aplicación Móvil

La aplicación móvil debe considerarse como módulo adicional respecto al desarrollo web principal.

Incluye de forma prevista:

- login de cliente
- catálogo por sucursal
- bolsa de compra
- checkout
- perfil de cliente
- historial y estado de pedidos
- recepción de notificaciones según las capacidades finalmente aprobadas

No incluye por defecto:

- panel administrativo móvil
- app para repartidores
- funciones offline complejas
- geolocalización avanzada

## Exclusiones Generales

- hosting y dominio
- costos de Supabase y servicios externos
- costos de `SMS`, `WhatsApp`, correo o pasarela de pago
- desarrollo no descrito expresamente en este documento
- cambios de alcance posteriores a la aprobación
- soporte indefinido
- desarrollo o corrección de plataformas de terceros fuera de este proyecto
- facturación fiscal directa desde la plataforma online

## Dependencias Externas

- proveedor de base de datos y backend
- proveedor de correo transaccional
- proveedor de notificaciones `SMS` y/o `WhatsApp`
- proveedor o mecanismo definitivo de pago
- disponibilidad técnica del sistema local/POS y de su programador

## Criterio De Alcance

Cualquier funcionalidad no descrita expresamente en este documento deberá considerarse fuera del alcance base del proyecto y deberá ser evaluada, definida y cotizada por separado.

## Próximas Definiciones Pendientes

- detalle funcional del delivery
- estructura final de estados del pedido en interfaz y operación
- método de pago definitivo
- proveedor de notificaciones
- alcance exacto del panel administrativo avanzado
- reportes operativos y comerciales
