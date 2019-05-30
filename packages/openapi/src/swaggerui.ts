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
        height: 100%;
      }

      body {
        display: flex;
        flex-direction: column;
      }

      form.download-url-wrapper {
        display: none !important;
      }

      #kyllikkipromote {
        background: #121212;
        color: white;
        padding: 10px;
        text-align: center;
        font-family: sans-serif;
        margin-top: auto;
      }

      #kyllikkipromote a {
        color: silver;
      }

      #kyllikkitoppromote {
        margin-left: auto;
      }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <div id="kyllikkipromote">
      😻😻 Powered by <a href="https://github.com/rallu/kyllikki">Kyllikki</a> 😻😻
    </div>

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

        const elem = document.createElement('div');
        elem.setAttribute("id", "kyllikkitoppromote");
        elem.innerHTML = '<a href="http://github.com/rallu/kyllikki">Kyllikki edition 🐈</a>';
        const doc = document.querySelector("#swagger-ui .topbar .topbar-wrapper");
        doc.appendChild(elem);
      };
    </script>
  </body>
</html>
`;
