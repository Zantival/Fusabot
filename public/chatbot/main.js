// chatbot/main.js — Inyectar configuración de Groq

// Vite reemplaza __VITE_GROQ_API_KEY__ y __VITE_GROQ_MODEL__ en tiempo de build
window.__FUSABOT_CONFIG__ = {
  groqKey: __VITE_GROQ_API_KEY__,
  groqModel: __VITE_GROQ_MODEL__
};
