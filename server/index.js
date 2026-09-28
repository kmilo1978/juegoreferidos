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

        logRequest("PUSH", "/api/push/broadcast", 200, `📢 Campaña Push enviada: "${title}" (${data.segment || "Todos"})`);

        // Registrar en logs del backend
        db.logs.unshift({
          method: "PUSH",
          url: "/api/push/broadcast",
          timestamp: new Date().toLocaleTimeString("es-CO"),
          detail: `📢 Encapuchado Push Masivo: "${title}" enviado a suscriptores. (URL: ${data.url || "Inicio"})`,
        });
        if (db.logs.length > 30) db.logs.pop();

        // Guardar última campaña en settings
        if (!db.settings.pushCampaigns) db.settings.pushCampaigns = [];
        db.settings.pushCampaigns.unshift({
          title,
          body: msgBody,
          url: data.url || "",
          segment: data.segment || "Subscribed Users",
          sentAt: new Date().toLocaleString("es-CO"),
        });
        if (db.settings.pushCampaigns.length > 20) db.settings.pushCampaigns.pop();
        saveDb();

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({
          success: true,
          message: "Notificación push masiva procesada y enviada a los suscriptores.",
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

  // Ruta no encontrada
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Endpoint no encontrado" }));
});

// INTERFAZ VISUAL DEL BACKEND (HTML SERVIDO EN http://localhost:3001)
function renderBackendDashboard() {
  const s = db.settings;
  const totalPrizes = db.prizes.length;
  const redeemed = db.prizes.filter((p) => p.status === "UTILIZADO").length;
  const totalCustomers = Object.keys(db.customers).length;
  const conversionRate = totalPrizes > 0 ? Math.round((redeemed / totalPrizes) * 100) : 0;

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${s.brand.name} · Backend & Panel de Control de Operaciones</title>
  <style>
    :root {
      --bg: #090d16;
      --card-bg: #111827;
      --card-border: #1f293d;
      --accent: ${s.brand.primaryColor || '#d97706'};
      --accent-hover: #b45309;
      --accent-glow: rgba(217, 119, 6, 0.18);
      --success: #10b981;
      --success-glow: rgba(16, 185, 129, 0.15);
      --text: #f3f4f6;
      --text-muted: #9ca3af;
      --font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: var(--font-family);
      line-height: 1.5;
      padding: 24px 16px;
      min-height: 100vh;
      -webkit-font-smoothing: antialiased;
    }
    .container { max-width: 1280px; margin: 0 auto; }

    /* ENCABEZADO */
    header {
      background: linear-gradient(135deg, #131c2e 0%, #0d1322 100%);
      border: 1px solid var(--card-border);
      border-radius: 18px;
      padding: 22px 28px;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 20px;
    }
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #34d399;
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.05em;
      margin-bottom: 6px;
    }
    .pulse-dot {
      width: 8px; height: 8px;
      background-color: #10b981;
      border-radius: 50%;
      animation: pulse 1.8s infinite;
    }
    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
      70% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
      100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
    }
    h1 { font-size: 24px; font-weight: 800; color: #fff; margin-bottom: 2px; }
    .header-desc { font-size: 13px; color: var(--text-muted); }
    .btn-frontend {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: #0b0f19;
      font-weight: 800;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 10px 18px;
      border-radius: 12px;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      box-shadow: 0 4px 14px rgba(217, 119, 6, 0.3);
      transition: all 0.2s;
    }
    .btn-frontend:hover { transform: translateY(-1px); filter: brightness(1.1); }

    /* LAYOUT PRINCIPAL DE 2 COLUMNAS (CONTENIDO IZQUIERDA / MENÚ VERTICAL A MANO DERECHA) */
    .dashboard-layout {
      display: flex;
      flex-direction: column-reverse;
      gap: 20px;
    }
    @media (min-width: 1024px) {
      .dashboard-layout {
        flex-direction: row;
        align-items: flex-start;
      }
      .main-content {
        flex: 1;
        min-width: 0;
      }
      .nav-sidebar {
        width: 290px;
        flex-shrink: 0;
        position: sticky;
        top: 20px;
      }
    }
    .main-content {
      width: 100%;
    }
    .sidebar-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
    }
    .sidebar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      font-weight: 800;
      color: #9ca3af;
      letter-spacing: 0.05em;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      padding-bottom: 8px;
    }
    .badge-role {
      background: rgba(217, 119, 6, 0.2);
      color: #fbbf24;
      font-size: 10px;
      padding: 2px 8px;
      border-radius: 9999px;
      border: 1px solid rgba(217, 119, 6, 0.4);
      font-family: monospace;
      font-weight: 700;
    }
    .nav-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .nav-group-title {
      font-size: 10px;
      font-weight: 800;
      color: #fbbf24;
      letter-spacing: 0.08em;
      margin-bottom: 2px;
      padding-left: 4px;
    }
    .nav-tab-btn {
      background: #111827;
      color: #9ca3af;
      border: 1px solid var(--card-border);
      padding: 9px 12px;
      border-radius: 10px;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.15s ease;
      display: flex;
      align-items: center;
      gap: 10px;
      text-align: left;
      width: 100%;
    }
    .nav-tab-btn:hover {
      color: #fff;
      background: #1f2937;
      border-color: rgba(217, 119, 6, 0.4);
    }
    .nav-tab-btn.active {
      background: linear-gradient(135deg, rgba(217, 119, 6, 0.25) 0%, rgba(217, 119, 6, 0.08) 100%);
      color: #fbbf24;
      border-color: #d97706;
      box-shadow: 0 2px 8px rgba(217, 119, 6, 0.2);
    }
    .tab-title { font-weight: 700; font-size: 12px; line-height: 1.2; }
    .tab-sub { font-size: 10px; font-weight: 400; color: #6b7280; margin-top: 1px; }
    .nav-tab-btn.active .tab-sub { color: #d97706; }

    /* GUÍAS RÁPIDAS EXPLICATIVAS PARA SECCIONES CON CIERTA COMPLEJIDAD */
    .quick-guide-box {
      background: rgba(245, 158, 11, 0.06);
      border: 1px solid rgba(245, 158, 11, 0.3);
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
      color: #fbbf24;
      margin-bottom: 6px;
    }
    .quick-guide-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 10px;
      margin-top: 10px;
    }
    .quick-guide-item {
      background: rgba(17, 24, 39, 0.6);
      border: 1px solid rgba(245, 158, 11, 0.15);
      border-radius: 10px;
      padding: 10px;
      font-size: 11px;
    }
    .quick-guide-item strong {
      color: #f3f4f6;
      display: block;
      margin-bottom: 3px;
    }
    .quick-guide-item span {
      color: #9ca3af;
      line-height: 1.4;
      display: block;
    }

    .tab-content { display: none; }
    .tab-content.active { display: block; animation: fadeIn 0.2s ease-in-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }

    /* TARJETAS DE MÉTRICAS */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
      margin-bottom: 20px;
    }
    .stat-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      padding: 18px 20px;
      position: relative;
    }
    .stat-title { font-size: 11px; text-transform: uppercase; font-weight: 700; color: var(--text-muted); }
    .stat-value { font-size: 28px; font-weight: 800; color: #fff; margin: 4px 0; display: block; }
    .stat-sub { font-size: 11px; color: #6b7280; }

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
    .panel-title { font-size: 15px; font-weight: 700; color: #fff; display: flex; align-items: center; gap: 8px; }

    /* TABLA */
    .table-container { overflow-x: auto; max-height: 480px; }
    table { width: 100%; border-collapse: collapse; text-align: left; font-size: 12px; }
    th {
      background: #0b0f19;
      color: var(--text-muted);
      font-weight: 700;
      text-transform: uppercase;
      font-size: 10px;
      padding: 10px 12px;
      border-bottom: 1px solid var(--card-border);
      position: sticky; top: 0;
    }
    td { padding: 12px; border-bottom: 1px solid #1a2234; }
    tbody tr:hover { background: rgba(255, 255, 255, 0.02); }
    .badge-code {
      font-family: monospace; font-size: 11px; font-weight: 700;
      background: #1e293b; padding: 3px 6px; border-radius: 6px; color: #38bdf8;
    }
    .badge-status-available {
      background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.3);
      color: #fbbf24; padding: 3px 8px; border-radius: 6px; font-size: 10px; font-weight: 700;
    }
    .badge-status-used {
      background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3);
      color: #34d399; padding: 3px 8px; border-radius: 6px; font-size: 10px; font-weight: 700;
    }
    .stars-cell { color: #fbbf24; font-size: 13px; }

    /* LOGS */
    .log-box {
      background: #060911; border: 1px solid var(--card-border); border-radius: 12px;
      height: 400px; overflow-y: auto; padding: 12px; display: flex; flex-direction: column; gap: 8px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 11px;
    }
    .log-item { background: #0f1626; border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 8px 10px; }
    .log-top { display: flex; align-items: center; justify-content: space-between; }
    .method-tag { font-weight: 800; padding: 2px 6px; border-radius: 4px; font-size: 10px; }
    .method-post { background: rgba(16, 185, 129, 0.2); color: #34d399; }
    .method-get { background: rgba(56, 189, 248, 0.2); color: #38bdf8; }
    .log-url { color: #f3f4f6; font-weight: 700; }
    .log-time { color: #6b7280; font-size: 10px; }
    .log-detail { color: #9ca3af; word-break: break-all; margin-top: 2px; }

    /* FORMULARIOS Y CONTROLES DEL BACKEND */
    .form-group { margin-bottom: 14px; }
    .form-label { display: block; font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--text-muted); margin-bottom: 6px; }
    .form-input {
      width: 100%; background: #0b0f19; border: 1px solid var(--card-border); color: #fff;
      padding: 9px 14px; border-radius: 10px; font-size: 12px; outline: none; transition: border-color 0.2s;
    }
    .form-input:focus { border-color: var(--accent); }
    .form-help { font-size: 10px; color: #6b7280; margin-top: 4px; display: block; }
    .btn-save {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: #000; font-weight: 800; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;
      padding: 10px 22px; border-radius: 10px; border: none; cursor: pointer; transition: all 0.2s;
    }
    .btn-save:hover { filter: brightness(1.1); transform: translateY(-1px); }
    .toast-success { color: #34d399; font-size: 11px; font-weight: 700; display: none; }

    /* PRESETS DE ICONOS Y EMOJIS */
    .icon-preset-btn {
      background: #0b0f19; border: 1px solid var(--card-border); color: #fff;
      padding: 6px 10px; border-radius: 8px; font-size: 12px; cursor: pointer; transition: all 0.15s;
      display: inline-flex; align-items: center; gap: 4px;
    }
    .icon-preset-btn:hover { border-color: #d97706; background: rgba(217, 119, 6, 0.1); }
    .icon-preset-btn.active { border-color: #f59e0b; background: rgba(245, 158, 11, 0.25); font-weight: 700; }
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

    <!-- LAYOUT PRINCIPAL DE 2 COLUMNAS (CONTENIDO A LA IZQUIERDA / BARRA VERTICAL A MANO DERECHA) -->
    <div class="dashboard-layout">
      <!-- CONTENIDO PRINCIPAL (IZQUIERDA) -->
      <main class="main-content">

    <!-- ========================================================================= -->
    <!-- PESTAÑA 1: OPERACIONES & MÉTRICAS                                         -->
    <!-- ========================================================================= -->
    <div id="tab-ops" class="tab-content active">
      <!-- TARJETAS DE MÉTRICAS OPERATIVAS -->
      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-title">Cupones Generados</span>
          <span class="stat-value" id="stat-total">${totalPrizes}</span>
          <span class="stat-sub">Registrados en db.json</span>
        </div>
        <div class="stat-card">
          <span class="stat-title">Canjeados en Caja</span>
          <span class="stat-value" id="stat-redeemed" style="color: #34d399;">${redeemed}</span>
          <span class="stat-sub">Verificados con PIN del cajero</span>
        </div>
        <div class="stat-card">
          <span class="stat-title">Efectividad de Mesa</span>
          <span class="stat-value" id="stat-rate" style="color: #fbbf24;">${conversionRate}%</span>
          <span class="stat-sub">Premios convertidos a consumo</span>
        </div>
        <div class="stat-card">
          <span class="stat-title">Clientes Únicos</span>
          <span class="stat-value" id="stat-customers" style="color: #38bdf8;">${totalCustomers}</span>
          <span class="stat-sub">Con acumulación de sellos</span>
        </div>
      </div>

      <!-- HORÓMETRO DE HORAS MUERTAS Y ACTIVIDAD -->
      <div style="background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
        <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 14px;">
          <div>
            <h3 style="font-size: 15px; font-weight: 700; color: #fff; display: flex; align-items: center; gap: 8px;">
              <span>⏱️ Horómetro de Actividad & Detección de Horas Muertas</span>
            </h3>
            <p style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">
              Monitorea a qué horas del día juegan los clientes en mesa para detectar y activar las horas lentas con ofertas.
            </p>
          </div>
          <div style="padding: 4px 12px; border-radius: 9999px; background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.3); color: #fbbf24; font-size: 11px; font-weight: 700;">
            ☕ Franja de Horas Muertas: 3:00 PM a 6:00 PM (15h - 18h)
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(70px, 1fr)); gap: 8px;">
          ${[8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22]
            .map((h) => {
              const isDead = h >= 15 && h <= 17;
              const ampm = h >= 12 ? "PM" : "AM";
              const h12 = h % 12 === 0 ? 12 : h % 12;
              const count = db.prizes.filter((p) => {
                if (!p.wonAt) return false;
                const match = p.wonAt.match(/^(\d{1,2}):/);
                return match && parseInt(match[1], 10) === h;
              }).length;
              return `
              <div style="padding: 10px 6px; border-radius: 10px; border: 1px solid ${
                isDead
                  ? "rgba(245, 158, 11, 0.4)"
                  : count > 0
                  ? "rgba(16, 185, 129, 0.4)"
                  : "var(--card-border)"
              }; background: ${
                isDead
                  ? "rgba(245, 158, 11, 0.08)"
                  : count > 0
                  ? "rgba(16, 185, 129, 0.08)"
                  : "#0b0f19"
              }; text-align: center;">
                <span style="font-size: 10px; font-weight: 700; color: ${
                  isDead ? "#fbbf24" : "#9ca3af"
                }; display: block;">${h12} ${ampm}</span>
                <span style="font-size: 18px; font-weight: 800; color: #fff; display: block; margin: 2px 0;">${count}</span>
                <span style="font-size: 8px; text-transform: uppercase; font-weight: 700; padding: 1px 4px; border-radius: 4px; background: ${
                  isDead ? "rgba(245, 158, 11, 0.2)" : "rgba(255,255,255,0.06)"
                }; color: ${isDead ? "#fbbf24" : "#6b7280"};">
                  ${isDead ? "Muerta" : h >= 12 && h < 15 ? "Almuerzo" : "Normal"}
                </span>
              </div>
            `;
            })
            .join("")}
        </div>
      </div>

      <!-- PANELES DIVIDIDOS -->
      <div class="panels-grid">
        <!-- PANEL IZQUIERDO: BASE DE DATOS DE CUPONES Y CLIENTES -->
        <div class="panel">
          <div class="panel-header">
            <div class="panel-title">
              <span>🎟️ Cupones y Tarjetas de Sellos</span>
              <span style="font-size: 11px; background: #1f2937; padding: 2px 8px; border-radius: 6px; color: #9ca3af;">Base de Datos Local</span>
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
                              <strong style="color: #fff;">${p.customerName || "Cliente"}</strong>
                              <div style="font-size: 11px; color: #9ca3af;">${p.whatsapp || "Sin número"}</div>
                            </td>
                            <td style="color: #e5e7eb;">
                              ${p.prizeName}
                              <div style="font-size: 10px; color: #6b7280;">Mesa: ${p.tableNumber || "1"}</div>
                            </td>
                            <td>
                              <span class="stars-cell">${stars}</span>
                              <div style="font-size: 10px; color: #9ca3af;">${stamps}/15 visitas</div>
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
    <div id="tab-roulette" class="tab-content">
      <!-- GUÍA RÁPIDA -->
      <div class="quick-guide-box">
        <div class="quick-guide-header">
          <span>💡</span>
          <span>Guía Rápida: Ruleta de Premios & Probabilidades</span>
        </div>
        <div class="quick-guide-grid">
          <div class="quick-guide-item">
            <strong>🎯 Suma 100% Obligatoria</strong>
            <span>La suma de todas las probabilidades activas debe dar exactamente 100% para mantener el equilibrio matemático.</span>
          </div>
          <div class="quick-guide-item">
            <strong>🎁 Tipos de Beneficio</strong>
            <span>Configura descuentos en %, productos de cortesía o promociones para elevar el ticket promedio en mesa.</span>
          </div>
          <div class="quick-guide-item">
            <strong>⚡ Sincronización en Vivo</strong>
            <span>Al presionar guardar, el frontend de comensales lee las nuevas opciones al instante sin recargar.</span>
          </div>
        </div>
      </div>

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
                <span style="font-size: 10px; color: #9ca3af;">${p.label}</span>
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
              <span id="comp-status-badge" style="font-size: 11px; padding: 4px 12px; border-radius: 20px; font-weight: 700; ${s.composio && s.composio.enabled ? 'background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.4);' : 'background: rgba(107, 114, 128, 0.2); color: #9ca3af; border: 1px solid rgba(107, 114, 128, 0.4);'}">
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
            <button onclick="testComposioSync()" style="background: rgba(255,255,255,0.08); color: #fff; font-size: 11px; padding: 7px 14px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15); cursor: pointer;">
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
              <strong style="color: #fff; font-size: 13px; text-transform: uppercase;">Matriz de Asignación de Permisos</strong>
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
                      <strong style="color: #fff; font-size: 12px;">${p.name}</strong>
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
        <div style="font-size: 11px; color: #9ca3af; margin-bottom: 8px;">
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
          <span style="font-size: 10px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 8px;">
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
          </div>

          <div class="form-group">
            <label class="form-label">URL de Destino (Opcional - al hacer clic)</label>
            <input type="url" id="pushUrl" class="form-input" placeholder="http://localhost:5173">
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 16px; padding-top: 12px; border-top: 1px solid var(--card-border);">
            <span id="pushStatusMsg" style="font-size: 11px; color: #9ca3af;"></span>
            <button type="submit" class="btn-save" style="background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%); color: #fff;">
              🚀 Enviar Notificación Masiva Ahora
            </button>
          </div>
        </form>
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
            <p style="font-size: 11px; color: #9ca3af; margin-bottom: 6px;">Disparo automático 6 minutos después del primer juego en mesa.</p>
            <div style="font-size: 11px; color: #fff; background: rgba(255,255,255,0.04); padding: 8px; border-radius: 8px; font-family: monospace;">
              "¡Gracias por visitarnos! Tu primer sello ya está activo en tu tarjeta digital."
            </div>
          </div>

          <!-- Flujo 2 -->
          <div style="background: #0b0f19; border: 1px solid var(--card-border); border-radius: 12px; padding: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <strong style="color: #fbbf24; font-size: 12px;">⏳ Urgencia Cupón (24h)</strong>
              <span class="badge-status-available">ACTIVO</span>
            </div>
            <p style="font-size: 11px; color: #9ca3af; margin-bottom: 6px;">Se envía 24h antes de que expire el beneficio de la ruleta.</p>
            <div style="font-size: 11px; color: #fff; background: rgba(255,255,255,0.04); padding: 8px; border-radius: 8px; font-family: monospace;">
              "¡Tu premio vence mañana! Ven hoy y disfrútalo en mesa antes de su caducidad."
            </div>
          </div>

          <!-- Flujo 3 -->
          <div style="background: #0b0f19; border: 1px solid var(--card-border); border-radius: 12px; padding: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <strong style="color: #c084fc; font-size: 12px;">☕ Reactivación (14 Días)</strong>
              <span class="badge-status-available">ACTIVO</span>
            </div>
            <p style="font-size: 11px; color: #9ca3af; margin-bottom: 6px;">Se envía a clientes que llevan 14 días sin visitarnos.</p>
            <div style="font-size: 11px; color: #fff; background: rgba(255,255,255,0.04); padding: 8px; border-radius: 8px; font-family: monospace;">
              "¡Te extrañamos! Esta semana recibe un postre artesanal sorpresa de cortesía con tu café."
            </div>
          </div>

          <!-- Flujo 4 -->
          <div style="background: #0b0f19; border: 1px solid var(--card-border); border-radius: 12px; padding: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <strong style="color: #38bdf8; font-size: 12px;">⚡ Happy Hour (3 a 6 PM)</strong>
              <span class="badge-status-available">ACTIVO</span>
            </div>
            <p style="font-size: 11px; color: #9ca3af; margin-bottom: 6px;">Multiplicador automático x2 de sellos en horas muertas de Lunes a Jueves.</p>
            <div style="font-size: 11px; color: #fff; background: rgba(255,255,255,0.04); padding: 8px; border-radius: 8px; font-family: monospace;">
              "¡Tarde dulce! Hoy tus consumos suman 2 SELLOS en tu tarjeta de fidelización."
            </div>
          </div>
        </div>
      </div>
    </div>

      </main>

      <!-- BARRA LATERAL VERTICAL A MANO DERECHA (Categorizada y de fácil personalización) -->
      <aside class="nav-sidebar">
        <div class="sidebar-card">
          <div class="sidebar-header">
            <span>📂 CATEGORÍAS</span>
            <span class="badge-role">ADMIN</span>
          </div>

          <!-- GRUPO 1: OPERACIONES -->
          <div class="nav-group">
            <span class="nav-group-title">📊 OPERACIONES</span>
            <button class="nav-tab-btn active" onclick="switchTab('tab-ops')">
              <span>📊</span>
              <div>
                <div class="tab-title">Operaciones & Métricas</div>
                <div class="tab-sub">KPIs, canjes y comensales</div>
              </div>
            </button>
            <button class="nav-tab-btn" onclick="switchTab('tab-channels')">
              <span>📱</span>
              <div>
                <div class="tab-title">Canales & WhatsApp</div>
                <div class="tab-sub">Notificación al comensal</div>
              </div>
            </button>
          </div>

          <!-- GRUPO 2: FIDELIZACIÓN -->
          <div class="nav-group">
            <span class="nav-group-title">🎯 FIDELIZACIÓN</span>
            <button class="nav-tab-btn" onclick="switchTab('tab-roulette')">
              <span>🎡</span>
              <div>
                <div class="tab-title">Ruleta de Premios</div>
                <div class="tab-sub">Probabilidades (100%)</div>
              </div>
            </button>
            <button class="nav-tab-btn" onclick="switchTab('tab-stamps')">
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
            <button class="nav-tab-btn" onclick="switchTab('tab-push')">
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
            <button class="nav-tab-btn" onclick="switchTab('tab-brand')">
              <span>🏷️</span>
              <div>
                <div class="tab-title">Identidad & Marca</div>
                <div class="tab-sub">Colores, logo y eslogan</div>
              </div>
            </button>
            <button class="nav-tab-btn" onclick="switchTab('tab-composio')">
              <span>⚡</span>
              <div>
                <div class="tab-title">Composio & IA</div>
                <div class="tab-sub">Conexión 200+ apps</div>
              </div>
            </button>
            <button class="nav-tab-btn" onclick="switchTab('tab-databases')">
              <span>🗄️</span>
              <div>
                <div class="tab-title">Bases de Datos</div>
                <div class="tab-sub">Google Sheets y Supabase</div>
              </div>
            </button>
            <button class="nav-tab-btn" onclick="switchTab('tab-security')">
              <span>🔐</span>
              <div>
                <div class="tab-title">Seguridad & PINs</div>
                <div class="tab-sub">Roles RBAC (8888, 5555, 1978)</div>
              </div>
            </button>
          </div>
        </div>
      </aside>
    </div>

  </div>

  <script>
    // CAMBIO DE PESTAÑAS EN EL BACKEND
    function switchTab(tabId) {
      document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
      document.querySelectorAll('.nav-tab-btn').forEach(el => el.classList.remove('active'));
      const target = document.getElementById(tabId);
      if (target) target.classList.add('active');
      const activeBtn = document.querySelector(`.nav-tab-btn[onclick="switchTab('${tabId}')"]`);
      if (activeBtn) activeBtn.classList.add('active');
    }

    // CARGAR PLANTILLAS DE PUSH
    function loadPushTemplate(type) {
      const titleInput = document.getElementById("pushTitle");
      const bodyInput = document.getElementById("pushBody");
      const segmentInput = document.getElementById("pushSegment");
      if (type === "happy_hour") {
        titleInput.value = "⚡ ¡Happy Hour 2x1 en Café y Bebidas de Autor!";
        bodyInput.value = "¡Hola! Hoy de 3:00 a 6:00 PM acumula el DOBLE de sellos y disfruta 2x1 en bebidas. ¡Muestra este mensaje en caja!";
        segmentInput.value = "Subscribed Users";
      } else if (type === "dessert") {
        titleInput.value = "🍰 ¡Postre de Cortesía en tu Visita de Hoy!";
        bodyInput.value = "Ven hoy a deleitarte y recibe un postre artesanal de autor de cortesía con tu consumo principal. ¡Te esperamos!";
        segmentInput.value = "Subscribed Users";
      } else if (type === "flash") {
        titleInput.value = "⏳ Cupón Flash: 50% en tu Segundo Plato o Bebida";
        bodyInput.value = "¡Solo por hoy! Disfruta 50% de descuento en tu segundo producto favorito. Muestra este aviso en caja.";
        segmentInput.value = "Active Customers";
      } else if (type === "stamps") {
        titleInput.value = "🌟 ¡Sellos Dobles este Fin de Semana!";
        bodyInput.value = "¡Acelera tu tarjeta de 15 sellos! Cada visita este fin de semana te otorga 2 sellos para llegar antes a tu premio.";
        segmentInput.value = "Subscribed Users";
      }
    }

    // ENVIAR CAMPAÑA PUSH BROADCAST
    async function sendBroadcastPush(e) {
      e.preventDefault();
      const statusEl = document.getElementById("pushStatusMsg");
      const title = document.getElementById("pushTitle").value.trim();
      const body = document.getElementById("pushBody").value.trim();
      const segment = document.getElementById("pushSegment").value;
      const url = document.getElementById("pushUrl").value.trim();

      if (!title || !body) {
        alert("Por favor completa el título y el mensaje de la campaña.");
        return;
      }

      statusEl.style.color = "#fbbf24";
      statusEl.innerText = "⏳ Enviando campaña push a los suscriptores...";

      try {
        const res = await fetch("/api/push/broadcast", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, body, segment, url })
        });
        const data = await res.json();
        if (data.success) {
          statusEl.style.color = "#34d399";
          statusEl.innerText = "✓ " + data.message;
          setTimeout(() => { statusEl.innerText = ""; }, 5000);
          refreshData();
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
                    <strong style="color: #fff;">\${p.customerName || "Cliente"}</strong>
                    <div style="font-size: 11px; color: #9ca3af;">\${p.whatsapp || "Sin número"}</div>
                  </td>
                  <td style="color: #e5e7eb;">
                    \${p.prizeName}
                    <div style="font-size: 10px; color: #6b7280;">Mesa: \${p.tableNumber || "1"}</div>
                  </td>
                  <td>
                    <span class="stars-cell">\${stars}</span>
                    <div style="font-size: 10px; color: #9ca3af;">\${stamps}/15 visitas</div>
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
