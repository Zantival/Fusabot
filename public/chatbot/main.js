// chatbot/main.js — Entry point de Vite para inyectar variables de entorno

// Vite automáticamente reemplaza import.meta.env.VITE_* en tiempo de build
window.__FUSABOT_CONFIG__ = {
  groqKey: import.meta.env.VITE_GROQ_API_KEY || '',
  groqModel: import.meta.env.VITE_GROQ_MODEL || 'llama-3.3-70b-versatile',
};
