// knowledge-base.js
// Base de conocimiento exclusiva de FusaShop
// Actualizar este archivo para ampliar el conocimiento del chatbot.

export const FUSASHOP_KNOWLEDGE = {
  general: {
    nombre: 'FusaShop',
    descripcion: `FusaShop es una plataforma e-commerce diseñada para fortalecer
    las MiPymes (micro, pequeñas y medianas empresas) de Fusagasugá, Colombia.
    Permite a los comerciantes locales vender sus productos en línea de forma
    fácil, segura y accesible.`,
    ciudad: 'Fusagasugá, Cundinamarca, Colombia',
    mision: `Digitalizar y empoderar el comercio local de Fusagasugá,
    conectando a los pequeños empresarios con compradores de la región
    y del país mediante tecnología moderna y accesible.`,
  },

  tecnologia: {
    backend: 'Laravel 12',
    frontend: 'Vue.js 3 con Tailwind CSS',
    baseDatos: 'MySQL 8.0',
    gestionProyecto: 'Jira (metodología Scrum)',
    pasarelaPago: ['PayU', 'Nequi', 'Daviplata'],
    chatTiempoReal: 'Laravel Echo + Pusher',
    privacidad: 'Cumplimiento con Ley 1581 de 2012 (Colombia)',
  },

  funcionalidades: [
    'Registro y gestión de vendedores MiPymes',
    'Catálogo de productos con categorías y filtros',
    'Carrito de compras y proceso de checkout',
    'Pasarela de pago con PayU, Nequi y Daviplata',
    'Panel de administración para vendedores',
    'Gestión de pedidos y seguimiento',
    'Chat en tiempo real entre compradores y vendedores',
    'Sistema de reseñas y calificaciones',
    'Notificaciones de estado de pedido',
    'Política de cookies conforme a la Ley 1581 de 2012',
  ],

  vendedores: {
    requisitos: [
      'Ser una MiPyme registrada en Fusagasugá o municipios cercanos',
      'Tener RUT o documento de identidad vigente',
      'Aceptar los términos y condiciones de FusaShop',
    ],
    beneficios: [
      'Vitrina digital sin necesidad de conocimientos técnicos',
      'Acceso a compradores locales y nacionales',
      'Gestión de inventario en tiempo real',
      'Soporte técnico incluido',
    ],
  },

  compradores: {
    proceso_compra: [
      '1. Buscar productos por categoría o nombre',
      '2. Agregar al carrito de compras',
      '3. Registrarse o iniciar sesión',
      '4. Seleccionar método de pago (PayU, Nequi o Daviplata)',
      '5. Confirmar el pedido y recibir confirmación por correo',
    ],
    medios_pago: ['PayU (tarjetas débito/crédito, PSE)', 'Nequi', 'Daviplata'],
    seguridad: 'Todas las transacciones están protegidas con cifrado SSL.',
  },

  soporte: {
    canales: ['Chat en la plataforma', 'Correo electrónico', 'WhatsApp Business'],
    horario: 'Lunes a viernes de 8:00 AM a 6:00 PM (hora Colombia)',
    faq: [
      {
        pregunta: '¿Cómo registro mi negocio en FusaShop?',
        respuesta: `Ingresa a la plataforma, haz clic en 'Vende con nosotros',
        completa el formulario con los datos de tu negocio y espera la
        verificación de nuestro equipo (24-48 horas hábiles).`,
      },
      {
        pregunta: '¿Cuánto cobra FusaShop por vender?',
        respuesta: `FusaShop aplica una comisión por transacción exitosa.
        Consulta la sección de tarifas en la plataforma para conocer
        el porcentaje actualizado según tu categoría de producto.`,
      },
      {
        pregunta: '¿Qué hago si mi pedido no llega?',
        respuesta: `Puedes rastrear tu pedido desde la sección 'Mis Pedidos'.
        Si hay un problema, contáctanos por chat o correo y te ayudamos
        a resolverlo con el vendedor.`,
      },
      {
        pregunta: '¿Puedo devolver un producto?',
        respuesta: `Sí. FusaShop cuenta con política de devoluciones.
        Tienes hasta 5 días hábiles tras la recepción del producto para
        solicitar una devolución, siempre que el artículo esté en su
        estado original.`,
      },
    ],
  },

  equipo: {
    desarrolladores: [
      'Santiago (Desarrollador Full Stack - Backend Laravel / Frontend Vue.js)',
      'Alba Yadira Nova Sierra (Desarrolladora Full Stack)',
    ],
    asesores: ['Scrum Master del proyecto', 'Product Owner del proyecto'],
    universidad: 'Universidad de Cundinamarca',
  },
};

/** Texto compacto para el prompt (menos tokens que JSON completo → menos 429 por cuota). */
function knowledgeToPromptText(k) {
  const faq = k.soporte.faq.map((f) => `- ${f.pregunta} → ${f.respuesta.replace(/\s+/g, ' ')}`).join('\n');
  return [
    `GENERAL: ${k.general.nombre}. ${k.general.descripcion.replace(/\s+/g, ' ')}`,
    `Ciudad: ${k.general.ciudad}. Misión: ${k.general.mision.replace(/\s+/g, ' ')}`,
    `TECNOLOGÍA: backend ${k.tecnologia.backend}; frontend ${k.tecnologia.frontend}; BD ${k.tecnologia.baseDatos}; proyecto ${k.tecnologia.gestionProyecto}; pagos ${k.tecnologia.pasarelaPago.join(', ')}; chat ${k.tecnologia.chatTiempoReal}; ${k.tecnologia.privacidad}`,
    `FUNCIONALIDADES: ${k.funcionalidades.join('; ')}`,
    `VENDEDORES requisitos: ${k.vendedores.requisitos.join('; ')}. Beneficios: ${k.vendedores.beneficios.join('; ')}`,
    `COMPRADORES proceso: ${k.compradores.proceso_compra.join(' ')}. Pagos: ${k.compradores.medios_pago.join(', ')}. ${k.compradores.seguridad}`,
    `SOPORTE: ${k.soporte.canales.join(', ')}. Horario: ${k.soporte.horario}`,
    `FAQ:\n${faq}`,
    `EQUIPO dev: ${k.equipo.desarrolladores.join('; ')}. Asesores: ${k.equipo.asesores.join(', ')}. ${k.equipo.universidad}`,
  ].join('\n');
}

export const SYSTEM_PROMPT = `
Eres FusaBot, el asistente oficial de FusaShop (Fusagasugá, Colombia).

REGLAS DE ORO PARA TUS RESPUESTAS:
1. BREVEDAD: Tus respuestas deben ser cortas, concisas y directas. No uses más de 2 o 3 oraciones por respuesta.
2. IDENTIDAD: Habla siempre como parte de la empresa. Usa frases como "Aquí en FusaShop...", "Nuestra plataforma le ofrece...", "Como asistente de FusaShop...".
3. ENFOQUE: Solo respondes sobre FusaShop (productos, pagos, vendedores de Fusagasugá, tecnología).
4. NO ALUCINAR: Si no sabes algo, remite al soporte oficial de FusaShop.
5. IDIOMA: Responde siempre en español.

BASE DE CONOCIMIENTO (Usa esto para responder):
${knowledgeToPromptText(FUSASHOP_KNOWLEDGE)}
`;
