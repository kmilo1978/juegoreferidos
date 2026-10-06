import { db, DEFAULT_SETTINGS, saveDb, logRequest } from "../state.js";

export function handleHermes(req, res, pathname, url) {
  // 13.5 API: CONEXIÓN CON HERMES (GET & POST /api/hermes/config, POST /api/hermes/test, POST /api/integrations/hermes/webhook)
  if (pathname === "/api/hermes/config") {
    if (req.method === "GET") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, hermes: db.settings.hermes || DEFAULT_SETTINGS.hermes }));
      return true;
    }

    if (req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => (body += chunk));
      req.on("end", () => {
        try {
          const { hermes } = JSON.parse(body || "{}");
          if (hermes) {
            db.settings.hermes = {
              ...(db.settings.hermes || DEFAULT_SETTINGS.hermes),
              ...hermes,
              events: {
                ...((db.settings.hermes && db.settings.hermes.events) || DEFAULT_SETTINGS.hermes.events),
                ...(hermes.events || {}),
              },
            };
            saveDb();
            logRequest("POST", "/api/hermes/config", 200, `Configuración de conexión Hermes guardada (Modo: ${db.settings.hermes.mode}, URL: ${db.settings.hermes.apiUrl})`);
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: true, hermes: db.settings.hermes }));
          } else {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: "Datos de Hermes inválidos" }));
          }
        } catch (err) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });
      return true;
    }
  }

  if (pathname === "/api/hermes/test" && req.method === "POST") {
    const hermes = db.settings.hermes || DEFAULT_SETTINGS.hermes;
    if (!hermes.stats) hermes.stats = { totalPings: 0, eventsDispatched: 0, lastLatencyMs: 0 };

    // Validación previa: sin apiKey o sin apiUrl no se puede probar nada real.
    if (!hermes.apiKey || !hermes.apiUrl) {
      hermes.status = "disconnected";
      saveDb();
      logRequest("HERMES", "/api/hermes/test", 400, "🤖 [HERMES] Faltan credenciales (apiUrl/apiKey)");
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({
        success: false,
        status: "error",
        error: "Configura la URL y la API Key de Hermes antes de probar la conexión.",
      }));
      return true;
    }

    // Ping REAL con timeout de 6s. Medimos la latencia real; no la inventamos.
    const started = Date.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    fetch(hermes.apiUrl, {
      method: "GET",
      headers: { Authorization: `Bearer ${hermes.apiKey}` },
      signal: controller.signal,
    })
      .then((r) => {
        clearTimeout(timeout);
        const latencyMs = Date.now() - started;
        const ok = r.status < 500; // 2xx/3xx/4xx = el endpoint respondió
        hermes.lastPing = new Date().toLocaleTimeString("es-CO");
        hermes.status = ok ? "connected" : "error";
        hermes.stats.totalPings = (hermes.stats.totalPings || 0) + 1;
        hermes.stats.lastLatencyMs = latencyMs;
        saveDb();

        logRequest("HERMES", "/api/hermes/test", r.status, `🤖 [HERMES PING] HTTP ${r.status} (${hermes.apiUrl}, ${latencyMs}ms)`);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({
          success: ok,
          status: hermes.status,
          httpStatus: r.status,
          message: ok
            ? `Conexión con Hermes verificada (HTTP ${r.status}, ${latencyMs}ms)`
            : `Hermes respondió con error HTTP ${r.status}`,
          latencyMs,
          hermes,
          timestamp: new Date().toISOString(),
        }));
      })
      .catch((err) => {
        clearTimeout(timeout);
        const latencyMs = Date.now() - started;
        hermes.status = "error";
        hermes.lastPing = new Date().toLocaleTimeString("es-CO");
        saveDb();
        const isAbort = err.name === "AbortError";
        logRequest("HERMES", "/api/hermes/test", 504, `🤖 [HERMES] ${isAbort ? "timeout" : err.message}`);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({
          success: false,
          status: "error",
          error: isAbort
            ? `Hermes no respondió en 6s (timeout). Verifica la URL: ${hermes.apiUrl}`
            : `No se pudo conectar con Hermes: ${err.message}`,
          latencyMs,
          timestamp: new Date().toISOString(),
        }));
      });
    return true;
  }

  // Enviar un enlace de demo personalizado por WhatsApp a través de Hermes.
  // Si Hermes está configurado (apiUrl + apiKey), hace un POST real al conector
  // omnicanal con la acción SEND_WHATSAPP. Si NO está configurado, responde con
  // fallback=true y un enlace wa.me para que el frontend lo abra manualmente
  // (así la herramienta de ventas nunca queda inservible).
  if (pathname === "/api/hermes/send-demo" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      (async () => {
        try {
          const { demoUrl, brandName, tel, message } = JSON.parse(body || "{}");

          // Validación de entrada
          if (!demoUrl || !/^https?:\/\//i.test(String(demoUrl))) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: "demoUrl inválida o ausente" }));
            return;
          }
          const cleanTel = String(tel || "").replace(/[^0-9]/g, "");
          if (!cleanTel) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: "Falta el número de WhatsApp del destinatario" }));
            return;
          }

          const text =
            message ||
            `¡Hola${brandName ? ` ${brandName}` : ""}! 👋 Te comparto una demo personalizada de tu sistema de fidelización y juegos en mesa:\n\n${demoUrl}\n\nÁbrela desde tu celular para probarla. 🎁`;

          const hermes = db.settings.hermes || DEFAULT_SETTINGS.hermes;
          if (!hermes.stats) hermes.stats = { totalPings: 0, eventsDispatched: 0, lastLatencyMs: 0 };

          const waFallbackUrl = `https://wa.me/${cleanTel}?text=${encodeURIComponent(text)}`;

          // Sin credenciales => fallback manual (no es un error del usuario).
          if (!hermes.apiKey || !hermes.apiUrl) {
            logRequest("HERMES", "/api/hermes/send-demo", 200, `🤖 [HERMES] Sin credenciales: fallback wa.me para ${cleanTel}`);
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({
              success: true,
              delivered: false,
              fallback: true,
              waUrl: waFallbackUrl,
              message: "Hermes no está configurado. Abre el enlace de WhatsApp manualmente para enviar el demo.",
            }));
            return;
          }

          // Envío REAL vía Hermes (conector omnicanal) con timeout de 8s.
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 8000);
          try {
            const r = await fetch(hermes.apiUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${hermes.apiKey}`,
              },
              body: JSON.stringify({
                action: "SEND_WHATSAPP",
                agentId: hermes.agentId,
                to: cleanTel,
                text,
                metadata: { kind: "demo-link", brandName: brandName || null, demoUrl },
              }),
              signal: controller.signal,
            });
            clearTimeout(timeout);

            const ok = r.status < 400;
            if (ok) {
              hermes.stats.eventsDispatched = (hermes.stats.eventsDispatched || 0) + 1;
              hermes.status = "connected";
              hermes.lastPing = new Date().toLocaleTimeString("es-CO");
              saveDb();
            }
            logRequest("HERMES", "/api/hermes/send-demo", r.status, `🤖 [HERMES] Envío demo a ${cleanTel} → HTTP ${r.status}`);
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({
              success: ok,
              delivered: ok,
              fallback: !ok,
              waUrl: ok ? undefined : waFallbackUrl,
              httpStatus: r.status,
              message: ok
                ? `Demo enviado por WhatsApp a ${cleanTel} vía Hermes`
                : `Hermes respondió HTTP ${r.status}. Usa el enlace de WhatsApp manual.`,
            }));
          } catch (err) {
            clearTimeout(timeout);
            const isAbort = err.name === "AbortError";
            logRequest("HERMES", "/api/hermes/send-demo", 504, `🤖 [HERMES] ${isAbort ? "timeout" : err.message} al enviar demo`);
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({
              success: false,
              delivered: false,
              fallback: true,
              waUrl: waFallbackUrl,
              error: isAbort
                ? "Hermes no respondió en 8s (timeout). Usa el enlace de WhatsApp manual."
                : `No se pudo enviar vía Hermes: ${err.message}. Usa el enlace manual.`,
            }));
          }
        } catch (err) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
      })();
    });
    return true;
  }

  if (pathname === "/api/integrations/hermes/webhook" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const payload = JSON.parse(body || "{}");
        const hermes = db.settings.hermes || DEFAULT_SETTINGS.hermes;
        if (!hermes.stats) hermes.stats = { totalPings: 0, eventsDispatched: 0, lastLatencyMs: 0 };
        hermes.stats.eventsDispatched = (hermes.stats.eventsDispatched || 0) + 1;
        saveDb();

        logRequest("HERMES", "/api/integrations/hermes/webhook", 200, `🤖 [HERMES WEBHOOK] Acción recibida: ${payload.action || 'Evento'} desde Hermes`);

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({
          success: true,
          status: "received",
          processedAt: new Date().toISOString(),
          echoAction: payload.action || "PING",
        }));
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return true;
  }

  return false;
}
