import { db, saveDb, logRequest } from "../state.js";

export function handlePush(req, res, pathname, url) {
  // 8. API: ENVÍO MASIVO DE OFERTAS PUSH (POST /api/push/broadcast)
  if (req.method === "POST" && pathname === "/api/push/broadcast") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const data = JSON.parse(body || "{}");
        const title = data.title || "⚡ Oferta Especial";
        const msgBody = data.body || "¡Aprovecha nuestro beneficio de hoy!";
        const isScheduled = data.scheduleType === "scheduled";

        logRequest("PUSH", "/api/push/broadcast", 200, `📢 Campaña Push ${isScheduled ? "programada" : "enviada"}: "${title}" (${data.segment || "Todos"})`);

        // Registrar en logs del backend
        db.logs.unshift({
          method: "PUSH",
          url: "/api/push/broadcast",
          timestamp: new Date().toLocaleTimeString("es-CO"),
          detail: `📢 ${isScheduled ? "Programada (" + (data.scheduledTime || "") + ")" : "Envío Inmediato"}: "${title}" (Canales: Push=${data.channels?.push !== false}, Webhook=${data.channels?.webhook !== false})`,
        });
        if (db.logs.length > 30) db.logs.pop();

        // Guardar última campaña en settings
        if (!db.settings.pushCampaigns) db.settings.pushCampaigns = [];
        db.settings.pushCampaigns.unshift({
          title,
          body: msgBody,
          url: data.url || "",
          segment: data.segment || "Subscribed Users",
          scheduleType: data.scheduleType || "immediate",
          scheduledTime: data.scheduledTime || "",
          channels: data.channels || { push: true, webhook: true, whatsappPreview: true },
          sentAt: new Date().toLocaleString("es-CO"),
        });
        if (db.settings.pushCampaigns.length > 20) db.settings.pushCampaigns.pop();
        saveDb();

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({
          success: true,
          message: isScheduled
            ? `¡Campaña programada exitosamente para ${data.scheduledTime}!`
            : "Notificación push masiva procesada y enviada a los suscriptores.",
          campaign: { title, body: msgBody, sentAt: new Date().toISOString() }
        }));
      } catch (err) {
        logRequest("PUSH", "/api/push/broadcast", 400, err.message);
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return true;
  }

  // 9. API: GESTIÓN DE PLANTILLAS Y BORRADORES PUSH (/api/push/drafts)
  if (pathname === "/api/push/drafts") {
    if (req.method === "GET") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, drafts: db.settings.savedPushDrafts || [] }));
      return true;
    }

    if (req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => (body += chunk));
      req.on("end", () => {
        try {
          const draft = JSON.parse(body || "{}");
          if (!draft.title) throw new Error("Título de oferta requerido");
          if (!db.settings.savedPushDrafts) db.settings.savedPushDrafts = [];

          const existingIdx = db.settings.savedPushDrafts.findIndex((d) => d.id === draft.id);
          const itemToSave = {
            id: draft.id || ("draft_" + Date.now()),
            name: draft.name || draft.title.slice(0, 30),
            title: draft.title,
            body: draft.body || "",
            url: draft.url || "",
            segment: draft.segment || "Subscribed Users",
            scheduleType: draft.scheduleType || "immediate",
            scheduledTime: draft.scheduledTime || "",
            channels: draft.channels || { push: true, webhook: true, whatsappPreview: true },
            createdAt: new Date().toLocaleDateString("es-CO"),
          };

          if (existingIdx >= 0) {
            db.settings.savedPushDrafts[existingIdx] = itemToSave;
          } else {
            db.settings.savedPushDrafts.unshift(itemToSave);
          }
          saveDb();

          logRequest("POST", "/api/push/drafts", 200, `💾 Plantilla push guardada: "${itemToSave.name}"`);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true, draft: itemToSave, drafts: db.settings.savedPushDrafts }));
        } catch (err) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });
      return true;
    }

    if (req.method === "DELETE") {
      let body = "";
      req.on("data", (chunk) => (body += chunk));
      req.on("end", () => {
        try {
          const { id } = JSON.parse(body || "{}");
          if (!id) throw new Error("ID requerido");
          if (!db.settings.savedPushDrafts) db.settings.savedPushDrafts = [];
          db.settings.savedPushDrafts = db.settings.savedPushDrafts.filter((d) => d.id !== id);
          saveDb();

          logRequest("DELETE", "/api/push/drafts", 200, `🗑️ Plantilla push eliminada (ID: ${id})`);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true, drafts: db.settings.savedPushDrafts }));
        } catch (err) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });
      return true;
    }
  }


  // 10. API: SUSCRIPCI�N WEB PUSH DESDE EL NAVEGADOR (/api/push/subscribe)
  if (pathname === "/api/push/subscribe" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const subData = JSON.parse(body || "{}");
        if (!subData.endpoint) {
          throw new Error("Endpoint de suscripci�n requerido");
        }
        if (!db.webPushSubscriptions) db.webPushSubscriptions = [];
        
        const existingIdx = db.webPushSubscriptions.findIndex(s => s.endpoint === subData.endpoint);
        const entry = {
          id: "sub_" + Date.now(),
          endpoint: subData.endpoint,
          keys: subData.keys || {},
          customerWhatsapp: subData.customerWhatsapp || null,
          customerName: subData.customerName || "Invitado WiFi",
          subscribedAt: new Date().toISOString(),
          userAgent: req.headers["user-agent"] || "",
        };

        if (existingIdx >= 0) {
          db.webPushSubscriptions[existingIdx] = { ...db.webPushSubscriptions[existingIdx], ...entry };
        } else {
          db.webPushSubscriptions.push(entry);
        }
        saveDb();

        logRequest("POST", "/api/push/subscribe", 200, `Dispositivo suscrito a Web Push: ${entry.customerName}`);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, count: db.webPushSubscriptions.length }));
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return true;
  }

  // 11. API: LISTADO DE SUSCRIPTORES WEB PUSH (/api/push/subscribers)
  if (pathname === "/api/push/subscribers" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      success: true,
      subscribersCount: (db.webPushSubscriptions || []).length,
      subscribers: db.webPushSubscriptions || [],
    }));
    return true;
  }

  return false;
}
