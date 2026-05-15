# FusaShop — widget FusaBot

Asistente de chat para **FusaShop** (MiPymes, Fusagasugá). Usa la API de **[Groq](https://console.groq.com/)** (modelos vía endpoint compatible con OpenAI) y responde con base en la base de conocimiento en código.

## Estructura

- `public/chatbot/knowledge-base.js` — datos de FusaShop y `SYSTEM_PROMPT`. **Actualizar el conocimiento del bot editando solo este archivo.**
- `public/chatbot/chatbot.js` — llamadas a Groq y UI del widget.
- `public/chatbot/chatbot.css` — estilos del widget flotante.
- `public/chatbot/index.html` — página de demostración del widget.

Copia `.env.example` a `.env` cuando uses Vite/Laravel. **No subas** `.env` con claves reales.

## Probar en local

1. Crea una API key en [Groq Console](https://console.groq.com/keys) (formato `gsk_…`).
2. Sirve la carpeta `public` por HTTP (los módulos ES no funcionan bien con `file://`):

```bash
cd public && python3 -m http.server 3456
```

3. Abre la **landing** en `http://127.0.0.1:3456/` o la demo en `/chatbot/index.html`.
4. En `public/index.html` (o la demo), solo en `window.__FUSABOT_CONFIG__`: **`groqKey: 'gsk_…'`** y, si quieres, **`groqModel`**.

Con **Vite**, define solo **`VITE_GROQ_API_KEY`** y opcionalmente **`VITE_GROQ_MODEL`** en `.env`.

## Integración Laravel (Blade)

Cuando el proyecto Laravel tenga Vite configurado, puedes copiar el HTML del widget a una vista parcial e importar los mismos archivos (por ejemplo moviendo `chatbot.js` y `chatbot.css` a `resources/js` y `resources/css` y registrándolos en `vite.config.js`), o servir los archivos estáticos desde `public/chatbot/`.

Ejemplo al final del layout:

```blade
@include('partials.fusabot-widget')
```

Contenido sugerido de `resources/views/partials/fusabot-widget.blade.php`:

```blade
<div class="fusabot-widget" id="fusabot">
  <div class="fusabot-header">🛒 FusaBot — Asistente FusaShop</div>
  <div class="chat-messages" id="chat-messages"></div>
  <div class="chat-input-area">
    <input type="text" id="chat-input" placeholder="¿En qué te ayudamos?" autocomplete="off" />
    <button type="button" id="chat-send" aria-label="Enviar">➤</button>
  </div>
</div>
@vite(['resources/js/chatbot.js', 'resources/css/chatbot.css'])
```

(Ajusta rutas y entrada Vite según cómo organices el proyecto.)

## Seguridad

Exponer la API key de Groq en el navegador tiene riesgos de abuso. Para producción conviene un **proxy en backend** que llame a Groq con la clave en servidor.

## Si ves "Failed to fetch"

Suele ser red, bloqueador, VPN, o abrir el HTML como archivo (`file://`). Sirve el sitio con un servidor HTTP y prueba otra red o sin extensiones que bloqueen `api.groq.com`.
