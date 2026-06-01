const swaggerHtml = `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Shanghai Integration API</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
    <style>
      body { margin: 0; background: #fafafa; }
      .topbar { display: none; }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js" crossorigin></script>
    <script>
      window.onload = () => {
        window.ui = SwaggerUIBundle({
          url: '/api/integration/openapi',
          dom_id: '#swagger-ui',
          deepLinking: true,
          persistAuthorization: true,
        })
      }
    </script>
  </body>
</html>`

export const runtime = "nodejs"

export async function GET() {
  return new Response(swaggerHtml, {
    headers: {
      "content-type": "text/html; charset=utf-8",
    },
  })
}
