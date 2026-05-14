// chatbot.js
// Módulo principal del chatbot FusaShop usando Gemini API y Groq API
// Principios: modular, reutilizable, bajo acoplamiento

import { SYSTEM_PROMPT } from './knowledge-base.js';

function env(key) {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key];
  }
  return '';
}

function runtimeConfig() {
  return typeof window !== 'undefined' && window.__FUSABOT_CONFIG__
    ? window.__FUSABOT_CONFIG__
    : {};
}

/** Configuración de APIs */
const GEMINI_API_KEY = env('VITE_GEMINI_API_KEY') || runtimeConfig().geminiKey || runtimeConfig().apiKey || '';
const GROQ_API_KEY = env('VITE_GROQ_API_KEY') || runtimeConfig().groqKey || '';

const GEMINI_MODELS = ['gemini-1.5-flash', 'gemini-2.0-flash-001'];
const GROQ_MODELS = ['llama-3.3-70b-versatile', 'llama3-8b-8192', 'mixtral-8x7b-32768'];

/** Historial de conversación (Formato neutro: { role: 'user'|'assistant', content: string }) */
let conversationHistory = [];

/**
 * Llama a la API de Gemini
 */
async function callGemini(model, history) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
  
  // Convertir historial al formato Gemini
  const contents = history.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }));

  const payload = {
    system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents,
    generationConfig: { temperature: 0.3, maxOutputTokens: 512, topP: 0.8 },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || 'Error en Gemini');

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini no devolvió texto');
  return text;
}

/**
 * Llama a la API de Groq (OpenAI compatible)
 */
async function callGroq(model, history) {
  const url = 'https://api.groq.com/openai/v1/chat/completions';
  
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history
  ];

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.3,
      max_tokens: 512,
      top_p: 0.8
    }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || 'Error en Groq');

  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('Groq no devolvió texto');
  return text;
}

/**
 * Función principal para obtener respuesta de la IA
 */
async function callAI(userMessage) {
  if (!GEMINI_API_KEY && !GROQ_API_KEY) {
    throw new Error('No se encontró ninguna API Key (Gemini o Groq).');
  }

  // Agregar mensaje del usuario al historial
  conversationHistory.push({ role: 'user', content: userMessage });

  // Limitar historial
  if (conversationHistory.length > 8) {
    conversationHistory = conversationHistory.slice(conversationHistory.length - 8);
  }

  let lastError = null;

  // 1. Intentar con Groq primero (si está disponible) porque es más rápido y tiene menos límites de cuota que el tier gratuito de Gemini
  if (GROQ_API_KEY) {
    for (const model of GROQ_MODELS) {
      try {
        console.log(`[FusaBot] Intentando con Groq (${model})...`);
        const reply = await callGroq(model, conversationHistory);
        conversationHistory.push({ role: 'assistant', content: reply });
        return reply;
      } catch (err) {
        console.warn(`[FusaBot] Error en Groq (${model}):`, err.message);
        lastError = err;
        if (err.message.includes('limit') || err.message.includes('429')) continue;
        break; // Si es un error distinto a cuota, quizás mejor parar o probar el siguiente provider
      }
    }
  }

  // 2. Intentar con Gemini como respaldo
  if (GEMINI_API_KEY) {
    for (const model of [env('VITE_GEMINI_MODEL') || 'gemini-1.5-flash', ...GEMINI_MODELS]) {
      try {
        console.log(`[FusaBot] Intentando con Gemini (${model})...`);
        const reply = await callGemini(model, conversationHistory);
        conversationHistory.push({ role: 'assistant', content: reply });
        return reply;
      } catch (err) {
        console.warn(`[FusaBot] Error en Gemini (${model}):`, err.message);
        lastError = err;
        continue;
      }
    }
  }

  // Si llegamos aquí, todo falló
  conversationHistory.pop(); // Quitar el mensaje del usuario que no pudo ser procesado
  throw lastError || new Error('No se pudo obtener respuesta de ningún servicio de IA.');
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

  // Mensaje de bienvenida si el contenedor está vacío
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
      const botReply = await callAI(userText);
      typingEl.remove();
      renderMessage(container, botReply, 'bot');
    } catch (err) {
      typingEl.remove();
      const hint = err.message || 'Error desconocido';
      renderMessage(
        container,
        `Lo siento, tengo problemas para responder en este momento. (${hint})`,
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
