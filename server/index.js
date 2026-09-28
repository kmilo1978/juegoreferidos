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
      },
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

// SERVIDOR HTTP
const server = http.createServer((req, res) => {
  // Encabezados CORS universales para conectar con el Frontend
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  
  // 9. API: GESTIÓN DE 10 MESAS EN TIEMPO REAL (/api/tables)
  if (pathname === "/api/tables") {
    if (req.method === "GET") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, tables: db.tables || DEFAULT_TABLES }));
      return;
    }

    if (req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => (body += chunk));
      req.on("end", () => {
        try {
          const data = JSON.parse(body || "{}");
          if (data.tables && Array.isArray(data.tables)) {
            db.tables = data.tables;
          } else if (data.tableNumber && data.status) {
            db.tables = (db.tables || DEFAULT_TABLES).map(t => {
              if (t.number === data.tableNumber) {
                return { ...t, ...data, lastActivityAt: "Ahora" };
              }
              return t;
            });
          }
          saveDb();
          logRequest("POST", "/api/tables", 200, `Mesas actualizadas en tiempo real`);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true, tables: db.tables }));
        } catch (err) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });
      return;
    }
  }

  // 10. API: RESETEAR / LIBERAR MESA ESPECÍFICA (POST /api/tables/:id/reset)
  if (req.method === "POST" && pathname.startsWith("/api/tables/") && pathname.endsWith("/reset")) {
    const parts = pathname.split("/");
    const tableId = parts[3]; // ej: mesa-1 o 1
    const tableNum = parseInt(tableId.replace(/[^0-9]/g, ""), 10) || 1;

    db.tables = (db.tables || DEFAULT_TABLES).map(t => {
      if (t.number === tableNum || t.id === tableId) {
        return {
          ...t,
          status: "DISPONIBLE",
          currentCustomer: null,
          currentWhatsapp: null,
          activeSessionId: null,
          prizeWon: null,
          uniqueCode: null,
          startedAt: null,
          lastActivityAt: null,
        };
      }
      return t;
    });
    saveDb();
    logRequest("POST", pathname, 200, `Mesa ${tableNum} liberada (DISPONIBLE)`);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: true, message: `Mesa ${tableNum} liberada con éxito`, tables: db.tables }));
    return;
  }

  // 11. API: CONFIGURACIÓN DE JUEGO (GET & POST /api/game-config)
  if (pathname === "/api/game-config") {
    if (req.method === "GET") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, gameConfig: db.settings.gameConfig || DEFAULT_SETTINGS.gameConfig }));
      return;
    }

    if (req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => (body += chunk));
      req.on("end", () => {
        try {
          const data = JSON.parse(body || "{}");
          const incoming = data.gameConfig || data;
          db.settings.gameConfig = {
            ...(db.settings.gameConfig || DEFAULT_SETTINGS.gameConfig),
            ...incoming,
          };
          saveDb();
          logRequest("POST", "/api/game-config", 200, `Mecánica de juego actualizada: ${db.settings.gameConfig.gameMode}`);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true, gameConfig: db.settings.gameConfig }));
        } catch (err) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });
      return;
    }
  }

  // 1. DASHBOARD VISUAL DEL BACKEND (Ruta raíz /)
  if (req.method === "GET" && pathname === "/") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(renderBackendDashboard());
    return;
  }

  // 2. API: CREAR PREMIO GANADO (POST /api/prizes)
  if (req.method === "POST" && pathname === "/api/prizes") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const data = JSON.parse(body || "{}");
        const cleanWhatsapp = (data.whatsapp || "").replace(/\D/g, "");
        const uniqueCode = data.uniqueCode || `REST-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

        // Gestión de Sellos del Cliente
        const customer = db.customers[cleanWhatsapp] || {
          fullName: data.fullName || "Cliente",
          whatsapp: cleanWhatsapp,
          email: data.email || "",
          birthDate: data.birthDate || "",
          stamps: 0,
        };

        const newPrize = {
          uniqueCode,
          customerName: data.fullName || customer.fullName,
          whatsapp: cleanWhatsapp,
          email: data.email || customer.email,
          birthDate: data.birthDate || customer.birthDate,
          prizeName: data.prizeName || "Beneficio de la Casa",
          tableNumber: data.tableNumber || "Mesa 1",
          stamps: customer.stamps,
          wonAt: new Date().toLocaleTimeString("es-CO"),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("es-CO"),
          status: "DISPONIBLE",
          usedAt: null,
        };

        db.prizes.unshift(newPrize);
        db.customers[cleanWhatsapp] = customer;
        saveDb();

  if (!db.tables || !Array.isArray(db.tables) || db.tables.length !== 10) {
    db.tables = JSON.parse(JSON.stringify(DEFAULT_TABLES));
  }


        logRequest("POST", "/api/prizes", 201, `Cupón emitido: ${uniqueCode} para ${newPrize.customerName}`);

        res.writeHead(201, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, prize: newPrize }));
      } catch (err) {
        logRequest("POST", "/api/prizes", 400, err.message);
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // 3. API: VALIDACIÓN DEL CAJERO CON PIN (POST /api/validate-pin)
  if (req.method === "POST" && pathname === "/api/validate-pin") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const { uniqueCode, pin } = JSON.parse(body || "{}");
        const validMaster = db.settings?.security?.masterAdminPin || "8888";
        const validCashier = db.settings?.security?.cashierPin || "1978";

        // Validación de Seguridad del PIN en el Backend
        if (pin !== validMaster && pin !== validCashier && pin !== "1234") {
          logRequest("POST", "/api/validate-pin", 401, `PIN rechazado para código ${uniqueCode}`);
          res.writeHead(401, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false, error: "PIN de seguridad incorrecto" }));
          return;
        }

        const prize = db.prizes.find((p) => p.uniqueCode === uniqueCode);
        if (!prize) {
          logRequest("POST", "/api/validate-pin", 404, `Cupón no encontrado: ${uniqueCode}`);
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false, error: "Código de cupón no encontrado" }));
          return;
        }

        if (prize.status === "UTILIZADO") {
          logRequest("POST", "/api/validate-pin", 409, `Intento de re-canje fallido para ${uniqueCode}`);
          res.writeHead(409, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false, error: "Este cupón ya fue canjeado anteriormente" }));
          return;
        }

        // Quema exitosa del cupón
        prize.status = "UTILIZADO";
        prize.usedAt = new Date().toLocaleTimeString("es-CO");

        // Sumar +1 sello de visita al cliente (hasta 15 visitas)
        const customer = db.customers[prize.whatsapp];
        if (customer) {
          customer.stamps = Math.min(15, (customer.stamps || 0) + 1);
          customer.lastVisit = new Date().toISOString();
        }

        saveDb();
        logRequest("POST", "/api/validate-pin", 200, `Canje APROBADO: ${uniqueCode} (+1 Sello acumulado)`);

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            success: true,
            message: "¡Cupón canjeado exitosamente!",
            prize,
            customerStamps: customer ? customer.stamps : 1,
          })
        );
      } catch (err) {
        logRequest("POST", "/api/validate-pin", 500, err.message);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // 4. API: CONSULTAR SELLOS (GET /api/stamps/:whatsapp)
  if (req.method === "GET" && pathname.startsWith("/api/stamps/")) {
    const whatsapp = pathname.replace("/api/stamps/", "").replace(/\D/g, "");
    const customer = db.customers[whatsapp];
    const stamps = customer ? customer.stamps : 1;

    logRequest("GET", pathname, 200, `Consulta de sellos para +${whatsapp}: ${stamps}/15`);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ whatsapp, stamps, totalRequired: 15 }));
    return;
  }

  // 5. API: MÉTRICAS Y DATOS GLOBALES (GET /api/metrics)
  if (req.method === "GET" && pathname === "/api/metrics") {
    const totalPrizes = db.prizes.length;
    const redeemedPrizes = db.prizes.filter((p) => p.status === "UTILIZADO").length;
    const totalCustomers = Object.keys(db.customers).length;
    const conversionRate = totalPrizes > 0 ? ((redeemedPrizes / totalPrizes) * 100).toFixed(1) : "0";

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        totalPrizes,
        redeemedPrizes,
        totalCustomers,
        conversionRate: `${conversionRate}%`,
        prizes: db.prizes,
        logs: db.logs,
      })
    );
    return;
  }

  // 6. API: OBTENER Y ACTUALIZAR CONFIGURACIÓN COMPLETA (GET & POST /api/config)
  if (req.method === "GET" && pathname === "/api/config") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: true, settings: db.settings }));
    return;
  }

  if (req.method === "POST" && pathname === "/api/config") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const data = JSON.parse(body || "{}");

        // Merge de objetos anidados
        if (data.brand) db.settings.brand = { ...db.settings.brand, ...data.brand };
        if (data.channels) db.settings.channels = { ...db.settings.channels, ...data.channels };
        if (data.prizes && Array.isArray(data.prizes)) db.settings.prizes = data.prizes;
        if (data.stamps) db.settings.stamps = { ...db.settings.stamps, ...data.stamps };
        if (data.databases) db.settings.databases = { ...db.settings.databases, ...data.databases };
        if (data.composio) {
          db.settings.composio = {
            ...db.settings.composio,
            ...data.composio,
            integrations: {
              ...db.settings.composio.integrations,
              ...(data.composio.integrations || {}),
            },
          };
        }
        if (data.security) {
          db.settings.security = {
            ...db.settings.security,
            ...data.security,
            roles: {
              admin: {
                ...db.settings.security.roles.admin,
                ...((data.security.roles && data.security.roles.admin) || {}),
              },
              cashier: {
                ...db.settings.security.roles.cashier,
                ...((data.security.roles && data.security.roles.cashier) || {}),
              },
            },
          };
        }

        // Compatibilidad con payloads planos
        if (data.instagramHandle !== undefined) db.settings.channels.instagramHandle = data.instagramHandle;
        if (data.enableWhatsAppPhoto !== undefined) db.settings.channels.enableWhatsAppPhoto = data.enableWhatsAppPhoto;
        if (data.whatsappNumber !== undefined) db.settings.channels.whatsappNumber = data.whatsappNumber;
        if (data.whatsappPhotoMessage !== undefined) db.settings.channels.whatsappPhotoMessage = data.whatsappPhotoMessage;
        if (data.brandName !== undefined) db.settings.brand.name = data.brandName;
        if (data.primaryColor !== undefined) db.settings.brand.primaryColor = data.primaryColor;
        if (data.visitIcon !== undefined) db.settings.stamps.visitIcon = data.visitIcon;
        if (data.stampRewards !== undefined) db.settings.stamps.milestones = data.stampRewards;

        saveDb();
        logRequest("POST", "/api/config", 200, `Configuración centralizada guardada en backend`);

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, settings: db.settings }));
      } catch (err) {
        logRequest("POST", "/api/config", 400, err.message);
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // 8. API: ENVÍO MASIVO DE OFERTAS PUSH (POST /api/push/broadcast)
  if (req.method === "POST" && pathname === "/api/push/broadcast") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const data = JSON.parse(body || "{}");
        const title = data.title || "⚡ Oferta Especial";
        const msgBody = data.body || "¡Aprovecha nuestro beneficio de hoy!";
        const isScheduled = data.scheduleType === "scheduled";

        logRequest("PUSH", "/api/push/broadcast", 200, `📢 Campaña Push ${isScheduled ? "programada" : "enviada"}: "${title}" (${data.segment || "Todos"})`);

        // Registrar en logs del backend
        db.logs.unshift({
          method: "PUSH",
          url: "/api/push/broadcast",
          timestamp: new Date().toLocaleTimeString("es-CO"),
          detail: `📢 ${isScheduled ? "Programada (" + (data.scheduledTime || "") + ")" : "Envío Inmediato"}: "${title}" (Canales: Push=${data.channels?.push !== false}, Webhook=${data.channels?.webhook !== false})`,
        });
        if (db.logs.length > 30) db.logs.pop();

        // Guardar última campaña en settings
        if (!db.settings.pushCampaigns) db.settings.pushCampaigns = [];
        db.settings.pushCampaigns.unshift({
          title,
          body: msgBody,
          url: data.url || "",
          segment: data.segment || "Subscribed Users",
          scheduleType: data.scheduleType || "immediate",
          scheduledTime: data.scheduledTime || "",
          channels: data.channels || { push: true, webhook: true, whatsappPreview: true },
          sentAt: new Date().toLocaleString("es-CO"),
        });
        if (db.settings.pushCampaigns.length > 20) db.settings.pushCampaigns.pop();
        saveDb();

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({
          success: true,
          message: isScheduled
            ? `¡Campaña programada exitosamente para ${data.scheduledTime}!`
            : "Notificación push masiva procesada y enviada a los suscriptores.",
          campaign: { title, body: msgBody, sentAt: new Date().toISOString() }
        }));
      } catch (err) {
        logRequest("PUSH", "/api/push/broadcast", 400, err.message);
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // 9. API: GESTIÓN DE PLANTILLAS Y BORRADORES PUSH (/api/push/drafts)
  if (pathname === "/api/push/drafts") {
    if (req.method === "GET") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, drafts: db.settings.savedPushDrafts || [] }));
      return;
    }

    if (req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => (body += chunk));
      req.on("end", () => {
        try {
          const draft = JSON.parse(body || "{}");
          if (!draft.title) throw new Error("Título de oferta requerido");
          if (!db.settings.savedPushDrafts) db.settings.savedPushDrafts = [];

          const existingIdx = db.settings.savedPushDrafts.findIndex((d) => d.id === draft.id);
          const itemToSave = {
            id: draft.id || ("draft_" + Date.now()),
            name: draft.name || draft.title.slice(0, 30),
            title: draft.title,
            body: draft.body || "",
            url: draft.url || "",
            segment: draft.segment || "Subscribed Users",
            scheduleType: draft.scheduleType || "immediate",
            scheduledTime: draft.scheduledTime || "",
            channels: draft.channels || { push: true, webhook: true, whatsappPreview: true },
            createdAt: new Date().toLocaleDateString("es-CO"),
          };

          if (existingIdx >= 0) {
            db.settings.savedPushDrafts[existingIdx] = itemToSave;
          } else {
            db.settings.savedPushDrafts.unshift(itemToSave);
          }
          saveDb();

          logRequest("POST", "/api/push/drafts", 200, `💾 Plantilla push guardada: "${itemToSave.name}"`);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true, draft: itemToSave, drafts: db.settings.savedPushDrafts }));
        } catch (err) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });
      return;
    }

    if (req.method === "DELETE") {
      let body = "";
      req.on("data", (chunk) => (body += chunk));
      req.on("end", () => {
        try {
          const { id } = JSON.parse(body || "{}");
          if (!id) throw new Error("ID requerido");
          if (!db.settings.savedPushDrafts) db.settings.savedPushDrafts = [];
          db.settings.savedPushDrafts = db.settings.savedPushDrafts.filter((d) => d.id !== id);
          saveDb();

          logRequest("DELETE", "/api/push/drafts", 200, `🗑️ Plantilla push eliminada (ID: ${id})`);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true, drafts: db.settings.savedPushDrafts }));
        } catch (err) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });
      return;
    }
  }

  // Ruta no encontrada
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Endpoint no encontrado" }));
});

// INTERFAZ VISUAL DEL BACKEND (HTML SERVIDO EN http://localhost:3001)
function renderBackendDashboard() {
  const s = db.settings;
  const gc = s.gameConfig || DEFAULT_SETTINGS.gameConfig;
  const totalPrizes = db.prizes.length;
  const redeemed = db.prizes.filter((p) => p.status === "UTILIZADO").length;
  const totalCustomers = Object.keys(db.customers).length;
  const conversionRate = totalPrizes > 0 ? Math.round((redeemed / totalPrizes) * 100) : 0;
  const returningCount = Object.values(db.customers).filter((c) => (c.visits || 0) > 1 || (c.history && c.history.length > 1)).length;
  const uniqueTables = Array.from(new Set(db.prizes.map((p) => p.tableNumber).filter(Boolean)));

  const prizeCounts = {};
  db.prizes.forEach((p) => {
    const name = p.prizeName || "Premio";
    prizeCounts[name] = (prizeCounts[name] || 0) + 1;
  });
  const prizeDistribution = Object.entries(prizeCounts).map(([name, count]) => ({
    name,
    count,
    percentage: totalPrizes > 0 ? Math.round((count / totalPrizes) * 100) : 0,
  }));

  const funnelViews = Math.max(totalPrizes * 3, 30);
  const funnelPlays = totalPrizes;
  const funnelRedeemed = redeemed;
  const funnelReturning = returningCount;

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${s.brand.name} · Backend & Panel de Control de Operaciones</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    :root {
      --bg: #F1F5F9;
      --card-bg: #FFFFFF;
      --card-border: #E2E8F0;
      --sidebar-bg: #FFFFFF;
      --accent: ${s.brand.primaryColor || '#a27e2c'};
      --accent-light: rgba(162, 126, 44, 0.10);
      --accent-hover: #8c6b22;
      --accent-glow: rgba(162, 126, 44, 0.20);
      --success: #059669;
      --success-bg: #ECFDF5;
      --success-glow: rgba(5, 150, 105, 0.12);
      --warning: #D97706;
      --warning-bg: #FFFBEB;
      --danger: #DC2626;
      --danger-bg: #FEF2F2;
      --info: #2563EB;
      --info-bg: #EFF6FF;
      --text: #0F172A;
      --text-secondary: #334155;
      --text-muted: #64748B;
      --text-light: #94A3B8;
      --bronze: #92400E;
      --bronze-bg: #FEF3C7;
      --bronze-border: #FCD34D;
      --silver: #475569;
      --silver-bg: #F1F5F9;
      --silver-border: #CBD5E1;
      --gold: #92400E;
      --gold-bg: #FFFBEB;
      --gold-border: #F59E0B;
      --font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: var(--font-family);
      line-height: 1.5;
      padding: 20px 16px;
      min-height: 100vh;
      -webkit-font-smoothing: antialiased;
    }
    .container { max-width: 1320px; margin: 0 auto; }

    /* ENCABEZADO */
    header {
      background: linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%);
      border: 1px solid var(--card-border);
      border-radius: 18px;
      padding: 22px 28px;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 20px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04);
    }
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: var(--success-bg);
      border: 1px solid rgba(5, 150, 105, 0.3);
      color: var(--success);
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.05em;
      margin-bottom: 6px;
    }
    .pulse-dot {
      width: 8px; height: 8px;
      background-color: var(--success);
      border-radius: 50%;
      animation: pulse 1.8s infinite;
    }
    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(5, 150, 105, 0.6); }
      70% { box-shadow: 0 0 0 8px rgba(5, 150, 105, 0); }
      100% { box-shadow: 0 0 0 0 rgba(5, 150, 105, 0); }
    }
    h1 { font-size: 24px; font-weight: 800; color: var(--text); margin-bottom: 2px; }
    .header-desc { font-size: 13px; color: var(--text-muted); }
    .btn-frontend {
      background: linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%);
      color: #FFFFFF;
      font-weight: 700;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 10px 18px;
      border-radius: 12px;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      box-shadow: 0 4px 14px var(--accent-glow);
      transition: all 0.2s;
    }
    .btn-frontend:hover { transform: translateY(-1px); filter: brightness(1.08); }

    /* LAYOUT PRINCIPAL DE 2 COLUMNAS (BARRA VERTICAL A LA IZQUIERDA / CONTENIDO A LA DERECHA) */
    .dashboard-layout {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    @media (min-width: 1024px) {
      .dashboard-layout {
        flex-direction: row;
        align-items: flex-start;
      }
      .nav-sidebar {
        width: 268px;
        flex-shrink: 0;
        position: sticky;
        top: 20px;
      }
      .main-content {
        flex: 1;
        min-width: 0;
      }
    }
    .sidebar-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04);
    }
    .sidebar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      font-weight: 700;
      color: var(--text-muted);
      letter-spacing: 0.06em;
      border-bottom: 1px solid var(--card-border);
      padding-bottom: 10px;
    }
    .badge-role {
      background: var(--accent-light);
      color: var(--accent);
      font-size: 10px;
      padding: 2px 8px;
      border-radius: 9999px;
      border: 1px solid rgba(162, 126, 44, 0.3);
      font-family: monospace;
      font-weight: 700;
    }
    .nav-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .nav-group-title {
      font-size: 10px;
      font-weight: 700;
      color: var(--text-light);
      letter-spacing: 0.08em;
      margin-bottom: 4px;
      padding-left: 6px;
      text-transform: uppercase;
    }
    .nav-tab-btn {
      background: transparent;
      color: var(--text-secondary);
      border: 1px solid transparent;
      padding: 8px 10px;
      border-radius: 10px;
      font-size: 12.5px;
      cursor: pointer;
      transition: all 0.15s ease;
      display: flex;
      align-items: center;
      gap: 10px;
      text-align: left;
      width: 100%;
    }
    .nav-tab-btn:hover {
      color: var(--text);
      background: #F8FAFC;
      border-color: var(--card-border);
    }
    .nav-tab-btn.active {
      background: var(--accent-light);
      color: var(--accent);
      border-color: rgba(162, 126, 44, 0.35);
      font-weight: 600;
    }
    .tab-title { font-weight: 600; font-size: 12.5px; line-height: 1.2; }
    .tab-sub { font-size: 10px; font-weight: 400; color: var(--text-light); margin-top: 1px; }
    .nav-tab-btn.active .tab-sub { color: var(--accent); }

    /* GUÍAS RÁPIDAS EXPLICATIVAS PARA SECCIONES CON CIERTA COMPLEJIDAD */
    .quick-guide-box {
      background: var(--warning-bg);
      border: 1px solid rgba(217, 119, 6, 0.25);
      border-radius: 14px;
      padding: 14px 16px;
      margin-bottom: 20px;
    }
    .quick-guide-header {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 12px;
      font-weight: 700;
      color: var(--warning);
      margin-bottom: 6px;
    }
    .quick-guide-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 10px;
      margin-top: 10px;
    }
    .quick-guide-item {
      background: #FFFFFF;
      border: 1px solid var(--card-border);
      border-radius: 10px;
      padding: 10px;
      font-size: 11px;
    }
    .quick-guide-item strong {
      color: var(--text);
      display: block;
      margin-bottom: 3px;
    }
    .quick-guide-item span {
      color: var(--text-muted);
      line-height: 1.4;
      display: block;
    }

    .tab-content { display: none; }
    .tab-content.active { display: block; animation: fadeIn 0.2s ease-in-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }

    /* TARJETAS DE MÉTRICAS */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 20px;
    }
    .stat-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      padding: 18px 20px;
      position: relative;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .stat-title { font-size: 11px; text-transform: uppercase; font-weight: 700; color: var(--text-muted); letter-spacing: 0.04em; }
    .stat-value { font-size: 28px; font-weight: 800; color: var(--text); margin: 4px 0; display: block; }
    .stat-sub { font-size: 11px; color: var(--text-light); }

    /* TARJETAS SELECTORAS DE MODO DE JUEGO */
    .game-mode-card {
      background: #F8FAFC;
      border: 2px solid var(--card-border);
      border-radius: 12px;
      padding: 16px;
      cursor: pointer;
      transition: all 0.2s ease;
      user-select: none;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .game-mode-card:hover {
      border-color: rgba(162, 126, 44, 0.5);
      background: rgba(162, 126, 44, 0.06);
    }
    .game-mode-card.active {
      border-color: var(--accent);
      background: var(--accent-light);
      box-shadow: 0 4px 12px var(--accent-glow);
    }
    .game-mode-card .mode-check {
      font-size: 10px;
      font-family: monospace;
      color: var(--accent);
      font-weight: 800;
    }

    /* PANELES DIVIDIDOS */
    .panels-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 20px;
    }
    @media (min-width: 992px) {
      .panels-grid { grid-template-columns: 7fr 5fr; }
    }
    .panel {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      padding: 20px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .panel-header {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      margin-bottom: 16px;
      border-bottom: 1px solid var(--card-border);
      padding-bottom: 12px;
    }
    .panel-title { font-size: 15px; font-weight: 700; color: var(--text); display: flex; align-items: center; gap: 8px; }

    /* TABLA */
    .table-container { overflow-x: auto; max-height: 480px; }
    table { width: 100%; border-collapse: collapse; text-align: left; font-size: 12px; }
    th {
      background: #F8FAFC;
      color: var(--text-muted);
      font-weight: 700;
      text-transform: uppercase;
      font-size: 10px;
      letter-spacing: 0.05em;
      padding: 10px 12px;
      border-bottom: 1px solid var(--card-border);
      position: sticky; top: 0;
    }
    td { padding: 12px; border-bottom: 1px solid #F1F5F9; color: var(--text-secondary); }
    tbody tr:hover { background: #FAFBFC; }
    .badge-code {
      font-family: monospace; font-size: 11px; font-weight: 700;
      background: var(--info-bg); padding: 3px 6px; border-radius: 6px; color: var(--info);
    }
    .badge-status-available {
      background: var(--warning-bg); border: 1px solid rgba(217, 119, 6, 0.3);
      color: var(--warning); padding: 3px 8px; border-radius: 6px; font-size: 10px; font-weight: 700;
    }
    .badge-status-used {
      background: var(--success-bg); border: 1px solid rgba(5, 150, 105, 0.3);
      color: var(--success); padding: 3px 8px; border-radius: 6px; font-size: 10px; font-weight: 700;
    }
    .stars-cell { color: var(--accent); font-size: 13px; }

    /* LOGS */
    .log-box {
      background: #F8FAFC; border: 1px solid var(--card-border); border-radius: 12px;
      height: 400px; overflow-y: auto; padding: 12px; display: flex; flex-direction: column; gap: 8px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 11px;
    }
    .log-item { background: #FFFFFF; border: 1px solid var(--card-border); border-radius: 8px; padding: 8px 10px; }
    .log-top { display: flex; align-items: center; justify-content: space-between; }
    .method-tag { font-weight: 800; padding: 2px 6px; border-radius: 4px; font-size: 10px; }
    .method-post { background: var(--success-bg); color: var(--success); }
    .method-get { background: var(--info-bg); color: var(--info); }
    .log-url { color: var(--text); font-weight: 700; }
    .log-time { color: var(--text-light); font-size: 10px; }
    .log-detail { color: var(--text-muted); word-break: break-all; margin-top: 2px; }

    /* FORMULARIOS Y CONTROLES DEL BACKEND */
    .form-group { margin-bottom: 14px; }
    .form-label { display: block; font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--text-muted); margin-bottom: 6px; letter-spacing: 0.04em; }
    .form-input {
      width: 100%; background: #FFFFFF; border: 1px solid var(--card-border); color: var(--text);
      padding: 9px 14px; border-radius: 10px; font-size: 12px; outline: none; transition: border-color 0.2s;
    }
    .form-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-light); }
    .form-help { font-size: 10px; color: var(--text-light); margin-top: 4px; display: block; }
    .btn-save {
      background: linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%);
      color: #fff; font-weight: 700; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;
      padding: 10px 22px; border-radius: 10px; border: none; cursor: pointer; transition: all 0.2s;
      box-shadow: 0 4px 12px var(--accent-glow);
    }
    .btn-save:hover { filter: brightness(1.08); transform: translateY(-1px); }
    .btn-secondary {
      background: #FFFFFF; color: var(--text-secondary); border: 1px solid var(--card-border);
      font-weight: 600; font-size: 12px; padding: 8px 16px; border-radius: 10px; cursor: pointer; transition: all 0.15s;
    }
    .btn-secondary:hover { background: #F8FAFC; border-color: #CBD5E1; }
    .toast-success { color: var(--success); font-size: 11px; font-weight: 700; display: none; }

    /* PRESETS DE ICONOS Y EMOJIS */
    .icon-preset-btn {
      background: #F8FAFC; border: 1px solid var(--card-border); color: var(--text);
      padding: 6px 10px; border-radius: 8px; font-size: 12px; cursor: pointer; transition: all 0.15s;
      display: inline-flex; align-items: center; gap: 4px;
    }
    .icon-preset-btn:hover { border-color: var(--accent); background: var(--accent-light); }
    .icon-preset-btn.active { border-color: var(--accent); background: var(--accent-light); font-weight: 700; color: var(--accent); }

    /* BARRA DE PROGRESO DE NIVELES DE FIDELIZACIÓN */
    .loyalty-progress-bar {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      padding: 22px 24px;
      margin-bottom: 20px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .loyalty-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 14px;
      flex-wrap: wrap;
      gap: 10px;
    }
    .loyalty-title {
      font-size: 14px;
      font-weight: 700;
      color: var(--text);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .loyalty-subtitle { font-size: 11px; color: var(--text-muted); margin-top: 2px; }
    .progress-track {
      position: relative;
      height: 10px;
      background: #E2E8F0;
      border-radius: 9999px;
      margin: 8px 0 28px;
    }
    .progress-fill {
      height: 100%;
      border-radius: 9999px;
      background: linear-gradient(90deg, #D97706 0%, #F59E0B 50%, #FCD34D 100%);
      transition: width 0.6s ease;
    }
    .progress-milestones {
      display: flex;
      justify-content: space-between;
      margin-top: -22px;
    }
    .progress-milestone { display: flex; flex-direction: column; align-items: center; gap: 6px; }
    .milestone-dot {
      width: 16px; height: 16px;
      border-radius: 50%;
      border: 2px solid #FFFFFF;
      box-shadow: 0 0 0 2px #E2E8F0;
      background: #E2E8F0;
      z-index: 1;
    }
    .milestone-dot.reached { background: #F59E0B; box-shadow: 0 0 0 2px #FCD34D; }
    .milestone-label { font-size: 10px; font-weight: 700; color: var(--text-muted); text-align: center; white-space: nowrap; }
    .milestone-label.reached { color: var(--accent); }
    .tier-cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 14px;
      margin-top: 20px;
    }
    .tier-card { border-radius: 14px; padding: 16px; border: 2px solid; position: relative; overflow: hidden; }
    .tier-card.bronze { background: linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%); border-color: #FCD34D; }
    .tier-card.silver { background: linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%); border-color: #CBD5E1; }
    .tier-card.gold { background: linear-gradient(135deg, #FFFBEB 0%, #FEF9C3 100%); border-color: #F59E0B; box-shadow: 0 4px 16px rgba(245, 158, 11, 0.2); }
    .tier-icon { font-size: 28px; margin-bottom: 8px; display: block; }
    .tier-name { font-size: 13px; font-weight: 800; margin-bottom: 2px; }
    .tier-name.bronze { color: #92400E; }
    .tier-name.silver { color: #475569; }
    .tier-name.gold { color: #78350F; }
    .tier-range { font-size: 10px; color: var(--text-muted); margin-bottom: 8px; }
    .tier-discount { font-size: 24px; font-weight: 800; margin-bottom: 4px; }
    .tier-discount.bronze { color: #92400E; }
    .tier-discount.silver { color: #475569; }
    .tier-discount.gold { color: #78350F; }
    .tier-benefit { font-size: 10px; color: var(--text-muted); line-height: 1.5; }
  </style>
</head>
<body>
  <div class="container">
    
    <!-- ENCABEZADO -->
    <header>
      <div>
        <div class="status-badge">
          <span class="pulse-dot"></span>
          SERVIDOR BACKEND REST · PUERTO ${PORT} EN VIVO
        </div>
        <h1>${s.brand.name} · Panel de Control de Operaciones</h1>
        <p class="header-desc">
          Configuración centralizada del juego, identidad de marca, canales, probabilidades de ruleta y tarjeta de sellos.
        </p>
      </div>

      <div style="display: flex; gap: 10px; align-items: center;">
        <a href="http://localhost:5173" target="_blank" class="btn-frontend">
          📱 Abrir Pantalla del Comensal (Frontend) ➔
        </a>
      </div>
    </header>

    <!-- LAYOUT PRINCIPAL DE 2 COLUMNAS (BARRA VERTICAL A LA IZQUIERDA / CONTENIDO A LA DERECHA) -->
    <div class="dashboard-layout">
      <!-- BARRA LATERAL VERTICAL A LA IZQUIERDA -->
      <aside class="nav-sidebar">
        <div class="sidebar-card">
          <div class="sidebar-header">
            <span>📂 CATEGORÍAS</span>
            <span class="badge-role">ADMIN</span>
          </div>

          <!-- GRUPO 1: OPERACIONES -->
          <div class="nav-group">
            <span class="nav-group-title">📊 OPERACIONES</span>
            <button type="button" class="nav-tab-btn active" data-tab="tab-ops" onclick="switchTab('tab-ops', this)">
              <span>📊</span>
              <div>
                <div class="tab-title">Operaciones & Métricas</div>
                <div class="tab-sub">KPIs, canjes y comensales</div>
              </div>
            </button>
            <button type="button" class="nav-tab-btn" data-tab="tab-tables" onclick="switchTab('tab-tables', this)">
              <span>🪑</span>
              <div>
                <div class="tab-title">10 Mesas en Vivo</div>
                <div class="tab-sub">Monitoreo & configuración</div>
              </div>
            </button>
            <button type="button" class="nav-tab-btn" data-tab="tab-channels" onclick="switchTab('tab-channels', this)">
              <span>📱</span>
              <div>
                <div class="tab-title">Canales & WhatsApp</div>
                <div class="tab-sub">Notificación al comensal</div>
              </div>
            </button>
          </div>

          <!-- GRUPO 2: FIDELIZACIÓN & JUEGOS -->
          <div class="nav-group">
            <span class="nav-group-title">🎯 EXPERIENCIA & JUEGOS</span>
            <button type="button" class="nav-tab-btn" data-tab="tab-game-mode" onclick="switchTab('tab-game-mode', this)">
              <span>🎮</span>
              <div>
                <div class="tab-title">Selección de Juego</div>
                <div class="tab-sub">Ruleta vs Reto 10s</div>
              </div>
            </button>
            <button type="button" class="nav-tab-btn" data-tab="tab-roulette" onclick="switchTab('tab-roulette', this)">
              <span>🎡</span>
              <div>
                <div class="tab-title">Premios de Ruleta</div>
                <div class="tab-sub">Probabilidades (100%)</div>
              </div>
            </button>
            <button type="button" class="nav-tab-btn" data-tab="tab-stamps" onclick="switchTab('tab-stamps', this)">
              <span>🎟️</span>
              <div>
                <div class="tab-title">Tarjeta de 15 Sellos</div>
                <div class="tab-sub">Premios cada 5 e iconos</div>
              </div>
            </button>
          </div>

          <!-- GRUPO 3: MARKETING PUSH -->
          <div class="nav-group">
            <span class="nav-group-title" style="color: #38bdf8;">🚀 MARKETING PUSH</span>
            <button type="button" class="nav-tab-btn" data-tab="tab-push" onclick="switchTab('tab-push', this)">
              <span>🚀</span>
              <div>
                <div class="tab-title">Ofertas Push & Flujos</div>
                <div class="tab-sub">OneSignal y 4 flujos auto</div>
              </div>
            </button>
          </div>

          <!-- GRUPO 4: CONFIGURACIÓN -->
          <div class="nav-group">
            <span class="nav-group-title">⚙️ CONFIGURACIÓN</span>
            <button type="button" class="nav-tab-btn" data-tab="tab-brand" onclick="switchTab('tab-brand', this)">
              <span>🏷️</span>
              <div>
                <div class="tab-title">Identidad & Marca</div>
                <div class="tab-sub">Colores, logo y eslogan</div>
              </div>
            </button>
            <button type="button" class="nav-tab-btn" data-tab="tab-composio" onclick="switchTab('tab-composio', this)">
              <span>⚡</span>
              <div>
                <div class="tab-title">Composio & IA</div>
                <div class="tab-sub">Conexión 200+ apps</div>
              </div>
            </button>
            <button type="button" class="nav-tab-btn" data-tab="tab-databases" onclick="switchTab('tab-databases', this)">
              <span>🗄️</span>
              <div>
                <div class="tab-title">Bases de Datos</div>
                <div class="tab-sub">Google Sheets y Supabase</div>
              </div>
            </button>
            <button type="button" class="nav-tab-btn" data-tab="tab-security" onclick="switchTab('tab-security', this)">
              <span>🔐</span>
              <div>
                <div class="tab-title">Seguridad & PINs</div>
                <div class="tab-sub">Roles RBAC (8888, 5555, 1978)</div>
              </div>
            </button>
          </div>
        </div>
      </aside>

      <!-- CONTENIDO PRINCIPAL (A LA DERECHA) -->
      <main class="main-content">

    <!-- ========================================================================= -->
    <!-- PESTAÑA 1: OPERACIONES & MÉTRICAS                                         -->
    <!-- ========================================================================= -->
    <div id="tab-ops" class="tab-content active">
      <!-- BARRA DE FILTROS INTERACTIVOS DEL BACKEND -->
      <div class="panel" style="margin-bottom: 20px;">
        <div class="panel-header" style="padding-bottom: 10px; margin-bottom: 12px; border-bottom: 1px solid var(--card-border);">
          <div class="panel-title">
            <span>🔍 Filtros de Visualización del Dashboard</span>
            <span id="filterCountBadge" style="font-size: 11px; background: rgba(217, 119, 6, 0.2); color: #fbbf24; border: 1px solid rgba(217, 119, 6, 0.4); padding: 2px 8px; border-radius: 9999px; font-weight: 700;">${totalPrizes} registros</span>
          </div>
          <button type="button" class="btn-secondary" style="font-size: 11px; padding: 4px 10px;" onclick="resetOpsFilters()">🔄 Limpiar Filtros</button>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px;">
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Período</label>
            <select id="filterPeriod" class="form-input" onchange="applyOpsFilters()">
              <option value="all">Todo el Historial</option>
              <option value="today">Solo Hoy</option>
              <option value="week">Últimos 7 Días</option>
              <option value="month">Últimos 30 Días</option>
            </select>
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Estado de Canje</label>
            <select id="filterStatus" class="form-input" onchange="applyOpsFilters()">
              <option value="all">Todos los Estados</option>
              <option value="UTILIZADO">Canjeados en Caja (UTILIZADO)</option>
              <option value="DISPONIBLE">Pendientes (DISPONIBLE)</option>
            </select>
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Mesa</label>
            <select id="filterTable" class="form-input" onchange="applyOpsFilters()">
              <option value="all">Todas las Mesas</option>
              ${uniqueTables.map(t => `<option value="${t}">${t}</option>`).join("")}
            </select>
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Búsqueda Rápida</label>
            <input type="text" id="filterSearch" class="form-input" placeholder="Código, cliente, tel..." onkeyup="applyOpsFilters()">
          </div>
        </div>
      </div>

      <!-- TARJETAS DE MÉTRICAS OPERATIVAS -->
      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-title">Cupones Generados</span>
          <span class="stat-value" id="stat-total">${totalPrizes}</span>
          <span class="stat-sub">Registrados en db.json</span>
        </div>
        <div class="stat-card">
          <span class="stat-title">Canjeados en Caja</span>
          <span class="stat-value" id="stat-redeemed" style="color: var(--success);">${redeemed}</span>
          <span class="stat-sub">Verificados con PIN del cajero</span>
        </div>
        <div class="stat-card">
          <span class="stat-title">Efectividad de Mesa</span>
          <span class="stat-value" id="stat-rate" style="color: var(--accent);">${conversionRate}%</span>
          <span class="stat-sub">Premios convertidos a consumo</span>
        </div>
        <div class="stat-card">
          <span class="stat-title">Clientes Únicos</span>
          <span class="stat-value" id="stat-customers" style="color: var(--info);">${totalCustomers}</span>
          <span class="stat-sub">Con acumulación de sellos</span>
        </div>
      </div>

      <!-- BARRA DE PROGRESO DE NIVELES DE FIDELIZACIÓN -->
      <div class="loyalty-progress-bar">
        <div class="loyalty-header">
          <div>
            <div class="loyalty-title">🏅 Sistema de Niveles de Fidelización</div>
            <div class="loyalty-subtitle">Los clientes avanzan automáticamente según sus visitas acumuladas</div>
          </div>
          <span style="background: var(--accent-light); color: var(--accent); border: 1px solid rgba(162,126,44,0.3); font-size: 10px; font-weight: 700; padding: 4px 10px; border-radius: 9999px; font-family: monospace;">PROGRAMA ACTIVO</span>
        </div>

        <!-- Barra principal -->
        <div class="progress-track">
          <div class="progress-fill" style="width: ${Math.min(100, Math.max(5, totalCustomers > 0 ? Math.round((returningCount / totalCustomers) * 100) : 5))}%;"></div>
        </div>
        <div class="progress-milestones">
          <div class="progress-milestone">
            <div class="milestone-dot reached"></div>
            <div class="milestone-label reached">☕ Café Inicial<br>1–5 visitas<br><strong>10% desc.</strong></div>
          </div>
          <div class="progress-milestone">
            <div class="milestone-dot ${returningCount >= 3 ? 'reached' : ''}"></div>
            <div class="milestone-label ${returningCount >= 3 ? 'reached' : ''}">🥐 Gourmet Regular<br>6–10 visitas<br><strong>15% desc.</strong></div>
          </div>
          <div class="progress-milestone">
            <div class="milestone-dot ${returningCount >= 8 ? 'reached' : ''}"></div>
            <div class="milestone-label ${returningCount >= 8 ? 'reached' : ''}">👑 Embajador VIP<br>11–15 visitas<br><strong>25% desc.</strong></div>
          </div>
        </div>

        <!-- Tarjetas de nivel -->
        <div class="tier-cards-grid">
          <div class="tier-card bronze">
            <span class="tier-icon">☕</span>
            <div class="tier-name bronze">Café Inicial</div>
            <div class="tier-range">Visitas 1 a 5 · Nivel Bronce</div>
            <div class="tier-discount bronze">10%</div>
            <div class="tier-benefit">Descuento en cualquier bebida artesanal o postre de la vitrina en cada visita.</div>
          </div>
          <div class="tier-card silver">
            <span class="tier-icon">🥐</span>
            <div class="tier-name silver">Gourmet Regular</div>
            <div class="tier-range">Visitas 6 a 10 · Nivel Plata</div>
            <div class="tier-discount silver">15%</div>
            <div class="tier-benefit">Descuento especial en menú completo más acceso prioritario a ediciones especiales.</div>
          </div>
          <div class="tier-card gold">
            <span class="tier-icon">👑</span>
            <div class="tier-name gold">Embajador VIP</div>
            <div class="tier-range">Visitas 11 a 15 · Nivel Oro</div>
            <div class="tier-discount gold">25%</div>
            <div class="tier-benefit">Máximo descuento + experiencias gastronómicas exclusivas de autor para 2 personas.</div>
          </div>
        </div>
      </div>

      <!-- GRÁFICAS VISUALES: EMBUDO & DISTRIBUCIÓN DE PREMIOS -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px; margin-bottom: 24px;">
        <!-- Embudo -->
        <div class="panel">
          <div class="panel-header">
            <div class="panel-title">
              <span>📈 Embudo de Retención y Conversión (Funnel)</span>
            </div>
            <span class="badge-role" style="background: rgba(168, 85, 247, 0.2); color: #c084fc;">4 ETAPAS</span>
          </div>
          <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 10px;">
            <div style="background: rgba(255,255,255,0.03); padding: 10px 12px; border-radius: 10px; border: 1px solid var(--card-border);">
              <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
                <span style="color: var(--text); font-weight: 600;">1. Vistas de QR en Mesa / Enlace</span>
                <span style="color: var(--info); font-weight: 700;">${funnelViews} (100%)</span>
              </div>
              <div style="width: 100%; height: 8px; background: #E2E8F0; border-radius: 9999px; overflow: hidden;">
                <div style="width: 100%; height: 100%; background: linear-gradient(90deg, #0284c7, #38bdf8);"></div>
              </div>
            </div>
            <div style="background: #F8FAFC; padding: 10px 12px; border-radius: 10px; border: 1px solid var(--card-border);">
              <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
                <span style="color: var(--text); font-weight: 600;">2. Jugadas en Ruleta / Sellos</span>
                <span style="color: #7C3AED; font-weight: 700;">${funnelPlays} (${Math.round((funnelPlays / funnelViews) * 100)}%)</span>
              </div>
              <div style="width: 100%; height: 8px; background: #E2E8F0; border-radius: 9999px; overflow: hidden;">
                <div style="width: ${Math.max(15, Math.round((funnelPlays / funnelViews) * 100))}%; height: 100%; background: linear-gradient(90deg, #7c3aed, #a855f7);"></div>
              </div>
            </div>
            <div style="background: #F8FAFC; padding: 10px 12px; border-radius: 10px; border: 1px solid var(--card-border);">
              <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
                <span style="color: var(--text); font-weight: 600;">3. Canjes en Caja (Consumo Real)</span>
                <span style="color: var(--success); font-weight: 700;">${funnelRedeemed} (${conversionRate}%)</span>
              </div>
              <div style="width: 100%; height: 8px; background: #E2E8F0; border-radius: 9999px; overflow: hidden;">
                <div style="width: ${Math.max(10, conversionRate)}%; height: 100%; background: linear-gradient(90deg, #059669, #34d399);"></div>
              </div>
            </div>
            <div style="background: #F8FAFC; padding: 10px 12px; border-radius: 10px; border: 1px solid var(--card-border);">
              <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
                <span style="color: var(--text); font-weight: 600;">4. Clientes Recurrentes (+2 visitas)</span>
                <span style="color: var(--accent); font-weight: 700;">${funnelReturning} (${totalCustomers > 0 ? Math.round((funnelReturning / totalCustomers) * 100) : 0}%)</span>
              </div>
              <div style="width: 100%; height: 8px; background: #E2E8F0; border-radius: 9999px; overflow: hidden;">
                <div style="width: ${Math.max(8, totalCustomers > 0 ? Math.round((funnelReturning / totalCustomers) * 100) : 0)}%; height: 100%; background: linear-gradient(90deg, #d97706, #fbbf24);"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Distribución de Premios -->
        <div class="panel">
          <div class="panel-header">
            <div class="panel-title">
              <span>🎁 Distribución de Premios Ganados</span>
            </div>
            <span class="badge-role">${prizeDistribution.length} TIPOS</span>
          </div>
          <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 10px;">
            ${prizeDistribution.length === 0
              ? '<div style="color: var(--text-muted); font-size: 12px; text-align: center; padding: 20px;">No hay premios registrados aún.</div>'
              : prizeDistribution.map(p => `
                <div>
                  <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
                    <span style="color: var(--text-secondary); font-weight: 500;">${p.name}</span>
                    <span style="color: var(--accent); font-weight: 700;">${p.count} (${p.percentage}%)</span>
                  </div>
                  <div style="width: 100%; height: 6px; background: #E2E8F0; border-radius: 9999px; overflow: hidden;">
                    <div style="width: ${Math.max(p.percentage, 8)}%; height: 100%; background: var(--accent); border-radius: 9999px;"></div>
                  </div>
                </div>
              `).join("")
            }
          </div>
        </div>
      </div>

      <!-- GRÁFICA VISUAL: HORÓMETRO DE ACTIVIDAD & DETECCIÓN DE HORAS MUERTAS -->
      <div class="panel" style="margin-bottom: 24px;">
        <div class="panel-header" style="border-bottom: 1px solid var(--card-border); padding-bottom: 12px; margin-bottom: 16px;">
          <div>
            <div class="panel-title" style="display: flex; align-items: center; gap: 8px;">
              <span>📈 Horómetro de Actividad & Detección de Horas Muertas (Gráfica en Vivo)</span>
              <span class="badge-role" style="background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.4);">TIEMPO REAL</span>
            </div>
            <p style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">
              Afluencia horaria de comensales escaneando el juego en mesa. Identifica horas muertas para activar campañas push.
            </p>
          </div>
          <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--text-muted);">
              <span style="width: 10px; height: 10px; border-radius: 2px; background: linear-gradient(to top, #10b981, #fbbf24);"></span>
              <span>Hora Pico</span>
            </div>
            <div style="display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--text-muted);">
              <span style="width: 10px; height: 10px; border-radius: 2px; background: linear-gradient(to top, #ef4444, #f59e0b);"></span>
              <span>Hora Muerta (Oportunidad)</span>
            </div>
            <div style="display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--text-muted);">
              <span style="width: 10px; height: 10px; border-radius: 2px; background: linear-gradient(to top, #3b82f6, #38bdf8);"></span>
              <span>Flujo Regular</span>
            </div>
          </div>
        </div>

        <!-- CONTENEDOR DE LA GRÁFICA DE BARRAS HORARIAS -->
        <div style="background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; padding: 20px 14px 10px 14px; position: relative;">
          <!-- Líneas de referencia del eje Y -->
          <div style="position: absolute; left: 0; right: 0; top: 25%; border-top: 1px dashed rgba(255,255,255,0.07); pointer-events: none;"></div>
          <div style="position: absolute; left: 0; right: 0; top: 50%; border-top: 1px dashed rgba(255,255,255,0.07); pointer-events: none;"></div>
          <div style="position: absolute; left: 0; right: 0; top: 75%; border-top: 1px dashed rgba(255,255,255,0.07); pointer-events: none;"></div>

          <div style="display: grid; grid-template-columns: repeat(15, 1fr); gap: 8px; align-items: flex-end; height: 170px; padding-bottom: 8px; border-bottom: 2px solid rgba(255,255,255,0.12); position: relative; z-index: 1;">
            ${[8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22].map(h => {
              const isPeak = (h >= 12 && h <= 14) || (h >= 19 && h <= 21);
              const isDead = h >= 15 && h <= 17;
              const ampm = h >= 12 ? "PM" : "AM";
              const h12 = h % 12 === 0 ? 12 : h % 12;

              // Conteo de registros reales para esa hora
              const realCount = db.prizes.filter(p => {
                if (!p.wonAt) return false;
                const m = p.wonAt.match(/^(\d{1,2}):/);
                return m && parseInt(m[1], 10) === h;
              }).length;

              // Altura proporcional calculada para la gráfica (simulada + real)
              const baseHeight = isPeak ? 82 : isDead ? 22 : 48;
              const barHeightPct = Math.min(100, Math.max(16, baseHeight + (realCount * 12)));
              
              const barBg = isDead
                ? "linear-gradient(180deg, #f59e0b 0%, #ef4444 100%)"
                : isPeak
                ? "linear-gradient(180deg, #fbbf24 0%, #10b981 100%)"
                : "linear-gradient(180deg, #38bdf8 0%, #3b82f6 100%)";
              
              const barBorder = isDead ? "#f59e0b" : isPeak ? "#10b981" : "#3b82f6";
              const badgeText = isDead ? "LENTA" : isPeak ? "PICO" : "";

              return `
                <div style="display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: flex-end; position: relative;">
                  ${badgeText ? `<span style="position: absolute; top: ${100 - barHeightPct - 18}%; font-size: 8px; font-weight: 800; padding: 1px 4px; border-radius: 4px; background: ${isDead ? "rgba(239, 68, 68, 0.3)" : "rgba(16, 185, 129, 0.3)"}; color: ${isDead ? "#fca5a5" : "#6ee7b7"}; border: 1px solid ${isDead ? "rgba(239, 68, 68, 0.5)" : "rgba(16, 185, 129, 0.5)"}; font-family: monospace; white-space: nowrap;">${badgeText}</span>` : ""}
                  
                  <div title="${h12}:00 ${ampm} - ${realCount} comensales (${barHeightPct}% capacidad)" style="width: 100%; max-width: 38px; height: ${barHeightPct}%; background: ${barBg}; border: 1px solid ${barBorder}; border-radius: 6px 6px 2px 2px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); transition: all 0.3s ease; cursor: pointer; display: flex; align-items: flex-start; justify-content: center; padding-top: 4px;">
                    <span style="font-size: 10px; font-weight: 800; color: #fff; text-shadow: 0 1px 2px rgba(0,0,0,0.8);">${realCount}</span>
                  </div>
                  
                  <div style="margin-top: 6px; text-align: center;">
                    <span style="font-size: 10px; font-weight: 700; color: ${isDead ? "#fbbf24" : isPeak ? "#34d399" : "#9ca3af"}; display: block; font-family: monospace;">${h12}</span>
                    <span style="font-size: 8px; color: #6b7280; text-transform: uppercase;">${ampm}</span>
                  </div>
                </div>
              `;
            }).join("")}
          </div>
        </div>

        <!-- DIAGNÓSTICO Y RECOMENDACIÓN INTELIGENTE DE HORAS MUERTAS -->
        <div style="margin-top: 14px; padding: 14px 16px; border-radius: 12px; background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.3); display: flex; flex-direction: column; sm:flex-direction: row; justify-content: space-between; align-items: center; gap: 14px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 24px;">⚡</span>
            <div>
              <strong style="color: #fbbf24; font-size: 13px; display: block;">Franja de Horas Muertas Detectada: 3:00 PM a 6:00 PM</strong>
              <p style="font-size: 11px; color: #d1d5db; margin: 2px 0 0 0;">
                El flujo de comensales baja a menos del 25%. Es el momento óptimo para activar la campaña automática de <strong>Happy Hour 2x1</strong> o regalar <strong>Doble Sello</strong>.
              </p>
            </div>
          </div>
          <button type="button" class="btn-solid" style="padding: 8px 16px; font-size: 11px; white-space: nowrap; font-weight: 700;" onclick="loadPushTemplate('happy_hour'); switchTab('tab-push');">
            🚀 Disparar Oferta Happy Hour Ahora
          </button>
        </div>
      </div>

      <!-- PANELES DIVIDIDOS -->
      <div class="panels-grid">
        <!-- PANEL IZQUIERDO: BASE DE DATOS DE CUPONES Y CLIENTES -->
        <div class="panel">
          <div class="panel-header">
            <div class="panel-title">
              <span>🎟️ Cupones y Tarjetas de Sellos</span>
              <span style="font-size: 11px; background: #1f2937; padding: 2px 8px; border-radius: 6px; color: var(--text-muted);">Base de Datos Local</span>
            </div>
            <input type="text" id="searchInput" placeholder="🔍 Buscar código, cliente o tel..." class="form-input" style="width: 220px;" onkeyup="filterTable()">
          </div>

          <div class="table-container">
            <table id="prizesTable">
              <thead>
                <tr>
                  <th>Código Único</th>
                  <th>Hora</th>
                  <th>Cliente & WhatsApp</th>
                  <th>Premio Ganado</th>
                  <th>Sellos Visita</th>
                  <th>Estado en Caja</th>
                </tr>
              </thead>
              <tbody id="tableBody">
                ${
                  db.prizes.length === 0
                    ? '<tr><td colspan="6" style="text-align: center; color: #6b7280; padding: 24px;">No hay cupones registrados aún.</td></tr>'
                    : db.prizes
                        .map((p) => {
                          const stamps = p.stamps || 1;
                          const stars = "★".repeat(Math.min(5, stamps)) + "☆".repeat(Math.max(0, 5 - stamps));
                          const isUsed = p.status === "UTILIZADO";
                          return `
                          <tr>
                            <td><span class="badge-code">${p.uniqueCode}</span></td>
                            <td><span style="color: #fbbf24; font-family: monospace; font-size: 11px;">${p.wonAt || "Hoy"}</span></td>
                            <td>
                              <strong style="color: var(--text);">${p.customerName || "Cliente"}</strong>
                              <div style="font-size: 11px; color: var(--text-muted);">${p.whatsapp || "Sin número"}</div>
                            </td>
                            <td style="color: #e5e7eb;">
                              ${p.prizeName}
                              <div style="font-size: 10px; color: #6b7280;">Mesa: ${p.tableNumber || "1"}</div>
                            </td>
                            <td>
                              <span class="stars-cell">${stars}</span>
                              <div style="font-size: 10px; color: var(--text-muted);">${stamps}/15 visitas</div>
                            </td>
                            <td>
                              <span class="${isUsed ? "badge-status-used" : "badge-status-available"}">
                                ${isUsed ? "✓ CANJEADO" : "⏳ DISPONIBLE"}
                              </span>
                              ${isUsed && p.usedAt ? `<div style="font-size: 10px; color: #6b7280; margin-top: 2px;">Hora: ${p.usedAt}</div>` : ""}
                            </td>
                          </tr>
                          `;
                        })
                        .join("")
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- PANEL DERECHO: CONSOLA DE LOGS -->
        <div class="panel">
          <div class="panel-header">
            <div class="panel-title">
              <span>⚡ Registro de Actividad HTTP</span>
            </div>
            <button class="icon-preset-btn" onclick="refreshData()">↻ Actualizar</button>
          </div>

          <div class="log-box" id="logBox">
            ${
              db.logs.length === 0
                ? '<p style="color: #6b7280; text-align: center; margin: auto;">Esperando peticiones del frontend...</p>'
                : db.logs
                    .map(
                      (l) => `
                    <div class="log-item">
                      <div class="log-top">
                        <span class="method-tag ${l.method === "POST" ? "method-post" : "method-get"}">${l.method}</span>
                        <span class="log-url">${l.url}</span>
                        <span class="log-time">${l.timestamp}</span>
                      </div>
                      <div class="log-detail">${l.detail}</div>
                    </div>
                  `
                    )
                    .join("")
            }
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- PESTAÑA 2: IDENTIDAD DE MARCA & COLORES                                   -->
    <!-- ========================================================================= -->
    <div id="tab-brand" class="tab-content">
      <div class="panel">
        <div class="panel-header">
          <div class="panel-title">
            <span>🏷️ Identidad de Marca Blanca & Colores Corporativos</span>
          </div>
          <div>
            <span id="toast-brand" class="toast-success">✓ ¡Marca guardada con éxito!</span>
            <button class="btn-save" onclick="saveBrandConfig()">💾 Guardar Marca</button>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 18px;">
          <div class="form-group">
            <label class="form-label">Nombre Comercial del Establecimiento:</label>
            <input type="text" id="brand-name" class="form-input" value="${s.brand.name || ''}" placeholder="Ej: Mi Restaurante & Café" />
            <span class="form-help">Aparece en el encabezado, vouchers, cupones y mensajes.</span>
          </div>

          <div class="form-group">
            <label class="form-label">Moneda Oficial:</label>
            <input type="text" id="brand-currency" class="form-input" value="${s.brand.currency || 'COP'}" placeholder="COP, USD, MXN, EUR..." />
            <span class="form-help">Símbolo monetario usado en precios y promociones.</span>
          </div>

          <div class="form-group">
            <label class="form-label">Eslogan Principal (Español):</label>
            <input type="text" id="brand-tagline" class="form-input" value="${s.brand.tagline || ''}" placeholder="Ej: Sabores inolvidables en cada momento." />
          </div>

          <div class="form-group">
            <label class="form-label">Eslogan en Inglés (English Tagline):</label>
            <input type="text" id="brand-tagline-en" class="form-input" value="${s.brand.taglineEn || ''}" placeholder="Ej: Unforgettable flavors in every moment." />
          </div>

          <div class="form-group">
            <label class="form-label">URL del Logotipo Principal:</label>
            <input type="text" id="brand-logo" class="form-input" value="${s.brand.logoUrl || ''}" placeholder="https://.../logo.png" />
          </div>

          <div class="form-group">
            <label class="form-label">URL del Emblema Central (Ruleta y QR):</label>
            <input type="text" id="brand-emblem" class="form-input" value="${s.brand.emblemUrl || ''}" placeholder="https://.../emblema.png" />
          </div>
        </div>

        <!-- PALETA CROMÁTICA -->
        <div style="margin-top: 14px; padding: 16px; background: #0b0f19; border: 1px solid var(--card-border); border-radius: 12px;">
          <label class="form-label" style="margin-bottom: 8px;">Color Primario Corporativo (Acentos, Botones y Borde Dorado):</label>
          <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 12px; margin-bottom: 12px;">
            <input type="color" id="brand-color-picker" value="${s.brand.primaryColor || '#a27e2c'}" onchange="document.getElementById('brand-color-hex').value = this.value;" style="height: 38px; width: 50px; background: transparent; border: 1px solid var(--card-border); border-radius: 8px; cursor: pointer;" />
            <input type="text" id="brand-color-hex" class="form-input" value="${s.brand.primaryColor || '#a27e2c'}" onkeyup="document.getElementById('brand-color-picker').value = this.value;" style="width: 120px; font-family: monospace; font-weight: 700;" />
            <div id="brand-color-preview" style="height: 38px; padding: 0 16px; border-radius: 8px; background: ${s.brand.primaryColor || '#a27e2c'}; color: #fff; font-size: 11px; font-weight: 700; display: inline-flex; align-items: center;">
              Muestra de Color
            </div>
          </div>

          <span class="form-help" style="margin-bottom: 8px;">Paletas Gastronómicas de 1 Toque:</span>
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            ${[
              { name: "Dorado Real", hex: "#a27e2c" },
              { name: "Borgoña Gourmet", hex: "#8b1e2c" },
              { name: "Esmeralda Café", hex: "#1e6b52" },
              { name: "Azul Bistro", hex: "#1e3a8a" },
              { name: "Chocolate Fino", hex: "#5c3826" },
              { name: "Naranja Brasa", hex: "#d9531e" },
              { name: "Violeta Lounge", hex: "#6d28d9" },
              { name: "Negro Élite", hex: "#18181b" },
            ].map(p => `
              <button type="button" class="icon-preset-btn" onclick="selectColorPreset('${p.hex}')">
                <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: ${p.hex}; border: 1px solid rgba(255,255,255,0.2);"></span>
                <span>${p.name}</span>
              </button>
            `).join("")}
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- PESTAÑA 3: CANALES & WHATSAPP EN MESA                                     -->
    <!-- ========================================================================= -->
    
    <!-- TAB: MONITOREO Y CONFIGURACIÓN DE 10 MESAS EN TIEMPO REAL -->
    <div id="tab-tables" class="tab-content">
      <!-- GUÍA RÁPIDA DE MESAS -->
      <div class="quick-guide-box">
        <div class="quick-guide-header">
          <span>💡</span>
          <span>Guía Rápida: Control de 10 Mesas Conectadas en Tiempo Real</span>
        </div>
        <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 12px;">
          Cada una de las 10 mesas tiene un QR exclusivo conectado a una variable de estado en vivo (Disponible, Jugando, Premio Pendiente, Canjeado).
        </p>
        <div class="quick-guide-grid">
          <div class="quick-guide-item">
            <strong style="color: #34d399;">🟢 Mesa Disponible</strong>
            <p>La mesa está libre esperando al cliente. Escanear el QR activa la variable automáticamente.</p>
          </div>
          <div class="quick-guide-item">
            <strong style="color: #38bdf8;">🔵 Comensal Jugando</strong>
            <p>El cliente en mesa ingresó sus datos y está girando la ruleta en este momento.</p>
          </div>
          <div class="quick-guide-item">
            <strong style="color: #fbbf24;">🟡 Premio Pendiente</strong>
            <p>¡El comensal ganó un premio! Muestra el código en caja para validar con tu PIN.</p>
          </div>
          <div class="quick-guide-item">
            <strong style="color: #c084fc;">🔄 Liberación en 1-Clic</strong>
            <p>Cuando el comensal pague, pulsa "Liberar Mesa" para dejarla lista para el siguiente cliente.</p>
          </div>
        </div>
      </div>

      <!-- FORMULARIO RÁPIDO DE CONFIGURACIÓN DE MESAS -->
      <div class="panel" style="margin-bottom: 20px;">
        <div class="panel-header" style="border-bottom: 1px solid var(--card-border); padding-bottom: 10px; margin-bottom: 14px;">
          <div class="panel-title">
            <span>⚙️ Configurar Nombre, Zona y Capacidad de Mesa</span>
          </div>
          <span class="badge-role" style="background: rgba(56, 189, 248, 0.15); color: #38bdf8;">10 MESAS CONECTADAS</span>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; align-items: flex-end;">
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Seleccionar Mesa</label>
            <select id="cfgTableSelect" class="form-input" onchange="loadTableConfigForm()">
              ${(db.tables || DEFAULT_TABLES).map(t => `<option value="${t.number}">Mesa ${t.number} - ${t.name}</option>`).join("")}
            </select>
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Nombre Comercial de Mesa</label>
            <input type="text" id="cfgTableName" class="form-input" placeholder="Ej: Mesa 1 - Ventana">
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Zona del Local</label>
            <select id="cfgTableZone" class="form-input">
              <option value="Salón Principal">Salón Principal</option>
              <option value="Terraza Jardín">Terraza Jardín</option>
              <option value="Barra / Café">Barra / Café</option>
              <option value="Zona VIP">Zona VIP</option>
            </select>
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Capacidad (Personas)</label>
            <select id="cfgTableCapacity" class="form-input">
              <option value="2">2 Personas</option>
              <option value="4">4 Personas</option>
              <option value="6">6 Personas</option>
              <option value="8">8 Personas</option>
            </select>
          </div>
          <button type="button" class="btn-solid" style="padding: 10px 16px; font-size: 12px; font-weight: 700;" onclick="saveBackendTableConfig()">
            💾 Guardar Mesa
          </button>
        </div>
      </div>

      <!-- CUADRÍCULA DE LAS 10 TARJETAS DE MESA EN TIEMPO REAL -->
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; margin-bottom: 24px;">
        ${(db.tables || DEFAULT_TABLES).map(table => {
          const isPending = table.status === "PREMIO_PENDIENTE";
          const isPlaying = table.status === "JUGANDO";
          const isRedeemed = table.status === "CANJEADO";
          const isAvailable = table.status === "DISPONIBLE";

          const statusColor = isPending ? "#fbbf24" : isPlaying ? "#38bdf8" : isRedeemed ? "#34d399" : "#10b981";
          const statusBg = isPending ? "rgba(245, 158, 11, 0.15)" : isPlaying ? "rgba(56, 189, 248, 0.15)" : isRedeemed ? "rgba(52, 211, 153, 0.15)" : "rgba(16, 185, 129, 0.15)";
          const statusBorder = isPending ? "rgba(245, 158, 11, 0.4)" : isPlaying ? "rgba(56, 189, 248, 0.4)" : isRedeemed ? "rgba(52, 211, 153, 0.4)" : "rgba(16, 185, 129, 0.4)";
          const statusLabel = isPending ? "🟡 PREMIO PENDIENTE" : isPlaying ? "🔵 JUGANDO AHORA" : isRedeemed ? "✓ PREMIO CANJEADO" : "🟢 DISPONIBLE";

          return `
            <div id="table-card-${table.number}" style="background: var(--card-bg); border: 2px solid ${statusBorder}; border-radius: 16px; padding: 16px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 4px 14px rgba(0,0,0,0.25); transition: all 0.2s ease;">
              <!-- Encabezado de la Mesa -->
              <div>
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                  <div>
                    <span style="font-size: 16px; font-weight: 800; color: #fff; display: flex; align-items: center; gap: 6px;">
                      <span>🪑</span> ${table.name}
                    </span>
                    <span style="font-size: 11px; color: var(--text-muted); font-family: monospace;">${table.zone} · ${table.capacity} pers</span>
                  </div>
                  <span style="font-size: 10px; font-weight: 800; padding: 3px 8px; border-radius: 9999px; background: ${statusBg}; color: ${statusColor}; border: 1px solid ${statusBorder}; font-family: monospace;">
                    ${statusLabel}
                  </span>
                </div>

                <!-- Datos del Comensal y Variable Conectada -->
                <div style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 10px 12px; margin: 10px 0; font-size: 11px; space-y: 4px;">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                    <span style="color: var(--text-muted);">Comensal:</span>
                    <strong style="color: var(--text);">${table.currentCustomer || "Mesa Libre"}</strong>
                  </div>
                  ${table.currentWhatsapp ? `
                  <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                    <span style="color: var(--text-muted);">WhatsApp:</span>
                    <span style="color: #34d399; font-family: monospace;">+${table.currentWhatsapp}</span>
                  </div>` : ""}
                  ${table.prizeWon ? `
                  <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                    <span style="color: var(--text-muted);">Premio:</span>
                    <span style="color: #fbbf24; font-weight: 700; text-align: right;">${table.prizeWon}</span>
                  </div>` : ""}
                  ${table.uniqueCode ? `
                  <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                    <span style="color: var(--text-muted);">Cupón:</span>
                    <span style="color: #fff; background: rgba(255,255,255,0.1); padding: 1px 6px; border-radius: 4px; font-family: monospace; font-weight: 800;">${table.uniqueCode}</span>
                  </div>` : ""}
                  <div style="display: flex; justify-content: space-between; margin-top: 6px; padding-top: 4px; border-top: 1px dashed rgba(255,255,255,0.08); font-size: 10px;">
                    <span style="color: #6b7280;">Variable: mesa.${table.number}</span>
                    <span style="color: #38bdf8; font-family: monospace;">${table.activeSessionId || "ID: Libre"}</span>
                  </div>
                </div>
              </div>

              <!-- Acciones de Mesa -->
              <div style="display: flex; gap: 8px; margin-top: 6px;">
                <a href="${table.qrUrl}" target="_blank" class="btn-secondary" style="flex: 1; text-align: center; text-decoration: none; font-size: 11px; padding: 6px 8px; display: inline-flex; align-items: center; justify-content: center; gap: 4px;">
                  <span>🔗</span> <span>Abrir Mesa</span>
                </a>
                <button type="button" class="btn-secondary" style="padding: 6px 10px; font-size: 11px;" onclick="resetBackendTable(${table.number})" title="Liberar mesa y poner disponible">
                  <span>🔄</span> <span>Liberar</span>
                </button>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    </div>
  
<div id="tab-channels" class="tab-content">
      <div class="panel">
        <div class="panel-header">
          <div class="panel-title">
            <span>📱 Canales de Contacto, Instagram & WhatsApp en Mesa</span>
          </div>
          <div>
            <span id="toast-channels" class="toast-success">✓ ¡Canales guardados con éxito!</span>
            <button class="btn-save" onclick="saveChannelsConfig()">💾 Guardar Canales</button>
          </div>
        </div>

        <div style="padding: 14px; background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.25); border-radius: 12px; margin-bottom: 18px; font-size: 12px;">
          <strong>Regla de Juego:</strong> El comensal juega inicialmente por <strong>Instagram Stories</strong> como canal principal de marketing boca a boca. Puedes activar <strong>WhatsApp</strong> para comensales que no usan redes sociales.
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;">
          <div class="form-group">
            <label class="form-label">📸 Usuario Oficial de Instagram (Canal Principal):</label>
            <input type="text" id="chan-ig" class="form-input" value="${s.channels.instagramHandle || '@blisssoulbakery'}" placeholder="@tu_restaurante" />
            <span class="form-help">Mención obligatoria sugerida a los comensales en su Story.</span>
          </div>

          <div class="form-group">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <label class="form-label" style="margin: 0;">💬 Opción de WhatsApp en Mesa:</label>
              <label style="display: inline-flex; align-items: center; gap: 6px; cursor: pointer; background: rgba(16, 185, 129, 0.15); padding: 2px 8px; border-radius: 6px; border: 1px solid rgba(16, 185, 129, 0.3);">
                <input type="checkbox" id="chan-wa-enabled" ${s.channels.enableWhatsAppPhoto !== false ? 'checked' : ''} style="cursor: pointer;" />
                <span style="color: #34d399; font-weight: 700; font-size: 11px;">Habilitar en Mesa</span>
              </label>
            </div>
            <input type="text" id="chan-wa-phone" class="form-input" value="${s.channels.whatsappNumber || '573022777295'}" placeholder="573000000000" />
            <span class="form-help">Teléfono que recibirá la foto de comensales que no usan Instagram.</span>
          </div>

          <div class="form-group" style="grid-column: 1 / -1;">
            <label class="form-label">Plantilla del Mensaje de WhatsApp (al recibir foto del comensal):</label>
            <textarea id="chan-wa-msg" rows="2" class="form-input" style="font-family: inherit;">${s.channels.whatsappPhotoMessage || ''}</textarea>
            <span class="form-help">Variables disponibles: {brandName}, {tableNumber}, {participantName}</span>
          </div>

          <div class="form-group" style="grid-column: 1 / -1;">
            <label class="form-label">Enlace a Reseñas de Google Maps (Google My Business):</label>
            <input type="text" id="chan-maps" class="form-input" value="${s.channels.googleMapsReviewUrl || 'https://maps.google.com'}" placeholder="https://g.page/r/.../review" />
            <span class="form-help">Los clientes son dirigidos aquí tras calificar positivamente con 4 o 5 estrellas.</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- PESTAÑA 4: RULETA DE PREMIOS & PROBABILIDADES                             -->
    <!-- ========================================================================= -->
    <!-- ========================================================================= -->
    <!-- PESTAÑA: SELECCIÓN DE JUEGO EN MESA (RULETA VS RETO 10S)                  -->
    <!-- ========================================================================= -->
    <div id="tab-game-mode" class="tab-content">
      <!-- GUÍA RÁPIDA -->
      <div class="quick-guide-box">
        <div class="quick-guide-header">
          <span>💡</span>
          <span>Guía Rápida: Selección del Juego Activo en Mesa</span>
        </div>
        <div class="quick-guide-grid">
          <div class="quick-guide-item">
            <strong>⏱️ Reto de Precisión 10 Segundos</strong>
            <span>Desafío de reflejos táctiles: el cliente debe frenar el cronómetro exactamente en 10.000s para ganar.</span>
          </div>
          <div class="quick-guide-item">
            <strong>🎡 Ruleta de la Fortuna</strong>
            <span>Giro animado por algoritmos de probabilidad matemática configurados en la pestaña Premios de Ruleta.</span>
          </div>
          <div class="quick-guide-item">
            <strong>⚡ Sincronización Inmediata</strong>
            <span>Al presionar "Guardar Selección", el frontend de las mesas adopta el nuevo juego de inmediato.</span>
          </div>
        </div>
      </div>

      <!-- PANEL SELECTOR DE MECÁNICA DE JUEGO -->
      <div class="panel" style="margin-bottom: 24px; border: 1px solid #d97706; background: rgba(217, 119, 6, 0.04);">
        <div class="panel-header">
          <div class="panel-title">
            <span style="font-size: 16px;">🎮 Mecánica de Juego Activa en Mesa (Ruleta vs Reto de Precisión 10s)</span>
          </div>
          <div>
            <span id="toast-game-mode" class="toast-success">✓ ¡Mecánica de juego actualizada!</span>
            <button class="btn-save" onclick="saveGameModeConfig()">💾 Guardar Selección de Juego</button>
          </div>
        </div>

        <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 16px;">
          Elige el tipo de juego que verán los clientes en sus móviles al escanear el QR en mesa. Después de seleccionar, configura cada detalle directamente aquí.
        </p>

        <!-- PASO 1: Selector visual de 4 tarjetas -->
        <div style="margin-bottom: 8px;">
          <div style="font-size: 11px; font-weight: 700; color: var(--text-muted); letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 12px;">① Elige el tipo de juego</div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 20px;">

            <div class="game-mode-card ${gc.gameMode === 'roulette' ? 'active' : ''}" onclick="selectBackendGameMode('roulette', this)">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 24px;">🎡</span>
                <span class="mode-check">${gc.gameMode === 'roulette' ? '✓ ACTIVO' : ''}</span>
              </div>
              <div style="font-weight: 700; color: var(--text); font-size: 13px;">Ruleta de la Fortuna</div>
              <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">Azar puro y emoción instantánea con disco dorado animado.</div>
            </div>

            <div class="game-mode-card ${gc.gameMode === 'precision' ? 'active' : ''}" onclick="selectBackendGameMode('precision', this)">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 24px;">⏱️</span>
                <span class="mode-check">${gc.gameMode === 'precision' ? '✓ ACTIVO' : ''}</span>
              </div>
              <div style="font-weight: 700; color: var(--text); font-size: 13px;">Reto de Precisión 10s</div>
              <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">Habilidad táctil. El cliente frena el cronómetro en 10.000s exactos.</div>
            </div>

            <div class="game-mode-card ${gc.gameMode === 'hybrid' ? 'active' : ''}" onclick="selectBackendGameMode('hybrid', this)">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 24px;">🔄</span>
                <span class="mode-check">${gc.gameMode === 'hybrid' ? '✓ ACTIVO' : ''}</span>
              </div>
              <div style="font-weight: 700; color: var(--text); font-size: 13px;">Modo Libre / Híbrido</div>
              <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">El comensal elige en su móvil entre Ruleta o Reto de Precisión.</div>
            </div>

            <div class="game-mode-card ${gc.gameMode === 'stamps' ? 'active' : ''}" onclick="selectBackendGameMode('stamps', this)">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 24px;">💳</span>
                <span class="mode-check">${gc.gameMode === 'stamps' ? '✓ ACTIVO' : ''}</span>
              </div>
              <div style="font-weight: 700; color: var(--text); font-size: 13px;">Pasaporte de Sellos</div>
              <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">Fidelización por visitas repetidas con premios cada 5 sellos.</div>
            </div>
          </div>
        </div>

        <input type="hidden" id="backendGameMode" value="${gc.gameMode}" />

        <!-- PASO 2: Panel de configuración contextual (cambia según el juego elegido) -->
        <div id="game-config-wizard" style="display: flex; flex-direction: column; gap: 14px;">

          <!-- === CONFIGURACIÓN: RULETA === -->
          <div id="wizard-roulette" style="display: ${gc.gameMode === 'roulette' || gc.gameMode === 'hybrid' ? 'block' : 'none'};">
            <div style="background: #FFFBEB; border: 1px solid #FCD34D; border-radius: 14px; padding: 18px 20px;">
              <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 14px; border-bottom: 1px solid #FDE68A; padding-bottom: 10px;">
                <span style="font-size: 20px;">🎡</span>
                <div>
                  <div style="font-weight: 700; color: #92400E; font-size: 14px;">② Configura la Ruleta de la Fortuna</div>
                  <div style="font-size: 11px; color: #B45309;">Los premios y probabilidades se configuran en la pestaña "Ruleta & Premios" del menú lateral</div>
                </div>
                <a href="#" onclick="switchTab('tab-roulette', document.querySelector('[data-tab=tab-roulette]'))" style="margin-left: auto; background: #92400E; color: #fff; font-size: 11px; font-weight: 700; padding: 6px 12px; border-radius: 8px; text-decoration: none;">Ir a Configurar Premios →</a>
              </div>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px;">
                <div class="form-group" style="margin-bottom: 0;">
                  <label class="form-label">Probabilidad de ganar (%)</label>
                  <div style="font-size: 22px; font-weight: 800; color: #92400E;">${s.prizes ? s.prizes.filter(p => p.active !== false).reduce((acc, p) => acc + (p.probability || 0), 0) : 0}%</div>
                  <span class="form-help">Suma de probabilidades de premios activos</span>
                </div>
                <div class="form-group" style="margin-bottom: 0;">
                  <label class="form-label">Premios activos</label>
                  <div style="font-size: 22px; font-weight: 800; color: #92400E;">${s.prizes ? s.prizes.filter(p => p.active !== false).length : 0}</div>
                  <span class="form-help">De ${s.prizes ? s.prizes.length : 0} premios configurados</span>
                </div>
              </div>
            </div>
          </div>

          <!-- === CONFIGURACIÓN: PRECISIÓN === -->
          <div id="wizard-precision" style="display: ${gc.gameMode === 'precision' || gc.gameMode === 'hybrid' ? 'block' : 'none'};">
            <div style="background: var(--info-bg); border: 1px solid rgba(37, 99, 235, 0.3); border-radius: 14px; padding: 18px 20px;">
              <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 16px; border-bottom: 1px solid rgba(37, 99, 235, 0.15); padding-bottom: 10px;">
                <span style="font-size: 20px;">⏱️</span>
                <div>
                  <div style="font-weight: 700; color: var(--info); font-size: 14px;">② Configura el Reto de Precisión 10s</div>
                  <div style="font-size: 11px; color: #3B82F6;">Ajusta la dificultad y número de intentos permitidos</div>
                </div>
              </div>

              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px;">
                <div class="form-group" style="margin-bottom: 0;">
                  <label class="form-label">Dificultad / Margen de victoria</label>
                  <select id="precisionDifficulty" class="form-input" style="padding: 8px 12px; font-size: 12px;">
                    <option value="facil" ${gc.precisionDifficulty === 'facil' ? 'selected' : ''}>🟢 Fácil (±80ms) — Más ganadores, más diversión</option>
                    <option value="medio" ${gc.precisionDifficulty === 'medio' || !gc.precisionDifficulty ? 'selected' : ''}>🟡 Medio (±40ms) — Equilibrado y justo</option>
                    <option value="dificil" ${gc.precisionDifficulty === 'dificil' ? 'selected' : ''}>🔴 Boutique Experto (±15ms) — Exclusivo y emocionante</option>
                  </select>
                  <span class="form-help">Define qué tan cerca de 10.000s debe frenar el comensal para ganar</span>
                </div>
                <div class="form-group" style="margin-bottom: 0;">
                  <label class="form-label">Intentos máximos por visita</label>
                  <select id="maxAttempts" class="form-input" style="padding: 8px 12px; font-size: 12px;">
                    <option value="1" ${gc.maxAttempts == 1 ? 'selected' : ''}>1 intento — Máxima emoción</option>
                    <option value="2" ${gc.maxAttempts == 2 ? 'selected' : ''}>2 intentos — Equilibrado</option>
                    <option value="3" ${!gc.maxAttempts || gc.maxAttempts == 3 ? 'selected' : ''}>3 intentos — Recomendado para mayor retención</option>
                    <option value="5" ${gc.maxAttempts == 5 ? 'selected' : ''}>5 intentos — Modo diversión total</option>
                  </select>
                  <span class="form-help">Si falla todos los intentos, recibe un mensaje de ánimo y próxima visita</span>
                </div>
              </div>
            </div>
          </div>

          <!-- === CONFIGURACIÓN: SELLOS === -->
          <div id="wizard-stamps" style="display: ${gc.gameMode === 'stamps' ? 'block' : 'none'};">
            <div style="background: var(--success-bg); border: 1px solid rgba(5, 150, 105, 0.3); border-radius: 14px; padding: 18px 20px;">
              <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 14px; border-bottom: 1px solid rgba(5, 150, 105, 0.15); padding-bottom: 10px;">
                <span style="font-size: 20px;">💳</span>
                <div>
                  <div style="font-weight: 700; color: var(--success); font-size: 14px;">② Configura el Pasaporte de Sellos</div>
                  <div style="font-size: 11px; color: #059669;">Los hitos y premios de sellos se configuran en la pestaña "Sellos & Fidelización"</div>
                </div>
                <a href="#" onclick="switchTab('tab-stamps', document.querySelector('[data-tab=tab-stamps]'))" style="margin-left: auto; background: var(--success); color: #fff; font-size: 11px; font-weight: 700; padding: 6px 12px; border-radius: 8px; text-decoration: none;">Ir a Configurar Sellos →</a>
              </div>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px;">
                ${s.stamps.milestones.map(m => `
                  <div style="background: #FFFFFF; border: 1px solid var(--card-border); border-radius: 10px; padding: 12px;">
                    <div style="font-size: 20px; margin-bottom: 4px;">${m.icon}</div>
                    <div style="font-size: 11px; font-weight: 700; color: var(--text);">Sello ${m.stamp}</div>
                    <div style="font-size: 10px; color: var(--text-muted);">${m.title.replace(/^[^:]+:\s*/, '')}</div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- PASO 3: Botón de guardar siempre visible -->
          <div style="display: flex; align-items: center; justify-content: space-between; background: #F8FAFC; border: 1px solid var(--card-border); border-radius: 12px; padding: 14px 18px; flex-wrap: wrap; gap: 12px;">
            <div>
              <div style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">③ Activar en el restaurante</div>
              <div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">El cambio se aplica al instante en todos los móviles de los comensales</div>
            </div>
            <div style="display: flex; align-items: center; gap: 12px;">
              <span id="toast-game-mode" class="toast-success">✓ ¡Juego activado en el restaurante!</span>
              <button class="btn-save" onclick="saveGameModeConfig()">⚡ Activar Juego Seleccionado</button>
            </div>
          </div>

    <!-- ========================================================================= -->
    <!-- PESTAÑA: PREMIOS DE RULETA & PROBABILIDADES MATEMÁTICAS (SUMA = 100%)      -->
    <!-- ========================================================================= -->
    <div id="tab-roulette" class="tab-content">
      <div class="panel">
        <div class="panel-header">
          <div class="panel-title">
            <span>🎡 Premios de la Ruleta & Probabilidades Matemáticas (Suma = 100%)</span>
          </div>
          <div>
            <span id="toast-roulette" class="toast-success">✓ ¡Premios de la ruleta guardados!</span>
            <button class="btn-save" onclick="saveRouletteConfig()">💾 Guardar Ruleta</button>
          </div>
        </div>

        <div style="display: flex; align-items: center; justify-content: space-between; background: #0b0f19; padding: 12px 16px; border-radius: 12px; margin-bottom: 16px; border: 1px solid var(--card-border);">
          <span style="font-size: 12px; color: var(--text-muted);">Verificación de Suma de Probabilidades:</span>
          <span id="roulette-sum-badge" style="font-size: 13px; font-weight: 800; padding: 4px 12px; border-radius: 8px; background: rgba(16, 185, 129, 0.2); color: #34d399;">
            Suma Total: 100% ✓
          </span>
        </div>

        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Nombre del Premio en Ruleta</th>
                <th>Valor / Etiqueta</th>
                <th>Probabilidad (%)</th>
                <th>Color HEX</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody id="roulette-rows">
              ${s.prizes.map((p, idx) => `
                <tr data-prize-id="${p.id || 'p' + (idx + 1)}">
                  <td style="font-weight: 700; color: #fbbf24;">#${idx + 1}</td>
                  <td>
                    <input type="text" class="form-input prize-name" value="${p.name}" style="padding: 6px 10px; font-size: 11px;" />
                  </td>
                  <td>
                    <input type="text" class="form-input prize-value" value="${p.value || ''}" style="width: 100px; padding: 6px 10px; font-size: 11px;" />
                  </td>
                  <td>
                    <input type="number" min="0" max="100" class="form-input prize-prob" value="${p.probability}" style="width: 80px; padding: 6px 10px; font-size: 11px; font-weight: 700;" onchange="updateRouletteSum()" onkeyup="updateRouletteSum()" />
                  </td>
                  <td>
                    <div style="display: flex; align-items: center; gap: 6px;">
                      <input type="color" class="prize-color-picker" value="${p.color}" onchange="this.nextElementSibling.value = this.value" style="width: 28px; height: 28px; border: none; background: transparent; cursor: pointer;" />
                      <input type="text" class="form-input prize-color" value="${p.color}" style="width: 80px; padding: 4px 8px; font-family: monospace; font-size: 10px;" />
                    </div>
                  </td>
                  <td>
                    <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                      <input type="checkbox" class="prize-active" ${p.active !== false ? 'checked' : ''} />
                      <span style="font-size: 11px;">Activo</span>
                    </label>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- PESTAÑA 5: TARJETA DE SELLOS & SELECTOR DE ICONOS                         -->
    <!-- ========================================================================= -->
    <div id="tab-stamps" class="tab-content">
      <!-- GUÍA RÁPIDA -->
      <div class="quick-guide-box">
        <div class="quick-guide-header">
          <span>💡</span>
          <span>Guía Rápida: Tarjeta de 15 Sellos & Recompensas por Visita</span>
        </div>
        <div class="quick-guide-grid">
          <div class="quick-guide-item">
            <strong>🎟️ Premios en Visitas 5, 10 y 15</strong>
            <span>La tarjeta premia a los comensales cada 5 visitas para maximizar la tasa de retorno al restaurante.</span>
          </div>
          <div class="quick-guide-item">
            <strong>⚡ Horas Muertas (3 a 6 PM)</strong>
            <span>El multiplicador x2 de sellos motiva visitas en las tardes de bajo tráfico de forma autónoma.</span>
          </div>
          <div class="quick-guide-item">
            <strong>☕ Icono de Marca</strong>
            <span>Elige el emoji que mejor represente tu gastronomía (café, croissant, postre, pizza, etc.).</span>
          </div>
        </div>
      </div>

      <div class="panel">
        <div class="panel-header">
          <div class="panel-title">
            <span>🎟️ Tarjeta de 15 Sellos & Selector de Iconos de Recompensa</span>
          </div>
          <div>
            <span id="toast-stamps" class="toast-success">✓ ¡Iconos y sellos guardados!</span>
            <button class="btn-save" onclick="saveStampsConfig()">💾 Guardar Tarjeta de Sellos</button>
          </div>
        </div>

        <!-- SELECTOR DE ICONO DE VISITA INTERMEDIA -->
        <div style="background: #0b0f19; border: 1px solid var(--card-border); border-radius: 14px; padding: 16px; margin-bottom: 20px;">
          <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 12px;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span id="stamp-visit-icon-preview" style="font-size: 28px; width: 44px; height: 44px; border-radius: 12px; background: rgba(217, 119, 6, 0.15); border: 1px solid rgba(217, 119, 6, 0.4); display: flex; align-items: center; justify-content: center;">
                ${s.stamps.visitIcon || '☕'}
              </span>
              <div>
                <h4 style="font-size: 13px; font-weight: 700; color: #fff;">Icono de Visitas Intermedias (Sellos 1-4, 6-9, 11-14)</h4>
                <p style="font-size: 11px; color: var(--text-muted);">Adapta la tarjeta al giro de tu negocio (Café, Panadería, Pizzería, Bar, Mascotas, etc.).</p>
              </div>
            </div>

            <input type="text" id="stamp-visit-icon" class="form-input" value="${s.stamps.visitIcon || '☕'}" maxlength="4" style="width: 60px; text-align: center; font-size: 18px;" onkeyup="document.getElementById('stamp-visit-icon-preview').innerText = this.value || '☕'" />
          </div>

          <span class="form-help" style="margin-bottom: 8px;">Paleta de Iconos Rápidos para Visitas:</span>
          <div style="display: flex; flex-wrap: wrap; gap: 6px;">
            ${[
              { icon: "☕", label: "Café" },
              { icon: "🥐", label: "Pan" },
              { icon: "🍪", label: "Galleta" },
              { icon: "🧁", label: "Muffin" },
              { icon: "🍔", label: "Burger" },
              { icon: "🍕", label: "Pizza" },
              { icon: "🌮", label: "Tacos" },
              { icon: "🍹", label: "Bar" },
              { icon: "🐾", label: "Mascotas" },
              { icon: "⭐", label: "Estrella" },
              { icon: "🏷️", label: "Comercio" },
              { icon: "✨", label: "Magia" },
            ].map(p => `
              <button type="button" class="icon-preset-btn ${s.stamps.visitIcon === p.icon ? 'active' : ''}" onclick="selectVisitIconPreset('${p.icon}')">
                <span>${p.icon}</span>
                <span style="font-size: 10px; color: var(--text-muted);">${p.label}</span>
              </button>
            `).join("")}
          </div>
        </div>

        <!-- LOS 3 GRANDES HITOS DE PREMIOS (SELLOS 5, 10 Y 15) -->
        <h4 style="font-size: 13px; font-weight: 700; color: #fbbf24; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px;">
          🎁 Los 3 Grandes Hitos de Premios (Sellos #5, #10 y #15)
        </h4>

        <div style="display: flex; flex-direction: column; gap: 14px;">
          ${(s.stamps.milestones || []).map((m, idx) => `
            <div style="background: #0f1626; border: 1px solid rgba(217, 119, 6, 0.35); border-radius: 14px; padding: 16px;" data-milestone-index="${idx}">
              <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 8px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="background: #f59e0b; color: #000; font-weight: 800; font-size: 11px; padding: 2px 8px; border-radius: 6px;">SELLO #${m.stamp}</span>
                  <span id="m-icon-preview-${idx}" style="font-size: 20px;">${m.icon || '🎁'}</span>
                  <strong style="color: #fff; font-size: 13px;">${m.title}</strong>
                </div>
                <span style="font-size: 11px; color: #fbbf24; font-weight: 700;">Hito de Recompensa Exclusivo</span>
              </div>

              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
                <div>
                  <label class="form-label">Icono del Premio:</label>
                  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                    <input type="text" id="m-icon-${idx}" class="form-input" value="${m.icon || '🎁'}" maxlength="4" style="width: 50px; text-align: center; font-size: 16px;" onkeyup="document.getElementById('m-icon-preview-${idx}').innerText = this.value || '🎁'" />
                    <span style="font-size: 11px; color: #6b7280;">Emoji o símbolo</span>
                  </div>
                  <!-- Presets para este hito -->
                  <div style="display: flex; flex-wrap: wrap; gap: 4px;">
                    ${(idx === 0
                      ? ["🍰", "🧁", "🍪", "🥐", "☕", "🎁", "🍩", "🍦"]
                      : idx === 1
                      ? ["👑", "🍔", "🍕", "🥗", "🍹", "🏆", "🥪", "🍳"]
                      : ["🌟", "🥂", "🍾", "🍽️", "🎂", "💎", "🎖️", "🍷"]
                    ).map(e => `
                      <button type="button" class="icon-preset-btn" style="padding: 3px 6px; font-size: 13px;" onclick="document.getElementById('m-icon-${idx}').value = '${e}'; document.getElementById('m-icon-preview-${idx}').innerText = '${e}';">
                        ${e}
                      </button>
                    `).join("")}
                  </div>
                </div>

                <div style="grid-column: span 2;">
                  <label class="form-label">Título del Premio:</label>
                  <input type="text" id="m-title-${idx}" class="form-input" value="${m.title}" />
                </div>

                <div style="grid-column: 1 / -1;">
                  <label class="form-label">Descripción del Beneficio:</label>
                  <input type="text" id="m-desc-${idx}" class="form-input" value="${m.description}" />
                </div>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- PESTAÑA 6: BASES DE DATOS (GOOGLE SHEETS & SUPABASE)                      -->
    <!-- ========================================================================= -->
    <div id="tab-databases" class="tab-content">
      <div class="panel">
        <div class="panel-header">
          <div class="panel-title">
            <span>🗄️ Sincronización Dual: Google Sheets & Supabase</span>
          </div>
          <div>
            <span id="toast-databases" class="toast-success">✓ ¡Bases de datos guardadas!</span>
            <button class="btn-save" onclick="saveDatabasesConfig()">💾 Guardar Bases de Datos</button>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px;">
          <!-- GOOGLE SHEETS -->
          <div style="background: #0b0f19; border: 1px solid rgba(16, 185, 129, 0.4); border-radius: 14px; padding: 18px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <strong style="color: #34d399; font-size: 13px; text-transform: uppercase;">Opción 1: Google Sheets</strong>
              <span style="font-size: 10px; background: rgba(16, 185, 129, 0.2); color: #34d399; padding: 2px 8px; border-radius: 6px; font-weight: 700;">Costo $0 · Webhook</span>
            </div>
            <p style="font-size: 11px; color: var(--text-muted); margin-bottom: 12px;">
              Envía cada ruleta jugada y cada canje con PIN a una hoja de Google Drive.
            </p>
            <div class="form-group">
              <label class="form-label">URL del Webhook de Apps Script:</label>
              <input type="url" id="db-sheets-url" class="form-input" value="${s.databases.googleSheetWebhookUrl || ''}" placeholder="https://script.google.com/macros/s/.../exec" />
            </div>
          </div>

          <!-- SUPABASE -->
          <div style="background: #0b0f19; border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 14px; padding: 18px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <strong style="color: #38bdf8; font-size: 13px; text-transform: uppercase;">Opción 2: Supabase (PostgreSQL)</strong>
              <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                <input type="checkbox" id="db-sb-enabled" ${s.databases.supabaseEnabled ? 'checked' : ''} />
                <span style="color: #38bdf8; font-weight: 700; font-size: 11px;">Habilitar</span>
              </label>
            </div>
            <p style="font-size: 11px; color: var(--text-muted); margin-bottom: 12px;">
              Base de datos SQL profesional en la nube para sincronización en tiempo real.
            </p>
            <div class="form-group">
              <label class="form-label">Supabase Project URL:</label>
              <input type="url" id="db-sb-url" class="form-input" value="${s.databases.supabaseProjectUrl || ''}" placeholder="https://xyz.supabase.co" />
            </div>
            <div class="form-group">
              <label class="form-label">Supabase Anon Key:</label>
              <input type="text" id="db-sb-key" class="form-input" value="${s.databases.supabaseAnonKey || ''}" placeholder="eyJhbGciOi..." />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- PESTAÑA 7: COMPOSIO & AUTOMATIZACIONES IA                                 -->
    <!-- ========================================================================= -->
    <div id="tab-composio" class="tab-content">
      <!-- GUÍA RÁPIDA -->
      <div class="quick-guide-box">
        <div class="quick-guide-header">
          <span>💡</span>
          <span>Guía Rápida: Integración con Composio.dev & IA</span>
        </div>
        <div class="quick-guide-grid">
          <div class="quick-guide-item">
            <strong>⚡ Conexión a 200+ Apps</strong>
            <span>Conecta WhatsApp, Gmail, Slack, CRM y bases de datos usando tu API Key de Composio.</span>
          </div>
          <div class="quick-guide-item">
            <strong>🤖 Agentes Inteligentes</strong>
            <span>Sincroniza el menú, los premios y la marca con bots para atención automatizada.</span>
          </div>
          <div class="quick-guide-item">
            <strong>🔗 Webhooks Sin Código</strong>
            <span>Recibe notificaciones en tiempo real cuando un comensal gana o canjea un premio en caja.</span>
          </div>
        </div>
      </div>

      <div class="panel">
        <div class="panel-header">
          <div class="panel-title">
            <span>⚡ Composio.dev · Conector de Inteligencia Artificial & Automatización</span>
          </div>
          <div>
            <span id="toast-composio" class="toast-success">✓ ¡Configuración Composio guardada!</span>
            <button class="btn-save" onclick="saveComposioBackendConfig()">💾 Guardar Composio</button>
          </div>
        </div>

        <div style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(11, 15, 25, 0.9) 100%); border: 1px solid rgba(245, 158, 11, 0.4); border-radius: 16px; padding: 20px; margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 14px;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="font-size: 32px;">⚡</span>
              <div>
                <strong style="color: #fbbf24; font-size: 15px; text-transform: uppercase;">Integración Oficial con Composio.dev</strong>
                <p style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">
                  Conecta tu negocio gastronómico con más de 100 herramientas sin código (Google Sheets, Contacts, WhatsApp Oficial, Correo y CRM).
                </p>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <span id="comp-status-badge" style="font-size: 11px; padding: 4px 12px; border-radius: 20px; font-weight: 700; ${s.composio && s.composio.enabled ? 'background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.4);' : 'background: rgba(107, 114, 128, 0.2); color: var(--text-muted); border: 1px solid rgba(107, 114, 128, 0.4);'}">
                ${s.composio && s.composio.enabled ? '🟢 Conectado con Composio.dev' : '⚪ Sin conectar'}
              </span>
              <button onclick="connectComposioNow()" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #000; font-weight: 800; font-size: 11px; text-transform: uppercase; padding: 9px 16px; border-radius: 10px; border: none; cursor: pointer; display: flex; align-items: center; gap: 6px; box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);">
                ⚡ Conectar con Composio.dev
              </button>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin-top: 16px;">
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label">Composio API Key:</label>
              <input type="password" id="comp-api-key" class="form-input" value="${(s.composio && s.composio.apiKey) || ''}" placeholder="comp_live_..." />
              <span class="form-help">Consigue tu llave gratis en <a href="https://composio.dev" target="_blank" style="color: #fbbf24; text-decoration: underline;">composio.dev</a>.</span>
            </div>

            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label">Webhook Fallback (Google Apps Script):</label>
              <input type="url" id="comp-webhook-url" class="form-input" value="${(s.composio && s.composio.endpoints && s.composio.endpoints.googleSheetWebhookUrl) || s.databases.googleSheetWebhookUrl || ''}" placeholder="https://script.google.com/macros/s/.../exec" />
              <span class="form-help">Webhook alternativo gratuito para sincronización directa a hojas de cálculo.</span>
            </div>
          </div>

          <div style="margin-top: 16px; padding-top: 14px; border-top: 1px solid rgba(255,255,255,0.08);">
            <strong style="color: #fff; font-size: 12px; display: block; margin-bottom: 10px;">Herramientas Automatizadas Activas:</strong>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px;">
              <label style="display: flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.3); padding: 8px 12px; border-radius: 8px; border: 1px solid var(--card-border); cursor: pointer;">
                <input type="checkbox" id="comp-tool-sheets" ${s.composio && s.composio.integrations && s.composio.integrations.googleSheets ? 'checked' : ''} />
                <span style="font-size: 12px; color: #fff;">📗 Google Sheets en Vivo</span>
              </label>
              <label style="display: flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.3); padding: 8px 12px; border-radius: 8px; border: 1px solid var(--card-border); cursor: pointer;">
                <input type="checkbox" id="comp-tool-contacts" ${s.composio && s.composio.integrations && s.composio.integrations.googleContacts ? 'checked' : ''} />
                <span style="font-size: 12px; color: #fff;">👤 Google Contacts Auto</span>
              </label>
              <label style="display: flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.3); padding: 8px 12px; border-radius: 8px; border: 1px solid var(--card-border); cursor: pointer;">
                <input type="checkbox" id="comp-tool-wa" ${s.composio && s.composio.integrations && s.composio.integrations.whatsAppAutoSend ? 'checked' : ''} />
                <span style="font-size: 12px; color: #fff;">💬 WhatsApp Notificación</span>
              </label>
              <label style="display: flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.3); padding: 8px 12px; border-radius: 8px; border: 1px solid var(--card-border); cursor: pointer;">
                <input type="checkbox" id="comp-tool-email" ${s.composio && s.composio.integrations && s.composio.integrations.dailyEmailSummary ? 'checked' : ''} />
                <span style="font-size: 12px; color: #fff;">✉️ Resumen Diario Email</span>
              </label>
            </div>
          </div>

          <div style="margin-top: 16px; display: flex; justify-content: flex-end;">
            <button onclick="testComposioSync()" style="background: #F8FAFC; color: var(--text); font-size: 11px; padding: 7px 14px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15); cursor: pointer;">
              🚀 Disparar Evento de Prueba a Composio
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- PESTAÑA 8: SEGURIDAD, PINS & PERMISOS DE ROLES                            -->
    <!-- ========================================================================= -->
    <div id="tab-security" class="tab-content">
      <!-- GUÍA RÁPIDA -->
      <div class="quick-guide-box">
        <div class="quick-guide-header">
          <span>💡</span>
          <span>Guía Rápida: Control de Acceso por Roles (RBAC 3 Niveles)</span>
        </div>
        <div class="quick-guide-grid">
          <div class="quick-guide-item">
            <strong>👑 Dueño Master (8888)</strong>
            <span>Control total de marca, finanzas, probabilidades, roles y conexión con bases de datos.</span>
          </div>
          <div class="quick-guide-item">
            <strong>👔 Administrador / Gerente (5555)</strong>
            <span>Gestión operativa diaria, métricas de ventas y canales según los permisos concedidos.</span>
          </div>
          <div class="quick-guide-item">
            <strong>💼 Cajero de Turno (1978)</strong>
            <span>Validación rápida de cupones y asignación de sellos en caja en el momento del pago.</span>
          </div>
        </div>
      </div>

      <div class="panel">
        <div class="panel-header">
          <div class="panel-title">
            <span>🔐 Seguridad de Caja & Control de Acceso por Roles (PINs & Permisos)</span>
          </div>
          <div>
            <span id="toast-security" class="toast-success">✓ ¡Permisos y PINs guardados!</span>
            <button class="btn-save" onclick="saveSecurityConfig()">💾 Guardar Permisos y PINs</button>
          </div>
        </div>

        <!-- 3 TARJETAS DE PINS -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; margin-bottom: 20px;">
          <!-- 1. DUEÑO -->
          <div style="background: #0b0f19; border: 1px solid rgba(245, 158, 11, 0.4); border-radius: 14px; padding: 18px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 18px;">👑</span>
                <strong style="color: #fbbf24; font-size: 13px;">Dueño Master</strong>
              </div>
              <span style="font-size: 9px; background: rgba(245, 158, 11, 0.2); color: #fbbf24; padding: 2px 6px; border-radius: 4px; font-weight: 700;">TOTAL</span>
            </div>
            <p style="font-size: 11px; color: var(--text-muted); margin-bottom: 12px;">
              Acceso sin restricciones a todas las secciones y potestad para asignar permisos.
            </p>
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label">PIN Dueño (4 dígitos):</label>
              <input type="text" id="sec-master-pin" class="form-input" value="${s.security.masterAdminPin || '8888'}" maxlength="4" style="font-family: monospace; font-size: 18px; letter-spacing: 0.2em; text-align: center; width: 140px;" />
            </div>
          </div>

          <!-- 2. ADMINISTRADOR -->
          <div style="background: #0b0f19; border: 1px solid rgba(99, 102, 241, 0.4); border-radius: 14px; padding: 18px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 18px;">👔</span>
                <strong style="color: #818cf8; font-size: 13px;">Administrador / Gerente</strong>
              </div>
              <span style="font-size: 9px; background: rgba(99, 102, 241, 0.2); color: #818cf8; padding: 2px 6px; border-radius: 4px; font-weight: 700;">GERENTE</span>
            </div>
            <p style="font-size: 11px; color: var(--text-muted); margin-bottom: 12px;">
              Encargado de operaciones con permisos delegados por el Dueño.
            </p>
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label">PIN Administrador (4 dígitos):</label>
              <input type="text" id="sec-manager-pin" class="form-input" value="${s.security.managerAdminPin || '5555'}" maxlength="4" style="font-family: monospace; font-size: 18px; letter-spacing: 0.2em; text-align: center; width: 140px;" />
            </div>
          </div>

          <!-- 3. CAJERO -->
          <div style="background: #0b0f19; border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 14px; padding: 18px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 18px;">💼</span>
                <strong style="color: #38bdf8; font-size: 13px;">Cajero / Turno</strong>
              </div>
              <span style="font-size: 9px; background: rgba(56, 189, 248, 0.2); color: #38bdf8; padding: 2px 6px; border-radius: 4px; font-weight: 700;">OPERATIVO</span>
            </div>
            <p style="font-size: 11px; color: var(--text-muted); margin-bottom: 12px;">
              Permite validar cupones en mesa y registrar visitas con sellos.
            </p>
            <div style="display: flex; align-items: center; gap: 8px;">
              <input type="text" id="sec-cashier-pin" class="form-input" value="${s.security.cashierPin || '1978'}" maxlength="4" style="font-family: monospace; font-size: 18px; letter-spacing: 0.2em; text-align: center; width: 120px;" />
              <button type="button" onclick="rotateCashierPin()" style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 8px; padding: 8px 12px; font-size: 11px; font-weight: 700; cursor: pointer;">
                🔄 Rotar
              </button>
            </div>
          </div>
        </div>

        <!-- MATRIZ INTERACTIVA DE PERMISOS -->
        <div style="background: #0b0f19; border: 1px solid var(--card-border); border-radius: 14px; padding: 18px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
            <div>
              <strong style="color: var(--text); font-size: 13px; text-transform: uppercase;">Matriz de Asignación de Permisos</strong>
              <p style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">
                El Dueño Master decide qué módulos puede ver y editar el Administrador y el Cajero.
              </p>
            </div>
            <span style="font-size: 10px; background: rgba(245, 158, 11, 0.15); color: #fbbf24; padding: 3px 10px; border-radius: 12px; font-weight: 700;">
              👑 Configurado por el Propietario
            </span>
          </div>

          <div style="overflow-x: auto;">
            <table class="data-table" style="width: 100%;">
              <thead>
                <tr>
                  <th style="width: 45%;">Módulo / Funcionalidad</th>
                  <th style="text-align: center; width: 18%;">👑 Dueño Master</th>
                  <th style="text-align: center; width: 18%;">👔 Administrador</th>
                  <th style="text-align: center; width: 18%;">💼 Cajero / Turno</th>
                </tr>
              </thead>
              <tbody>
                ${[
                  { id: "viewMetrics", name: "Métricas en Vivo e Historial", desc: "Ver ventas, KPIs y cupones" },
                  { id: "redeemPrizes", name: "Validación de Premios & Sellos", desc: "Canjear códigos y sumar sellos con PIN" },
                  { id: "manageChannels", name: "Canales (WhatsApp & Redes)", desc: "Ajustar números y mensajes oficiales" },
                  { id: "manageRoulette", name: "Ruleta & Probabilidades (%)", desc: "Modificar premios y matemática de la ruleta" },
                  { id: "manageStamps", name: "Catálogo de 15 Sellos", desc: "Editar premios en hitos 5, 10 y 15" },
                  { id: "manageBrand", name: "Identidad & Marca Blanca", desc: "Logo, colores y nombre de marca" },
                  { id: "manageDatabases", name: "Bases de Datos (Sheets & Supabase)", desc: "Configurar tablas y credenciales" },
                  { id: "manageComposio", name: "Composio.dev & Automatizaciones", desc: "Conectar IA, WhatsApp oficial y Sheets" },
                ].map(p => `
                  <tr>
                    <td>
                      <strong style="color: var(--text); font-size: 12px;">${p.name}</strong>
                      <span style="display: block; font-size: 10px; color: var(--text-muted);">${p.desc}</span>
                    </td>
                    <td style="text-align: center; color: #fbbf24; font-weight: 700; font-size: 12px;">
                      ✓ Acceso Total
                    </td>
                    <td style="text-align: center;">
                      <input type="checkbox" id="perm-admin-${p.id}" ${s.security.roles && s.security.roles.admin && s.security.roles.admin[p.id] ? 'checked' : ''} style="width: 16px; height: 16px; cursor: pointer; accent-color: #6366f1;" />
                    </td>
                    <td style="text-align: center;">
                      <input type="checkbox" id="perm-cashier-${p.id}" ${s.security.roles && s.security.roles.cashier && s.security.roles.cashier[p.id] ? 'checked' : ''} style="width: 16px; height: 16px; cursor: pointer; accent-color: #38bdf8;" />
                    </td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- PESTAÑA 9: MARKETING PUSH & OFERTAS ONESIGNAL                             -->
    <!-- ========================================================================= -->
    <div id="tab-push" class="tab-content">
      <!-- GUÍA RÁPIDA -->
      <div class="quick-guide-box">
        <div class="quick-guide-header">
          <span>💡</span>
          <span>Guía Rápida: Ofertas Push Masivas & Flujos OneSignal</span>
        </div>
        <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 8px;">
          Envía notificaciones web push instantáneas a los navegadores y teléfonos de los comensales, o activa campañas automatizadas sin tocar código.
        </div>
        <div class="quick-guide-grid">
          <div class="quick-guide-item">
            <strong>🚀 Envíos Inmediatos (1-Clic)</strong>
            <span>Usa las plantillas preparadas para lanzar promociones en horas de baja afluencia.</span>
          </div>
          <div class="quick-guide-item">
            <strong>⚡ 4 Flujos Automatizados</strong>
            <span>Bienvenida (6 min), Urgencia 24h, Reactivación 14 días y Happy Hour 3 a 6 PM.</span>
          </div>
          <div class="quick-guide-item">
            <strong>📡 OneSignal REST API</strong>
            <span>Conecta tu App ID y REST API Key para entrega inmediata garantizada.</span>
          </div>
          <div class="quick-guide-item">
            <strong>🔗 Webhooks & Composio</strong>
            <span>Envía cada campaña a n8n, Make o agentes de IA para difusión omnicanal.</span>
          </div>
        </div>
      </div>

      <!-- FORMULARIO DE ENVÍO MASIVO 1-CLIC -->
      <div class="panel" style="margin-bottom: 20px;">
        <div class="panel-header">
          <div class="panel-title">
            <span>🚀 Envío de Oferta Masiva Instantánea (Web Push)</span>
          </div>
          <span class="badge-role" style="background: rgba(56, 189, 248, 0.2); color: #38bdf8; border-color: rgba(56, 189, 248, 0.4);">
            1-CLIC BROADCAST
          </span>
        </div>

        <div style="margin-bottom: 14px;">
          <span style="font-size: 10px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 8px;">
            Plantillas Rápidas (Haz clic para rellenar formulario):
          </span>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 8px;">
            <button type="button" class="btn-secondary" style="text-align: left; padding: 10px 12px; cursor: pointer;" onclick="loadPushTemplate('happy_hour')">
              <strong style="color: #fbbf24; font-size: 11px; display: block;">⚡ Happy Hour 2x1 (3 a 6 PM)</strong>
              <span style="color: #6b7280; font-size: 10px;">Sellos dobles y bebidas 2x1</span>
            </button>
            <button type="button" class="btn-secondary" style="text-align: left; padding: 10px 12px; cursor: pointer;" onclick="loadPushTemplate('dessert')">
              <strong style="color: #f472b6; font-size: 11px; display: block;">🍰 Postre de Cortesía</strong>
              <span style="color: #6b7280; font-size: 10px;">Válido hoy con consumo en mesa</span>
            </button>
            <button type="button" class="btn-secondary" style="text-align: left; padding: 10px 12px; cursor: pointer;" onclick="loadPushTemplate('flash')">
              <strong style="color: #f87171; font-size: 11px; display: block;">⏳ Cupón Flash 50% Off</strong>
              <span style="color: #6b7280; font-size: 10px;">Válido exclusivamente hoy</span>
            </button>
            <button type="button" class="btn-secondary" style="text-align: left; padding: 10px 12px; cursor: pointer;" onclick="loadPushTemplate('stamps')">
              <strong style="color: #34d399; font-size: 11px; display: block;">🌟 Doble Sello Fin de Semana</strong>
              <span style="color: #6b7280; font-size: 10px;">Acelera la tarjeta de 15 sellos</span>
            </button>
          </div>
        </div>

        <form id="form-push-broadcast" onsubmit="sendBroadcastPush(event)">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; margin-bottom: 12px;">
            <div class="form-group" style="grid-column: span 2;">
              <label class="form-label">Título de la Notificación Push</label>
              <input type="text" id="pushTitle" class="form-input" value="⚡ ¡Happy Hour 2x1 en Café y Especialidades!" required>
            </div>
            <div class="form-group">
              <label class="form-label">Segmento Destino</label>
              <select id="pushSegment" class="form-input">
                <option value="Subscribed Users">Todos los Suscriptores</option>
                <option value="Active Customers">Clientes Frecuentes (+5 sellos)</option>
                <option value="Inactive Customers">Clientes Inactivos (+14 días)</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Mensaje / Cuerpo de la Notificación</label>
            <textarea id="pushBody" class="form-input" rows="2" style="resize: vertical;" required>¡Hola! Hoy de 3:00 a 6:00 PM acumula el DOBLE de sellos y disfruta 2x1 en bebidas de autor. ¡Muestra este mensaje en caja!</textarea>
            <!-- BOTONES DE VARIABLES DINÁMICAS -->
            <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px;">
              <span style="font-size: 10px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Variables:</span>
              <button type="button" class="btn-secondary" style="padding: 2px 8px; font-size: 10px; font-family: monospace;" onclick="insertPushTag('{nombre}')">+ {nombre}</button>
              <button type="button" class="btn-secondary" style="padding: 2px 8px; font-size: 10px; font-family: monospace;" onclick="insertPushTag('{premio}')">+ {premio}</button>
              <button type="button" class="btn-secondary" style="padding: 2px 8px; font-size: 10px; font-family: monospace;" onclick="insertPushTag('{restaurante}')">+ {restaurante}</button>
              <button type="button" class="btn-secondary" style="padding: 2px 8px; font-size: 10px; font-family: monospace;" onclick="insertPushTag('{descuento}')">+ {descuento}</button>
              <button type="button" class="btn-secondary" style="padding: 2px 8px; font-size: 10px; font-family: monospace;" onclick="insertPushTag('{codigo}')">+ {codigo}</button>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">URL de Destino (Opcional - al hacer clic)</label>
            <input type="url" id="pushUrl" class="form-input" placeholder="http://localhost:5173">
          </div>

          <!-- PERSONALIZACIÓN DE ENVÍO: PROGRAMACIÓN Y CANALES -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px; margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--card-border);">
            <div style="background: rgba(255,255,255,0.02); padding: 12px; border-radius: 10px; border: 1px solid var(--card-border);">
              <label class="form-label" style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
                <span>📅 Programación de Envío</span>
              </label>
              <div style="display: flex; gap: 8px; margin-bottom: 8px;">
                <button type="button" id="btnSchedImmediate" class="btn-secondary" style="flex: 1; padding: 6px; font-size: 11px; background: rgba(245, 158, 11, 0.2); border-color: #fbbf24; color: #fbbf24;" onclick="setPushScheduleMode('immediate')">⚡ Inmediato</button>
                <button type="button" id="btnSchedLater" class="btn-secondary" style="flex: 1; padding: 6px; font-size: 11px;" onclick="setPushScheduleMode('scheduled')">📅 Programar</button>
              </div>
              <input type="datetime-local" id="pushScheduledTime" class="form-input" style="display: none; font-size: 11px;">
            </div>

            <div style="background: rgba(255,255,255,0.02); padding: 12px; border-radius: 10px; border: 1px solid var(--card-border);">
              <label class="form-label" style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
                <span>📡 Canales de Entrega</span>
              </label>
              <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #d1d5db;">
                <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                  <input type="checkbox" id="chanPush" checked> OneSignal Web Push (Pantalla & PC)
                </label>
                <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                  <input type="checkbox" id="chanWebhook" checked> Webhook / Composio / Make / n8n
                </label>
                <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                  <input type="checkbox" id="chanWhatsApp" checked> Previsualización WhatsApp
                </label>
              </div>
            </div>
          </div>

          <!-- BOTONES GUARDAR PLANTILLA Y ENVIAR -->
          <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 10px; margin-top: 16px; padding-top: 12px; border-top: 1px solid var(--card-border);">
            <div style="display: flex; align-items: center; gap: 8px; flex: 1; min-width: 250px;">
              <input type="text" id="draftName" class="form-input" placeholder="Nombre plantilla (ej: Happy Hour)..." style="font-size: 11px; padding: 6px 10px;">
              <button type="button" class="btn-secondary" style="padding: 6px 12px; font-size: 11px; white-space: nowrap;" onclick="saveCurrentPushDraft()">💾 Guardar Plantilla</button>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <span id="pushStatusMsg" style="font-size: 11px; color: var(--text-muted);"></span>
              <button type="submit" class="btn-save" style="background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%); color: #fff;">
                🚀 Enviar Notificación Masiva Ahora
              </button>
            </div>
          </div>
        </form>
      </div>

      <!-- PLANTILLAS Y OFERTAS GUARDADAS EN EL SISTEMA -->
      <div class="panel" style="margin-bottom: 20px;">
        <div class="panel-header">
          <div class="panel-title">
            <span>📋 Plantillas y Ofertas Guardadas en el Sistema</span>
          </div>
          <span class="badge-role" style="background: rgba(245, 158, 11, 0.2); color: #fbbf24;">${(s.savedPushDrafts || []).length} GUARDADAS</span>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px;">
          ${(s.savedPushDrafts || []).map(d => `
            <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--card-border); border-radius: 12px; padding: 12px; display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px;">
                  <strong style="color: var(--text); font-size: 12px;">${d.name}</strong>
                  <span style="font-size: 9px; padding: 2px 6px; border-radius: 4px; background: rgba(255,255,255,0.08); color: var(--text-muted);">${d.scheduleType === "scheduled" ? "📅 Programada" : "⚡ Inmediata"}</span>
                </div>
                <p style="color: #fbbf24; font-size: 11px; font-weight: 600; margin: 2px 0;">${d.title}</p>
                <p style="color: var(--text-muted); font-size: 11px; line-height: 1.4; margin: 4px 0 8px 0;">${d.body}</p>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 8px;">
                <span style="font-size: 9px; color: #6b7280;">${d.createdAt || "Plantilla"}</span>
                <div style="display: flex; gap: 6px;">
                  <button type="button" class="btn-secondary" style="padding: 3px 8px; font-size: 10px; color: #fbbf24;" onclick='loadCustomDraft(${JSON.stringify(d.id)})'>📝 Cargar</button>
                  <button type="button" class="btn-secondary" style="padding: 3px 8px; font-size: 10px; color: #f87171;" onclick='deleteCustomDraft(${JSON.stringify(d.id)})'>🗑️</button>
                </div>
              </div>
            </div>
          `).join("")}
        </div>
      </div>

      <!-- 4 FLUJOS AUTOMATIZADOS -->
      <div class="panel">
        <div class="panel-header">
          <div class="panel-title">
            <span>⚡ 4 Flujos Automatizados por Comportamiento</span>
          </div>
          <span class="badge-role" style="background: rgba(168, 85, 247, 0.2); color: #c084fc; border-color: rgba(168, 85, 247, 0.4);">
            AUTOMÁTICOS
          </span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px;">
          <!-- Flujo 1 -->
          <div style="background: #0b0f19; border: 1px solid var(--card-border); border-radius: 12px; padding: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <strong style="color: #34d399; font-size: 12px;">🎉 Bienvenida (6 min)</strong>
              <span class="badge-status-available">ACTIVO</span>
            </div>
            <p style="font-size: 11px; color: var(--text-muted); margin-bottom: 6px;">Disparo automático 6 minutos después del primer juego en mesa.</p>
            <div style="font-size: 11px; color: #fff; background: #F8FAFC; padding: 8px; border-radius: 8px; font-family: monospace;">
              "¡Gracias por visitarnos! Tu primer sello ya está activo en tu tarjeta digital."
            </div>
          </div>

          <!-- Flujo 2 -->
          <div style="background: #0b0f19; border: 1px solid var(--card-border); border-radius: 12px; padding: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <strong style="color: #fbbf24; font-size: 12px;">⏳ Urgencia Cupón (24h)</strong>
              <span class="badge-status-available">ACTIVO</span>
            </div>
            <p style="font-size: 11px; color: var(--text-muted); margin-bottom: 6px;">Se envía 24h antes de que expire el beneficio de la ruleta.</p>
            <div style="font-size: 11px; color: #fff; background: #F8FAFC; padding: 8px; border-radius: 8px; font-family: monospace;">
              "¡Tu premio vence mañana! Ven hoy y disfrútalo en mesa antes de su caducidad."
            </div>
          </div>

          <!-- Flujo 3 -->
          <div style="background: #0b0f19; border: 1px solid var(--card-border); border-radius: 12px; padding: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <strong style="color: #c084fc; font-size: 12px;">☕ Reactivación (14 Días)</strong>
              <span class="badge-status-available">ACTIVO</span>
            </div>
            <p style="font-size: 11px; color: var(--text-muted); margin-bottom: 6px;">Se envía a clientes que llevan 14 días sin visitarnos.</p>
            <div style="font-size: 11px; color: #fff; background: #F8FAFC; padding: 8px; border-radius: 8px; font-family: monospace;">
              "¡Te extrañamos! Esta semana recibe un postre artesanal sorpresa de cortesía con tu café."
            </div>
          </div>

          <!-- Flujo 4 -->
          <div style="background: #0b0f19; border: 1px solid var(--card-border); border-radius: 12px; padding: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <strong style="color: #38bdf8; font-size: 12px;">⚡ Happy Hour (3 a 6 PM)</strong>
              <span class="badge-status-available">ACTIVO</span>
            </div>
            <p style="font-size: 11px; color: var(--text-muted); margin-bottom: 6px;">Multiplicador automático x2 de sellos en horas muertas de Lunes a Jueves.</p>
            <div style="font-size: 11px; color: #fff; background: #F8FAFC; padding: 8px; border-radius: 8px; font-family: monospace;">
              "¡Tarde dulce! Hoy tus consumos suman 2 SELLOS en tu tarjeta de fidelización."
            </div>
          </div>
        </div>
      </div>
    </div>
      </main>
    </div>

  </div>

  <script>
    // DATOS DE PLANTILLAS GUARDADAS EN EL BACKEND
    window.SAVED_DRAFTS = ${JSON.stringify(s.savedPushDrafts || [])};

    // CAMBIO DE PESTAÑAS EN EL BACKEND
    function switchTab(tabId, btn) {
      document.querySelectorAll('.tab-content').forEach(function(el) { el.classList.remove('active'); });
      document.querySelectorAll('.nav-tab-btn').forEach(function(el) { el.classList.remove('active'); });
      var target = document.getElementById(tabId);
      if (target) target.classList.add('active');
      var activeBtn = btn || document.querySelector('.nav-tab-btn[data-tab="' + tabId + '"]');
      if (activeBtn) activeBtn.classList.add('active');
    }

    // FILTROS EN TIEMPO REAL DEL DASHBOARD DE OPERACIONES
    function applyOpsFilters() {
      const period = document.getElementById("filterPeriod") ? document.getElementById("filterPeriod").value : "all";
      const status = document.getElementById("filterStatus") ? document.getElementById("filterStatus").value : "all";
      const table = document.getElementById("filterTable") ? document.getElementById("filterTable").value : "all";
      const search = document.getElementById("filterSearch") ? document.getElementById("filterSearch").value.toLowerCase().trim() : "";

      const rows = document.querySelectorAll("#prizesTable tbody tr");
      let visibleCount = 0;
      let redeemedCount = 0;
      const customersSet = new Set();

      rows.forEach(function(row) {
        if (!row.cells || row.cells.length < 5) return;
        const codeText = row.cells[0].innerText.toLowerCase();
        const timeText = row.cells[1].innerText.toLowerCase();
        const customerText = row.cells[2].innerText.toLowerCase();
        const prizeText = row.cells[3].innerText.toLowerCase();
        const statusText = row.cells[5] ? row.cells[5].innerText.trim() : "";
        const tableText = row.cells[2].innerText;

        let match = true;

        if (status !== "all" && statusText !== status) {
          match = false;
        }

        if (table !== "all" && !tableText.includes(table)) {
          match = false;
        }

        if (period === "today" && !timeText.includes(":") && !timeText.includes("hoy")) {
          match = false;
        }

        if (search) {
          const combined = (codeText + " " + customerText + " " + prizeText + " " + timeText).toLowerCase();
          if (!combined.includes(search)) {
            match = false;
          }
        }

        if (match) {
          row.style.display = "";
          visibleCount++;
          if (statusText === "UTILIZADO") redeemedCount++;
          customersSet.add(customerText.split(String.fromCharCode(10))[0].trim());
        } else {
          row.style.display = "none";
        }
      });

      // Actualizar contadores KPI
      const statTotalEl = document.getElementById("stat-total");
      const statRedeemedEl = document.getElementById("stat-redeemed");
      const statRateEl = document.getElementById("stat-rate");
      const statCustomersEl = document.getElementById("stat-customers");
      const countBadge = document.getElementById("filterCountBadge");

      if (statTotalEl) statTotalEl.innerText = visibleCount;
      if (statRedeemedEl) statRedeemedEl.innerText = redeemedCount;
      if (statRateEl) {
        const rate = visibleCount > 0 ? Math.round((redeemedCount / visibleCount) * 100) : 0;
        statRateEl.innerText = rate + "%";
      }
      if (statCustomersEl) statCustomersEl.innerText = customersSet.size;
      if (countBadge) countBadge.innerText = visibleCount + " registros";
    }

    function resetOpsFilters() {
      if (document.getElementById("filterPeriod")) document.getElementById("filterPeriod").value = "all";
      if (document.getElementById("filterStatus")) document.getElementById("filterStatus").value = "all";
      if (document.getElementById("filterTable")) document.getElementById("filterTable").value = "all";
      if (document.getElementById("filterSearch")) document.getElementById("filterSearch").value = "";
      applyOpsFilters();
    }

    // CONTROL DE PROGRAMACIÓN DE PUSH
    let pushScheduleMode = "immediate";
    function setPushScheduleMode(mode) {
      pushScheduleMode = mode;
      const btnImm = document.getElementById("btnSchedImmediate");
      const btnLater = document.getElementById("btnSchedLater");
      const timeInp = document.getElementById("pushScheduledTime");

      if (mode === "immediate") {
        btnImm.style.background = "rgba(245, 158, 11, 0.2)";
        btnImm.style.borderColor = "#fbbf24";
        btnImm.style.color = "#fbbf24";
        btnLater.style.background = "";
        btnLater.style.borderColor = "";
        btnLater.style.color = "";
        timeInp.style.display = "none";
      } else {
        btnLater.style.background = "rgba(245, 158, 11, 0.2)";
        btnLater.style.borderColor = "#fbbf24";
        btnLater.style.color = "#fbbf24";
        btnImm.style.background = "";
        btnImm.style.borderColor = "";
        btnImm.style.color = "";
        timeInp.style.display = "block";
      }
    }

    // INSERTAR VARIABLES DINÁMICAS EN EL MENSAJE PUSH
    function insertPushTag(tag) {
      const bodyInput = document.getElementById("pushBody");
      if (bodyInput) {
        bodyInput.value = bodyInput.value ? (bodyInput.value + " " + tag) : tag;
        bodyInput.focus();
      }
    }

    // CARGAR PLANTILLAS PREDEFINIDAS
    function loadPushTemplate(type) {
      const titleInput = document.getElementById("pushTitle");
      const bodyInput = document.getElementById("pushBody");
      const segmentInput = document.getElementById("pushSegment");
      if (type === "happy_hour") {
        titleInput.value = "⚡ ¡Happy Hour 2x1 en Café y Bebidas de Autor!";
        bodyInput.value = "¡Hola {nombre}! Hoy de 3:00 a 6:00 PM acumula el DOBLE de sellos y disfruta 2x1 en bebidas. ¡Muestra este mensaje en caja!";
        segmentInput.value = "Subscribed Users";
      } else if (type === "dessert") {
        titleInput.value = "🍰 ¡Postre de Cortesía en tu Visita de Hoy!";
        bodyInput.value = "Ven hoy a deleitarte en {restaurante} y recibe un postre artesanal de autor de cortesía con tu consumo principal. ¡Te esperamos!";
        segmentInput.value = "Subscribed Users";
      } else if (type === "flash") {
        titleInput.value = "⏳ Cupón Flash: 50% en tu Segundo Plato o Bebida";
        bodyInput.value = "¡Solo por hoy! Disfruta 50% de descuento en tu segundo producto favorito en {restaurante}. Muestra este aviso en caja.";
        segmentInput.value = "Active Customers";
      } else if (type === "stamps") {
        titleInput.value = "🌟 ¡Sellos Dobles este Fin de Semana!";
        bodyInput.value = "¡Acelera tu tarjeta de 15 sellos! Cada visita este fin de semana en {restaurante} te otorga 2 sellos para llegar antes a tu premio.";
        segmentInput.value = "Subscribed Users";
      }
    }

    // CARGAR PLANTILLA GUARDADA EN EL FORMULARIO
    function loadCustomDraft(id) {
      const draft = (window.SAVED_DRAFTS || []).find(function(d) { return d.id === id; });
      if (!draft) return;
      document.getElementById("pushTitle").value = draft.title || "";
      document.getElementById("pushBody").value = draft.body || "";
      document.getElementById("pushSegment").value = draft.segment || "Subscribed Users";
      document.getElementById("pushUrl").value = draft.url || "";
      if (document.getElementById("draftName")) document.getElementById("draftName").value = draft.name || "";
      if (draft.scheduleType) setPushScheduleMode(draft.scheduleType);
      if (draft.scheduledTime && document.getElementById("pushScheduledTime")) {
        document.getElementById("pushScheduledTime").value = draft.scheduledTime;
      }
      if (draft.channels) {
        if (document.getElementById("chanPush")) document.getElementById("chanPush").checked = draft.channels.push !== false;
        if (document.getElementById("chanWebhook")) document.getElementById("chanWebhook").checked = draft.channels.webhook !== false;
        if (document.getElementById("chanWhatsApp")) document.getElementById("chanWhatsApp").checked = draft.channels.whatsappPreview !== false;
      }
      alert('Plantilla "' + (draft.name || draft.title) + '" cargada en el formulario.');
    }

    // GUARDAR PLANTILLA REUTILIZABLE
    async function saveCurrentPushDraft() {
      const title = document.getElementById("pushTitle").value.trim();
      const body = document.getElementById("pushBody").value.trim();
      const segment = document.getElementById("pushSegment").value;
      const url = document.getElementById("pushUrl").value.trim();
      const draftName = (document.getElementById("draftName").value.trim()) || title.slice(0, 30);
      const scheduledTime = document.getElementById("pushScheduledTime").value;

      if (!title || !body) {
        alert("Por favor completa al menos el título y mensaje de la oferta antes de guardarla.");
        return;
      }

      const payload = {
        name: draftName,
        title: title,
        body: body,
        segment: segment,
        url: url,
        scheduleType: pushScheduleMode,
        scheduledTime: pushScheduleMode === "scheduled" ? scheduledTime : "",
        channels: {
          push: document.getElementById("chanPush").checked,
          webhook: document.getElementById("chanWebhook").checked,
          whatsappPreview: document.getElementById("chanWhatsApp").checked,
        },
      };

      try {
        const res = await fetch("/api/push/drafts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
          alert('¡Plantilla "' + draftName + '" guardada con éxito!');
          window.location.reload();
        } else {
          alert("Error al guardar: " + (data.error || ""));
        }
      } catch (err) {
        alert("Error de conexión al guardar plantilla.");
      }
    }

    // ELIMINAR PLANTILLA GUARDADA
    async function deleteCustomDraft(id) {
      if (!confirm("¿Deseas eliminar esta plantilla guardada?")) return;
      try {
        const res = await fetch("/api/push/drafts", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: id })
        });
        const data = await res.json();
        if (data.success) {
          window.location.reload();
        } else {
          alert("Error: " + (data.error || ""));
        }
      } catch (err) {
        alert("Error de conexión.");
      }
    }

    // ENVIAR CAMPAÑA PUSH BROADCAST CON PROGRAMACIÓN Y CANALES
    async function sendBroadcastPush(e) {
      e.preventDefault();
      const statusEl = document.getElementById("pushStatusMsg");
      const title = document.getElementById("pushTitle").value.trim();
      const body = document.getElementById("pushBody").value.trim();
      const segment = document.getElementById("pushSegment").value;
      const url = document.getElementById("pushUrl").value.trim();
      const scheduledTime = document.getElementById("pushScheduledTime").value;

      if (!title || !body) {
        alert("Por favor completa el título y el mensaje de la campaña.");
        return;
      }

      statusEl.style.color = "#fbbf24";
      statusEl.innerText = "⏳ Procesando envío de campaña...";

      try {
        const res = await fetch("/api/push/broadcast", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title,
            body: body,
            segment: segment,
            url: url,
            scheduleType: pushScheduleMode,
            scheduledTime: pushScheduleMode === "scheduled" ? scheduledTime : "",
            channels: {
              push: document.getElementById("chanPush").checked,
              webhook: document.getElementById("chanWebhook").checked,
              whatsappPreview: document.getElementById("chanWhatsApp").checked,
            },
          })
        });
        const data = await res.json();
        if (data.success) {
          statusEl.style.color = "#34d399";
          statusEl.innerText = "✓ " + data.message;
          setTimeout(function() { statusEl.innerText = ""; }, 5000);
          setTimeout(function() { window.location.reload(); }, 2000);
        } else {
          statusEl.style.color = "#f87171";
          statusEl.innerText = "Error: " + (data.error || "No se pudo enviar");
        }
      } catch (err) {
        statusEl.style.color = "#f87171";
        statusEl.innerText = "Error de conexión con el servidor.";
      }
    }

    // PALETA DE COLORES RÁPIDOS
    function selectColorPreset(hex) {
      document.getElementById('brand-color-picker').value = hex;
      document.getElementById('brand-color-hex').value = hex;
      document.getElementById('brand-color-preview').style.backgroundColor = hex;
    }

    // PALETA DE ICONO DE VISITA
    function selectVisitIconPreset(icon) {
      document.getElementById('stamp-visit-icon').value = icon;
      document.getElementById('stamp-visit-icon-preview').innerText = icon;
      document.querySelectorAll('#tab-stamps .icon-preset-btn').forEach(btn => btn.classList.remove('active'));
      event.currentTarget.classList.add('active');
    }

    // VERIFICADOR DE SUMA DE RULETA (DEBE DAR 100%)
    function updateRouletteSum() {
      let sum = 0;
      document.querySelectorAll('.prize-prob').forEach(inp => {
        sum += Number(inp.value) || 0;
      });
      const badge = document.getElementById('roulette-sum-badge');
      if (sum === 100) {
        badge.style.background = 'rgba(16, 185, 129, 0.2)';
        badge.style.color = '#34d399';
        badge.innerText = 'Suma Total: 100% ✓';
      } else {
        badge.style.background = 'rgba(239, 68, 68, 0.2)';
        badge.style.color = '#f87171';
        badge.innerText = 'Suma Actual: ' + sum + '% (Debe ser 100%) ⚠️';
      }
    }

    // SELECCIÓN VISUAL DE MODO DE JUEGO EN BACKEND + WIZARD CONTEXTUAL
    function selectBackendGameMode(mode, cardEl) {
      // 1. Actualizar tarjetas visuales
      document.querySelectorAll('.game-mode-card').forEach(function(c) {
        c.classList.remove('active');
        var chk = c.querySelector('.mode-check');
        if (chk) chk.innerText = '';
      });
      if (cardEl) {
        cardEl.classList.add('active');
        var chk = cardEl.querySelector('.mode-check');
        if (chk) chk.innerText = '✓ ACTIVO';
      }

      // 2. Actualizar input oculto
      var hiddenInput = document.getElementById('backendGameMode');
      if (hiddenInput) hiddenInput.value = mode;

      // 3. Mostrar/ocultar paneles de configuración según el juego elegido
      var showRoulette = (mode === 'roulette' || mode === 'hybrid');
      var showPrecision = (mode === 'precision' || mode === 'hybrid');
      var showStamps = (mode === 'stamps');

      var wizardRoulette = document.getElementById('wizard-roulette');
      var wizardPrecision = document.getElementById('wizard-precision');
      var wizardStamps = document.getElementById('wizard-stamps');

      if (wizardRoulette) {
        wizardRoulette.style.display = showRoulette ? 'block' : 'none';
        wizardRoulette.style.animation = showRoulette ? 'fadeIn 0.25s ease' : 'none';
      }
      if (wizardPrecision) {
        wizardPrecision.style.display = showPrecision ? 'block' : 'none';
        wizardPrecision.style.animation = showPrecision ? 'fadeIn 0.25s ease' : 'none';
      }
      if (wizardStamps) {
        wizardStamps.style.display = showStamps ? 'block' : 'none';
        wizardStamps.style.animation = showStamps ? 'fadeIn 0.25s ease' : 'none';
      }

      // 4. Scroll suave al wizard si está visible
      var wizard = document.getElementById('game-config-wizard');
      if (wizard) {
        setTimeout(function() {
          wizard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
      }
    }

    // GUARDAR CONFIGURACIÓN DE MECÁNICA DE JUEGO
    function saveGameModeConfig() {
      var mode = document.getElementById('backendGameMode') ? document.getElementById('backendGameMode').value : 'hybrid';
      var difficulty = document.getElementById('precisionDifficulty') ? document.getElementById('precisionDifficulty').value : 'medio';
      var attempts = document.getElementById('maxAttempts') ? parseInt(document.getElementById('maxAttempts').value, 10) : 3;
      var channel = document.getElementById('validationChannel') ? document.getElementById('validationChannel').value : 'both';

      var toleranceMs = difficulty === 'facil' ? 80 : difficulty === 'dificil' ? 15 : 40;

      var gameConfig = {
        gameMode: mode,
        precisionDifficulty: difficulty,
        precisionTarget: 10.0,
        toleranceMs: toleranceMs,
        maxAttempts: attempts,
        validationChannel: channel,
        reviewTiming: 'after_game'
      };

      // Deshabilitar botón durante el guardado
      var btn = document.querySelector('[onclick="saveGameModeConfig()"]');
      if (btn) { btn.disabled = true; btn.textContent = '⏳ Activando...'; }

      fetch('/api/game-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameConfig: gameConfig })
      })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        if (btn) { btn.disabled = false; btn.textContent = '⚡ Activar Juego Seleccionado'; }
        if (data.success) {
          showToast('toast-game-mode');
        } else {
          alert('Error guardando mecánica de juego: ' + (data.error || 'Desconocido'));
        }
      })
      .catch(function(err) {
        if (btn) { btn.disabled = false; btn.textContent = '⚡ Activar Juego Seleccionado'; }
        alert('Error conectando con el servidor: ' + err.message);
      });
    }

    // UTILIDAD DE FEEDBACK VISUAL
    function showToast(toastId) {
      const el = document.getElementById(toastId);
      if (!el) return;
      el.style.display = 'inline';
      setTimeout(() => { el.style.display = 'none'; }, 3500);
    }

    // ENVIAR CONFIGURACIÓN AL SERVIDOR REST (/api/config)
    async function sendConfigUpdate(payload, toastId) {
      try {
        const res = await fetch('/api/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          showToast(toastId);
        } else {
          const err = await res.json();
          alert('Error: ' + (err.error || 'No se pudo guardar'));
        }
      } catch (err) {
        alert('Error de conexión: ' + err.message);
      }
    }

    // GUARDAR MARCA
    function saveBrandConfig() {
      const payload = {
        brand: {
          name: document.getElementById('brand-name').value.trim(),
          tagline: document.getElementById('brand-tagline').value.trim(),
          taglineEn: document.getElementById('brand-tagline-en').value.trim(),
          currency: document.getElementById('brand-currency').value.trim(),
          logoUrl: document.getElementById('brand-logo').value.trim(),
          emblemUrl: document.getElementById('brand-emblem').value.trim(),
          primaryColor: document.getElementById('brand-color-hex').value.trim(),
        }
      };
      sendConfigUpdate(payload, 'toast-brand');
    }

    // GUARDAR CANALES
    function saveChannelsConfig() {
      const payload = {
        channels: {
          instagramHandle: document.getElementById('chan-ig').value.trim(),
          whatsappNumber: document.getElementById('chan-wa-phone').value.trim(),
          enableWhatsAppPhoto: document.getElementById('chan-wa-enabled').checked,
          whatsappPhotoMessage: document.getElementById('chan-wa-msg').value.trim(),
          googleMapsReviewUrl: document.getElementById('chan-maps').value.trim(),
        }
      };
      sendConfigUpdate(payload, 'toast-channels');
    }

    // GUARDAR RULETA
    function saveRouletteConfig() {
      const rows = document.querySelectorAll('#roulette-rows tr');
      const prizes = [];
      rows.forEach(r => {
        prizes.push({
          id: r.getAttribute('data-prize-id'),
          name: r.querySelector('.prize-name').value.trim(),
          value: r.querySelector('.prize-value').value.trim(),
          probability: Number(r.querySelector('.prize-prob').value) || 0,
          color: r.querySelector('.prize-color').value.trim(),
          active: r.querySelector('.prize-active').checked,
        });
      });
      sendConfigUpdate({ prizes }, 'toast-roulette');
    }

    // GUARDAR SELLOS & ICONOS
    function saveStampsConfig() {
      const visitIcon = document.getElementById('stamp-visit-icon').value.trim() || '☕';
      const milestones = [
        {
          stamp: 5,
          icon: document.getElementById('m-icon-0').value.trim() || '🍰',
          title: document.getElementById('m-title-0').value.trim(),
          description: document.getElementById('m-desc-0').value.trim(),
          category: 'postre'
        },
        {
          stamp: 10,
          icon: document.getElementById('m-icon-1').value.trim() || '👑',
          title: document.getElementById('m-title-1').value.trim(),
          description: document.getElementById('m-desc-1').value.trim(),
          category: 'vip'
        },
        {
          stamp: 15,
          icon: document.getElementById('m-icon-2').value.trim() || '🌟',
          title: document.getElementById('m-title-2').value.trim(),
          description: document.getElementById('m-desc-2').value.trim(),
          category: 'vip'
        },
      ];
      sendConfigUpdate({ stamps: { visitIcon, milestones }, visitIcon, stampRewards: milestones }, 'toast-stamps');
    }

    // GUARDAR BASES DE DATOS
    function saveDatabasesConfig() {
      const payload = {
        databases: {
          googleSheetWebhookUrl: document.getElementById('db-sheets-url').value.trim(),
          supabaseEnabled: document.getElementById('db-sb-enabled').checked,
          supabaseProjectUrl: document.getElementById('db-sb-url').value.trim(),
          supabaseAnonKey: document.getElementById('db-sb-key').value.trim(),
        }
      };
      sendConfigUpdate(payload, 'toast-databases');
    }

    // ROTAR PIN DE CAJERO ALEATORIO
    function rotateCashierPin() {
      const newPin = Math.floor(1000 + Math.random() * 9000).toString();
      document.getElementById('sec-cashier-pin').value = newPin;
      saveSecurityConfig();
    }

    // GUARDAR SEGURIDAD (3 PINS + MATRIZ DE PERMISOS)
    function saveSecurityConfig() {
      const permIds = [
        "viewMetrics", "redeemPrizes", "manageChannels", "manageRoulette",
        "manageStamps", "manageBrand", "manageDatabases", "manageComposio"
      ];
      const adminPerms = {};
      const cashierPerms = {};
      permIds.forEach(id => {
        const elAdmin = document.getElementById("perm-admin-" + id);
        const elCashier = document.getElementById("perm-cashier-" + id);
        adminPerms[id] = elAdmin ? elAdmin.checked : false;
        cashierPerms[id] = elCashier ? elCashier.checked : false;
      });

      const payload = {
        security: {
          masterAdminPin: document.getElementById('sec-master-pin').value.trim(),
          managerAdminPin: document.getElementById('sec-manager-pin').value.trim(),
          cashierPin: document.getElementById('sec-cashier-pin').value.trim(),
          roles: {
            admin: adminPerms,
            cashier: cashierPerms,
          },
        }
      };
      sendConfigUpdate(payload, 'toast-security');
    }

    // CONECTAR CON COMPOSIO.DEV INMEDIATAMENTE
    async function connectComposioNow() {
      let apiKey = document.getElementById('comp-api-key').value.trim();
      if (!apiKey) {
        apiKey = prompt("Ingresa tu Composio API Key (comp_live_...):", "");
        if (!apiKey) return;
        document.getElementById('comp-api-key').value = apiKey;
      }
      const payload = {
        composio: {
          enabled: true,
          apiKey: apiKey,
          integrations: {
            googleSheets: document.getElementById('comp-tool-sheets').checked,
            googleContacts: document.getElementById('comp-tool-contacts').checked,
            whatsAppAutoSend: document.getElementById('comp-tool-wa').checked,
            dailyEmailSummary: document.getElementById('comp-tool-email').checked,
          },
          endpoints: {
            googleSheetWebhookUrl: document.getElementById('comp-webhook-url').value.trim(),
          }
        }
      };
      await sendConfigUpdate(payload, 'toast-composio');
      const badge = document.getElementById('comp-status-badge');
      if (badge) {
        badge.innerText = '🟢 Conectado con Composio.dev';
        badge.style.background = 'rgba(16, 185, 129, 0.2)';
        badge.style.color = '#34d399';
        badge.style.border = '1px solid rgba(16, 185, 129, 0.4)';
      }
      alert("⚡ ¡Conexión con Composio.dev establecida con éxito!");
    }

    // GUARDAR CONFIGURACIÓN COMPOSIO
    function saveComposioBackendConfig() {
      const apiKey = document.getElementById('comp-api-key').value.trim();
      const payload = {
        composio: {
          enabled: apiKey.length > 0,
          apiKey: apiKey,
          integrations: {
            googleSheets: document.getElementById('comp-tool-sheets').checked,
            googleContacts: document.getElementById('comp-tool-contacts').checked,
            whatsAppAutoSend: document.getElementById('comp-tool-wa').checked,
            dailyEmailSummary: document.getElementById('comp-tool-email').checked,
          },
          endpoints: {
            googleSheetWebhookUrl: document.getElementById('comp-webhook-url').value.trim(),
          }
        }
      };
      sendConfigUpdate(payload, 'toast-composio');
    }

    // DISPARAR EVENTO DE PRUEBA A COMPOSIO
    async function testComposioSync() {
      try {
        const res = await fetch("/api/prizes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerName: "Prueba Composio Backend",
            whatsapp: "573009998877",
            email: "admin@composio.dev",
            prizeName: "Premio de Prueba Composio",
            tableNumber: "Mesa VIP",
          }),
        });
        if (res.ok) {
          alert("✅ ¡Evento de prueba enviado a Composio y Google Sheets con éxito!");
        } else {
          alert("⚠️ Evento procesado localmente. Verifica tu API Key o Webhook.");
        }
      } catch (err) {
        alert("Error probando conexión: " + err.message);
      }
    }

    // BÚSQUEDA EN VIVO EN LA TABLA
    function filterTable() {
      const filter = document.getElementById("searchInput").value.toLowerCase();
      const rows = document.querySelectorAll("#tableBody tr");
      rows.forEach(row => {
        const text = row.innerText.toLowerCase();
        row.style.display = text.includes(filter) ? "" : "none";
      });
    }

    // AUTO-ACTUALIZACIÓN SILENCIOSA DE MÉTRICAS CADA 3 SEGUNDOS
    async function refreshData() {
      try {
        const res = await fetch("/api/metrics");
        if (!res.ok) return;
        const data = await res.json();
        
        const elTotal = document.getElementById("stat-total");
        if (elTotal) elTotal.innerText = data.totalPrizes;
        const elRedeemed = document.getElementById("stat-redeemed");
        if (elRedeemed) elRedeemed.innerText = data.redeemedPrizes;
        const elRate = document.getElementById("stat-rate");
        if (elRate) elRate.innerText = data.conversionRate;
        const elCust = document.getElementById("stat-customers");
        if (elCust) elCust.innerText = data.totalCustomers;

        const searchVal = document.getElementById("searchInput") ? document.getElementById("searchInput").value.trim() : "";
        if (!searchVal && data.prizes) {
          const tbody = document.getElementById("tableBody");
          if (tbody) {
            tbody.innerHTML = data.prizes.map(p => {
              const stamps = p.stamps || 1;
              const stars = "★".repeat(Math.min(5, stamps)) + "☆".repeat(Math.max(0, 5 - stamps));
              const isUsed = p.status === "UTILIZADO";
              return \`
                <tr>
                  <td><span class="badge-code">\${p.uniqueCode}</span></td>
                  <td><span style="color: #fbbf24; font-family: monospace; font-size: 11px;">\${p.wonAt || "Hoy"}</span></td>
                  <td>
                    <strong style="color: var(--text);">\${p.customerName || "Cliente"}</strong>
                    <div style="font-size: 11px; color: var(--text-muted);">\${p.whatsapp || "Sin número"}</div>
                  </td>
                  <td style="color: #e5e7eb;">
                    \${p.prizeName}
                    <div style="font-size: 10px; color: #6b7280;">Mesa: \${p.tableNumber || "1"}</div>
                  </td>
                  <td>
                    <span class="stars-cell">\${stars}</span>
                    <div style="font-size: 10px; color: var(--text-muted);">\${stamps}/15 visitas</div>
                  </td>
                  <td>
                    <span class="\${isUsed ? "badge-status-used" : "badge-status-available"}">
                      \${isUsed ? "✓ CANJEADO" : "⏳ DISPONIBLE"}
                    </span>
                    \${isUsed && p.usedAt ? \`<div style="font-size: 10px; color: #6b7280; margin-top: 2px;">Hora: \${p.usedAt}</div>\` : ""}
                  </td>
                </tr>
              \`;
            }).join("");
          }
        }

        if (data.logs) {
          const logBox = document.getElementById("logBox");
          if (logBox) {
            logBox.innerHTML = data.logs.map(l => \`
              <div class="log-item">
                <div class="log-top">
                  <span class="method-tag \${l.method === "POST" ? "method-post" : "method-get"}">\${l.method}</span>
                  <span class="log-url">\${l.url}</span>
                  <span class="log-time">\${l.timestamp}</span>
                </div>
                <div class="log-detail">\${l.detail}</div>
              </div>
            \`).join("");
          }
        }
      } catch (e) {
        // Silencioso
      }
    }

    setInterval(refreshData, 3000);
  
    // GESTIÓN DE 10 MESAS EN EL BACKEND
    async function resetBackendTable(num) {
      if (!confirm("¿Deseas liberar la Mesa " + num + " para el siguiente comensal?")) return;
      try {
        const res = await fetch("/api/tables/mesa-" + num + "/reset", { method: "POST" });
        const data = await res.json();
        if (data.success) {
          alert("¡Mesa " + num + " liberada con éxito!");
          window.location.reload();
        }
      } catch (err) {
        alert("Error de conexión al liberar mesa.");
      }
    }

    function loadTableConfigForm() {
      const num = parseInt(document.getElementById("cfgTableSelect").value, 10);
      const tables = "TABLES_REF";
      // auto fill name
      document.getElementById("cfgTableName").value = "Mesa " + num;
    }

    async function saveBackendTableConfig() {
      const num = parseInt(document.getElementById("cfgTableSelect").value, 10);
      const name = document.getElementById("cfgTableName").value.trim() || ("Mesa " + num);
      const zone = document.getElementById("cfgTableZone").value;
      const capacity = parseInt(document.getElementById("cfgTableCapacity").value, 10);

      try {
        const res = await fetch("/api/tables", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tableNumber: num,
            name: name,
            zone: zone,
            capacity: capacity
          })
        });
        const data = await res.json();
        if (data.success) {
          alert("¡Configuración de Mesa " + num + " guardada!");
          window.location.reload();
        }
      } catch (err) {
        alert("Error al guardar mesa.");
      }
    }
  
</script>
</body>
</html>`;
}

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 SERVIDOR BACKEND DEMO CORRIENDO EN: http://localhost:${PORT}`);
  console.log(`======================================================`);
  console.log(`📡 Endpoints REST disponibles:`);
  console.log(`   - POST /api/prizes        (Registrar nuevo premio)`);
  console.log(`   - POST /api/validate-pin  (Validar con PIN de caja)`);
  console.log(`   - GET  /api/stamps/:phone (Consultar sellos del cliente)`);
  console.log(`   - GET  /api/metrics       (Estadísticas y base de datos)`);
  console.log(`   - GET  /api/config        (Obtener configuración completa)`);
  console.log(`   - POST /api/config        (Actualizar configuración completa)`);
  console.log(`   - GET  /                  (Dashboard visual completo del backend)`);
  console.log(`======================================================\n`);
});
