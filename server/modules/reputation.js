import { db, DEFAULT_SETTINGS, saveDb, logRequest } from "../state.js";

export function handleReputation(req, res, pathname, url) {
  // 14. API: EMBUDO INTELIGENTE DE REPUTACIÓN (GET /api/reputation, POST /api/reputation/feedback, POST /api/reputation/config)
  if (pathname === "/api/reputation") {
    if (req.method === "GET") {
      const repConfig = db.settings.reputation || DEFAULT_SETTINGS.reputation;
      const feedbacks = db.reputationFeedbacks || [];
      const total = feedbacks.length;
      const googleCount = feedbacks.filter((f) => f.actionTaken === "google" || f.rating >= (repConfig.minRatingForGoogle || 4)).length;
      const whatsappCount = feedbacks.filter((f) => f.actionTaken === "whatsapp" || f.rating < (repConfig.minRatingForGoogle || 4)).length;
      const sumRatings = feedbacks.reduce((acc, cur) => acc + (cur.rating || 5), 0);
      const avg = total > 0 ? (sumRatings / total).toFixed(1) : "5.0";
      const protectionRate = total > 0 ? Math.round((googleCount / total) * 100) : 100;

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          success: true,
          config: repConfig,
          feedbacks: feedbacks,
          stats: {
            total,
            averageRating: avg,
            googleCount,
            whatsappCount,
            protectionRate,
          },
        })
      );
      return true;
    }
  }

  if (pathname === "/api/reputation/feedback" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const { customerName, customerWhatsapp, tableNumber, rating, comment, actionTaken } = JSON.parse(body || "{}");
        const cleanRating = parseInt(rating, 10) || 5;
        const repConfig = db.settings.reputation || DEFAULT_SETTINGS.reputation;
        const finalAction = actionTaken || (cleanRating >= (repConfig.minRatingForGoogle || 4) ? "google" : "whatsapp");

        const newFeedback = {
          id: `REV-${Date.now().toString(36).toUpperCase()}`,
          customerName: customerName || "Comensal",
          customerWhatsapp: (customerWhatsapp || "").replace(/\D/g, "") || "",
          tableNumber: tableNumber || "Mesa 1",
          rating: cleanRating,
          comment: (comment || "").trim(),
          actionTaken: finalAction,
          timestamp: new Date().toISOString(),
          timeFormatted: new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }),
          dateFormatted: new Date().toLocaleDateString("es-CO", { day: "2-digit", month: "short" }),
        };

        db.reputationFeedbacks = db.reputationFeedbacks || [];
        db.reputationFeedbacks.unshift(newFeedback);
        saveDb();

        logRequest("POST", "/api/reputation/feedback", 200, `Calificación recibida: ${cleanRating}★ (${finalAction}) por ${newFeedback.customerName}`);

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, feedback: newFeedback }));
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return true;
  }

  if (pathname === "/api/reputation/config" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const data = JSON.parse(body || "{}");
        db.settings.reputation = {
          ...DEFAULT_SETTINGS.reputation,
          ...(db.settings.reputation || {}),
          ...data,
        };
        saveDb();

        logRequest("POST", "/api/reputation/config", 200, "Configuración del Embudo de Reputación actualizada");
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, config: db.settings.reputation }));
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return true;
  }

  return false;
}
