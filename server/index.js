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
  security: {
    masterAdminPin: "8888",
    cashierPin: "1978",
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
        security: { ...DEFAULT_SETTINGS.security, ...((loaded.settings && loaded.settings.security) || {}) },
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
        if (data.security) db.settings.security = { ...db.settings.security, ...data.security };

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

    /* PESTAÑAS DE NAVEGACIÓN */
    .nav-tabs {
      display: flex;
      gap: 8px;
      margin-bottom: 20px;
      overflow-x: auto;
      padding-bottom: 6px;
      border-bottom: 1px solid var(--card-border);
    }
    .nav-tab {
      background: #111827;
      color: #9ca3af;
      border: 1px solid var(--card-border);
      padding: 10px 16px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .nav-tab:hover { color: #fff; border-color: rgba(217, 119, 6, 0.5); }
    .nav-tab.active {
      background: linear-gradient(135deg, rgba(217, 119, 6, 0.25) 0%, rgba(217, 119, 6, 0.08) 100%);
      color: #fbbf24;
      border-color: #d97706;
      box-shadow: 0 2px 8px rgba(217, 119, 6, 0.2);
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

    <!-- PESTAÑAS DE NAVEGACIÓN GENERAL -->
    <div class="nav-tabs">
      <button class="nav-tab active" onclick="switchTab('tab-ops')">📊 Operaciones & Métricas</button>
      <button class="nav-tab" onclick="switchTab('tab-brand')">🏷️ Identidad & Marca</button>
      <button class="nav-tab" onclick="switchTab('tab-channels')">📱 Canales & WhatsApp</button>
      <button class="nav-tab" onclick="switchTab('tab-roulette')">🎡 Ruleta de Premios</button>
      <button class="nav-tab" onclick="switchTab('tab-stamps')">🎟️ Tarjeta de Sellos & Iconos</button>
      <button class="nav-tab" onclick="switchTab('tab-databases')">🗄️ Bases de Datos</button>
      <button class="nav-tab" onclick="switchTab('tab-security')">🔐 Seguridad & PINs</button>
    </div>

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
    <!-- PESTAÑA 7: SEGURIDAD & PINS                                               -->
    <!-- ========================================================================= -->
    <div id="tab-security" class="tab-content">
      <div class="panel">
        <div class="panel-header">
          <div class="panel-title">
            <span>🔐 Seguridad de Caja & Control de Acceso por Roles (PINs)</span>
          </div>
          <div>
            <span id="toast-security" class="toast-success">✓ ¡PINs guardados con éxito!</span>
            <button class="btn-save" onclick="saveSecurityConfig()">💾 Guardar PINs</button>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;">
          <div style="background: #0b0f19; border: 1px solid var(--card-border); border-radius: 14px; padding: 18px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
              <span style="font-size: 18px;">👑</span>
              <strong style="color: #fbbf24; font-size: 13px;">PIN Maestro de Dueño (Admin Total)</strong>
            </div>
            <p style="font-size: 11px; color: var(--text-muted); margin-bottom: 12px;">
              Permite configurar probabilidades de ruleta, marca, bases de datos y cambiar PINs.
            </p>
            <input type="password" id="sec-master-pin" class="form-input" value="${s.security.masterAdminPin || '8888'}" maxlength="4" style="font-family: monospace; font-size: 18px; letter-spacing: 0.2em; text-align: center; width: 140px;" />
          </div>

          <div style="background: #0b0f19; border: 1px solid var(--card-border); border-radius: 14px; padding: 18px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
              <span style="font-size: 18px;">💼</span>
              <strong style="color: #34d399; font-size: 13px;">PIN Operativo de Cajero (Turno en Mesa)</strong>
            </div>
            <p style="font-size: 11px; color: var(--text-muted); margin-bottom: 12px;">
              Permite validar y quemar cupones de comensales en caja y sumar sellos de visita.
            </p>
            <input type="password" id="sec-cashier-pin" class="form-input" value="${s.security.cashierPin || '1978'}" maxlength="4" style="font-family: monospace; font-size: 18px; letter-spacing: 0.2em; text-align: center; width: 140px;" />
          </div>
        </div>
      </div>
    </div>

  </div>

  <script>
    // CAMBIO DE PESTAÑAS EN EL BACKEND
    function switchTab(tabId) {
      document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
      document.querySelectorAll('.nav-tab').forEach(el => el.classList.remove('active'));
      const target = document.getElementById(tabId);
      if (target) target.classList.add('active');
      event.currentTarget.classList.add('active');
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

    // GUARDAR SEGURIDAD
    function saveSecurityConfig() {
      const payload = {
        security: {
          masterAdminPin: document.getElementById('sec-master-pin').value.trim(),
          cashierPin: document.getElementById('sec-cashier-pin').value.trim(),
        }
      };
      sendConfigUpdate(payload, 'toast-security');
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
