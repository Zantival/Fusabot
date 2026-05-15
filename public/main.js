// main.js — Entry point de Vite para inyectar variables de entorno

// Inyectar las variables en window.__FUSABOT_CONFIG__
window.__FUSABOT_CONFIG__ = {
  groqKey: import.meta.env.VITE_GROQ_API_KEY || '',
  groqModel: import.meta.env.VITE_GROQ_MODEL || 'llama-3.3-70b-versatile',
};
