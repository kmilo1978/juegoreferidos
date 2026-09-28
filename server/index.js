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
};

// Cargar datos previos si existen
if (fs.existsSync(DB_FILE)) {
  try {
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    db = { ...db, ...JSON.parse(raw) };
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

        // Validación de Seguridad del PIN en el Backend
        if (pin !== "1234" && pin !== "1978") {
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

        // Sumar +1 sello de visita al cliente
        const customer = db.customers[prize.whatsapp];
        if (customer) {
          customer.stamps = Math.min(5, (customer.stamps || 0) + 1);
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

    logRequest("GET", pathname, 200, `Consulta de sellos para +${whatsapp}: ${stamps}/5`);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ whatsapp, stamps, totalRequired: 5 }));
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

  // Ruta no encontrada
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Endpoint no encontrado" }));
});

// INTERFAZ VISUAL DEL BACKEND (HTML SERVIDO EN http://localhost:3001)
function renderBackendDashboard() {
  const totalPrizes = db.prizes.length;
  const redeemed = db.prizes.filter((p) => p.status === "UTILIZADO").length;
  const totalCustomers = Object.keys(db.customers).length;
  const conversionRate = totalPrizes > 0 ? Math.round((redeemed / totalPrizes) * 100) : 0;

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bliss Soul · Backend & Panel de Control de Operaciones</title>
  <style>
    :root {
      --bg: #090d16;
      --card-bg: #111827;
      --card-border: #1f293d;
      --accent: #d97706;
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
    .container { max-width: 1240px; margin: 0 auto; }
    
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
      box-shadow: 0 10px 30px rgba(0,0,0,0.4);
      margin-bottom: 24px;
    }
    .header-info { display: flex; flex-direction: column; gap: 6px; }
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 4px 12px;
      border-radius: 9999px;
      background: var(--success-glow);
      color: var(--success);
      border: 1px solid rgba(16, 185, 129, 0.3);
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.5px;
      width: fit-content;
    }
    .pulse-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--success);
      box-shadow: 0 0 10px var(--success);
      animation: pulse 1.8s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(1.3); }
    }
    h1 { font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; }
    .header-desc { font-size: 13px; color: var(--text-muted); }
    .btn-frontend {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: #0f172a;
      text-decoration: none;
      font-weight: 700;
      font-size: 13px;
      padding: 10px 18px;
      border-radius: 12px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s ease;
      box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);
    }
    .btn-frontend:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(245, 158, 11, 0.45); }

    /* TARJETAS DE MÉTRICAS */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    .stat-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 14px;
      padding: 18px 20px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      transition: border-color 0.2s ease;
    }
    .stat-card:hover { border-color: #374151; }
    .stat-title { font-size: 11px; text-transform: uppercase; font-weight: 700; color: var(--text-muted); letter-spacing: 0.5px; }
    .stat-value { font-size: 28px; font-weight: 800; color: #ffffff; line-height: 1; }
    .stat-sub { font-size: 11px; color: var(--text-muted); }

    /* PANELES PRINCIPALES */
    .panels-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 20px;
    }
    @media (max-width: 980px) {
      .panels-grid { grid-template-columns: 1fr; }
    }
    .panel {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      padding: 22px;
      box-shadow: 0 6px 20px rgba(0,0,0,0.25);
    }
    .panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }
    .panel-title {
      font-size: 15px;
      font-weight: 700;
      color: #ffffff;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .btn-secondary {
      background: #1f2937;
      color: #e5e7eb;
      border: 1px solid #374151;
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .btn-secondary:hover { background: #374151; }

    /* TABLA */
    .table-container {
      overflow-x: auto;
      border: 1px solid var(--card-border);
      border-radius: 12px;
      background: #0b0f19;
    }
    table { width: 100%; border-collapse: collapse; text-align: left; font-size: 13px; }
    th {
      background: #131b2c;
      color: #9ca3af;
      padding: 12px 14px;
      font-size: 11px;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.5px;
      border-bottom: 1px solid var(--card-border);
    }
    td {
      padding: 12px 14px;
      border-bottom: 1px solid rgba(255,255,255,0.04);
      color: #d1d5db;
    }
    tr:hover td { background: rgba(255,255,255,0.02); }
    .badge-code {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-weight: 700;
      color: #f59e0b;
      background: rgba(245, 158, 11, 0.1);
      padding: 3px 8px;
      border-radius: 6px;
      border: 1px solid rgba(245, 158, 11, 0.25);
      display: inline-block;
    }
    .badge-status-used {
      background: rgba(16, 185, 129, 0.15);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.3);
      padding: 3px 9px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 700;
    }
    .badge-status-available {
      background: rgba(245, 158, 11, 0.15);
      color: #fbbf24;
      border: 1px solid rgba(245, 158, 11, 0.3);
      padding: 3px 9px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 700;
    }
    .stars-cell {
      color: #fbbf24;
      font-weight: 700;
      font-size: 12px;
    }

    /* CONSOLA DE LOGS */
    .log-box {
      background: #060911;
      border: 1px solid var(--card-border);
      border-radius: 12px;
      height: 380px;
      overflow-y: auto;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 11px;
    }
    .log-item {
      background: #0f1626;
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 8px;
      padding: 8px 10px;
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .log-top { display: flex; align-items: center; justify-content: space-between; }
    .method-tag {
      font-weight: 800;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 10px;
    }
    .method-post { background: rgba(16, 185, 129, 0.2); color: #34d399; }
    .method-get { background: rgba(56, 189, 248, 0.2); color: #38bdf8; }
    .log-url { color: #f3f4f6; font-weight: 700; }
    .log-time { color: #6b7280; font-size: 10px; }
    .log-detail { color: #9ca3af; word-break: break-all; }

    /* FILTRO DE BÚSQUEDA */
    .search-input {
      background: #0b0f19;
      border: 1px solid var(--card-border);
      color: #fff;
      padding: 7px 12px;
      border-radius: 8px;
      font-size: 12px;
      outline: none;
      width: 220px;
      transition: border-color 0.2s;
    }
    .search-input:focus { border-color: var(--accent); }
  </style>
</head>
<body>
  <div class="container">
    
    <!-- ENCABEZADO -->
    <header>
      <div class="header-info">
        <div class="status-badge">
          <span class="pulse-dot"></span>
          SERVIDOR BACKEND REST · PUERTO ${PORT} EN VIVO
        </div>
        <h1>Panel de Operaciones & Base de Datos</h1>
        <p class="header-desc">
          Monitoreo en tiempo real de premios otorgados en la ruleta, sellos de fidelización y canjes con PIN en caja.
        </p>
      </div>

      <div style="display: flex; gap: 10px; align-items: center;">
        <a href="http://localhost:5173" target="_blank" class="btn-frontend">
          📱 Abrir Pantalla del Comensal (Frontend) ➔
        </a>
      </div>
    </header>

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
          <input type="text" id="searchInput" placeholder="🔍 Buscar código, cliente o tel..." class="search-input" onkeyup="filterTable()">
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
                  ? '<tr><td colspan="6" style="text-align: center; color: #6b7280; padding: 24px;">No hay cupones registrados aún. ¡Gira la ruleta en el frontend para generar el primero!</td></tr>'
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
                            <div style="font-size: 10px; color: #9ca3af;">${stamps}/5 visitas</div>
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

      <!-- PANEL DERECHO: CONSOLA DE LOGS Y OPERACIONES -->
      <div class="panel">
        <div class="panel-header">
          <div class="panel-title">
            <span>⚡ Registro de Actividad HTTP</span>
          </div>
          <button class="btn-secondary" onclick="refreshData()">↻ Actualizar</button>
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

        <div style="margin-top: 14px; padding: 12px; background: #0b0f19; border: 1px solid var(--card-border); border-radius: 10px; font-size: 12px; color: #9ca3af;">
          <div style="font-weight: 700; color: #e5e7eb; margin-bottom: 4px;">ℹ️ PIN Maestro del Cajero:</div>
          <div>El cajero valida con el código PIN <strong style="color: #34d399;">1234</strong>. Al validarlo, el cupón pasa automáticamente a CANJEADO y se le suma +1 sello al cliente.</div>
        </div>
      </div>

    </div>

  </div>

  <script>
    // Búsqueda en vivo en la tabla
    function filterTable() {
      const filter = document.getElementById("searchInput").value.toLowerCase();
      const rows = document.querySelectorAll("#tableBody tr");
      rows.forEach(row => {
        const text = row.innerText.toLowerCase();
        row.style.display = text.includes(filter) ? "" : "none";
      });
    }

    // Auto-actualización silenciosa cada 3 segundos
    async function refreshData() {
      try {
        const res = await fetch("/api/metrics");
        if (!res.ok) return;
        const data = await res.json();
        
        // Actualizar métricas
        document.getElementById("stat-total").innerText = data.totalPrizes;
        document.getElementById("stat-redeemed").innerText = data.redeemedPrizes;
        document.getElementById("stat-rate").innerText = data.conversionRate;
        document.getElementById("stat-customers").innerText = data.totalCustomers;

        // Si no está escribiendo en el buscador, recargar tabla y logs suavemente
        const searchVal = document.getElementById("searchInput").value.trim();
        if (!searchVal) {
          const tbody = document.getElementById("tableBody");
          if (data.prizes && data.prizes.length > 0) {
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
                    <div style="font-size: 10px; color: #9ca3af;">\${stamps}/5 visitas</div>
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

          // Actualizar logs
          if (data.logs && data.logs.length > 0) {
            const logBox = document.getElementById("logBox");
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
        console.error("Error auto-refrescando backend:", e);
      }
    }

    // Intervalo de auto-refresco en segundo plano
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
  console.log(`   - GET  /                  (Dashboard visual del backend)`);
  console.log(`======================================================\n`);
});
