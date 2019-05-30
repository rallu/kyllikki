export const swaggerui = spec => `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>OpenAPI</title>
    <link
      rel="stylesheet"
      type="text/css"
      href="https://unpkg.com/swagger-ui-dist@3.12.1/swagger-ui.css"
    />
    <style>
      html,
      body {
        margin: 0;
      }

      form.download-url-wrapper {
        display: none;
      }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>

    <script src="https://unpkg.com/swagger-ui-dist@3.12.1/swagger-ui-standalone-preset.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@3.12.1/swagger-ui-bundle.js"></script>

    <script>
      window.onload = function() {
        // Build a system
        const ui = SwaggerUIBundle({
          spec: ${JSON.stringify(spec)},
          dom_id: "#swagger-ui",
          deepLinking: true,
          presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
          plugins: [SwaggerUIBundle.plugins.DownloadUrl],
          layout: "StandaloneLayout"
        });
        window.ui = ui;
      };
    </script>
  </body>
</html>
`;
