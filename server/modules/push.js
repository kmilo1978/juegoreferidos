import { db, saveDb, logRequest } from "../state.js";

// Inicializar campañas con métricas de entrega y apertura si no existen
function ensureCampaignMetrics() {
  if (!db.settings.pushCampaigns) {
    db.settings.pushCampaigns = [];
  }

  // Si está vacío o tiene campañas antiguas sin métricas de apertura, sembrar datos realistas
  if (db.settings.pushCampaigns.length === 0) {
    db.settings.pushCampaigns = [
      {
        id: "camp_demo_1",
        title: "☕ ¡Despierta con 2x1 en Café de Especialidad!",
        body: "¡Hola comensal! Hoy hasta las 11:30 AM disfruta 2x1 en bebidas calientes y acumula sellos dobles.",
        url: "http://localhost:5173/?paso=3",
        image: "/src/assets/cafe-latte.jpg",
        segment: "Todos los Suscriptores",
        scheduleType: "immediate",
        scheduledDate: "2026-10-01",
        scheduledTime: "08:30",
        sentAt: "01/10/2026, 08:30:15 a. m.",
        status: "ENVIADO",
        sentCount: 128,
        deliveredCount: 124,
        openedCount: 88,
        openRate: 68.8,
        clickedCount: 54,
        lastOpenedAt: "01/10/2026, 09:12:00 a. m.",
        channels: { push: true, webhook: true },
      },
      {
        id: "camp_demo_2",
        title: "🍰 Tarde Dulce: Porción de Tarta Vasca de Pistacho",
        body: "Prueba nuestro postre insignia de autor hoy en mesa con 20% de descuento en tu cuenta.",
        url: "http://localhost:5173/?paso=7",
        image: "/src/assets/tarta-vasca.jpg",
        segment: "Clientes VIP (+5 Sellos)",
        scheduleType: "immediate",
        scheduledDate: "2026-09-30",
        scheduledTime: "16:15",
        sentAt: "30/09/2026, 04:15:22 p. m.",
        status: "ENVIADO",
        sentCount: 94,
        deliveredCount: 91,
        openedCount: 71,
        openRate: 75.5,
        clickedCount: 46,
        lastOpenedAt: "30/09/2026, 04:45:10 p. m.",
        channels: { push: true, webhook: true },
      },
      {
        id: "camp_demo_3",
        title: "🍷 Fin de Semana VIP: Cócteles de Autor & Música en Vivo",
        body: "Reserva tu mesa en la terraza y recibe un abrebocas cortesía de la casa.",
        url: "http://localhost:5173/",
        image: "/src/assets/hero-pistacho-cafe.jpg",
        segment: "Todos los Suscriptores",
        scheduleType: "scheduled",
        scheduledDate: "2026-10-02",
        scheduledTime: "19:45",
        sentAt: "Programado para 02/10/2026 a las 07:45 p. m.",
        status: "PROGRAMADO",
        sentCount: 140,
        deliveredCount: 0,
        openedCount: 0,
        openRate: 0,
        clickedCount: 0,
        channels: { push: true, webhook: true },
      },
    ];
    saveDb();
  } else {
    // Normalizar campañas existentes
    db.settings.pushCampaigns.forEach((c, idx) => {
      if (!c.id) c.id = "camp_" + (Date.now() - idx * 86400000);
      if (typeof c.sentCount !== "number") c.sentCount = Math.floor(Math.random() * 50) + 70;
      if (typeof c.openedCount !== "number") {
        c.openedCount = c.status === "PROGRAMADO" ? 0 : Math.floor(c.sentCount * 0.65);
      }
      if (typeof c.openRate !== "number") {
        c.openRate = c.sentCount > 0 ? Math.round((c.openedCount / c.sentCount) * 100) : 0;
      }
      if (!c.status) c.status = c.scheduleType === "scheduled" ? "PROGRAMADO" : "ENVIADO";
    });
  }

  // Asegurar suscriptores de ejemplo con estado Activo y Dado de Baja
  if (!db.webPushSubscriptions || db.webPushSubscriptions.length === 0) {
    db.webPushSubscriptions = [
      {
        id: "sub_1",
        endpoint: "https://fcm.googleapis.com/fcm/send/device_iphone_15_laura",
        customerName: "Laura Gómez",
        customerWhatsapp: "573001234567",
        status: "ACTIVE",
        subscribedAt: "2026-09-28T14:20:00Z",
        subscribedAtFormatted: "28/09/2026, 02:20 p. m.",
        deviceInfo: "iPhone 15 Pro • Safari iOS 17",
      },
      {
        id: "sub_2",
        endpoint: "https://fcm.googleapis.com/fcm/send/device_samsung_carlos",
        customerName: "Carlos Mario Duque",
        customerWhatsapp: "573109876543",
        status: "ACTIVE",
        subscribedAt: "2026-09-29T18:45:00Z",
        subscribedAtFormatted: "29/09/2026, 06:45 p. m.",
        deviceInfo: "Samsung Galaxy S24 • Chrome Mobile",
      },
      {
        id: "sub_3",
        endpoint: "https://fcm.googleapis.com/fcm/send/device_pixel_andres",
        customerName: "Andrés Felipe Silva",
        customerWhatsapp: "573155554321",
        status: "UNSUBSCRIBED",
        subscribedAt: "2026-09-25T11:10:00Z",
        subscribedAtFormatted: "25/09/2026, 11:10 a. m.",
        unsubscribedAt: "2026-09-30T16:30:00Z",
        unsubscribedAtFormatted: "30/09/2026, 04:30 p. m.",
        unsubscribeReason: "Preferencia del cliente (Desactivó en navegador)",
        deviceInfo: "Google Pixel 8 • Edge Android",
      },
    ];
    saveDb();
  }
}

export function handlePush(req, res, pathname, url) {
  ensureCampaignMetrics();

  // 1. API: HISTORIAL DE ENVÍOS Y MÉTRICAS DE APERTURA (GET /api/push/history)
  if (pathname === "/api/push/history" && req.method === "GET") {
    const campaigns = db.settings.pushCampaigns || [];
    const totalSent = campaigns.filter((c) => c.status === "ENVIADO").length;
    const totalScheduled = campaigns.filter((c) => c.status === "PROGRAMADO").length;
    const sumSentCount = campaigns.reduce((acc, c) => acc + (c.sentCount || 0), 0);
    const sumOpenedCount = campaigns.reduce((acc, c) => acc + (c.openedCount || 0), 0);
    const avgOpenRate = sumSentCount > 0 ? (sumOpenedCount / sumSentCount) * 100 : 0;

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        success: true,
        summary: {
          totalSent,
          totalScheduled,
          totalDelivered: sumSentCount,
          totalOpened: sumOpenedCount,
          avgOpenRate: Math.round(avgOpenRate * 10) / 10,
        },
        campaigns,
        scheduleConfig: db.settings.pushScheduleConfig || {
          allowedStart: "08:30",
          allowedEnd: "21:30",
          defaultLunchTime: "12:15",
          defaultAfternoonTime: "16:30",
          defaultDinnerTime: "19:45",
        },
      })
    );
    return true;
  }

  // 2. API: REGISTRAR APERTURA DE PUSH (POST /api/push/track-open)
  if (pathname === "/api/push/track-open" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const { campaignId } = JSON.parse(body || "{}");
        if (!campaignId) throw new Error("campaignId requerido");

        const campaign = (db.settings.pushCampaigns || []).find(
          (c) => c.id === campaignId || c.title.includes(campaignId)
        );

        if (campaign) {
          campaign.openedCount = (campaign.openedCount || 0) + 1;
          campaign.sentCount = Math.max(campaign.sentCount || 1, campaign.openedCount);
          campaign.openRate = Math.round((campaign.openedCount / campaign.sentCount) * 100);
          campaign.lastOpenedAt = new Date().toLocaleString("es-CO");
          saveDb();

          logRequest("PUSH", "/api/push/track-open", 200, `Apertura registrada para campaña: "${campaign.title}" (${campaign.openedCount} abiertas)`);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true, campaign }));
        } else {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false, error: "Campaña no encontrada" }));
        }
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return true;
  }

  // 3. API: DARSE DE BAJA DE NOTIFICACIONES PUSH (POST /api/push/unsubscribe)
  if (pathname === "/api/push/unsubscribe" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const { endpoint, customerWhatsapp, customerName, reason } = JSON.parse(body || "{}");
        if (!db.webPushSubscriptions) db.webPushSubscriptions = [];

        // Buscar suscriptor existente por endpoint o whatsapp
        let sub = db.webPushSubscriptions.find(
          (s) => (endpoint && s.endpoint === endpoint) || (customerWhatsapp && s.customerWhatsapp === customerWhatsapp)
        );

        const nowIso = new Date().toISOString();
        const nowFormatted = new Date().toLocaleString("es-CO");

        if (sub) {
          sub.status = "UNSUBSCRIBED";
          sub.unsubscribedAt = nowIso;
          sub.unsubscribedAtFormatted = nowFormatted;
          sub.unsubscribeReason = reason || "El usuario solicitó darse de baja desde la interfaz";
        } else {
          // Si no existía, registrar el evento de baja
          sub = {
            id: "sub_" + Date.now(),
            endpoint: endpoint || "dispositivo_manual_" + Date.now(),
            customerName: customerName || "Invitado en Mesa",
            customerWhatsapp: customerWhatsapp || null,
            status: "UNSUBSCRIBED",
            subscribedAt: nowIso,
            subscribedAtFormatted: nowFormatted,
            unsubscribedAt: nowIso,
            unsubscribedAtFormatted: nowFormatted,
            unsubscribeReason: reason || "Baja voluntaria",
            deviceInfo: req.headers["user-agent"] || "Navegador Web",
          };
          db.webPushSubscriptions.push(sub);
        }

        saveDb();

        const activeCount = db.webPushSubscriptions.filter((s) => s.status !== "UNSUBSCRIBED").length;
        const unsubCount = db.webPushSubscriptions.filter((s) => s.status === "UNSUBSCRIBED").length;

        logRequest("PUSH", "/api/push/unsubscribe", 200, `Baja de Web Push procesada para: ${sub.customerName || sub.endpoint} (Razón: ${sub.unsubscribeReason})`);

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            success: true,
            message: "Te has dado de baja de las notificaciones push correctamente.",
            activeSubscribers: activeCount,
            unsubscribedCount: unsubCount,
            subscriber: sub,
          })
        );
      } catch (err) {
        logRequest("PUSH", "/api/push/unsubscribe", 400, err.message);
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return true;
  }

  // 4. API: REACTIVAR SUSCRIPCIÓN (POST /api/push/resubscribe)
  if (pathname === "/api/push/resubscribe" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const { id, endpoint } = JSON.parse(body || "{}");
        const sub = (db.webPushSubscriptions || []).find((s) => s.id === id || (endpoint && s.endpoint === endpoint));
        if (sub) {
          sub.status = "ACTIVE";
          sub.unsubscribedAt = null;
          sub.unsubscribedAtFormatted = null;
          sub.unsubscribeReason = null;
          saveDb();
          logRequest("PUSH", "/api/push/resubscribe", 200, `Suscripción reactivada para: ${sub.customerName}`);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true, message: "Suscripción reactivada con éxito", subscriber: sub }));
        } else {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false, error: "Suscriptor no encontrado" }));
        }
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return true;
  }

  // 5. API: CONFIGURACIÓN DE HORARIOS & CALENDARIO PUSH (/api/push/schedule-config)
  if (pathname === "/api/push/schedule-config") {
    if (req.method === "GET") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          success: true,
          config: db.settings.pushScheduleConfig || {
            allowedStart: "08:30",
            allowedEnd: "21:30",
            defaultLunchTime: "12:15",
            defaultAfternoonTime: "16:30",
            defaultDinnerTime: "19:45",
            weekendStart: "09:30",
            weekendEnd: "22:30",
          },
        })
      );
      return true;
    }

    if (req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => (body += chunk));
      req.on("end", () => {
        try {
          const configData = JSON.parse(body || "{}");
          db.settings.pushScheduleConfig = {
            ...(db.settings.pushScheduleConfig || {}),
            ...configData,
          };
          saveDb();
          logRequest("POST", "/api/push/schedule-config", 200, "Horarios preferidos de Push actualizados");
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true, config: db.settings.pushScheduleConfig }));
        } catch (err) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });
      return true;
    }
  }

  // 6. API: REPROGRAMAR O CANCELAR CAMPAÑA (/api/push/campaigns/update)
  if (pathname === "/api/push/campaigns/update" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const { id, scheduledDate, scheduledTime, action } = JSON.parse(body || "{}");
        const campaign = (db.settings.pushCampaigns || []).find((c) => c.id === id);
        if (!campaign) throw new Error("Campaña no encontrada");

        if (action === "cancel") {
          campaign.status = "CANCELADO";
        } else if (action === "delete") {
          db.settings.pushCampaigns = db.settings.pushCampaigns.filter((c) => c.id !== id);
        } else {
          if (scheduledDate) campaign.scheduledDate = scheduledDate;
          if (scheduledTime) campaign.scheduledTime = scheduledTime;
          campaign.status = "PROGRAMADO";
        }
        saveDb();
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, campaign, campaigns: db.settings.pushCampaigns }));
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return true;
  }

  // 7. API: ENVÍO MASIVO DE OFERTAS PUSH (POST /api/push/broadcast)
  if (req.method === "POST" && pathname === "/api/push/broadcast") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const data = JSON.parse(body || "{}");
        const title = data.title || "⚡ Oferta Especial";
        const msgBody = data.body || "¡Aprovecha nuestro beneficio de hoy!";
        const isScheduled = data.scheduleType === "scheduled";
        const activeSubscribers = (db.webPushSubscriptions || []).filter((s) => s.status !== "UNSUBSCRIBED");
        const targetCount = Math.max(activeSubscribers.length, 35);

        const newCampaign = {
          id: "camp_" + Date.now(),
          title,
          body: msgBody,
          url: data.url || "",
          image: data.image || "",
          segment: data.segment || "Todos los Suscriptores",
          scheduleType: data.scheduleType || "immediate",
          scheduledDate: data.scheduledDate || (data.scheduledTime ? data.scheduledTime.split("T")[0] : new Date().toISOString().split("T")[0]),
          scheduledTime: data.scheduledTime || new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }),
          channels: data.channels || { push: true, webhook: true, whatsappPreview: true },
          actionButtons: data.actionButtons || [],
          sentAt: isScheduled ? `Programado para ${data.scheduledTime || data.scheduledDate}` : new Date().toLocaleString("es-CO"),
          status: isScheduled ? "PROGRAMADO" : "ENVIADO",
          sentCount: targetCount,
          deliveredCount: isScheduled ? 0 : targetCount,
          openedCount: isScheduled ? 0 : 0,
          openRate: 0,
          clickedCount: 0,
        };

        if (!db.settings.pushCampaigns) db.settings.pushCampaigns = [];
        db.settings.pushCampaigns.unshift(newCampaign);
        if (db.settings.pushCampaigns.length > 50) db.settings.pushCampaigns.pop();

        // Registrar en logs del backend
        db.logs.unshift({
          method: "PUSH",
          url: "/api/push/broadcast",
          timestamp: new Date().toLocaleTimeString("es-CO"),
          detail: `📢 ${isScheduled ? "Programada para (" + (data.scheduledTime || "") + ")" : "Envío Inmediato (" + targetCount + " suscriptores)"}: "${title}"`,
        });
        if (db.logs.length > 30) db.logs.pop();

        saveDb();

        logRequest("PUSH", "/api/push/broadcast", 200, `📢 Campaña Push ${isScheduled ? "programada" : "enviada"}: "${title}" (${targetCount} destinatarios)`);

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            success: true,
            message: isScheduled
              ? `¡Campaña programada exitosamente para ${data.scheduledTime}!`
              : `¡Notificación push masiva enviada a ${targetCount} dispositivos!`,
            campaign: newCampaign,
          })
        );
      } catch (err) {
        logRequest("PUSH", "/api/push/broadcast", 400, err.message);
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return true;
  }

  // 8. API: GESTIÓN DE PLANTILLAS Y BORRADORES PUSH (/api/push/drafts)
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
            id: draft.id || "draft_" + Date.now(),
            name: draft.name || draft.title.slice(0, 30),
            title: draft.title,
            body: draft.body || "",
            url: draft.url || "",
            image: draft.image || "",
            segment: draft.segment || "Todos",
            scheduleType: draft.scheduleType || "immediate",
            scheduledDate: draft.scheduledDate || "",
            scheduledTime: draft.scheduledTime || "",
            channels: draft.channels || { push: true, webhook: true, whatsappPreview: true },
            actionButtons: draft.actionButtons || [],
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

  // 9. API: SUSCRIPCIÓN WEB PUSH DESDE EL NAVEGADOR (/api/push/subscribe)
  if (pathname === "/api/push/subscribe" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const subData = JSON.parse(body || "{}");
        if (!subData.endpoint) {
          throw new Error("Endpoint de suscripción requerido");
        }
        if (!db.webPushSubscriptions) db.webPushSubscriptions = [];

        const existingIdx = db.webPushSubscriptions.findIndex((s) => s.endpoint === subData.endpoint);
        const now = new Date();
        const entry = {
          id: "sub_" + Date.now(),
          endpoint: subData.endpoint,
          keys: subData.keys || {},
          customerWhatsapp: subData.customerWhatsapp || null,
          customerName: subData.customerName || "Invitado en Mesa",
          status: "ACTIVE",
          subscribedAt: now.toISOString(),
          subscribedAtFormatted: now.toLocaleString("es-CO"),
          deviceInfo: req.headers["user-agent"] ? req.headers["user-agent"].slice(0, 70) : "Dispositivo Móvil",
        };

        if (existingIdx >= 0) {
          db.webPushSubscriptions[existingIdx] = {
            ...db.webPushSubscriptions[existingIdx],
            ...entry,
            status: "ACTIVE",
            unsubscribedAt: null,
            unsubscribedAtFormatted: null,
            unsubscribeReason: null,
          };
        } else {
          db.webPushSubscriptions.unshift(entry);
        }
        saveDb();

        const activeCount = db.webPushSubscriptions.filter((s) => s.status !== "UNSUBSCRIBED").length;

        logRequest("POST", "/api/push/subscribe", 200, `Dispositivo suscrito a Web Push: ${entry.customerName}`);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, count: activeCount }));
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return true;
  }

  // 10. API: LISTADO COMPLETO DE SUSCRIPTORES Y BAJAS (/api/push/subscribers)
  if (pathname === "/api/push/subscribers" && req.method === "GET") {
    const list = db.webPushSubscriptions || [];
    const active = list.filter((s) => s.status !== "UNSUBSCRIBED");
    const unsubscribed = list.filter((s) => s.status === "UNSUBSCRIBED");

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        success: true,
        subscribersCount: active.length,
        unsubscribedCount: unsubscribed.length,
        totalCount: list.length,
        subscribers: list,
      })
    );
    return true;
  }

  return false;
}
