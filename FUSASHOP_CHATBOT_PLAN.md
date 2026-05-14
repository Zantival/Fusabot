# 🛒 FusaShop Chatbot — Plan de Cursor

> Plan de desarrollo para integrar un chatbot inteligente y exclusivo en **FusaShop**, plataforma e-commerce para MiPymes de Fusagasugá, Colombia. El chatbot usa la API de **Google AI Studio (Gemini)** y responde únicamente con base en la información del sistema.

---

## 📐 Arquitectura General

```
fusashop/
├── public/
│   └── chatbot/
│       ├── index.html          # Widget de chat embebible
│       ├── chatbot.js          # Lógica del chatbot (módulo principal)
│       ├── chatbot.css         # Estilos del widget
│       └── knowledge-base.js   # Base de conocimiento estática de FusaShop
├── .env                        # Variables de entorno reales (no se sube al repo)
├── .env.example                # Plantilla de variables de entorno
└── README.md
```

---

## 🔐 Variables de Entorno

### `.env.example`
```env
# API Key de Google AI Studio (Gemini)
GEMINI_API_KEY=TU_API_KEY_AQUI

# Modelo de Gemini a usar
GEMINI_MODEL=gemini-2.0-flash

# Nombre del e-commerce
SHOP_NAME=FusaShop

# URL base del sitio
SHOP_BASE_URL=https://fusashop.com
```

> ⚠️ Nunca subas el archivo `.env` real al repositorio. Agrega `.env` al `.gitignore`.

---

## 🧠 Base de Conocimiento del Chatbot

El chatbot **solo responde** con base en la información definida en `knowledge-base.js`. No accede a internet ni responde preguntas fuera del alcance de FusaShop.

### Estructura de `knowledge-base.js`

```javascript
// knowledge-base.js
// Base de conocimiento exclusiva de FusaShop
// Actualizar este archivo para ampliar el conocimiento del chatbot.

export const FUSASHOP_KNOWLEDGE = {
  general: {
    nombre: "FusaShop",
    descripcion: `FusaShop es una plataforma e-commerce diseñada para fortalecer
    las MiPymes (micro, pequeñas y medianas empresas) de Fusagasugá, Colombia.
    Permite a los comerciantes locales vender sus productos en línea de forma
    fácil, segura y accesible.`,
    ciudad: "Fusagasugá, Cundinamarca, Colombia",
    mision: `Digitalizar y empoderar el comercio local de Fusagasugá,
    conectando a los pequeños empresarios con compradores de la región
    y del país mediante tecnología moderna y accesible.`,
  },

  tecnologia: {
    backend: "Laravel 12",
    frontend: "Vue.js 3 con Tailwind CSS",
    baseDatos: "MySQL 8.0",
    gestionProyecto: "Jira (metodología Scrum)",
    pasarelaPago: ["PayU", "Nequi", "Daviplata"],
    chatTiempoReal: "Laravel Echo + Pusher",
    privacidad: "Cumplimiento con Ley 1581 de 2012 (Colombia)",
  },

  funcionalidades: [
    "Registro y gestión de vendedores MiPymes",
    "Catálogo de productos con categorías y filtros",
    "Carrito de compras y proceso de checkout",
    "Pasarela de pago con PayU, Nequi y Daviplata",
    "Panel de administración para vendedores",
    "Gestión de pedidos y seguimiento",
    "Chat en tiempo real entre compradores y vendedores",
    "Sistema de reseñas y calificaciones",
    "Notificaciones de estado de pedido",
    "Política de cookies conforme a la Ley 1581 de 2012",
  ],

  vendedores: {
    requisitos: [
      "Ser una MiPyme registrada en Fusagasugá o municipios cercanos",
      "Tener RUT o documento de identidad vigente",
      "Aceptar los términos y condiciones de FusaShop",
    ],
    beneficios: [
      "Vitrina digital sin necesidad de conocimientos técnicos",
      "Acceso a compradores locales y nacionales",
      "Gestión de inventario en tiempo real",
      "Soporte técnico incluido",
    ],
  },

  compradores: {
    proceso_compra: [
      "1. Buscar productos por categoría o nombre",
      "2. Agregar al carrito de compras",
      "3. Registrarse o iniciar sesión",
      "4. Seleccionar método de pago (PayU, Nequi o Daviplata)",
      "5. Confirmar el pedido y recibir confirmación por correo",
    ],
    medios_pago: ["PayU (tarjetas débito/crédito, PSE)", "Nequi", "Daviplata"],
    seguridad: "Todas las transacciones están protegidas con cifrado SSL.",
  },

  soporte: {
    canales: ["Chat en la plataforma", "Correo electrónico", "WhatsApp Business"],
    horario: "Lunes a viernes de 8:00 AM a 6:00 PM (hora Colombia)",
    faq: [
      {
        pregunta: "¿Cómo registro mi negocio en FusaShop?",
        respuesta: `Ingresa a la plataforma, haz clic en 'Vende con nosotros',
        completa el formulario con los datos de tu negocio y espera la
        verificación de nuestro equipo (24-48 horas hábiles).`,
      },
      {
        pregunta: "¿Cuánto cobra FusaShop por vender?",
        respuesta: `FusaShop aplica una comisión por transacción exitosa.
        Consulta la sección de tarifas en la plataforma para conocer
        el porcentaje actualizado según tu categoría de producto.`,
      },
      {
        pregunta: "¿Qué hago si mi pedido no llega?",
        respuesta: `Puedes rastrear tu pedido desde la sección 'Mis Pedidos'.
        Si hay un problema, contáctanos por chat o correo y te ayudamos
        a resolverlo con el vendedor.`,
      },
      {
        pregunta: "¿Puedo devolver un producto?",
        respuesta: `Sí. FusaShop cuenta con política de devoluciones.
        Tienes hasta 5 días hábiles tras la recepción del producto para
        solicitar una devolución, siempre que el artículo esté en su
        estado original.`,
      },
    ],
  },

  equipo: {
    desarrolladores: [
      "Santiago (Desarrollador Full Stack - Backend Laravel / Frontend Vue.js)",
      "Alba Yadira Nova Sierra (Desarrolladora Full Stack)",
    ],
    asesores: ["Scrum Master del proyecto", "Product Owner del proyecto"],
    universidad: "Universidad de Cundinamarca",
  },
};

export const SYSTEM_PROMPT = `
Eres el asistente virtual oficial de FusaShop, el e-commerce de MiPymes de
Fusagasugá, Colombia. Tu nombre es FusaBot.

REGLAS ESTRICTAS:
1. SOLO responde preguntas relacionadas con FusaShop: productos, vendedores,
   compradores, pagos, soporte, tecnología o el equipo del proyecto.
2. Si el usuario pregunta algo fuera del alcance de FusaShop, responde:
   "Solo puedo ayudarte con temas relacionados con FusaShop. ¿En qué te
   puedo ayudar sobre nuestra plataforma?"
3. Sé amable, claro y conciso. Usa un tono profesional pero cercano.
4. No inventes información. Si no sabes algo, di: "Esa información no está
   disponible en este momento. Te recomiendo contactar a nuestro equipo de
   soporte."
5. Responde siempre en español.

BASE DE CONOCIMIENTO:
${JSON.stringify(FUSASHOP_KNOWLEDGE, null, 2)}
`;
```

---

## ⚙️ Módulo Principal del Chatbot

### `chatbot.js`

```javascript
// chatbot.js
// Módulo principal del chatbot FusaShop usando Gemini API
// Principios: modular, reutilizable, bajo acoplamiento

import { SYSTEM_PROMPT } from './knowledge-base.js';

const GEMINI_API_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/${
    import.meta.env?.VITE_GEMINI_MODEL || 'gemini-2.0-flash'
  }:generateContent`;

const API_KEY = import.meta.env?.VITE_GEMINI_API_KEY || '';

// --- Estado del chat ---
let conversationHistory = [];

// --- Función reutilizable: llamada a la API de Gemini ---
async function callGeminiAPI(userMessage) {
  conversationHistory.push({
    role: 'user',
    parts: [{ text: userMessage }],
  });

  const payload = {
    system_instruction: {
      parts: [{ text: SYSTEM_PROMPT }],
    },
    contents: conversationHistory,
    generationConfig: {
      temperature: 0.3,       // Respuestas más predecibles y fieles a la KB
      maxOutputTokens: 512,
      topP: 0.8,
    },
  };

  const response = await fetch(`${GEMINI_API_URL}?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Error en la API de Gemini: ${response.status}`);
  }

  const data = await response.json();
  const botReply = data.candidates?.[0]?.content?.parts?.[0]?.text
    || 'Lo siento, no pude procesar tu consulta.';

  conversationHistory.push({
    role: 'model',
    parts: [{ text: botReply }],
  });

  return botReply;
}

// --- Función reutilizable: renderizar mensaje en el DOM ---
function renderMessage(container, text, role) {
  const bubble = document.createElement('div');
  bubble.classList.add('chat-bubble', role === 'user' ? 'user-bubble' : 'bot-bubble');
  bubble.textContent = text;
  container.appendChild(bubble);
  container.scrollTop = container.scrollHeight;
}

// --- Función reutilizable: mostrar indicador de escritura ---
function showTypingIndicator(container) {
  const indicator = document.createElement('div');
  indicator.id = 'typing-indicator';
  indicator.classList.add('chat-bubble', 'bot-bubble', 'typing');
  indicator.textContent = 'FusaBot está escribiendo...';
  container.appendChild(indicator);
  container.scrollTop = container.scrollHeight;
  return indicator;
}

// --- Inicializar el widget del chatbot ---
export function initChatbot({ containerId, inputId, sendBtnId }) {
  const container = document.getElementById(containerId);
  const input     = document.getElementById(inputId);
  const sendBtn   = document.getElementById(sendBtnId);

  // Mensaje de bienvenida
  renderMessage(
    container,
    '¡Hola! Soy FusaBot 🛒 el asistente de FusaShop. ¿En qué te puedo ayudar hoy?',
    'bot',
  );

  // Función de envío reutilizable
  async function handleSend() {
    const userText = input.value.trim();
    if (!userText) return;

    input.value = '';
    renderMessage(container, userText, 'user');

    const typingEl = showTypingIndicator(container);

    try {
      const botReply = await callGeminiAPI(userText);
      typingEl.remove();
      renderMessage(container, botReply, 'bot');
    } catch (err) {
      typingEl.remove();
      renderMessage(
        container,
        'Ocurrió un error al conectar con el asistente. Intenta de nuevo.',
        'bot',
      );
      console.error('[FusaBot Error]', err);
    }
  }

  sendBtn.addEventListener('click', handleSend);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleSend(); });
}
```

---

## 🎨 Estilos del Widget

### `chatbot.css`

```css
/* chatbot.css — Widget FusaShop */
:root {
  --fusa-primary: #1a6b3a;      /* Verde FusaShop */
  --fusa-secondary: #1565c0;    /* Azul */
  --fusa-bg: #ffffff;
  --fusa-surface: #f5f9f5;
  --fusa-border: #c8e6c9;
  --fusa-text: #212121;
  --fusa-radius: 12px;
}

.fusabot-widget {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 360px;
  max-height: 520px;
  background: var(--fusa-bg);
  border: 1.5px solid var(--fusa-border);
  border-radius: var(--fusa-radius);
  box-shadow: 0 8px 32px rgba(26,107,58,0.15);
  display: flex;
  flex-direction: column;
  font-family: 'Segoe UI', sans-serif;
  z-index: 9999;
}

.fusabot-header {
  background: var(--fusa-primary);
  color: #fff;
  padding: 14px 18px;
  border-radius: var(--fusa-radius) var(--fusa-radius) 0 0;
  font-weight: 700;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 10px;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: var(--fusa-surface);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.chat-bubble {
  max-width: 80%;
  padding: 10px 14px;
  border-radius: 18px;
  font-size: 0.9rem;
  line-height: 1.5;
}

.user-bubble {
  align-self: flex-end;
  background: var(--fusa-secondary);
  color: #fff;
  border-bottom-right-radius: 4px;
}

.bot-bubble {
  align-self: flex-start;
  background: #e8f5e9;
  color: var(--fusa-text);
  border: 1px solid var(--fusa-border);
  border-bottom-left-radius: 4px;
}

.typing { font-style: italic; opacity: 0.7; }

.chat-input-area {
  display: flex;
  padding: 12px;
  gap: 8px;
  border-top: 1px solid var(--fusa-border);
}

.chat-input-area input {
  flex: 1;
  padding: 10px 14px;
  border: 1.5px solid var(--fusa-border);
  border-radius: 24px;
  outline: none;
  font-size: 0.9rem;
  transition: border-color 0.2s;
}

.chat-input-area input:focus { border-color: var(--fusa-primary); }

.chat-input-area button {
  background: var(--fusa-primary);
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  cursor: pointer;
  font-size: 1.1rem;
  transition: background 0.2s;
}

.chat-input-area button:hover { background: #145230; }
```

---

## 🖼️ HTML del Widget

### `index.html` (fragmento embebible)

```html
<!-- Widget FusaBot — incluir antes de </body> -->
<div class="fusabot-widget" id="fusabot">
  <div class="fusabot-header">
    🛒 FusaBot — Asistente FusaShop
  </div>
  <div class="chat-messages" id="chat-messages"></div>
  <div class="chat-input-area">
    <input
      type="text"
      id="chat-input"
      placeholder="Escribe tu pregunta sobre FusaShop..."
      autocomplete="off"
    />
    <button id="chat-send" aria-label="Enviar">➤</button>
  </div>
</div>

<link rel="stylesheet" href="/chatbot/chatbot.css" />
<script type="module">
  import { initChatbot } from '/chatbot/chatbot.js';
  initChatbot({
    containerId: 'chat-messages',
    inputId:     'chat-input',
    sendBtnId:   'chat-send',
  });
</script>
```

---

## 🔗 Integración en Laravel (Blade)

Para incluir el widget en cualquier vista Blade de FusaShop:

```blade
{{-- resources/views/layouts/app.blade.php --}}
{{-- Al final del <body> --}}
@include('partials.fusabot-widget')
```

```blade
{{-- resources/views/partials/fusabot-widget.blade.php --}}
<div class="fusabot-widget" id="fusabot">
  <div class="fusabot-header">🛒 FusaBot — Asistente FusaShop</div>
  <div class="chat-messages" id="chat-messages"></div>
  <div class="chat-input-area">
    <input type="text" id="chat-input" placeholder="¿En qué te ayudamos?" autocomplete="off" />
    <button id="chat-send">➤</button>
  </div>
</div>

@vite(['resources/js/chatbot.js', 'resources/css/chatbot.css'])
```

> La API Key se carga desde `.env` de Laravel como `VITE_GEMINI_API_KEY` y queda disponible en el frontend via Vite.

---

## 🚀 Guía de la API de Gemini (adaptada para FusaShop)

```bash
# Prueba rápida desde terminal
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=TU_API_KEY" \
  -H 'Content-Type: application/json' \
  -X POST \
  -d '{
    "system_instruction": {
      "parts": [{ "text": "Eres FusaBot, el asistente de FusaShop. Solo responde sobre FusaShop." }]
    },
    "contents": [
      {
        "role": "user",
        "parts": [{ "text": "¿Cómo puedo registrar mi negocio en FusaShop?" }]
      }
    ]
  }'
```

---

## ✅ Checklist de Implementación

- [ ] Crear `.env` con `VITE_GEMINI_API_KEY` real (basado en `.env.example`)
- [ ] Poblar `knowledge-base.js` con datos reales de FusaShop (productos, categorías, políticas)
- [ ] Ajustar `SYSTEM_PROMPT` según el tono de marca de FusaShop
- [ ] Incluir el widget en el layout principal de Laravel (`app.blade.php`)
- [ ] Probar el chatbot con las preguntas del FAQ
- [ ] Validar que rechaza preguntas fuera del scope de FusaShop
- [ ] Agregar `.env` al `.gitignore`
- [ ] Documentar la KB en el README del repositorio

---

## 📌 Notas Finales

- **Escalabilidad**: La base de conocimiento (`knowledge-base.js`) es independiente del motor de IA. Si en el futuro se cambia de Gemini a otra API, solo se modifica `chatbot.js`.
- **Privacidad**: No se almacenan conversaciones en servidores externos. El historial vive en memoria del navegador y se reinicia al recargar la página.
- **Cumplimiento**: El chatbot no recopila datos personales, alineado con la Ley 1581 de 2012.
- **Mantenimiento**: Para actualizar el conocimiento del bot, editar únicamente `knowledge-base.js`.
