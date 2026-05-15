// chatbot.js — FusaBot con Groq (API compatible con OpenAI)
// https://console.groq.com/keys

import { SYSTEM_PROMPT } from './knowledge-base.js';

// Variable para almacenar el idioma detectado en la conversación
let detectedLanguage = 'es';

function runtimeConfig() {
  return typeof window !== 'undefined' && window.__FUSABOT_CONFIG__
    ? window.__FUSABOT_CONFIG__
    : {};
}

/** Detecta si el mensaje está en español o inglés */
function detectLanguage(text) {
  const spanishWords = /\b(hola|buenos|qué|cómo|para|pero|porque|puedo|puede|quiero|necesito|gracias|por favor|sí|no|el|la|de|que|y|es|en|un|una|me|te|se|le|nos|os|les|mi|tu|su|nuestro|vuestro|este|ese|aquello|yo|tú|él|nosotros|vosotros|ellos|ella|nosotras|vosotras|ellas|este|ese|aquel|estoy|estás|está|estamos|estáis|están|soy|eres|es|somos|sois|son|tengo|tienes|tiene|tenemos|tenéis|tienen|voy|vas|va|vamos|vais|van|debo|debes|debe|debemos|debéis|deben|puedo|puedes|puede|podemos|podéis|pueden|quiero|quieres|quiere|queremos|queréis|quieren|siento|sientes|siente|sentimos|sentís|sienten|pienso|piensas|piensa|pensamos|pensáis|piensan|miro|miras|mira|miramos|miráis|miran|hablo|hablas|habla|hablamos|habláis|hablan|compro|compras|compra|compramos|compráis|compran|vendo|vendes|vende|vendemos|vendéis|venden|llamo|llamas|llama|llamamos|llamáis|llaman|siento|sientes|siente|sentimos|sentís|sienten)\b/gi;
  const englishWords = /\b(hello|hi|how|what|why|when|where|who|which|can|could|would|should|may|might|must|shall|will|do|does|did|done|have|has|had|am|is|are|was|were|be|been|being|a|an|the|and|or|but|in|on|at|to|from|of|with|by|for|about|as|if|so|than|that|this|these|those|not|no|yes|me|you|him|her|us|them|my|your|his|her|our|their|its|i|we|they|she|it|they|please|thank|thanks|thanks|thanks|help|need|want|buy|sell|product|price|payment|support|order|shop|store|business|customer|vendor|seller|help|question|problem|issue)\b/gi;
  
  const spanishMatches = (text.match(spanishWords) || []).length;
  const englishMatches = (text.match(englishWords) || []).length;
  
  return englishMatches > spanishMatches ? 'en' : 'es';
}

function viteEnv(key) {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    return String(import.meta.env[key]).trim();
  }
  return '';
}

function isPlaceholderKey(key) {
  if (!key || typeof key !== 'string') return true;
  const k = key.trim();
  if (k.length < 8) return true;
  if (/^YOUR_/i.test(k)) return true;
  if (/placeholder|TU_API|AQUI|example/i.test(k)) return true;
  return false;
}

/** Clave Groq: solo `VITE_GROQ_API_KEY` (Vite) o `window.__FUSABOT_CONFIG__.groqKey`. */
function groqApiKey() {
  const fromVite = viteEnv('VITE_GROQ_API_KEY');
  const cfg = runtimeConfig();
  const fromWindow = (cfg.groqKey || '').trim();
  const key = fromVite || fromWindow;
  return isPlaceholderKey(key) ? '' : key;
}

function groqModelPreferred() {
  const fromVite = viteEnv('VITE_GROQ_MODEL');
  const cfg = runtimeConfig();
  return (fromVite || cfg.groqModel || 'llama-3.3-70b-versatile').trim();
}

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const FALLBACK_MODELS = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'llama-3.1-70b-versatile'];

function modelsToTry() {
  const preferred = groqModelPreferred();
  const list = [preferred, ...FALLBACK_MODELS.filter((m) => m !== preferred)];
  return [...new Set(list)];
}

/** Historial solo user/assistant (el system va aparte en cada request). */
let conversationHistory = [];

function buildMessages() {
  let systemPrompt = SYSTEM_PROMPT;
  
  // Ajustar el idioma de respuesta en el system prompt basado en el idioma detectado
  if (detectedLanguage === 'en') {
    systemPrompt = systemPrompt.replace(
      'IDIOMA: Responde siempre en español.',
      'LANGUAGE: Always respond in English.'
    );
    // Si es inglés, traducir también las reglas iniciales
    systemPrompt = systemPrompt.replace(
      "Eres FusaBot, el asistente oficial de FusaShop (Fusagasugá, Colombia).\n\nREGLAS DE ORO PARA TUS RESPUESTAS:",
      "You are FusaBot, the official assistant of FusaShop (Fusagasugá, Colombia).\n\nGOLDEN RULES FOR YOUR RESPONSES:"
    );
    systemPrompt = systemPrompt.replace(
      '1. BREVEDAD: Tus respuestas deben ser cortas, concisas y directas. No uses más de 2 o 3 oraciones por respuesta.',
      '1. BREVITY: Your answers should be short, concise and direct. Do not use more than 2 or 3 sentences per answer.'
    );
    systemPrompt = systemPrompt.replace(
      '2. IDENTIDAD: Habla siempre como parte de la empresa. Usa frases como "Aquí en FusaShop...", "Nuestra plataforma le ofrece...", "Como asistente de FusaShop...".',
      '2. IDENTITY: Always speak as part of the company. Use phrases like "Here at FusaShop...", "Our platform offers you...", "As FusaShop assistant...".'
    );
    systemPrompt = systemPrompt.replace(
      '3. ENFOQUE: Solo respondes sobre FusaShop (productos, pagos, vendedores de Fusagasugá, tecnología).',
      '3. FOCUS: You only answer about FusaShop (products, payments, sellers from Fusagasugá, technology).'
    );
    systemPrompt = systemPrompt.replace(
      '4. NO ALUCINAR: Si no sabes algo, remite al soporte oficial de FusaShop.',
      '4. DO NOT HALLUCINATE: If you don\'t know something, refer to FusaShop official support.'
    );
  }
  
  return [{ role: 'system', content: systemPrompt }, ...conversationHistory];
}

async function callGroq(model) {
  const key = groqApiKey();
  const messages = buildMessages();

  let res;
  try {
    res = await fetch(GROQ_URL, {
      method: 'POST',
      mode: 'cors',
      credentials: 'omit',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.3,
        max_tokens: 512,
        top_p: 0.85,
      }),
    });
  } catch (e) {
    const name = e && e.name;
    const msg = e && e.message;
    if (name === 'TypeError' || /Failed to fetch|NetworkError|Load failed/i.test(String(msg))) {
      const errorMsg = detectedLanguage === 'en'
        ? 'No connection to Groq (Failed to fetch). Check: internet, blockers, VPN, or that the page is served via http(s) with a local server (do not open HTML as file://). On restrictive networks use a proxy in your backend.'
        : 'Sin conexión a Groq (Failed to fetch). Revisa: internet, bloqueadores, VPN, o que la página se sirva por http(s) con un servidor local (no abras el HTML como file://). En redes restrictivas usa un proxy en tu backend.';
      throw new Error(errorMsg);
    }
    throw e;
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errMsg = data?.error?.message || res.statusText || 'Error desconocido';
    throw new Error(`Groq ${res.status}: ${errMsg}`);
  }

  const text = data.choices?.[0]?.message?.content;
  if (!text || !String(text).trim()) {
    console.error('[FusaBot] Respuesta vacía:', data);
    const errMsg = detectedLanguage === 'en' ? 'Groq did not return usable text.' : 'Groq no devolvió texto usable.';
    throw new Error(errMsg);
  }
  return String(text).trim();
}

async function callAssistant(userMessage) {
  const key = groqApiKey();
  if (!key) {
    const errorMsg = detectedLanguage === 'en'
      ? 'Missing Groq API key. Place your gsk_… key in window.__FUSABOT_CONFIG__.groqKey (HTML) or in VITE_GROQ_API_KEY (.env with Vite).'
      : 'Falta la API key de Groq. Pon tu clave gsk_… en window.__FUSABOT_CONFIG__.groqKey (HTML) o en VITE_GROQ_API_KEY (.env con Vite).';
    throw new Error(errorMsg);
  }

  // Detectar el idioma del mensaje del usuario
  detectedLanguage = detectLanguage(userMessage);

  conversationHistory.push({ role: 'user', content: userMessage });
  if (conversationHistory.length > 16) {
    conversationHistory = conversationHistory.slice(-16);
  }

  let lastErr;
  for (const model of modelsToTry()) {
    try {
      const reply = await callGroq(model);
      conversationHistory.push({ role: 'assistant', content: reply });
      return reply;
    } catch (err) {
      lastErr = err;
      const m = err instanceof Error ? err.message : String(err);
      if (/Groq 429|rate limit|quota/i.test(m)) continue;
      if (/Groq 40[04]/.test(m) && /model/i.test(m)) continue;
      break;
    }
  }

  conversationHistory.pop();
  const lastErrMsg = lastErr instanceof Error ? lastErr.message : 'Could not get response from Groq.';
  throw lastErr || new Error(detectedLanguage === 'en' ? lastErrMsg : 'No se pudo obtener respuesta de Groq.');
}

function renderMessage(container, text, role) {
  const bubble = document.createElement('div');
  bubble.classList.add('chat-bubble', role === 'user' ? 'user-bubble' : 'bot-bubble');
  bubble.textContent = text;
  container.appendChild(bubble);
  container.scrollTop = container.scrollHeight;
}

function showTypingIndicator(container) {
  const indicator = document.createElement('div');
  indicator.id = 'typing-indicator';
  indicator.classList.add('chat-bubble', 'bot-bubble', 'typing');
  const text = detectedLanguage === 'en' ? 'FusaBot is typing...' : 'FusaBot está escribiendo...';
  indicator.textContent = text;
  container.appendChild(indicator);
  container.scrollTop = container.scrollHeight;
  return indicator;
}

export function initChatbot({ containerId, inputId, sendBtnId }) {
  const container = document.getElementById(containerId);
  const input = document.getElementById(inputId);
  const sendBtn = document.getElementById(sendBtnId);

  if (!container || !input || !sendBtn) {
    console.error('[FusaBot] No se encontraron elementos del DOM.');
    return;
  }

  if (container.children.length === 0) {
    const welcomeMsg = detectedLanguage === 'en'
      ? '👋 Hi! I\'m FusaBot 🛒, FusaShop\'s assistant. How can I help you today?'
      : '¡Hola! Soy FusaBot 🛒 el asistente de FusaShop. ¿En qué te puedo ayudar hoy?';
    renderMessage(container, welcomeMsg, 'bot');
  }

  async function handleSend() {
    const userText = input.value.trim();
    if (!userText) return;

    input.value = '';
    renderMessage(container, userText, 'user');

    const typingEl = showTypingIndicator(container);

    try {
      const botReply = await callAssistant(userText);
      typingEl.remove();
      renderMessage(container, botReply, 'bot');
    } catch (err) {
      typingEl.remove();
      const hint = err instanceof Error ? err.message : 'Error desconocido';
      const prefix = detectedLanguage === 'en'
        ? 'Could not connect with the assistant. '
        : 'No pude conectar con el asistente. ';
      renderMessage(
        container,
        `${prefix}${hint}`,
        'bot',
      );
      console.error('[FusaBot Error]', err);
    }
  }

  sendBtn.addEventListener('click', handleSend);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  });
}
