/**
 * SERVIDOR BACKEND MODULAR - FIDELIZACIÓN & GAMIFICACIÓN EN MESA (MARCA BLANCA)
 * Arquitectura modular y extensible de 0 dependencias.
 * Módulos integrados:
 *  - Tables (Gestión de mesas en tiempo real)
 *  - Loyalty (Sellos, ruleta, segunda oportunidad, sorteo)
 *  - Missions (Misiones gamificadas y reseñas)
 *  - Hermes (Conexión IA & WhatsApp Omnicanal)
 *  - Reputation (Embudo de reputación y reseñas Google)
 *  - Config (Configuración de marca, bases de datos y métricas)
 *  - Push (Web Push notifications y difusión)
 *  - Captive Portal (Servicio tipo Kiosko y Portal Cautivo WiFi)
 *  - Views/Dashboard (Panel visual de administración)
 */

import http from "node:http";
import { PORT, db } from "./state.js";
import { renderBackendDashboard } from "./views/dashboard.js";
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

const server = http.createServer((req, res) => {
  // Encabezados CORS universales
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

  // 2. DESPACHO A MÓDULOS ACTIVOS
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
  console.log(`   - [Tables]         /api/tables, /api/tables/:id/reset`);
  console.log(`   - [Loyalty]        /api/game-config, /api/prizes, /api/validate-pin, /api/contest/*`);
  console.log(`   - [Missions]       /api/missions, /api/missions/*`);
  console.log(`   - [Hermes]         /api/hermes/*, /api/integrations/hermes/*`);
  console.log(`   - [Reputation]     /api/reputation/*`);
  console.log(`   - [Push]           /api/push/* (+ Web Push Subscribers)`);
  console.log(`   - [Captive Portal] /api/portal/* (Kiosko & WiFi Captive Portal)`);
  console.log(`   - [Dashboard]      http://localhost:${PORT}/`);
  console.log(`======================================================\n`);
});
