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
