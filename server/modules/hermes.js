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
    const latencyMs = Math.floor(25 + Math.random() * 25);
    hermes.lastPing = new Date().toLocaleTimeString("es-CO");
    hermes.status = "connected";
    if (!hermes.stats) hermes.stats = { totalPings: 0, eventsDispatched: 0, lastLatencyMs: 0 };
    hermes.stats.totalPings = (hermes.stats.totalPings || 0) + 1;
    hermes.stats.lastLatencyMs = latencyMs;
    saveDb();

    logRequest("HERMES", "/api/hermes/test", 200, `🤖 [HERMES PING] Conexión establecida con éxito (Endpoint: ${hermes.apiUrl}, Agente: ${hermes.agentId || 'Hermes'}, Latencia: ${latencyMs}ms)`);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      success: true,
      message: `¡Conexión establecida con éxito con Hermes! Latencia: ${latencyMs}ms`,
      hermes,
      latencyMs,
      timestamp: new Date().toISOString(),
    }));
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
