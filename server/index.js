/**
 * SERVIDOR BACKEND MODULAR - FIDELIZACIÓN & GAMIFICACIÓN EN MESA (MARCA BLANCA)
 * Arquitectura modular y extensible de 0 dependencias de runtime.
 * Módulos integrados:
 *  - Auth (Login por PIN + token de sesión que protege endpoints de escritura)
 *  - Tables (Gestión de mesas en tiempo real)
 *  - Loyalty (Sellos, ruleta, segunda oportunidad, sorteo)
 *  - Missions (Misiones gamificadas y reseñas)
 *  - Hermes (Conexión IA & WhatsApp Omnicanal)
 *  - Reputation (Embudo de reputación y reseñas Google)
 *  - Config (Configuración de marca, bases de datos y métricas)
 *  - Push (Web Push notifications y difusión + Geofencing)
 *  - Captive Portal (Servicio tipo Kiosko y Portal Cautivo WiFi)
 *  - NFC (Asistente NFC/QR por mesa)
 *  - Views/Dashboard (Panel visual de administración)
 */

import http from "node:http";
import { PORT, db } from "./state.js";
import { renderBackendDashboard } from "./views/dashboard.js";
import { handleAuth, requireAuth } from "./modules/auth.js";
import { handleTables } from "./modules/tables.js";
import { handleLoyalty } from "./modules/loyalty.js";
import { handleMissions } from "./modules/missions.js";
import { handleHermes } from "./modules/hermes.js";
import { handleReputation } from "./modules/reputation.js";
import { handleConfig } from "./modules/config.js";
import { handlePush } from "./modules/push.js";
import { handleCaptivePortal } from "./modules/captive-portal.js";
import { handleNfc } from "./modules/nfc.js";

const modules = [
  handleTables,
  handleLoyalty,
  handleMissions,
  handleHermes,
  handleReputation,
  handleConfig,
  handlePush,
  handleCaptivePortal,
  handleNfc,
];

// =========================================================================
// CONTROL DE ACCESO
// Endpoints administrativos de escritura que exigen token de sesión.
// Cada regla es [método, matcher]. El matcher puede ser string exacto o RegExp.
// Todo lo que NO coincida aquí es público (flujo del comensal, GETs, CNA, etc.).
// =========================================================================
const PROTECTED = [
  ["POST", "/api/config"],
  ["POST", "/api/tables"],
  ["POST", /^\/api\/tables\/.+\/reset$/],
  ["POST", "/api/game-config"],
  ["POST", "/api/second-chance-config"],
  ["POST", "/api/missions/config"],
  ["POST", "/api/missions/review"],
  ["POST", "/api/hermes/config"],
  ["POST", "/api/hermes/test"],
  ["POST", "/api/hermes/send-demo"],
  ["POST", "/api/reputation/config"],
  ["POST", "/api/portal/config"],
  ["POST", /^\/api\/portal\/devices\/(disconnect|extend)$/],
  ["POST", "/api/nfc/config"],
  ["POST", /^\/api\/backup\/.+/],
  ["POST", "/api/contest/draw"],
  ["POST", "/api/contest/batch"],
  ["POST", "/api/contest/transfer-to-prizes"],
  ["POST", "/api/contest/import-sheets"],
  ["POST", "/api/push/broadcast"],
  ["POST", "/api/push/drafts"],
  ["DELETE", "/api/push/drafts"],
  ["POST", "/api/push/schedule-config"],
  ["POST", "/api/push/campaigns/update"],
  ["POST", "/api/push/geofencing"],
  ["POST", "/api/push/geofencing/test-trigger"],
  ["POST", /^\/api\/integrations\/composio\/.+/],
];

function isProtected(method, pathname) {
  return PROTECTED.some(([m, matcher]) => {
    if (m !== method) return false;
    return matcher instanceof RegExp ? matcher.test(pathname) : matcher === pathname;
  });
}

// Orígenes permitidos para CORS. En producción, define ALLOWED_ORIGINS
// (coma-separado). Si no está definido, se permite "*" (modo desarrollo).
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

function applyCors(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.length === 0) {
    res.setHeader("Access-Control-Allow-Origin", "*");
  } else if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

const server = http.createServer((req, res) => {
  applyCors(req, res);

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  // 0. AUTENTICACIÓN (login / logout / verify) — siempre público
  if (handleAuth(req, res, pathname)) return;

  // 1. DASHBOARD VISUAL DEL BACKEND (Ruta raíz /)
  if ((req.method === "GET" || req.method === "HEAD") && pathname === "/") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    if (req.method === "HEAD") {
      res.end();
      return;
    }
    res.end(renderBackendDashboard());
    return;
  }

  // 1.1 MANIFIESTO PWA DINÁMICO (/manifest.json o /manifest.webmanifest)
  if (req.method === "GET" && (pathname === "/manifest.json" || pathname === "/manifest.webmanifest" || pathname === "/api/manifest")) {
    const brand = db.settings?.brand || {};
    const manifest = {
      name: brand.name ? `${brand.name} - Fidelización & Premios` : "Tu Restaurante & Café - Experiencia & Premios VIP",
      short_name: brand.name || "Tu Negocio",
      description: brand.tagline || "Gira la ruleta, acumula sellos de visita y canjea premios exclusivos en tu mesa.",
      start_url: "/?source=pwa",
      scope: "/",
      display: "standalone",
      background_color: "#141317",
      theme_color: brand.primaryColor || "#0f0e12",
      orientation: "portrait-primary",
      icons: [
        { src: "/favicon.png", sizes: "64x64", type: "image/png" },
        { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any maskable" },
        { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" }
      ],
      shortcuts: [
        {
          name: "Girar Ruleta",
          url: "/?paso=3&source=shortcut",
          icons: [{ src: "/icon-192.png", sizes: "192x192" }]
        },
        {
          name: "Tarjeta de Sellos",
          url: "/?paso=7&source=shortcut",
          icons: [{ src: "/icon-192.png", sizes: "192x192" }]
        }
      ]
    };
    res.writeHead(200, { "Content-Type": "application/manifest+json; charset=utf-8" });
    res.end(JSON.stringify(manifest, null, 2));
    return;
  }

  // 1.2 CONTROL DE ACCESO para endpoints administrativos de escritura
  if (isProtected(req.method, pathname)) {
    if (!requireAuth(req, res)) return; // 401 ya enviado
  }

  // 2. DESPACHO A MÓDULOS ACTIVOS.
  // Cada módulo devuelve true si manejó la ruta; si ya escribió la respuesta
  // (res.headersSent) también cortamos. Así el primer módulo que coincide gana.
  for (const handleModule of modules) {
    const handled = handleModule(req, res, pathname, url);
    if (handled || res.headersSent) {
      return;
    }
  }

  if (res.headersSent) return;

  // 3. RUTA NO ENCONTRADA (404)
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Endpoint no encontrado" }));
});

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 SERVIDOR BACKEND MODULAR CORRIENDO EN: http://localhost:${PORT}`);
  console.log(`======================================================`);
  console.log(`✨ Módulos activos cargados:`);
  console.log(`   - [Auth]           /api/auth/login, /api/auth/logout, /api/auth/verify`);
  console.log(`   - [Tables]         /api/tables, /api/tables/:id/reset`);
  console.log(`   - [Loyalty]        /api/game-config, /api/prizes, /api/validate-pin, /api/stamps/*, /api/contest/*`);
  console.log(`   - [Missions]       /api/missions, /api/missions/*`);
  console.log(`   - [Hermes]         /api/hermes/*, /api/integrations/hermes/*`);
  console.log(`   - [Reputation]     /api/reputation/*`);
  console.log(`   - [Config]         /api/config, /api/metrics, /api/backup/*`);
  console.log(`   - [Push]           /api/push/* (+ Web Push + Geofencing)`);
  console.log(`   - [Captive Portal] /api/portal/* (Kiosko & WiFi Captive Portal)`);
  console.log(`   - [NFC]            /api/nfc/* (Asistente NFC/QR por mesa)`);
  console.log(`   - [Dashboard]      http://localhost:${PORT}/`);
  console.log(`   - CORS: ${ALLOWED_ORIGINS.length ? ALLOWED_ORIGINS.join(", ") : "* (desarrollo)"}`);
  console.log(`======================================================\n`);
});
