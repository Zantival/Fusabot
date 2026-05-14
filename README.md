# FusaShop — widget FusaBot

Asistente de chat para **FusaShop** (MiPymes, Fusagasugá). Usa la API de **Google Gemini** y responde con base en la base de conocimiento definida en código.

## Estructura

- `public/chatbot/knowledge-base.js` — datos de FusaShop y `SYSTEM_PROMPT` enviado a Gemini. **Actualizar el conocimiento del bot editando solo este archivo.**
- `public/chatbot/chatbot.js` — llamadas a la API y UI del widget.
- `public/chatbot/chatbot.css` — estilos del widget flotante.
- `public/chatbot/index.html` — página de demostración del widget.

Variables de entorno de referencia: copia `.env.example` a `.env` en el proyecto Laravel/Vite cuando integres el front compilado. **No subas** `.env` con claves reales.

## Probar en local

1. Obtén una API key en [Google AI Studio](https://aistudio.google.com/).
2. Desde la raíz del repositorio, sirve la carpeta `public` (los módulos ES requieren HTTP, no `file://`):

```bash
npx --yes serve public
```

3. Abre la URL del servidor: la **landing** está en `/` (`public/index.html`). La demo mínima del widget sigue en `/chatbot/index.html`.
4. En `public/chatbot/index.html`, rellena `window.__FUSABOT_CONFIG__.apiKey` con tu clave **solo para pruebas locales**. No commitees claves.

Con **Vite**, define `VITE_GEMINI_API_KEY` y `VITE_GEMINI_MODEL` en `.env`; el módulo `chatbot.js` las lee automáticamente.

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

Exponer la API key en el navegador tiene riesgos de abuso. Para producción conviene un **proxy en backend** que llame a Gemini con la clave en servidor.
