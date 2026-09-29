import { db, DEFAULT_TABLES, DEFAULT_SETTINGS, saveDb, logRequest } from "../state.js";

export function handleCaptivePortal(req, res, pathname, url) {
  // 1. ESTADO Y CONFIGURACI�N DEL PORTAL CAUTIVO / KIOSKO (/api/portal/status)
  if (pathname === "/api/portal/status" && req.method === "GET") {
    const brand = db.settings?.brand || DEFAULT_SETTINGS.brand;
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      success: true,
      portalName: brand.name,
      wifiSSID: "Bliss Soul - Clientes VIP",
      logoUrl: brand.logoUrl,
      welcomeMessage: brand.tagline,
      tablesAvailable: (db.tables || DEFAULT_TABLES).filter(t => t.status === "DISPONIBLE").length,
      pushEnabled: true,
    }));
    return true;
  }

  // 2. CONEXI�N Y REGISTRO DESDE EL PORTAL / KIOSKO (/api/portal/connect)
  if (pathname === "/api/portal/connect" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const data = JSON.parse(body || "{}");
        const cleanWhatsapp = (data.whatsapp || "").replace(/\D/g, "");
        if (!cleanWhatsapp) {
          throw new Error("N�mero de WhatsApp requerido para acceso al WiFi");
        }

        const existingCustomer = db.customers[cleanWhatsapp];

        if (!existingCustomer) {
          db.customers[cleanWhatsapp] = {
            fullName: data.fullName || "Invitado WiFi",
            whatsapp: cleanWhatsapp,
            email: data.email || "",
            stamps: 1,
            visits: 1,
            origin: "PORTAL_CAUTIVO_WIFI",
            connectedAt: new Date().toISOString(),
          };
        } else {
          db.customers[cleanWhatsapp].visits = (db.customers[cleanWhatsapp].visits || 1) + 1;
          db.customers[cleanWhatsapp].lastVisit = new Date().toISOString();
        }

        saveDb();
        logRequest("POST", "/api/portal/connect", 200, `Acceso WiFi concedido a +${cleanWhatsapp} (${data.fullName || "Invitado"})`);

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({
          success: true,
          accessGranted: true,
          sessionMinutes: 120,
          customer: db.customers[cleanWhatsapp],
          stamps: db.customers[cleanWhatsapp].stamps,
          welcomeMessage: "�Bienvenido a Bliss Soul! Disfruta de tu conexi�n de alta velocidad.",
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
