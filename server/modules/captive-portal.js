import http from "node:http";
import https from "node:https";
import { db, DEFAULT_TABLES, DEFAULT_SETTINGS, saveDb, logRequest } from "../state.js";

/**
 * Ejecuta la autorización REAL del dispositivo contra el router/controladora.
 * - MikroTik: hace un GET al endpoint de login del hotspot (gateway).
 * - UniFi: hace un POST authorize-guest a la controladora.
 *
 * Devuelve { ok, status, detail }. Si no hay router accesible, ok=false con el
 * detalle del error — NUNCA finge éxito.
 *
 * NOTA: requiere un router físico accesible en la red del local. No es
 * verificable sin ese hardware; en desarrollo normalmente fallará con ECONNREFUSED
 * y eso es correcto (se reporta como error, no como éxito).
 */
function callRouter(portalSettings, clientMac, sessionMins) {
  return new Promise((resolve) => {
    const hw = portalSettings.hardwareType;
    const TIMEOUT_MS = 5000;

    try {
      if (hw === "mikrotik") {
        const gw = portalSettings.mikrotik?.gatewayIp || "192.168.88.1";
        const dst = encodeURIComponent(portalSettings.redirectUrl || "/");
        const user = encodeURIComponent(clientMac);
        const path = `/login?username=${user}&dst=${dst}`;
        const reqRouter = http.request(
          { host: gw, port: 80, path, method: "GET", timeout: TIMEOUT_MS },
          (r) => {
            r.resume();
            resolve({ ok: r.statusCode < 400, status: r.statusCode, detail: `MikroTik login HTTP ${r.statusCode}` });
          }
        );
        reqRouter.on("timeout", () => { reqRouter.destroy(); resolve({ ok: false, status: "timeout", detail: "MikroTik no respondió (timeout)" }); });
        reqRouter.on("error", (e) => resolve({ ok: false, status: "error", detail: `MikroTik inaccesible: ${e.code || e.message}` }));
        reqRouter.end();
        return;
      }

      if (hw === "unifi") {
        const controllerUrl = portalSettings.unifi?.controllerUrl || "https://192.168.1.10:8443";
        const site = portalSettings.unifi?.site || "default";
        const apiKey = portalSettings.unifi?.apiKey || "";
        let u;
        try { u = new URL(controllerUrl); } catch { resolve({ ok: false, status: "error", detail: "URL de controladora UniFi inválida" }); return; }
        const payload = JSON.stringify({ cmd: "authorize-guest", mac: clientMac, minutes: sessionMins });
        const client = u.protocol === "https:" ? https : http;
        const reqRouter = client.request(
          {
            host: u.hostname,
            port: u.port || (u.protocol === "https:" ? 8443 : 80),
            path: `/api/s/${site}/cmd/stamgr`,
            method: "POST",
            timeout: TIMEOUT_MS,
            rejectUnauthorized: false, // las controladoras UniFi usan cert autofirmado
            headers: {
              "Content-Type": "application/json",
              "Content-Length": Buffer.byteLength(payload),
              ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
            },
          },
          (r) => {
            r.resume();
            resolve({ ok: r.statusCode < 400, status: r.statusCode, detail: `UniFi authorize HTTP ${r.statusCode}` });
          }
        );
        reqRouter.on("timeout", () => { reqRouter.destroy(); resolve({ ok: false, status: "timeout", detail: "UniFi no respondió (timeout)" }); });
        reqRouter.on("error", (e) => resolve({ ok: false, status: "error", detail: `UniFi inaccesible: ${e.code || e.message}` }));
        reqRouter.write(payload);
        reqRouter.end();
        return;
      }

      // kiosk_dns u otros: no hay router que autorizar (acceso vía DNS/kiosko)
      resolve({ ok: true, status: "n/a", detail: "Sin router: modo kiosko/DNS" });
    } catch (e) {
      resolve({ ok: false, status: "error", detail: e.message });
    }
  });
}

// Inicializar lista de dispositivos conectados si no existe
if (!db.connectedDevices) {
  db.connectedDevices = [
    {
      id: "dev-iphone-carlos",
      mac: "D4:61:9D:28:44:A1",
      ip: "192.168.88.102",
      hostname: "iPhone-de-Carlos",
      fullName: "Carlos Andrés Restrepo",
      whatsapp: "573009876543",
      connectedAt: new Date(Date.now() - 25 * 60000).toISOString(),
      expiresAt: new Date(Date.now() + 95 * 60000).toISOString(),
      stampsGranted: 1,
      status: "authorized",
      hardware: "mikrotik",
      bytesDownMb: 142.5,
      bytesUpMb: 18.2,
    },
    {
      id: "dev-samsung-marcela",
      mac: "BC:D1:1F:72:08:9B",
      ip: "192.168.88.105",
      hostname: "Galaxy-S24-Ultra",
      fullName: "Marcela Gómez",
      whatsapp: "573001234567",
      connectedAt: new Date(Date.now() - 40 * 60000).toISOString(),
      expiresAt: new Date(Date.now() + 80 * 60000).toISOString(),
      stampsGranted: 1,
      status: "authorized",
      hardware: "mikrotik",
      bytesDownMb: 210.8,
      bytesUpMb: 34.6,
    },
    {
      id: "dev-xiaomi-felipe",
      mac: "E8:48:B8:11:5F:C3",
      ip: "192.168.88.110",
      hostname: "Redmi-Note-13",
      fullName: "Felipe Morales",
      whatsapp: "573105556677",
      connectedAt: new Date(Date.now() - 10 * 60000).toISOString(),
      expiresAt: new Date(Date.now() + 110 * 60000).toISOString(),
      stampsGranted: 1,
      status: "authorized",
      hardware: "unifi",
      bytesDownMb: 58.1,
      bytesUpMb: 9.4,
    },
  ];
}

export function handleCaptivePortal(req, res, pathname, url) {
  const brand = db.settings?.brand || DEFAULT_SETTINGS.brand;
  const portalSettings = db.settings?.captivePortal || {
    enabled: true,
    hardwareType: "mikrotik",
    ssid: `${brand.name || "Restaurante"} - WiFi Clientes VIP`,
    sessionDurationMinutes: 120,
    welcomeTitle: "¡Bienvenido a nuestro restaurante!",
    welcomeDescription: "Conéctate al WiFi de alta velocidad, recibe tu primer sello de visita y participa por premios en mesa.",
    logoUrl: brand.logoUrl || "",
    requireWhatsapp: true,
    requireEmail: false,
    grantStampOnConnect: true,
    redirectUrl: "/?demo=true&paso=1",
    mikrotik: {
      gatewayIp: "192.168.88.1",
      hotspotServer: "hotspot1",
      dnsName: "wifi.local",
      walledGardenDomains: ["maps.google.com", "api.whatsapp.com", "fonts.googleapis.com", "fonts.gstatic.com"],
    },
    unifi: {
      controllerUrl: "https://192.168.1.10:8443",
      site: "default",
      apiKey: "unifi_api_key_sample",
    },
  };

  // =========================================================================
  // 1. DETECCIÓN CNA DE SISTEMAS OPERATIVOS (Captive Network Assistant)
  // =========================================================================

  // A. Apple iOS / macOS CNA Check (captive.apple.com / hotspot-detect.html)
  if (pathname === "/hotspot-detect.html" || pathname.endsWith("/hotspot-detect.html")) {
    const clientIp = req.socket?.remoteAddress || "unknown";
    const isAuth = db.connectedDevices.some((d) => d.ip === clientIp && d.status === "authorized");

    if (isAuth) {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end("<HTML><HEAD><TITLE>Success</TITLE></HEAD><BODY>Success</BODY></HTML>");
    } else {
      res.writeHead(302, { Location: "/?kiosk=true&cna=apple" });
      res.end();
    }
    return true;
  }

  // B. Android / Google Chrome CNA Check (/generate_204)
  if (pathname === "/generate_204") {
    const clientIp = req.socket?.remoteAddress || "unknown";
    const isAuth = db.connectedDevices.some((d) => d.ip === clientIp && d.status === "authorized");

    if (isAuth) {
      res.writeHead(204);
      res.end();
    } else {
      res.writeHead(302, { Location: "/?kiosk=true&cna=android" });
      res.end();
    }
    return true;
  }

  // C. Windows CNA Check (/connecttest.txt)
  if (pathname === "/connecttest.txt" || pathname.endsWith("/connecttest.txt")) {
    const clientIp = req.socket?.remoteAddress || "unknown";
    const isAuth = db.connectedDevices.some((d) => d.ip === clientIp && d.status === "authorized");

    if (isAuth) {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("Microsoft Connect Test");
    } else {
      res.writeHead(302, { Location: "/?kiosk=true&cna=windows" });
      res.end();
    }
    return true;
  }

  // D. Estándar IETF RFC 8908 & RFC 7710 (Captive Portal API)
  if (pathname === "/api/portal/cna-status") {
    const clientIp = req.socket?.remoteAddress || "unknown";
    const device = db.connectedDevices.find((d) => d.ip === clientIp);
    const isAuth = device && device.status === "authorized";

    res.writeHead(200, { "Content-Type": "application/captive+json" });
    res.end(
      JSON.stringify({
        captive: !isAuth,
        "user-portal-url": `http://${req.headers.host || "localhost:3001"}/?kiosk=true`,
        "venue-info-url": `http://${req.headers.host || "localhost:3001"}/`,
        seconds_remaining: isAuth ? Math.max(0, Math.floor((new Date(device.expiresAt).getTime() - Date.now()) / 1000)) : 0,
        can_extend_session: isAuth,
      })
    );
    return true;
  }

  // =========================================================================
  // 2. ESTADO Y CONFIGURACIÓN DEL PORTAL CAUTIVO (/api/portal/status)
  // =========================================================================
  if (pathname === "/api/portal/status" && req.method === "GET") {
    const activeDevices = db.connectedDevices.filter(
      (d) => d.status === "authorized" && new Date(d.expiresAt).getTime() > Date.now()
    );

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        success: true,
        active: portalSettings.enabled !== false,
        portalName: brand.name,
        wifiSSID: portalSettings.ssid || `${brand.name || "Restaurante"} - WiFi Clientes VIP`,
        welcomeMessage: portalSettings.welcomeTitle,
        welcomeDescription: portalSettings.welcomeDescription,
        logoUrl: portalSettings.logoUrl || brand.logoUrl,
        sessionMinutes: portalSettings.sessionDurationMinutes || 120,
        hardwareType: portalSettings.hardwareType || "mikrotik",
        requireEmail: portalSettings.requireEmail ?? false,
        requireWhatsapp: portalSettings.requireWhatsapp ?? true,
        grantStampOnConnect: portalSettings.grantStampOnConnect ?? true,
        redirectUrl: portalSettings.redirectUrl || "/?demo=true&paso=1",
        mikrotik: portalSettings.mikrotik,
        unifi: portalSettings.unifi,
        connectedDevicesCount: activeDevices.length,
        connectedDevices: activeDevices,
        tablesAvailable: (db.tables || DEFAULT_TABLES).filter((t) => t.status === "DISPONIBLE").length,
      })
    );
    return true;
  }

  // =========================================================================
  // 3. GUARDAR CONFIGURACIÓN COMPLETA DEL PORTAL (/api/portal/config)
  // =========================================================================
  if (pathname === "/api/portal/config" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const payload = JSON.parse(body || "{}");
        if (!db.settings) db.settings = {};
        db.settings.captivePortal = {
          ...portalSettings,
          ...payload,
        };
        saveDb();
        logRequest("POST", "/api/portal/config", 200, `Configuración Portal Cautivo actualizada (${payload.hardwareType || "general"})`);

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            success: true,
            message: "Configuración del portal WiFi guardada correctamente",
            captivePortal: db.settings.captivePortal,
          })
        );
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return true;
  }

  // =========================================================================
  // 4. AUTORIZACIÓN Y CONEXIÓN DESDE EL PORTAL / KIOSKO (/api/portal/connect)
  // =========================================================================
  if ((pathname === "/api/portal/connect" || pathname === "/api/portal/authorize") && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", async () => {
      try {
        const data = JSON.parse(body || "{}");
        const cleanWhatsapp = (data.whatsapp || "").replace(/\D/g, "");
        if (!cleanWhatsapp) {
          throw new Error("Número de WhatsApp requerido para acceso al WiFi");
        }

        const clientMac = data.mac || `02:00:${Math.floor(Math.random()*89+10)}:${Math.floor(Math.random()*89+10)}:${Math.floor(Math.random()*89+10)}:${Math.floor(Math.random()*89+10)}`;
        const clientIp = data.ip || req.socket?.remoteAddress || "192.168.88." + (Math.floor(Math.random()*150)+50);
        const sessionMins = portalSettings.sessionDurationMinutes || 120;

        // Registrar o actualizar cliente en CRM
        const existingCustomer = db.customers[cleanWhatsapp];
        let stampsEarned = 1;

        if (!existingCustomer) {
          db.customers[cleanWhatsapp] = {
            fullName: data.fullName || "Invitado WiFi",
            whatsapp: cleanWhatsapp,
            email: data.email || "",
            stamps: portalSettings.grantStampOnConnect ? 1 : 0,
            visits: 1,
            origin: "PORTAL_CAUTIVO_WIFI",
            connectedAt: new Date().toISOString(),
          };
        } else {
          db.customers[cleanWhatsapp].visits = (db.customers[cleanWhatsapp].visits || 1) + 1;
          if (portalSettings.grantStampOnConnect) {
            db.customers[cleanWhatsapp].stamps = (db.customers[cleanWhatsapp].stamps || 0) + 1;
          }
          db.customers[cleanWhatsapp].lastVisit = new Date().toISOString();
          stampsEarned = db.customers[cleanWhatsapp].stamps;
        }

        // Registrar o actualizar dispositivo conectado
        const expiresAt = new Date(Date.now() + sessionMins * 60000).toISOString();
        const existingDeviceIdx = db.connectedDevices.findIndex((d) => d.mac.toUpperCase() === clientMac.toUpperCase());

        const deviceEntry = {
          id: `dev-${cleanWhatsapp.slice(-4)}-${Date.now().toString(36)}`,
          mac: clientMac.toUpperCase(),
          ip: clientIp,
          hostname: data.hostname || (data.fullName ? `${data.fullName.split(" ")[0]}-Device` : "Invitado-Móvil"),
          fullName: data.fullName || "Invitado WiFi",
          whatsapp: cleanWhatsapp,
          connectedAt: new Date().toISOString(),
          expiresAt,
          stampsGranted: portalSettings.grantStampOnConnect ? 1 : 0,
          status: "authorized",
          hardware: portalSettings.hardwareType || "mikrotik",
          bytesDownMb: 0.1,
          bytesUpMb: 0.1,
        };

        if (existingDeviceIdx >= 0) {
          db.connectedDevices[existingDeviceIdx] = { ...db.connectedDevices[existingDeviceIdx], ...deviceEntry };
        } else {
          db.connectedDevices.unshift(deviceEntry);
        }

        saveDb();
        logRequest("POST", "/api/portal/authorize", 200, `WiFi Desbloqueado: +${cleanWhatsapp} [MAC: ${clientMac}] (${sessionMins}m)`);

        // AUTORIZACIÓN REAL contra el router/controladora (si hay hardware).
        // El cliente ya quedó registrado en el CRM; aquí intentamos abrirle
        // el acceso a internet de verdad. Si el router no está accesible, lo
        // reportamos honestamente en routerHandshake.status = "error".
        const routerResult = await callRouter(portalSettings, clientMac, sessionMins);
        const routerHandshake = {
          routerType: portalSettings.hardwareType || "none",
          mac: clientMac,
          minutes: sessionMins,
          status: routerResult.ok ? "authorized" : "error",
          detail: routerResult.detail,
        };

        logRequest(
          "POST",
          "/api/portal/authorize",
          routerResult.ok ? 200 : 502,
          `Router (${portalSettings.hardwareType}): ${routerResult.detail}`
        );

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            success: true,
            // El registro del cliente siempre se persiste; accessGranted refleja
            // si el router realmente abrió el acceso a internet.
            accessGranted: routerResult.ok,
            routerAuthorized: routerResult.ok,
            sessionMinutes: sessionMins,
            customer: db.customers[cleanWhatsapp],
            stamps: stampsEarned,
            expiresAt,
            routerHandshake,
            redirectUrl: portalSettings.redirectUrl || "/?demo=true&paso=1",
            welcomeMessage: routerResult.ok
              ? "¡Conexión WiFi autorizada con éxito! Disfruta de internet libre y acumula sellos."
              : "Registro completado. El acceso a internet se activará cuando el router esté disponible.",
          })
        );
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return true;
  }

  // =========================================================================
  // 5. LISTA DE DISPOSITIVOS CONECTADOS (/api/portal/devices)
  // =========================================================================
  if (pathname === "/api/portal/devices" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        success: true,
        devices: db.connectedDevices,
      })
    );
    return true;
  }

  // =========================================================================
  // 6. DESCONECTAR DISPOSITIVO (/api/portal/devices/disconnect)
  // =========================================================================
  if (pathname === "/api/portal/devices/disconnect" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const { mac } = JSON.parse(body || "{}");
        if (!mac) throw new Error("MAC requerida");

        const dev = db.connectedDevices.find((d) => d.mac.toUpperCase() === mac.toUpperCase());
        if (dev) {
          dev.status = "disconnected";
          dev.expiresAt = new Date().toISOString();
          saveDb();
          logRequest("POST", "/api/portal/devices/disconnect", 200, `Dispositivo desconectado: ${mac} (${dev.fullName})`);
        }

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, message: `Dispositivo ${mac} desconectado correctamente` }));
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return true;
  }

  // =========================================================================
  // 7. EXTENDER SESIÓN (+60 MIN) (/api/portal/devices/extend)
  // =========================================================================
  if (pathname === "/api/portal/devices/extend" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const { mac, extraMinutes } = JSON.parse(body || "{}");
        if (!mac) throw new Error("MAC requerida");
        const minutes = Number(extraMinutes) || 60;

        const dev = db.connectedDevices.find((d) => d.mac.toUpperCase() === mac.toUpperCase());
        if (dev) {
          const currentExp = new Date(dev.expiresAt).getTime() > Date.now() ? new Date(dev.expiresAt).getTime() : Date.now();
          dev.expiresAt = new Date(currentExp + minutes * 60000).toISOString();
          dev.status = "authorized";
          saveDb();
          logRequest("POST", "/api/portal/devices/extend", 200, `Sesión extendida +${minutes}m para ${mac}`);
        }

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, message: `Sesión extendida +${minutes} minutos`, expiresAt: dev?.expiresAt }));
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return true;
  }

  // =========================================================================
  // 8. GENERADOR DE SCRIPTS TÉCNICOS DE RED (MikroTik / UniFi)
  // =========================================================================
  if (pathname === "/api/portal/scripts/mikrotik" && req.method === "GET") {
    const gw = portalSettings.mikrotik?.gatewayIp || "192.168.88.1";
    const serverHost = req.headers.host || "192.168.88.2:3001";
    const hsName = portalSettings.mikrotik?.hotspotServer || "hotspot1";

    const scriptContent = `# ===================================================================
# SCRIPT OFICIAL ROUTEROS (MIKROTIK) - PORTAL CAUTIVO CON GAMIFICACIÓN
# Generado automáticamente por la plataforma de Fidelización y Gamificación
# ===================================================================

# 1. Crear Perfil de Hotspot con Walled Garden hacia la plataforma
/ip hotspot profile
set [ find default=yes ] html-directory=flash/hotspot http-proxy=0.0.0.0:0 \\
    login-by=http-chap,http-pap,mac-cookie name=${hsName} rate-limit="" use-radius=no

# 2. Configurar Walled Garden (Sitios accesibles antes del registro)
/ip hotspot walled-garden
add dst-host=${serverHost.split(":")[0]} comment="Plataforma de Fidelizacion Local"
add dst-host=*.googleapis.com comment="Fuentes tipograficas de marca"
add dst-host=*.gstatic.com comment="Estilos y assets"
add dst-host=*.whatsapp.com comment="Validacion de WhatsApp"
add dst-host=*.tripadvisor.com comment="Misiones de resena"

# 3. Redirección HTTP hacia la URL del Portal Cautivo
/ip hotspot user profile
set [ find default=yes ] idle-timeout=none keepalive-timeout=2m mac-cookie-timeout=3d \\
    name=default shared-users=1 status-autorefresh=1m

# 4. Mensaje de confirmacion en consola de MikroTik
:put ">> PORTAL CAUTIVO CONFIGURADO CON EXITO. Servidor: http://${serverHost} <<"
`;

    res.writeHead(200, {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": 'attachment; filename="mikrotik-hotspot-config.rsc"',
    });
    res.end(scriptContent);
    return true;
  }

  return false;
}
