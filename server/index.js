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

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Backend Demo - Consola de Servidor & Base de Datos</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen p-6 font-mono">
  <div class="max-w-6xl mx-auto space-y-6">
    
    <!-- ENCABEZADO DEL SERVIDOR -->
    <header class="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
      <div class="space-y-1">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          SERVIDOR BACKEND ACTIVO · PUERTO ${PORT}
        </div>
        <h1 class="text-xl font-bold text-white tracking-tight">Consola de Servidor & Base de Datos REST</h1>
        <p class="text-xs text-slate-400">Procesa eventos de ruleta, valida el PIN de caja y acumula sellos digitales.</p>
      </div>

      <div class="flex items-center gap-3">
        <a href="http://localhost:5173" target="_blank" class="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl transition">
          📱 Abrir Demo Frontend (Puerto 5173) ➔
        </a>
      </div>
    </header>

    <!-- ESTADÍSTICAS DEL SERVIDOR -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div class="bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <span class="text-[10px] text-slate-400 block uppercase">Cupones Emitidos</span>
        <span class="text-2xl font-bold text-white">${totalPrizes}</span>
      </div>
      <div class="bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <span class="text-[10px] text-slate-400 block uppercase">Canjeados con PIN</span>
        <span class="text-2xl font-bold text-amber-400">${redeemed}</span>
      </div>
      <div class="bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <span class="text-[10px] text-slate-400 block uppercase">Clientes Registrados</span>
        <span class="text-2xl font-bold text-sky-400">${Object.keys(db.customers).length}</span>
      </div>
      <div class="bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <span class="text-[10px] text-slate-400 block uppercase">PIN del Cajero</span>
        <span class="text-2xl font-bold text-emerald-400 font-mono">1234</span>
      </div>
    </div>

    <!-- SECCIÓN DIVIDIDA: BASE DE DATOS Y LOGS -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      <!-- TABLA DE LA BASE DE DATOS (8 cols) -->
      <div class="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
        <h3 class="text-sm font-bold text-white flex items-center gap-2">
          <span>💾 Base de Datos de Cupones (db.json)</span>
        </h3>

        <div class="overflow-x-auto border border-slate-800 rounded-xl">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-950 text-slate-400 border-b border-slate-800 text-[11px]">
              <tr>
                <th class="p-2.5">Código</th>
                <th class="p-2.5">Cliente</th>
                <th class="p-2.5">Premio</th>
                <th class="p-2.5">Sellos</th>
                <th class="p-2.5">Estado</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800 text-[11px]">
              ${db.prizes
                .map(
                  (p) => `
                <tr class="hover:bg-slate-800/40">
                  <td class="p-2.5 font-bold text-amber-400">${p.uniqueCode}</td>
                  <td class="p-2.5 text-slate-200">${p.customerName}<br><span class="text-[9px] text-slate-500">${p.whatsapp}</span></td>
                  <td class="p-2.5 text-slate-300">${p.prizeName}</td>
                  <td class="p-2.5 text-emerald-400 font-bold">${p.stamps || 1}/5 ⭐</td>
                  <td class="p-2.5">
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold ${
                      p.status === "UTILIZADO"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-amber-500/20 text-amber-400"
                    }">
                      ${p.status}
                    </span>
                  </td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </div>
      </div>

      <!-- LOGS HTTP EN VIVO (5 cols) -->
      <div class="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-bold text-white flex items-center gap-2">
            <span>⚡ Registro de Peticiones HTTP</span>
          </h3>
          <button onclick="location.reload()" class="text-[10px] bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded text-slate-300">
            ↻ Refrescar
          </button>
        </div>

        <div class="h-80 overflow-y-auto space-y-2 text-[10px] bg-slate-950 p-3 rounded-xl border border-slate-800">
          ${db.logs.length === 0 ? '<p class="text-slate-500 italic">No hay peticiones recientes...</p>' : ""}
          ${db.logs
            .map(
              (l) => `
            <div class="p-2 rounded bg-slate-900 border border-slate-800 flex items-start gap-2">
              <span class="px-1.5 py-0.5 rounded font-bold ${
                l.method === "POST" ? "bg-emerald-950 text-emerald-400" : "bg-sky-950 text-sky-400"
              }">${l.method}</span>
              <div class="flex-1 overflow-hidden">
                <div class="flex items-center justify-between text-slate-400">
                  <span class="font-bold text-slate-200">${l.url}</span>
                  <span>${l.timestamp}</span>
                </div>
                <p class="text-slate-400 truncate mt-0.5">${l.detail}</p>
              </div>
            </div>
          `
            )
            .join("")}
        </div>
      </div>

    </div>

  </div>
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
