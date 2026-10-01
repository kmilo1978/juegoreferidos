/**
 * MÓDULO NFC & ASISTENTE DE MESAS CONTACTLESS
 * Gestiona enlaces NFC por mesa, registro de visitas (NFC vs QR) y configuración de dominio.
 */

import { db, saveDb, logRequest } from "../state.js";

// Inicializar estructura NFC en db si no existe
if (!db.nfc) {
  db.nfc = {
    baseDomain: "http://localhost:5173",
    stats: {
      nfcScans: 28,
      qrScans: 64,
      lastScans: [
        { id: "scan_1", mesa: 3, origen: "nfc", timestamp: "Hace 12 min", device: "iPhone (iOS 18)" },
        { id: "scan_2", mesa: 1, origen: "qr", timestamp: "Hace 25 min", device: "Samsung Galaxy (Android 14)" },
        { id: "scan_3", mesa: 5, origen: "nfc", timestamp: "Hace 40 min", device: "Xiaomi (Android 13)" },
        { id: "scan_4", mesa: 2, origen: "nfc", timestamp: "Hace 1 hora", device: "iPhone 15 Pro" },
        { id: "scan_5", mesa: 4, origen: "qr", timestamp: "Hace 2 horas", device: "Pixel 8 (Android 14)" },
      ],
    },
  };
}

export function handleNfc(req, res, pathname, url) {
  // 1. OBTENER CONFIGURACIÓN Y ESTADÍSTICAS (GET /api/nfc/stats)
  if (req.method === "GET" && pathname === "/api/nfc/stats") {
    const baseDomain = db.nfc?.baseDomain || "http://localhost:5173";
    const tables = (db.tables || []).map((t) => {
      const mesaNum = t.number || parseInt(t.id.replace("mesa-", ""), 10) || 1;
      return {
        id: t.id,
        number: mesaNum,
        name: t.name || `Mesa ${mesaNum}`,
        zone: t.zone || "Salón",
        nfcUrl: `${baseDomain}/?mesa=${mesaNum}&origen=nfc`,
        qrUrl: `${baseDomain}/?mesa=${mesaNum}&origen=qr`,
      };
    });

    const nfcScans = db.nfc?.stats?.nfcScans || 0;
    const qrScans = db.nfc?.stats?.qrScans || 0;
    const totalScans = nfcScans + qrScans;
    const nfcRate = totalScans > 0 ? Math.round((nfcScans / totalScans) * 100) : 0;

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        success: true,
        baseDomain,
        stats: {
          nfcScans,
          qrScans,
          totalScans,
          nfcRate: `${nfcRate}%`,
          lastScans: db.nfc?.stats?.lastScans || [],
        },
        tables,
      })
    );
    return true;
  }

  // 2. REGISTRAR VISITA / ESCANEO (POST /api/nfc/track)
  if (req.method === "POST" && pathname === "/api/nfc/track") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const data = JSON.parse(body || "{}");
        const mesa = Number(data.mesa) || 1;
        const origen = data.origen === "nfc" ? "nfc" : "qr";
        const device = data.device || (data.ua?.includes("iPhone") ? "iPhone (iOS)" : "Android");

        if (!db.nfc) db.nfc = { baseDomain: "http://localhost:5173", stats: { nfcScans: 0, qrScans: 0, lastScans: [] } };
        if (!db.nfc.stats) db.nfc.stats = { nfcScans: 0, qrScans: 0, lastScans: [] };

        if (origen === "nfc") {
          db.nfc.stats.nfcScans = (db.nfc.stats.nfcScans || 0) + 1;
        } else {
          db.nfc.stats.qrScans = (db.nfc.stats.qrScans || 0) + 1;
        }

        const newScan = {
          id: `scan_${Date.now()}`,
          mesa,
          origen,
          device,
          timestamp: new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }),
        };

        db.nfc.stats.lastScans = [newScan, ...(db.nfc.stats.lastScans || []).slice(0, 19)];
        saveDb();

        logRequest(`Lectura de mesa ${mesa} vía ${origen.toUpperCase()} (${device})`);

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, scan: newScan }));
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return true;
  }

  // 3. ACTUALIZAR DOMINIO BASE DE ENLACES (POST /api/nfc/config)
  if (req.method === "POST" && pathname === "/api/nfc/config") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const data = JSON.parse(body || "{}");
        if (data.baseDomain) {
          if (!db.nfc) db.nfc = { baseDomain: "", stats: { nfcScans: 0, qrScans: 0, lastScans: [] } };
          db.nfc.baseDomain = data.baseDomain.replace(/\/$/, "");
          saveDb();
        }

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, baseDomain: db.nfc.baseDomain }));
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return true;
  }

  return false;
}
