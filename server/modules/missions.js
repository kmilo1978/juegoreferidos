import { db, DEFAULT_SETTINGS, saveDb, logRequest } from "../state.js";

export function handleMissions(req, res, pathname, url) {
  // 13. API: CENTRO DE MISIONES (GET /api/missions, POST /api/missions/config, POST /api/missions/submit, POST /api/missions/review)
  if (pathname === "/api/missions") {
    if (req.method === "GET") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          success: true,
          missions: db.settings.missions || DEFAULT_SETTINGS.missions,
          submissions: db.missionSubmissions || [],
        })
      );
      return true;
    }
  }

  if (pathname === "/api/missions/config" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const { missions } = JSON.parse(body || "{}");
        if (Array.isArray(missions)) {
          db.settings.missions = missions;
          saveDb();
          logRequest("POST", "/api/missions/config", 200, `Catálogo de misiones actualizado (${missions.length} misiones configuradas)`);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true, missions: db.settings.missions }));
        } else {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false, error: "Formato de misiones no válido" }));
        }
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return true;
  }

  if (pathname === "/api/missions/submit" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const { missionId, customerName, customerWhatsapp, evidenceUrl } = JSON.parse(body || "{}");
        if (!evidenceUrl || !evidenceUrl.trim()) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false, error: "Debes ingresar el enlace de tu publicación o video" }));
      return true;
        }

        const missions = db.settings.missions || DEFAULT_SETTINGS.missions;
        const targetMission = missions.find((m) => m.id === missionId) || missions[0];

        const cleanPhone = (customerWhatsapp || "").replace(/\D/g, "") || "573000000000";

        const newSubmission = {
          id: `SUB-${Date.now().toString(36).toUpperCase()}`,
          missionId: targetMission.id,
          missionTitle: targetMission.title,
          missionIcon: targetMission.icon || "🎯",
          category: targetMission.category,
          customerName: customerName || "Comensal Gourmet",
          customerWhatsapp: cleanPhone,
          evidenceUrl: evidenceUrl.trim(),
          rewardStamps: targetMission.rewardStamps || 1,
          rewardText: targetMission.rewardText || "+1 Sello",
          submittedAt: new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }),
          dateFormatted: new Date().toLocaleDateString("es-CO", { day: "2-digit", month: "short" }),
          status: "PENDIENTE", // "PENDIENTE" | "APROBADO" | "RECHAZADO"
        };

        db.missionSubmissions = db.missionSubmissions || [];
        db.missionSubmissions.unshift(newSubmission);
        saveDb();

        logRequest("POST", "/api/missions/submit", 200, `Misión enviada para revisión: ${targetMission.title} por ${newSubmission.customerName}`);

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, submission: newSubmission }));
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return true;
  }

  if (pathname === "/api/missions/review" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const { submissionId, action } = JSON.parse(body || "{}");
        db.missionSubmissions = db.missionSubmissions || [];
        const sub = db.missionSubmissions.find((s) => s.id === submissionId);
        if (!sub) {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false, error: "Evidencia de misión no encontrada" }));
      return true;
        }

        if (action === "approve") {
          sub.status = "APROBADO";
          sub.reviewedAt = new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });

          // Sumar sellos al cliente en la base de datos de fidelización
          const customerPhone = sub.customerWhatsapp;
          if (customerPhone) {
            if (!db.customers[customerPhone]) {
              db.customers[customerPhone] = {
                fullName: sub.customerName,
                whatsapp: customerPhone,
                stamps: 0,
                lastVisit: new Date().toISOString(),
              };
            }
            const prevStamps = db.customers[customerPhone].stamps || 0;
            db.customers[customerPhone].stamps = Math.min(15, prevStamps + sub.rewardStamps);
            logRequest("POST", "/api/missions/review", 200, `Misión APROBADA: ${sub.missionTitle} (+${sub.rewardStamps} sellos a ${sub.customerName})`);
          }
        } else {
          sub.status = "RECHAZADO";
          sub.reviewedAt = new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
          logRequest("POST", "/api/missions/review", 200, `Misión RECHAZADA: ${sub.missionTitle} de ${sub.customerName}`);
        }

        saveDb();

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, submission: sub, customers: db.customers }));
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return true;
  }

  return false;
}
