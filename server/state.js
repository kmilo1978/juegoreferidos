/**
 * SERVIDOR BACKEND DEMO - SISTEMA DE FIDELIZACIÓN, SELLOS Y CUPONES
 * Servidor API REST ultraligero con 0 dependencias externas.
 * Ejecutar con: bun server/index.js  (o: node server/index.js)
 */

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3001;
const DB_FILE = path.join(__dirname, "db.json");

// CONFIGURACIÓN POR DEFECTO PARA EL NEGOCIO (WHITE-LABEL TOTAL)

const DEFAULT_TABLES = Array.from({ length: 10 }, (_, i) => {
  const num = i + 1;
  const zone = num <= 4 ? "Salón Principal" : num <= 7 ? "Terraza Jardín" : "Zona VIP";
  const capacity = num === 10 ? 8 : num >= 7 ? 6 : 4;
  return {
    id: `mesa-${num}`,
    number: num,
    name: `Mesa ${num}`,
    zone,
    capacity,
    status: num === 3 ? "PREMIO_PENDIENTE" : num === 1 ? "JUGANDO" : "DISPONIBLE",
    currentCustomer: num === 3 ? "Carlos Andrés" : num === 1 ? "Invitado en Mesa" : null,
    currentWhatsapp: num === 3 ? "573009876543" : null,
    activeSessionId: num === 3 ? "SES-M3-8492" : num === 1 ? "SES-M1-1024" : null,
    prizeWon: num === 3 ? "Postre Artesanal de Cortesía" : null,
    uniqueCode: num === 3 ? "REST-8492" : null,
    startedAt: num === 3 ? "Hace 15 min" : num === 1 ? "Hace 4 min" : null,
    lastActivityAt: num === 3 ? "Hace 2 min" : num === 1 ? "Ahora" : null,
    qrUrl: `http://localhost:5173/?mesa=${num}`,
  };
});

const DEFAULT_SETTINGS = {
  brand: {
    name: "Bliss Soul Bakery & Café",
    tagline: "Sabores inolvidables, momentos que alegran el día.",
    taglineEn: "Unforgettable flavors, moments that brighten your day.",
    logoUrl: "/src/assets/logo-header.png",
    emblemUrl: "/src/assets/emblema-dorado.png",
    currency: "COP",
    primaryColor: "#a27e2c",
    backgroundColor: "#fcfaf7",
  },
  channels: {
    instagramHandle: "@blisssoulbakery",
    enableWhatsAppPhoto: true,
    whatsappNumber: "573022777295",
    whatsappPhotoMessage: "¡Hola! 📸 Aquí les comparto la foto de mi pedido en la mesa {tableNumber} (Cliente: {participantName}) para validar mi visita y jugar en la Ruleta de Premios.",
    googleMapsReviewUrl: "https://maps.google.com",
  },
  prizes: [
    { id: "p1", name: "10% de Descuento", value: "10%", probability: 30, color: "#a27e2c", active: true },
    { id: "p2", name: "15% de Descuento", value: "15%", probability: 20, color: "#fcfaf7", active: true },
    { id: "p3", name: "Café de Especialidad Gratis", value: "Café", probability: 20, color: "#d1b374", active: true },
    { id: "p4", name: "Postre Artesanal Gratis", value: "Postre", probability: 15, color: "#24201d", active: true },
    { id: "p5", name: "Bono Dulce Sorpresa", value: "Sorpresa", probability: 10, color: "#8c6b22", active: true },
    { id: "p6", name: "Cena Especial para 2", value: "Cena 2P", probability: 5, color: "#594314", active: true },
  ],
  stamps: {
    visitIcon: "☕",
    milestones: [
      { stamp: 5, title: "🎁 Premio Sello 5: Porción de Torta Artesanal", description: "Cualquier porción de la vitrina pastelera de la casa por tus 5 visitas.", icon: "🍰", category: "postre" },
      { stamp: 10, title: "👑 Premio Sello 10: Brunch Completo de Autor", description: "Plato de brunch o especialidad a elección con bebida de autor por tus 10 visitas.", icon: "👑", category: "vip" },
      { stamp: 15, title: "🌟 Gran Premio Sello 15: Menú Degustación para 2", description: "Experiencia gastronómica VIP de autor para 2 personas con atención de la casa.", icon: "🌟", category: "vip" },
    ],
  },
  gameConfig: {
    gameMode: "hybrid", // "roulette" | "precision" | "hybrid" | "stamps"
    precisionTarget: 10.0,
    precisionDifficulty: "medio", // "facil" | "medio" | "dificil"
    toleranceMs: 40,
    maxAttempts: 3,
    validationChannel: "both", // "both" | "instagram" | "whatsapp"
    reviewTiming: "after_game",
  },
  secondChance: {
    enabled: true,
    prizeName: "Postre Artesanal de Autor Gratis",
    prizeDescription: "Una porción de nuestra Tarta Vasca artesanal del día",
    prizeValue: "$18.000 COP",
    claimTerms: "Válido hoy en caja presentando tu código único de ganador.",
    prizeImageUrl: "/src/assets/tarta-vasca.jpg",
    prizeImageSize: "medium", // "small" | "medium" | "large"
    maxAttempts: 3,
    difficulty: "medio",
    toleranceMs: 40,
    shareChannels: ["instagram", "whatsapp"], // canales disponibles para compartir
    whatsappStatusText: "¡Disfrutando de una tarde increíble en Bliss Soul Bakery & Café! ☕🍰 Les recomiendo probar sus postres artesanales. 10/10 ✨",
    whatsappVerificationMessage: "¡Hola! 📸 Te comparto mi captura de estado para participar en la 2ª oportunidad del Reto de Precisión en {restaurante}. Mesa {tableNumber} - Cliente: {participantName}",
  },
  missions: [
    {
      id: "m_tiktok",
      category: "Creación de Contenido",
      title: "Video o Reel en TikTok",
      rewardStamps: 3,
      rewardText: "+3 Sellos de Visita",
      badge: "VIRAL",
      icon: "🎵",
      description: "Comparte un video corto disfrutando tu café o postre favorito de Bliss Soul.",
      rules: [
        "Publica un video público en TikTok.",
        "Menciona a @blisssoulbakery en la descripción o usa la etiqueta de ubicación.",
        "Muestra tu experiencia real con el producto o en el local.",
        "Mantén el video público de forma permanente."
      ],
      actionUrl: "https://www.tiktok.com",
      evidencePlaceholder: "https://www.tiktok.com/@tu_usuario/video/...",
      active: true,
    },
    {
      id: "m_trustpilot",
      category: "Reseñas de Confianza",
      title: "Reseña en Trustpilot",
      rewardStamps: 2,
      rewardText: "+2 Sellos de Visita",
      badge: "AUTORIDAD",
      icon: "⭐",
      description: "Comparte tu experiencia sincera sobre el servicio y la calidad de nuestra repostería.",
      rules: [
        "Escribe una reseña honesta en nuestra página de Trustpilot.",
        "Menciona tu producto favorito y cómo fue tu atención.",
        "Pega el enlace directo a tu reseña publicada."
      ],
      actionUrl: "https://www.trustpilot.com",
      evidencePlaceholder: "https://www.trustpilot.com/reviews/...",
      active: true,
    },
    {
      id: "m_facebook",
      category: "Comunidad y Familia",
      title: "Recomendación en Facebook",
      rewardStamps: 1,
      rewardText: "+1 Sello de Visita",
      badge: "COMUNIDAD",
      icon: "👥",
      description: "Recomienda nuestra página oficial o haz check-in en el local con una foto.",
      rules: [
        "Deja una recomendación positiva en la Fanpage oficial de Facebook o haz check-in.",
        "Comparte una foto de tu postre o pedido.",
        "Asegúrate de que la publicación esté en modo público."
      ],
      actionUrl: "https://www.facebook.com",
      evidencePlaceholder: "https://www.facebook.com/tu_publicacion/...",
      active: true,
    },
    {
      id: "m_whatsapp_status",
      category: "Boca a Boca Directo",
      title: "Estados de WhatsApp",
      rewardStamps: 1,
      rewardText: "+1 Sello de Visita",
      badge: "WHATSAPP",
      icon: "💬",
      description: "Sube una foto de tu pedido a tus Estados de WhatsApp recomendando el local.",
      rules: [
        "Publica una foto de tu postre o café en tus Estados de WhatsApp.",
        "Escribe una frase recomendando a Bliss Soul Bakery.",
        "Envía el enlace o confirmación de tu estado."
      ],
      actionUrl: "https://api.whatsapp.com",
      evidencePlaceholder: "https://wa.me/... o confirmación",
      active: true,
    },
    {
      id: "m_referrals",
      category: "Embajador de la Casa",
      title: "Invitar a 3 Amigos por WhatsApp",
      rewardStamps: 3,
      rewardText: "+3 Sellos de Visita",
      badge: "VIRAL BOCA A BOCA",
      icon: "🤝",
      description: "Comparte tu enlace de invitación con 3 amigos o en un grupo de WhatsApp recomendando visitarnos.",
      rules: [
        "Toca el botón 'Abrir WhatsApp' y reenvía la invitación con tu código a 3 amigos.",
        "Tus amigos recibirán cortesía sorpresa en mesa cuando nos visiten.",
        "Pega tu número o confirmación para validar tus sellos y clasificar a la Cena para 2.",
      ],
      actionUrl: "https://api.whatsapp.com",
      evidencePlaceholder: "Confirmación de envío o nombres de tus invitados",
      active: true,
    },
    {
      id: "m_whatsapp_community",
      category: "Comunidad Exclusiva",
      title: "Unirse a la Comunidad VIP de WhatsApp",
      rewardStamps: 2,
      rewardText: "+2 Sellos de Visita",
      badge: "CLUB PRIVADO",
      icon: "💬",
      description: "Únete a nuestro grupo oficial y exclusivo de WhatsApp para recibir ofertas secretas de repostería, lanzamientos de temporada y catas privadas.",
      rules: [
        "Toca el botón 'Abrir WhatsApp' y únete al grupo oficial de nuestra Comunidad VIP.",
        "Recibe antes que nadie promociones relámpago, recetas de autor y regalos.",
        "Pega tu número de WhatsApp para confirmar tu ingreso y sumar tus sellos.",
      ],
      actionUrl: "https://chat.whatsapp.com/BlissSoulVIPCommunity",
      evidencePlaceholder: "Tu número de WhatsApp o confirmación de ingreso al grupo",
      active: true,
    },
    {
      id: "m_bing",
      category: "Motores de Búsqueda",
      title: "Reseña en Bing Places & Maps",
      rewardStamps: 2,
      rewardText: "+2 Sellos de Visita",
      badge: "BING MAPS",
      icon: "🌐",
      description: "Comparte tu opinión y calificación en nuestro perfil de Microsoft Bing Places para ayudarnos a posicionar en búsquedas.",
      rules: [
        "Abre el perfil de Bliss Soul Bakery en Bing Maps o Microsoft Search.",
        "Califica con estrellas y comparte tu producto o postre favorito.",
        "Pega el enlace de tu reseña o confirmación para sumar tus sellos.",
      ],
      actionUrl: "https://www.bing.com/maps",
      evidencePlaceholder: "https://www.bing.com/maps?... o confirmación",
      active: true,
    },
  ],
  reputation: {
    googleBusinessUrl: "https://g.page/r/CfPSfNSGX8u1EBM/review",
    whatsappPrivateNumber: "573000000000",
    minRatingForGoogle: 4,
    autoRedirectGoogle: true,
    filterNegativeReviews: true,
  },
  databases: {
    googleSheetWebhookUrl: "",
    supabaseEnabled: false,
    supabaseProjectUrl: "",
    supabaseAnonKey: "",
  },
  composio: {
    enabled: false,
    apiKey: "",
    integrations: {
      googleSheets: true,
      googleContacts: true,
      whatsAppAutoSend: false,
      dailyEmailSummary: true,
    },
    endpoints: {
      googleSheetWebhookUrl: "",
      customWebhookUrl: "",
    },
  },
  hermes: {
    enabled: true,
    mode: "agent", // "agent" | "crm" | "pos" | "webhook"
    apiUrl: "https://api.hermes.ai/v1",
    apiKey: "hermes_live_key_9824",
    agentId: "hermes-agent-bliss",
    webhookUrl: "http://localhost:3001/api/integrations/hermes/webhook",
    events: {
      syncPrizes: true,
      syncPinRedemption: true,
      syncCustomers: true,
      syncReputation: true,
      syncMissions: true,
    },
    status: "connected",
    lastPing: "10:00:00 a. m.",
    stats: {
      totalPings: 12,
      eventsDispatched: 24,
      lastLatencyMs: 38,
    },
  },
  security: {
    masterAdminPin: "8888",
    managerAdminPin: "5555",
    cashierPin: "1978",
    roles: {
      admin: {
        manageBrand: true,
        manageRoulette: true,
        manageStamps: true,
        manageChannels: true,
        manageDatabases: false,
        manageComposio: false,
        viewMetrics: true,
        redeemPrizes: true,
      },
      cashier: {
        manageBrand: false,
        manageRoulette: false,
        manageStamps: false,
        manageChannels: false,
        manageDatabases: false,
        manageComposio: false,
        viewMetrics: true,
        redeemPrizes: true,
      },
    },
  },
  savedPushDrafts: [
    {
      id: "offer_happy_hour",
      name: "⚡ Happy Hour 2x1 (3 a 6 PM)",
      title: "⚡ ¡Happy Hour 2x1 en Café y Bebidas de Autor!",
      body: "¡Hola {nombre}! Hoy de 3:00 a 6:00 PM acumula el DOBLE de sellos y disfruta 2x1 en bebidas. ¡Muestra este mensaje en caja!",
      url: "",
      segment: "Subscribed Users",
      scheduleType: "immediate",
      channels: { push: true, webhook: true, whatsappPreview: true },
      createdAt: "Plantilla Inicial",
    },
    {
      id: "offer_dessert",
      name: "🍰 Postre de Cortesía en Mesa",
      title: "🍰 ¡Postre de Cortesía en tu Visita de Hoy!",
      body: "Ven hoy a deleitarte en {restaurante} y recibe un postre artesanal de autor de cortesía con tu consumo principal. ¡Te esperamos!",
      url: "",
      segment: "Subscribed Users",
      scheduleType: "immediate",
      channels: { push: true, webhook: true, whatsappPreview: false },
      createdAt: "Plantilla Inicial",
    },
    {
      id: "offer_flash_50",
      name: "⏳ Cupón Flash 50% Off (Hoy)",
      title: "⏳ Cupón Flash: 50% en tu Segundo Plato o Bebida",
      body: "¡Solo por hoy! Disfruta 50% de descuento en tu segundo producto favorito en {restaurante}. Muestra este aviso en caja.",
      url: "",
      segment: "Active Customers",
      scheduleType: "immediate",
      channels: { push: true, webhook: true, whatsappPreview: true },
      createdAt: "Plantilla Inicial",
    },
    {
      id: "offer_double_stamps",
      name: "🌟 Doble Sello Fin de Semana",
      title: "🌟 ¡Sellos Dobles este Fin de Semana!",
      body: "¡Acelera tu tarjeta de 15 sellos! Cada visita este fin de semana en {restaurante} te otorga 2 sellos para llegar antes a tu premio.",
      url: "",
      segment: "Subscribed Users",
      scheduleType: "immediate",
      channels: { push: true, webhook: true, whatsappPreview: false },
      createdAt: "Plantilla Inicial",
    },
  ],
};

// BASE DE DATOS EN MEMORIA CON PERSISTENCIA EN ARCHIVO
let db = {
  prizes: [
    {
      uniqueCode: "REST-8492",
      customerName: "Carlos Andrés",
      whatsapp: "573009876543",
      email: "carlos@gmail.com",
      birthDate: "14/11",
      prizeName: "Postre Artesanal de Cortesía",
      tableNumber: "Mesa 3",
      stamps: 3,
      wonAt: new Date().toLocaleTimeString("es-CO"),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("es-CO"),
      status: "DISPONIBLE",
      usedAt: null,
    },
  ],
  customers: {
    "573009876543": {
      fullName: "Carlos Andrés",
      whatsapp: "573009876543",
      email: "carlos@gmail.com",
      birthDate: "14/11",
      stamps: 3,
      lastVisit: new Date().toISOString(),
    },
  },
  missionSubmissions: [],
  reputationFeedbacks: [],
  monthlyContest: [
    {
      id: "TKT-DEMO-001",
      customerName: "Carlos Andrés",
      customerWhatsapp: "573009876543",
      ticketCode: "#CENA2-6543-VIP",
      prize: "Cena Degustación de Autor para 2 Personas",
      missionsCount: 5,
      enteredAt: "08:15 p. m.",
      dateFormatted: "28 de sept",
      status: "INSCRITO",
      winner: false,
    },
    {
      id: "TKT-DEMO-002",
      customerName: "Ana Gourmet",
      customerWhatsapp: "573001234567",
      ticketCode: "#CENA2-4567-VIP",
      prize: "Cena Degustación de Autor para 2 Personas",
      missionsCount: 5,
      enteredAt: "08:22 p. m.",
      dateFormatted: "28 de sept",
      status: "INSCRITO",
      winner: false,
    }
  ],
  logs: [],
  settings: JSON.parse(JSON.stringify(DEFAULT_SETTINGS)),
};

// Cargar datos previos si existen
if (fs.existsSync(DB_FILE)) {
  try {
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    const loaded = JSON.parse(raw);
    db = {
      ...db,
      ...loaded,
      monthlyContest: (loaded.monthlyContest && loaded.monthlyContest.length > 0) ? loaded.monthlyContest : db.monthlyContest,
      settings: {
        ...DEFAULT_SETTINGS,
        ...(loaded.settings || {}),
        brand: { ...DEFAULT_SETTINGS.brand, ...((loaded.settings && loaded.settings.brand) || {}) },
        channels: { ...DEFAULT_SETTINGS.channels, ...((loaded.settings && loaded.settings.channels) || {}) },
        prizes: (loaded.settings && loaded.settings.prizes && loaded.settings.prizes.length > 0)
          ? loaded.settings.prizes
          : DEFAULT_SETTINGS.prizes,
        stamps: {
          visitIcon: (loaded.settings && loaded.settings.stamps && loaded.settings.stamps.visitIcon) || DEFAULT_SETTINGS.stamps.visitIcon,
          milestones: (loaded.settings && loaded.settings.stamps && loaded.settings.stamps.milestones && loaded.settings.stamps.milestones.length > 0)
            ? loaded.settings.stamps.milestones
            : DEFAULT_SETTINGS.stamps.milestones,
        },
        databases: { ...DEFAULT_SETTINGS.databases, ...((loaded.settings && loaded.settings.databases) || {}) },
        composio: {
          ...DEFAULT_SETTINGS.composio,
          ...((loaded.settings && loaded.settings.composio) || {}),
          integrations: {
            ...DEFAULT_SETTINGS.composio.integrations,
            ...((loaded.settings && loaded.settings.composio && loaded.settings.composio.integrations) || {}),
          },
        },
        hermes: {
          ...DEFAULT_SETTINGS.hermes,
          ...((loaded.settings && loaded.settings.hermes) || {}),
          events: {
            ...DEFAULT_SETTINGS.hermes.events,
            ...((loaded.settings && loaded.settings.hermes && loaded.settings.hermes.events) || {}),
          },
          stats: {
            ...DEFAULT_SETTINGS.hermes.stats,
            ...((loaded.settings && loaded.settings.hermes && loaded.settings.hermes.stats) || {}),
          },
        },
        security: {
          ...DEFAULT_SETTINGS.security,
          ...((loaded.settings && loaded.settings.security) || {}),
          roles: {
            admin: {
              ...DEFAULT_SETTINGS.security.roles.admin,
              ...((loaded.settings && loaded.settings.security && loaded.settings.security.roles && loaded.settings.security.roles.admin) || {}),
            },
            cashier: {
              ...DEFAULT_SETTINGS.security.roles.cashier,
              ...((loaded.settings && loaded.settings.security && loaded.settings.security.roles && loaded.settings.security.roles.cashier) || {}),
            },
          },
        },
        savedPushDrafts: (loaded.settings && loaded.settings.savedPushDrafts && loaded.settings.savedPushDrafts.length > 0)
          ? loaded.settings.savedPushDrafts
          : DEFAULT_SETTINGS.savedPushDrafts,
        gameConfig: {
          ...DEFAULT_SETTINGS.gameConfig,
          ...((loaded.settings && loaded.settings.gameConfig) || {}),
        },
        secondChance: {
          ...DEFAULT_SETTINGS.secondChance,
          ...((loaded.settings && loaded.settings.secondChance) || {}),
        },
        missions: (() => {
          let list = (loaded.settings && loaded.settings.missions && loaded.settings.missions.length > 0)
            ? [...loaded.settings.missions]
            : [...DEFAULT_SETTINGS.missions];
          DEFAULT_SETTINGS.missions.forEach((defM) => {
            if (!list.some((m) => m.id === defM.id)) {
              list.push(defM);
            }
          });
          return list;
        })(),
        reputation: {
          ...DEFAULT_SETTINGS.reputation,
          ...((loaded.settings && loaded.settings.reputation) || {}),
        },
      },
      missionSubmissions: Array.isArray(loaded.missionSubmissions) ? loaded.missionSubmissions : [],
      reputationFeedbacks: Array.isArray(loaded.reputationFeedbacks) ? loaded.reputationFeedbacks : [],
    };
  } catch (err) {
    console.error("Error leyendo db.json:", err.message);
  }
}

function saveDb() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
  } catch (err) {
    console.error("Error guardando db.json:", err.message);
  }
}

function logRequest(method, url, status, detail) {
  const logEntry = {
    id: Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
    timestamp: new Date().toLocaleTimeString("es-CO"),
    method,
    url,
    status,
    detail,
  };
  db.logs.unshift(logEntry);
  if (db.logs.length > 50) db.logs.pop();
  console.log(`[BACKEND ${logEntry.timestamp}] ${method} ${url} -> ${status} | ${detail}`);
}

export {
  db,
  DB_FILE,
  PORT,
  DEFAULT_TABLES,
  DEFAULT_SETTINGS,
  saveDb,
  logRequest
};
