import { db, DEFAULT_TABLES, DEFAULT_SETTINGS, saveDb, logRequest } from "../state.js";

export function handleConfig(req, res, pathname, url) {
  // 5. API: MÉTRICAS Y DATOS GLOBALES (GET /api/metrics)
  if (req.method === "GET" && pathname === "/api/metrics") {
    const totalPrizes = db.prizes.length;
    const redeemedPrizes = db.prizes.filter((p) => p.status === "UTILIZADO").length;
    const totalCustomers = Object.keys(db.customers).length;
    const conversionRate = totalPrizes > 0 ? ((redeemedPrizes / totalPrizes) * 100).toFixed(1) : "0";

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        totalPrizes,
        redeemedPrizes,
        totalCustomers,
        conversionRate: `${conversionRate}%`,
        prizes: db.prizes,
        logs: db.logs,
      })
    );
    return true;
  }

  // 6. API: OBTENER Y ACTUALIZAR CONFIGURACIÓN COMPLETA (GET & POST /api/config)
  if (req.method === "GET" && pathname === "/api/config") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: true, settings: db.settings }));
      return true;
  }

  if (req.method === "POST" && pathname === "/api/config") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const data = JSON.parse(body || "{}");

        // Merge de objetos anidados
        if (data.brand) db.settings.brand = { ...db.settings.brand, ...data.brand };
        if (data.channels) db.settings.channels = { ...db.settings.channels, ...data.channels };
        if (data.prizes && Array.isArray(data.prizes)) db.settings.prizes = data.prizes;
        if (data.stamps) db.settings.stamps = { ...db.settings.stamps, ...data.stamps };
        if (data.gameConfig) db.settings.gameConfig = { ...(db.settings.gameConfig || DEFAULT_SETTINGS.gameConfig), ...data.gameConfig };
        if (data.secondChance) db.settings.secondChance = { ...(db.settings.secondChance || DEFAULT_SETTINGS.secondChance), ...data.secondChance };
        if (data.databases) db.settings.databases = { ...db.settings.databases, ...data.databases };
        if (data.composio) {
          db.settings.composio = {
            ...db.settings.composio,
            ...data.composio,
            integrations: {
              ...db.settings.composio.integrations,
              ...(data.composio.integrations || {}),
            },
          };
        }
        if (data.security) {
          db.settings.security = {
            ...db.settings.security,
            ...data.security,
            roles: {
              admin: {
                ...db.settings.security.roles.admin,
                ...((data.security.roles && data.security.roles.admin) || {}),
              },
              cashier: {
                ...db.settings.security.roles.cashier,
                ...((data.security.roles && data.security.roles.cashier) || {}),
              },
            },
          };
        }

        // Compatibilidad con payloads planos
        if (data.instagramHandle !== undefined) db.settings.channels.instagramHandle = data.instagramHandle;
        if (data.enableWhatsAppPhoto !== undefined) db.settings.channels.enableWhatsAppPhoto = data.enableWhatsAppPhoto;
        if (data.whatsappNumber !== undefined) db.settings.channels.whatsappNumber = data.whatsappNumber;
        if (data.whatsappPhotoMessage !== undefined) db.settings.channels.whatsappPhotoMessage = data.whatsappPhotoMessage;
        if (data.brandName !== undefined) db.settings.brand.name = data.brandName;
        if (data.primaryColor !== undefined) db.settings.brand.primaryColor = data.primaryColor;
        if (data.visitIcon !== undefined) db.settings.stamps.visitIcon = data.visitIcon;
        if (data.stampRewards !== undefined) db.settings.stamps.milestones = data.stampRewards;

        saveDb();
        logRequest("POST", "/api/config", 200, `Configuración centralizada guardada en backend`);

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, settings: db.settings }));
      } catch (err) {
        logRequest("POST", "/api/config", 400, err.message);
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return true;
  }

  return false;
}
