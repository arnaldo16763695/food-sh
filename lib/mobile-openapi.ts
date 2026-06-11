export const mobileOpenApiSpec = {
  openapi: "3.1.0",
  info: {
    title: "Shanghai Mobile API",
    version: "1.0.0",
    description:
      "API para la app Flutter de clientes compradores. La autenticación se realiza con Supabase Auth y los endpoints protegidos usan Authorization Bearer con el access token del cliente.",
  },
  servers: [{ url: "/api/mobile" }],
  tags: [
    { name: "Branches", description: "Sucursales y disponibilidad pública." },
    { name: "Products", description: "Catálogo público por sucursal." },
    { name: "Profile", description: "Perfil y estado de acceso del cliente autenticado." },
    { name: "Orders", description: "Pedidos del cliente autenticado." },
  ],
  components: {
    securitySchemes: {
      CustomerBearer: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Access token de Supabase Auth del cliente móvil.",
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
        example: {
          error: "No autenticado.",
          details: null,
        },
      },
      Branch: {
        type: "object",
        properties: {
          id: { type: "string" },
          slug: { type: "string" },
          title: { type: "string" },
          isActive: { type: "boolean" },
          onlineOrderMode: { type: "string", enum: ["auto", "force_closed", "force_open"] },
        },
        required: ["id", "slug", "title", "isActive", "onlineOrderMode"],
        example: {
          id: "centro",
          slug: "centro",
          title: "Sucursal Centro",
          isActive: true,
          onlineOrderMode: "auto",
        },
      },
      BranchAvailability: {
        type: "object",
        properties: {
          branchSlug: { type: "string" },
          isOpen: { type: "boolean" },
          weekday: { type: "integer", minimum: 0, maximum: 6 },
          opensAt: { type: ["string", "null"] },
          closesAt: { type: ["string", "null"] },
          onlineOrderMode: { type: "string", enum: ["auto", "force_closed", "force_open"] },
          timezone: { type: "string" },
          message: { type: "string" },
        },
        required: [
          "branchSlug",
          "isOpen",
          "weekday",
          "opensAt",
          "closesAt",
          "onlineOrderMode",
          "timezone",
          "message",
        ],
        example: {
          branchSlug: "centro",
          isOpen: true,
          weekday: 3,
          opensAt: "08:00:00",
          closesAt: "20:00:00",
          onlineOrderMode: "auto",
          timezone: "America/Caracas",
          message: "Sucursal abierta hasta las 20:00.",
        },
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
          updatedAtSource: { type: ["string", "null"], format: "date-time" },
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
        example: {
          id: "4cb0ea2d-ec1d-4e4a-8ce7-b6f76407ed13",
          externalId: "P000123",
          branchId: "centro",
          sku: "PAN-CAN-01",
          name: "Pan canilla",
          description: "Pan fresco horneado diariamente.",
          imageUrl: "https://example.com/productos/pan-canilla.jpg",
          priceUsd: 1.25,
          priceVes: 110.5,
          stock: 42,
          isActive: true,
          onlineEnabled: true,
          updatedAtSource: "2026-06-10T09:30:00Z",
          createdAt: "2026-06-10T09:35:00Z",
          updatedAt: "2026-06-10T09:35:00Z",
        },
      },
      CustomerProfile: {
        type: "object",
        properties: {
          userId: { type: "string", format: "uuid" },
          fullName: { type: "string" },
          phone: { type: "string" },
        },
        required: ["userId", "fullName", "phone"],
        example: {
          userId: "bc9c2aa6-4ec6-4767-a72e-9b57861f7db6",
          fullName: "Mariana Perez",
          phone: "+584121112233",
        },
      },
      MobileUser: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          email: { type: ["string", "null"], format: "email" },
          emailConfirmedAt: { type: ["string", "null"], format: "date-time" },
        },
        required: ["id", "email", "emailConfirmedAt"],
        example: {
          id: "bc9c2aa6-4ec6-4767-a72e-9b57861f7db6",
          email: "cliente@example.com",
          emailConfirmedAt: "2026-06-10T10:00:00Z",
        },
      },
      MobileMe: {
        type: "object",
        properties: {
          status: { type: "string", enum: ["unconfirmed", "needs-profile", "ready"] },
          user: { $ref: "#/components/schemas/MobileUser" },
          profile: {
            oneOf: [
              { $ref: "#/components/schemas/CustomerProfile" },
              { type: "null" },
            ],
          },
        },
        required: ["status", "user", "profile"],
        example: {
          status: "ready",
          user: {
            id: "bc9c2aa6-4ec6-4767-a72e-9b57861f7db6",
            email: "cliente@example.com",
            emailConfirmedAt: "2026-06-10T10:00:00Z",
          },
          profile: {
            userId: "bc9c2aa6-4ec6-4767-a72e-9b57861f7db6",
            fullName: "Mariana Perez",
            phone: "+584121112233",
          },
        },
      },
      UpdateProfileRequest: {
        type: "object",
        properties: {
          fullName: { type: "string" },
          phone: { type: "string" },
        },
        required: ["fullName", "phone"],
        example: {
          fullName: "Mariana Perez",
          phone: "+584121112233",
        },
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
        example: {
          id: "5d211e76-b55f-4358-aac2-486bfc3d50ff",
          branchSlug: "centro",
          customerName: "Mariana Perez",
          customerEmail: "cliente@example.com",
          customerPhone: "+584121112233",
          fulfillmentType: "pickup",
          currency: "USD",
          status: "submitted",
          pagoValidado: false,
          paymentReference: null,
          paymentValidatedAt: null,
          posFacturado: false,
          posFacturadoAt: null,
          posReference: null,
          subtotalUsd: 12.5,
          subtotalVes: 1250,
          createdAt: "2026-06-10T11:00:00Z",
          updatedAt: "2026-06-10T11:00:00Z",
        },
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
        example: {
          id: "9e97df58-d10a-4c3a-a50e-ff6a7f9b31e4",
          productId: "4cb0ea2d-ec1d-4e4a-8ce7-b6f76407ed13",
          productName: "Pan canilla",
          sku: "PAN-CAN-01",
          quantity: 2,
          note: "Bien tostado",
          exclusions: ["mayonesa"],
          unitPriceUsd: 1.25,
          unitPriceVes: 110.5,
          lineTotalUsd: 2.5,
          lineTotalVes: 221,
        },
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
      OrderCreateItemRequest: {
        type: "object",
        properties: {
          productId: { type: "string", format: "uuid" },
          quantity: { type: "number", minimum: 1 },
          note: { type: "string" },
          exclusions: { type: "array", items: { type: "string" } },
        },
        required: ["productId"],
        example: {
          productId: "4cb0ea2d-ec1d-4e4a-8ce7-b6f76407ed13",
          quantity: 2,
          note: "Bien tostado",
          exclusions: ["mayonesa"],
        },
      },
      CreateOrderRequest: {
        type: "object",
        properties: {
          customerName: { type: "string" },
          customerPhone: { type: "string" },
          fulfillmentType: { type: "string", enum: ["pickup", "delivery"] },
          notes: { type: "string" },
          currency: { type: "string", enum: ["USD", "VES"] },
          items: {
            type: "array",
            minItems: 1,
            items: { $ref: "#/components/schemas/OrderCreateItemRequest" },
          },
        },
        required: ["customerName", "customerPhone", "fulfillmentType", "notes", "currency", "items"],
        example: {
          customerName: "Mariana Perez",
          customerPhone: "+584121112233",
          fulfillmentType: "pickup",
          notes: "Sin cebolla",
          currency: "USD",
          items: [
            {
              productId: "4cb0ea2d-ec1d-4e4a-8ce7-b6f76407ed13",
              quantity: 2,
              note: "Bien tostado",
              exclusions: ["mayonesa"],
            },
          ],
        },
      },
      CreateOrderResponse: {
        type: "object",
        properties: {
          orderId: { type: "string", format: "uuid" },
          subtotalUsd: { type: "number" },
          subtotalVes: { type: "number" },
          currency: { type: "string", enum: ["USD", "VES"] },
        },
        required: ["orderId", "subtotalUsd", "subtotalVes", "currency"],
        example: {
          orderId: "5d211e76-b55f-4358-aac2-486bfc3d50ff",
          subtotalUsd: 12.5,
          subtotalVes: 1250,
          currency: "USD",
        },
      },
      DataBranchResponse: {
        type: "object",
        properties: { data: { $ref: "#/components/schemas/Branch" } },
        required: ["data"],
      },
      DataBranchesResponse: {
        type: "object",
        properties: {
          data: { type: "array", items: { $ref: "#/components/schemas/Branch" } },
        },
        required: ["data"],
      },
      DataBranchAvailabilityResponse: {
        type: "object",
        properties: { data: { $ref: "#/components/schemas/BranchAvailability" } },
        required: ["data"],
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
      DataMobileMeResponse: {
        type: "object",
        properties: { data: { $ref: "#/components/schemas/MobileMe" } },
        required: ["data"],
      },
      DataOrdersResponse: {
        type: "object",
        properties: {
          data: { type: "array", items: { $ref: "#/components/schemas/Order" } },
        },
        required: ["data"],
      },
      DataOrderResponse: {
        type: "object",
        properties: { data: { $ref: "#/components/schemas/OrderDetail" } },
        required: ["data"],
      },
      DataCreateOrderResponse: {
        type: "object",
        properties: { data: { $ref: "#/components/schemas/CreateOrderResponse" } },
        required: ["data"],
      },
    },
    responses: {
      BadRequest: {
        description: "Request inválido.",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
            example: {
              error: "Debes enviar nombre completo y teléfono.",
              details: null,
            },
          },
        },
      },
      Unauthorized: {
        description: "Cliente no autenticado.",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
            example: {
              error: "No autenticado.",
              details: null,
            },
          },
        },
      },
      Forbidden: {
        description: "Cliente autenticado pero sin acceso operativo.",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
            example: {
              error: "Completa tu perfil antes de continuar.",
              details: null,
            },
          },
        },
      },
      NotFound: {
        description: "Recurso no encontrado.",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
            example: {
              error: "Recurso no encontrado.",
              details: null,
            },
          },
        },
      },
    },
  },
  paths: {
    "/branches": {
      get: {
        tags: ["Branches"],
        summary: "Lista sucursales públicas activas.",
        responses: {
          "200": {
            description: "Listado de sucursales.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DataBranchesResponse" },
                example: {
                  data: [
                    {
                      id: "centro",
                      slug: "centro",
                      title: "Sucursal Centro",
                      isActive: true,
                      onlineOrderMode: "auto",
                    },
                    {
                      id: "norte",
                      slug: "norte",
                      title: "Sucursal Norte",
                      isActive: true,
                      onlineOrderMode: "force_open",
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    "/branches/{branchSlug}": {
      get: {
        tags: ["Branches"],
        summary: "Obtiene una sucursal por slug.",
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
            description: "Sucursal encontrada.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DataBranchResponse" },
                example: {
                  data: {
                    id: "centro",
                    slug: "centro",
                    title: "Sucursal Centro",
                    isActive: true,
                    onlineOrderMode: "auto",
                  },
                },
              },
            },
          },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/branches/{branchSlug}/availability": {
      get: {
        tags: ["Branches"],
        summary: "Consulta disponibilidad operativa actual de la sucursal.",
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
            description: "Disponibilidad actual.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DataBranchAvailabilityResponse" },
                example: {
                  data: {
                    branchSlug: "centro",
                    isOpen: true,
                    weekday: 3,
                    opensAt: "08:00:00",
                    closesAt: "20:00:00",
                    onlineOrderMode: "auto",
                    timezone: "America/Caracas",
                    message: "Sucursal abierta hasta las 20:00.",
                  },
                },
              },
            },
          },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/branches/{branchSlug}/products": {
      get: {
        tags: ["Products"],
        summary: "Lista productos visibles para compra online.",
        parameters: [
          {
            name: "branchSlug",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
          {
            name: "search",
            in: "query",
            required: false,
            schema: { type: "string" },
            description: "Filtro opcional por nombre, descripción o SKU.",
          },
        ],
        responses: {
          "200": {
            description: "Listado de productos.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DataProductsResponse" },
                example: {
                  data: [
                    {
                      id: "4cb0ea2d-ec1d-4e4a-8ce7-b6f76407ed13",
                      externalId: "P000123",
                      branchId: "centro",
                      sku: "PAN-CAN-01",
                      name: "Pan canilla",
                      description: "Pan fresco horneado diariamente.",
                      imageUrl: "https://example.com/productos/pan-canilla.jpg",
                      priceUsd: 1.25,
                      priceVes: 110.5,
                      stock: 42,
                      isActive: true,
                      onlineEnabled: true,
                      updatedAtSource: "2026-06-10T09:30:00Z",
                      createdAt: "2026-06-10T09:35:00Z",
                      updatedAt: "2026-06-10T09:35:00Z",
                    },
                  ],
                },
              },
            },
          },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/branches/{branchSlug}/products/{id}": {
      get: {
        tags: ["Products"],
        summary: "Obtiene el detalle de un producto visible en la sucursal.",
        parameters: [
          {
            name: "branchSlug",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "200": {
            description: "Producto encontrado.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DataProductResponse" },
                example: {
                  data: {
                    id: "4cb0ea2d-ec1d-4e4a-8ce7-b6f76407ed13",
                    externalId: "P000123",
                    branchId: "centro",
                    sku: "PAN-CAN-01",
                    name: "Pan canilla",
                    description: "Pan fresco horneado diariamente.",
                    imageUrl: "https://example.com/productos/pan-canilla.jpg",
                    priceUsd: 1.25,
                    priceVes: 110.5,
                    stock: 42,
                    isActive: true,
                    onlineEnabled: true,
                    updatedAtSource: "2026-06-10T09:30:00Z",
                    createdAt: "2026-06-10T09:35:00Z",
                    updatedAt: "2026-06-10T09:35:00Z",
                  },
                },
              },
            },
          },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/me": {
      get: {
        tags: ["Profile"],
        summary: "Obtiene estado de acceso y perfil del cliente autenticado.",
        security: [{ CustomerBearer: [] }],
        responses: {
          "200": {
            description: "Estado del cliente autenticado.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DataMobileMeResponse" },
                example: {
                  data: {
                    status: "ready",
                    user: {
                      id: "bc9c2aa6-4ec6-4767-a72e-9b57861f7db6",
                      email: "cliente@example.com",
                      emailConfirmedAt: "2026-06-10T10:00:00Z",
                    },
                    profile: {
                      userId: "bc9c2aa6-4ec6-4767-a72e-9b57861f7db6",
                      fullName: "Mariana Perez",
                      phone: "+584121112233",
                    },
                  },
                },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
      patch: {
        tags: ["Profile"],
        summary: "Actualiza o crea el perfil operativo del cliente.",
        security: [{ CustomerBearer: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateProfileRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Perfil actualizado.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DataMobileMeResponse" },
                example: {
                  data: {
                    status: "ready",
                    user: {
                      id: "bc9c2aa6-4ec6-4767-a72e-9b57861f7db6",
                      email: "cliente@example.com",
                      emailConfirmedAt: "2026-06-10T10:00:00Z",
                    },
                    profile: {
                      userId: "bc9c2aa6-4ec6-4767-a72e-9b57861f7db6",
                      fullName: "Mariana Perez",
                      phone: "+584121112233",
                    },
                  },
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/orders": {
      get: {
        tags: ["Orders"],
        summary: "Lista los pedidos del cliente autenticado.",
        security: [{ CustomerBearer: [] }],
        responses: {
          "200": {
            description: "Listado de pedidos del cliente.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DataOrdersResponse" },
                example: {
                  data: [
                    {
                      id: "5d211e76-b55f-4358-aac2-486bfc3d50ff",
                      branchSlug: "centro",
                      customerName: "Mariana Perez",
                      customerEmail: "cliente@example.com",
                      customerPhone: "+584121112233",
                      fulfillmentType: "pickup",
                      currency: "USD",
                      status: "submitted",
                      pagoValidado: false,
                      paymentReference: null,
                      paymentValidatedAt: null,
                      posFacturado: false,
                      posFacturadoAt: null,
                      posReference: null,
                      subtotalUsd: 12.5,
                      subtotalVes: 1250,
                      createdAt: "2026-06-10T11:00:00Z",
                      updatedAt: "2026-06-10T11:00:00Z",
                    },
                  ],
                },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/orders/{orderId}": {
      get: {
        tags: ["Orders"],
        summary: "Obtiene el detalle de un pedido del cliente autenticado.",
        security: [{ CustomerBearer: [] }],
        parameters: [
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
                example: {
                  data: {
                    id: "5d211e76-b55f-4358-aac2-486bfc3d50ff",
                    branchSlug: "centro",
                    customerName: "Mariana Perez",
                    customerEmail: "cliente@example.com",
                    customerPhone: "+584121112233",
                    fulfillmentType: "pickup",
                    currency: "USD",
                    status: "submitted",
                    pagoValidado: false,
                    paymentReference: null,
                    paymentValidatedAt: null,
                    posFacturado: false,
                    posFacturadoAt: null,
                    posReference: null,
                    subtotalUsd: 12.5,
                    subtotalVes: 1250,
                    createdAt: "2026-06-10T11:00:00Z",
                    updatedAt: "2026-06-10T11:00:00Z",
                    notes: "Sin cebolla",
                    items: [
                      {
                        id: "9e97df58-d10a-4c3a-a50e-ff6a7f9b31e4",
                        productId: "4cb0ea2d-ec1d-4e4a-8ce7-b6f76407ed13",
                        productName: "Pan canilla",
                        sku: "PAN-CAN-01",
                        quantity: 2,
                        note: "Bien tostado",
                        exclusions: ["mayonesa"],
                        unitPriceUsd: 1.25,
                        unitPriceVes: 110.5,
                        lineTotalUsd: 2.5,
                        lineTotalVes: 221,
                      },
                    ],
                  },
                },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/branches/{branchSlug}/orders": {
      post: {
        tags: ["Orders"],
        summary: "Crea un pedido para una sucursal.",
        security: [{ CustomerBearer: [] }],
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
              schema: { $ref: "#/components/schemas/CreateOrderRequest" },
              example: {
                customerName: "Mariana Perez",
                customerPhone: "+584121112233",
                fulfillmentType: "pickup",
                notes: "Sin cebolla",
                currency: "USD",
                items: [
                  {
                    productId: "4cb0ea2d-ec1d-4e4a-8ce7-b6f76407ed13",
                    quantity: 2,
                    note: "Bien tostado",
                    exclusions: ["mayonesa"],
                  },
                ],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Pedido creado exitosamente.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DataCreateOrderResponse" },
                example: {
                  data: {
                    orderId: "5d211e76-b55f-4358-aac2-486bfc3d50ff",
                    subtotalUsd: 12.5,
                    subtotalVes: 1250,
                    currency: "USD",
                  },
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "403": { $ref: "#/components/responses/Forbidden" },
        },
      },
    },
  },
} as const
