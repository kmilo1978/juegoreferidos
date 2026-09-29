import { db, DEFAULT_TABLES, saveDb, logRequest } from "../state.js";

export function handleTables(req, res, pathname, url) {
  // 9. API: GESTIÓN DE 10 MESAS EN TIEMPO REAL (/api/tables)
  if (pathname === "/api/tables") {
    if (req.method === "GET") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, tables: db.tables || DEFAULT_TABLES }));
      return true;
    }

    if (req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => (body += chunk));
      req.on("end", () => {
        try {
          const data = JSON.parse(body || "{}");
          if (data.tables && Array.isArray(data.tables)) {
            db.tables = data.tables;
          } else if (data.tableNumber && data.status) {
            db.tables = (db.tables || DEFAULT_TABLES).map(t => {
              if (t.number === data.tableNumber) {
                return { ...t, ...data, lastActivityAt: "Ahora" };
              }
              return t;
            });
          }
          saveDb();
          logRequest("POST", "/api/tables", 200, `Mesas actualizadas en tiempo real`);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true, tables: db.tables }));
        } catch (err) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });
      return true;
    }
  }

  // 10. API: RESETEAR / LIBERAR MESA ESPECÍFICA (POST /api/tables/:id/reset)
  if (req.method === "POST" && pathname.startsWith("/api/tables/") && pathname.endsWith("/reset")) {
    const parts = pathname.split("/");
    const tableId = parts[3]; // ej: mesa-1 o 1
    const tableNum = parseInt(tableId.replace(/[^0-9]/g, ""), 10) || 1;

    db.tables = (db.tables || DEFAULT_TABLES).map(t => {
      if (t.number === tableNum || t.id === tableId) {
        return {
          ...t,
          status: "DISPONIBLE",
          currentCustomer: null,
          currentWhatsapp: null,
          activeSessionId: null,
          prizeWon: null,
          uniqueCode: null,
          startedAt: null,
          lastActivityAt: null,
        };
      }
      return t;
    });
    saveDb();
    logRequest("POST", pathname, 200, `Mesa ${tableNum} liberada (DISPONIBLE)`);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: true, message: `Mesa ${tableNum} liberada con éxito`, tables: db.tables }));
      return true;
  }

  return false;
}
