export const integrationOpenApiSpec = {
  openapi: "3.1.0",
  info: {
    title: "Shanghai Integration API",
    version: "1.0.0",
    description:
      "API de integracion server-to-server para el sistema POS local. Usa Authorization Bearer, timestamp y firma HMAC sobre el body raw.",
  },
  servers: [{ url: "/api/integration" }],
  tags: [
    { name: "Health", description: "Verificacion basica de autenticacion de integracion." },
    { name: "Products", description: "Sincronizacion y consulta de productos del POS." },
    { name: "Orders", description: "Consulta de pedidos online listos para facturar en POS." },
  ],
  components: {
    securitySchemes: {
      IntegrationBearer: {
        type: "http",
        scheme: "bearer",
        description: "Bearer token configurado en INTEGRATION_API_KEY.",
      },
      IntegrationTimestamp: {
        type: "apiKey",
        in: "header",
        name: "X-Integration-Timestamp",
        description: "Fecha ISO exacta usada para construir la firma HMAC.",
      },
      IntegrationSignature: {
        type: "apiKey",
        in: "header",
        name: "X-Integration-Signature",
        description:
          "Firma HMAC-SHA256 del payload `${timestamp}.${method}.${pathname}.${rawBody}` usando INTEGRATION_HMAC_SECRET. Acepta `sha256=<hex>` o `<hex>`.",
      },
    },
    schemas: {
      ErrorResponse: {
        type: "object",
        properties: {
          error: { type: "string" },
          details: {},
        },
        required: ["error"],
      },
      Product: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          externalId: { type: "string" },
          branchId: { type: "string" },
          sku: { type: "string" },
          name: { type: "string" },
          description: { type: "string" },
          imageUrl: { type: ["string", "null"], format: "uri" },
          priceUsd: { type: "number" },
          priceVes: { type: "number" },
          stock: { type: "number" },
          isActive: { type: "boolean" },
          onlineEnabled: { type: "boolean" },
          updatedAtSource: { type: "string", format: "date-time" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
        required: [
          "id",
          "externalId",
          "branchId",
          "sku",
          "name",
          "description",
          "imageUrl",
          "priceUsd",
          "priceVes",
          "stock",
          "isActive",
          "onlineEnabled",
          "updatedAtSource",
          "createdAt",
          "updatedAt",
        ],
      },
      ProductUpsertRequest: {
        type: "object",
        properties: {
          external_id: { type: "string" },
          sku: { type: "string" },
          name: { type: "string" },
          price_usd: { type: "number", minimum: 0 },
          price_ves: { type: "number", minimum: 0 },
          stock: { type: "number", minimum: 0 },
          is_active: { type: "boolean" },
          updated_at_source: { type: "string", format: "date-time" },
        },
        required: [
          "external_id",
          "sku",
          "name",
          "price_usd",
          "price_ves",
          "stock",
          "is_active",
          "updated_at_source",
        ],
      },
      ProductStockRequest: {
        type: "object",
        properties: {
          stock: { type: "number", minimum: 0 },
          updated_at_source: { type: "string", format: "date-time" },
        },
        required: ["stock", "updated_at_source"],
      },
      ProductPriceRequest: {
        type: "object",
        properties: {
          price_usd: { type: "number", minimum: 0 },
          price_ves: { type: "number", minimum: 0 },
          updated_at_source: { type: "string", format: "date-time" },
        },
        required: ["price_usd", "price_ves", "updated_at_source"],
      },
      ProductStatusRequest: {
        type: "object",
        properties: {
          is_active: { type: "boolean" },
          updated_at_source: { type: "string", format: "date-time" },
        },
        required: ["is_active", "updated_at_source"],
      },
      OrderItem: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          productId: { type: "string", format: "uuid" },
          productName: { type: "string" },
          sku: { type: "string" },
          quantity: { type: "integer" },
          note: { type: "string" },
          exclusions: { type: "array", items: { type: "string" } },
          unitPriceUsd: { type: "number" },
          unitPriceVes: { type: "number" },
          lineTotalUsd: { type: "number" },
          lineTotalVes: { type: "number" },
        },
        required: [
          "id",
          "productId",
          "productName",
          "sku",
          "quantity",
          "note",
          "exclusions",
          "unitPriceUsd",
          "unitPriceVes",
          "lineTotalUsd",
          "lineTotalVes",
        ],
      },
      Order: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          branchSlug: { type: "string" },
          customerName: { type: "string" },
          customerEmail: { type: "string", format: "email" },
          customerPhone: { type: ["string", "null"] },
          fulfillmentType: { type: "string", enum: ["pickup", "delivery"] },
          currency: { type: "string", enum: ["USD", "VES"] },
          status: { type: "string", enum: ["draft", "submitted", "cancelled"] },
          pagoValidado: { type: "boolean" },
          paymentReference: { type: ["string", "null"] },
          paymentValidatedAt: { type: ["string", "null"], format: "date-time" },
          posFacturado: { type: "boolean" },
          posFacturadoAt: { type: ["string", "null"], format: "date-time" },
          posReference: { type: ["string", "null"] },
          subtotalUsd: { type: "number" },
          subtotalVes: { type: "number" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
        required: [
          "id",
          "branchSlug",
          "customerName",
          "customerEmail",
          "customerPhone",
          "fulfillmentType",
          "currency",
          "status",
          "pagoValidado",
          "paymentReference",
          "paymentValidatedAt",
          "posFacturado",
          "posFacturadoAt",
          "posReference",
          "subtotalUsd",
          "subtotalVes",
          "createdAt",
          "updatedAt",
        ],
      },
      OrderDetail: {
        allOf: [
          { $ref: "#/components/schemas/Order" },
          {
            type: "object",
            properties: {
              notes: { type: "string" },
              items: {
                type: "array",
                items: { $ref: "#/components/schemas/OrderItem" },
              },
            },
            required: ["notes", "items"],
          },
        ],
      },
      PosInvoiceRequest: {
        type: "object",
        properties: {
          pos_reference: { type: "string" },
          facturado_at: { type: "string", format: "date-time" },
        },
        required: ["pos_reference", "facturado_at"],
      },
      DataProductResponse: {
        type: "object",
        properties: { data: { $ref: "#/components/schemas/Product" } },
        required: ["data"],
      },
      DataProductsResponse: {
        type: "object",
        properties: {
          data: { type: "array", items: { $ref: "#/components/schemas/Product" } },
        },
        required: ["data"],
      },
      DataOrderResponse: {
        type: "object",
        properties: { data: { $ref: "#/components/schemas/OrderDetail" } },
        required: ["data"],
      },
      DataOrdersResponse: {
        type: "object",
        properties: {
          data: { type: "array", items: { $ref: "#/components/schemas/Order" } },
        },
        required: ["data"],
      },
      HealthResponse: {
        type: "object",
        properties: {
          data: {
            type: "object",
            properties: { status: { type: "string", enum: ["ok"] } },
            required: ["status"],
          },
        },
        required: ["data"],
      },
    },
    responses: {
      BadRequest: {
        description: "Request invalido.",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
          },
        },
      },
      Unauthorized: {
        description: "Integracion no autorizada.",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
          },
        },
      },
      NotFound: {
        description: "Recurso no encontrado.",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
          },
        },
      },
      Conflict: {
        description: "Conflicto de estado.",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
          },
        },
      },
    },
  },
  security: [
    {
      IntegrationBearer: [],
      IntegrationTimestamp: [],
      IntegrationSignature: [],
    },
  ],
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Verifica credenciales de integracion.",
        responses: {
          "200": {
            description: "Autenticacion valida.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/HealthResponse" },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/branches/{branchSlug}/products": {
      get: {
        tags: ["Products"],
        summary: "Lista todos los productos de una sucursal para el POS.",
        parameters: [
          {
            name: "branchSlug",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Slug estable de la sucursal.",
          },
        ],
        responses: {
          "200": {
            description: "Listado de productos.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DataProductsResponse" },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/branches/{branchSlug}/products/{externalId}": {
      get: {
        tags: ["Products"],
        summary: "Obtiene un producto por externalId.",
        parameters: [
          {
            name: "branchSlug",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
          {
            name: "externalId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Producto encontrado.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DataProductResponse" },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/branches/{branchSlug}/products/upsert": {
      post: {
        tags: ["Products"],
        summary: "Crea o actualiza un producto sincronizado desde el POS.",
        parameters: [
          {
            name: "branchSlug",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProductUpsertRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Producto sincronizado.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DataProductResponse" },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/branches/{branchSlug}/products/{externalId}/stock": {
      patch: {
        tags: ["Products"],
        summary: "Actualiza stock de un producto.",
        parameters: [
          {
            name: "branchSlug",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
          {
            name: "externalId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProductStockRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Stock actualizado.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DataProductResponse" },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/branches/{branchSlug}/products/{externalId}/price": {
      patch: {
        tags: ["Products"],
        summary: "Actualiza precios USD y VES de un producto.",
        parameters: [
          {
            name: "branchSlug",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
          {
            name: "externalId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProductPriceRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Precios actualizados.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DataProductResponse" },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/branches/{branchSlug}/products/{externalId}/status": {
      patch: {
        tags: ["Products"],
        summary: "Activa o desactiva logicamente un producto.",
        parameters: [
          {
            name: "branchSlug",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
          {
            name: "externalId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProductStatusRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Estado actualizado.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DataProductResponse" },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/branches/{branchSlug}/orders": {
      get: {
        tags: ["Orders"],
        summary: "Lista pedidos listos para facturar en POS.",
        description:
          "Devuelve solo pedidos submitted, con pago validado y aun no facturados por el POS.",
        parameters: [
          {
            name: "branchSlug",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Listado de pedidos pendientes para POS.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DataOrdersResponse" },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/branches/{branchSlug}/orders/{orderId}": {
      get: {
        tags: ["Orders"],
        summary: "Obtiene el detalle de un pedido validado.",
        parameters: [
          {
            name: "branchSlug",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
          {
            name: "orderId",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "200": {
            description: "Pedido encontrado.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DataOrderResponse" },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/branches/{branchSlug}/orders/{orderId}/pos-invoice": {
      patch: {
        tags: ["Orders"],
        summary: "Marca un pedido como facturado por el POS.",
        parameters: [
          {
            name: "branchSlug",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
          {
            name: "orderId",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PosInvoiceRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Pedido marcado como facturado por POS.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DataOrderResponse" },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "404": { $ref: "#/components/responses/NotFound" },
          "409": { $ref: "#/components/responses/Conflict" },
        },
      },
    },
  },
} as const
