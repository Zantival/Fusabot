// main.js — Inyectar configuración de Groq

// Vite reemplaza __VITE_GROQ_API_KEY__ y __VITE_GROQ_MODEL__ en tiempo de build
window.__FUSABOT_CONFIG__ = {
  groqKey: __VITE_GROQ_API_KEY__,
  groqModel: __VITE_GROQ_MODEL__
};
// Importar e inicializar el chatbot cuando el DOM esté listo
import { initChatbot } from '/chatbot/chatbot.js';

// Funcionalidad para mostrar/ocultar el widget del chatbot
document.addEventListener('DOMContentLoaded', () => {
  // Inicializar el chatbot
  initChatbot({
    containerId: 'chat-messages',
    inputId: 'chat-input',
    sendBtnId: 'chat-send',
  });

  // Elementos del chatbot
  const chatbotWidget = document.getElementById('fusabot-widget');
  const chatButtons = document.querySelectorAll('a[href="#fusabot"]');
  let isOpen = false;

  // Establecer estado inicial: el chatbot empieza oculto
  if (chatbotWidget) {
    chatbotWidget.classList.add('hidden');
  }

  // Agregar listeners a todos los botones que enlazan a #fusabot
  chatButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      toggleChatbot();
    });
  });

  // Función para alternar la visibilidad del chatbot
  function toggleChatbot() {
    isOpen = !isOpen;
    if (chatbotWidget) {
      if (isOpen) {
        chatbotWidget.classList.remove('hidden');
        chatbotWidget.classList.add('visible');
        // Enfocar el input para mejor UX
        const input = document.getElementById('chat-input');
        if (input) input.focus();
      } else {
        chatbotWidget.classList.remove('visible');
        chatbotWidget.classList.add('hidden');
      }
    }
  }

  // Cerrar el chatbot si se presiona Escape y está abierto
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) {
      toggleChatbot();
    }
  });
});