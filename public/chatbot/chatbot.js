// chatbot.js — FusaBot con Groq (API compatible con OpenAI)
// https://console.groq.com/keys

import { SYSTEM_PROMPT } from './knowledge-base.js';

function runtimeConfig() {
  return typeof window !== 'undefined' && window.__FUSABOT_CONFIG__
    ? window.__FUSABOT_CONFIG__
    : {};
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
  return [{ role: 'system', content: SYSTEM_PROMPT }, ...conversationHistory];
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
      throw new Error(
        'Sin conexión a Groq (Failed to fetch). Revisa: internet, bloqueadores, VPN, o que la página se sirva por http(s) con un servidor local (no abras el HTML como file://). En redes restrictivas usa un proxy en tu backend.',
      );
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
    throw new Error('Groq no devolvió texto usable.');
  }
  return String(text).trim();
}

async function callAssistant(userMessage) {
  const key = groqApiKey();
  if (!key) {
    throw new Error(
      'Falta la API key de Groq. Pon tu clave gsk_… en window.__FUSABOT_CONFIG__.groqKey (HTML) o en VITE_GROQ_API_KEY (.env con Vite).',
    );
  }

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
  throw lastErr || new Error('No se pudo obtener respuesta de Groq.');
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
  indicator.textContent = 'FusaBot está escribiendo...';
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
    renderMessage(
      container,
      '¡Hola! Soy FusaBot 🛒 el asistente de FusaShop. ¿En qué te puedo ayudar hoy?',
      'bot',
    );
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
      renderMessage(
        container,
        `No pude conectar con el asistente. ${hint}`,
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
