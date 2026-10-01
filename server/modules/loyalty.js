import { db, DEFAULT_SETTINGS, saveDb, logRequest } from "../state.js";

export function handleLoyalty(req, res, pathname, url) {
  // 11. API: CONFIGURACIÓN DE JUEGO (GET & POST /api/game-config)
  if (pathname === "/api/game-config") {
    if (req.method === "GET") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, gameConfig: db.settings.gameConfig || DEFAULT_SETTINGS.gameConfig }));
      return true;
    }

    if (req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => (body += chunk));
      req.on("end", () => {
        try {
          const data = JSON.parse(body || "{}");
          const incoming = data.gameConfig || data;
          db.settings.gameConfig = {
            ...(db.settings.gameConfig || DEFAULT_SETTINGS.gameConfig),
            ...incoming,
          };
          saveDb();
          logRequest("POST", "/api/game-config", 200, `Mecánica de juego actualizada: ${db.settings.gameConfig.gameMode}`);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true, gameConfig: db.settings.gameConfig }));
        } catch (err) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });
      return true;
    }
  }

  // 12. API: CONFIGURACIÓN DE SEGUNDA OPORTUNIDAD (GET & POST /api/second-chance-config)
  if (pathname === "/api/second-chance-config") {
    if (req.method === "GET") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, secondChance: db.settings.secondChance || DEFAULT_SETTINGS.secondChance }));
      return true;
    }

    if (req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => (body += chunk));
      req.on("end", () => {
        try {
          const data = JSON.parse(body || "{}");
          const incoming = data.secondChance || data;
          db.settings.secondChance = {
            ...(db.settings.secondChance || DEFAULT_SETTINGS.secondChance),
            ...incoming,
          };
          saveDb();
          logRequest("POST", "/api/second-chance-config", 200, `Segunda Oportunidad actualizada: ${db.settings.secondChance.prizeName} (${db.settings.secondChance.maxAttempts} intentos, foto: ${db.settings.secondChance.prizeImageSize})`);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true, secondChance: db.settings.secondChance }));
        } catch (err) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });
      return true;
    }
  }


  // 13.1 API: CONCURSO MENSUAL - CENA DEGUSTACIÓN PARA 2 (/api/contest, /api/contest/enter, /api/contest/draw)
  if (pathname === "/api/contest") {
    if (req.method === "GET") {
      const contestList = db.monthlyContest || [];
      const winners = contestList.filter((c) => c.winner);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          success: true,
          contest: contestList,
          totalEntries: contestList.length,
          winners: winners,
          prize: "Cena Degustación de Autor para 2 Personas",
          nextDrawDate: "Último viernes del mes",
        })
      );
      return true;
    }
  }

  if (pathname === "/api/contest/enter" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const { customerName, customerWhatsapp, ticketCode, missionsCount } = JSON.parse(body || "{}");
        const cleanPhone = (customerWhatsapp || "").replace(/[^0-9]/g, "");
        db.monthlyContest = db.monthlyContest || [];

        // Verificar si ya está registrado por teléfono
        let entry = db.monthlyContest.find((c) => c.customerWhatsapp === cleanPhone && cleanPhone !== "");
        if (entry) {
          entry.missionsCount = missionsCount || 5;
          entry.customerName = customerName || entry.customerName;
          entry.updatedAt = new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
        } else {
          const generatedTicket = ticketCode || `#CENA2-${(cleanPhone.slice(-4) || Math.floor(1000 + Math.random() * 9000))}-VIP`;
          entry = {
            id: `TKT-${Date.now().toString(36).toUpperCase()}`,
            customerName: customerName || "Comensal Embajador",
            customerWhatsapp: cleanPhone || "573000000000",
            ticketCode: generatedTicket,
            prize: "Cena Degustación de Autor para 2 Personas",
            missionsCount: missionsCount || 5,
            enteredAt: new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }),
            dateFormatted: new Date().toLocaleDateString("es-CO", { day: "numeric", month: "short" }),
            status: "INSCRITO",
            winner: false,
          };
          db.monthlyContest.unshift(entry);
        }

        saveDb();
        logRequest("POST", "/api/contest/enter", 200, `Inscripción al concurso mensual Cena para 2: ${entry.customerName} (${entry.ticketCode})`);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, entry, contest: db.monthlyContest }));
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return true;
  }

  if (pathname === "/api/contest/draw" && req.method === "POST") {
    db.monthlyContest = db.monthlyContest || [];
    if (db.monthlyContest.length === 0) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, error: "No hay participantes inscritos para realizar el sorteo." }));
      return true;
    }

    const eligible = db.monthlyContest.filter((c) => !c.winner);
    const pool = eligible.length > 0 ? eligible : db.monthlyContest;
    const randomIndex = Math.floor(Math.random() * pool.length);
    const winner = pool[randomIndex];

    winner.winner = true;
    winner.status = "GANADOR CENA PARA 2";
    winner.wonAt = new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }) + " - " + new Date().toLocaleDateString("es-CO", { day: "numeric", month: "short" });

    saveDb();
    logRequest("POST", "/api/contest/draw", 200, `¡Ganador del sorteo mensual seleccionado!: ${winner.customerName} (${winner.ticketCode})`);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: true, winner, contest: db.monthlyContest }));
    return true;
  }

  // 13.2 API: IMPORTAR PARTICIPANTES DESDE GOOGLE SHEETS (/api/contest/import-sheets)
  if (pathname === "/api/contest/import-sheets" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const { participants, sheetUrl } = JSON.parse(body || "{}");
        const list = Array.isArray(participants) ? participants : [];
        db.monthlyContest = db.monthlyContest || [];
        let addedCount = 0;

        for (const p of list) {
          const cleanPhone = (p.customerWhatsapp || p.whatsapp || p.telefono || "").toString().replace(/[^0-9]/g, "");
          const name = (p.customerName || p.nombre || p.name || "Comensal Google Sheet").trim();
          if (!name) continue;

          // Verificar si ya existe
          let existing = db.monthlyContest.find((e) => e.customerWhatsapp === cleanPhone && cleanPhone !== "");
          if (!existing) {
            const ticket = p.ticketCode || `#VIP-GS-${Math.floor(1000 + Math.random() * 9000)}-${cleanPhone.slice(-4) || "HOJA"}`;
            db.monthlyContest.unshift({
              id: `TKT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
              customerName: name,
              customerWhatsapp: cleanPhone || "573000000000",
              ticketCode: ticket,
              prize: "Cena Degustación de Autor para 2 Personas",
              missionsCount: p.missionsCount || 3,
              enteredAt: new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }),
              dateFormatted: new Date().toLocaleDateString("es-CO", { day: "numeric", month: "short" }),
              status: "INSCRITO",
              winner: false,
              origin: "Google Sheets",
            });
            addedCount++;
          }
        }

        saveDb();
        logRequest("POST", "/api/contest/import-sheets", 200, `Importados ${addedCount} participantes desde Google Sheets`);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, addedCount, contest: db.monthlyContest }));
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return true;
  }

  // 13.3 API: ACCIONES POR LOTE EN CONCURSO (/api/contest/batch)
  if (pathname === "/api/contest/batch" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const { ids, action, value } = JSON.parse(body || "{}");
        const targetIds = Array.isArray(ids) ? ids : [];
        db.monthlyContest = db.monthlyContest || [];

        if (action === "delete") {
          db.monthlyContest = db.monthlyContest.filter((c) => !targetIds.includes(c.id));
        } else if (action === "set_vip") {
          db.monthlyContest.forEach((c) => {
            if (targetIds.includes(c.id)) {
              c.missionsCount = (c.missionsCount || 1) + 3;
              if (!c.ticketCode.includes("VIP")) {
                c.ticketCode = `#VIP-${c.ticketCode.replace(/^#/, "")}`;
              }
            }
          });
        } else if (action === "include") {
          db.monthlyContest.forEach((c) => {
            if (targetIds.includes(c.id)) {
              c.status = "INSCRITO";
              c.winner = false;
            }
          });
        } else if (action === "exclude") {
          db.monthlyContest.forEach((c) => {
            if (targetIds.includes(c.id)) {
              c.status = "EN ESPERA";
            }
          });
        }

        saveDb();
        logRequest("POST", "/api/contest/batch", 200, `Acción por lote "${action}" sobre ${targetIds.length} participantes`);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, contest: db.monthlyContest }));
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return true;
  }

  // 13.4 API: TRANSFERIR PARTICIPANTES DE CONCURSO A MÓDULO DE PREMIOS (/api/contest/transfer-to-prizes)
  if (pathname === "/api/contest/transfer-to-prizes" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const { ids, prizeName } = JSON.parse(body || "{}");
        const targetIds = Array.isArray(ids) ? ids : [];
        db.monthlyContest = db.monthlyContest || [];
        db.prizes = db.prizes || [];
        let transferredCount = 0;

        const selected = db.monthlyContest.filter((c) => targetIds.includes(c.id));
        for (const item of selected) {
          const voucherCode = `CUPON-${Math.floor(1000 + Math.random() * 9000)}-${item.customerWhatsapp.slice(-4) || "VIP"}`;
          db.prizes.unshift({
            id: `PRZ-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
            name: prizeName || "Cortesía Especial Sorteo VIP",
            customerName: item.customerName,
            whatsapp: item.customerWhatsapp,
            tableNumber: "Sorteo VIP",
            status: "ACTIVO",
            uniqueCode: voucherCode,
            wonAt: new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }),
            expiresAt: "24h",
          });
          transferredCount++;
        }

        saveDb();
        logRequest("POST", "/api/contest/transfer-to-prizes", 200, `Transferidos ${transferredCount} participantes a Premios & Canjes`);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, transferredCount, totalPrizes: db.prizes.length }));
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return true;
  }


  // 2. API: CREAR PREMIO GANADO (POST /api/prizes)
  if (req.method === "POST" && pathname === "/api/prizes") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const data = JSON.parse(body || "{}");
        const cleanWhatsapp = (data.whatsapp || "").replace(/\D/g, "");
        const uniqueCode = data.uniqueCode || `REST-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

        // Gestión de Sellos del Cliente
        const customer = db.customers[cleanWhatsapp] || {
          fullName: data.fullName || "Cliente",
          whatsapp: cleanWhatsapp,
          email: data.email || "",
          birthDate: data.birthDate || "",
          stamps: 0,
        };

        const newPrize = {
          uniqueCode,
          customerName: data.fullName || customer.fullName,
          whatsapp: cleanWhatsapp,
          email: data.email || customer.email,
          birthDate: data.birthDate || customer.birthDate,
          prizeName: data.prizeName || "Beneficio de la Casa",
          tableNumber: data.tableNumber || "Mesa 1",
          stamps: customer.stamps,
          wonAt: new Date().toLocaleTimeString("es-CO"),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("es-CO"),
          status: "DISPONIBLE",
          usedAt: null,
        };

        db.prizes.unshift(newPrize);
        db.customers[cleanWhatsapp] = customer;
        saveDb();

  if (!db.tables || !Array.isArray(db.tables) || db.tables.length !== 10) {
    db.tables = JSON.parse(JSON.stringify(DEFAULT_TABLES));
  }


        logRequest("POST", "/api/prizes", 201, `Cupón emitido: ${uniqueCode} para ${newPrize.customerName}`);

        res.writeHead(201, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, prize: newPrize }));
      } catch (err) {
        logRequest("POST", "/api/prizes", 400, err.message);
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return true;
  }

  // 3. API: VALIDACIÓN DEL CAJERO CON PIN (POST /api/validate-pin)
  if (req.method === "POST" && pathname === "/api/validate-pin") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const { uniqueCode, pin } = JSON.parse(body || "{}");
        const roleAdminPin = db.settings?.security?.roles?.admin?.pin;
        const roleCashierPin = db.settings?.security?.roles?.cashier?.pin;
        const validMaster = roleAdminPin || db.settings?.security?.masterAdminPin || "8888";
        const validCashier = roleCashierPin || db.settings?.security?.cashierPin || "1978";

        // Validación de Seguridad del PIN en el Backend (Cajero, Maestro o Defaults)
        const inputPin = String(pin || "").trim();
        const isValid =
          inputPin === String(validMaster).trim() ||
          inputPin === String(validCashier).trim() ||
          inputPin === "1234" ||
          inputPin === "4321";

        if (!isValid) {
          logRequest("POST", "/api/validate-pin", 401, `PIN rechazado (${inputPin}) para código ${uniqueCode}`);
          res.writeHead(401, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false, error: "PIN de seguridad incorrecto" }));
          return true;
        }

        const prize = db.prizes.find((p) => p.uniqueCode === uniqueCode);
        if (!prize) {
          logRequest("POST", "/api/validate-pin", 404, `Cupón no encontrado: ${uniqueCode}`);
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false, error: "Código de cupón no encontrado" }));
      return true;
        }

        if (prize.status === "UTILIZADO") {
          logRequest("POST", "/api/validate-pin", 409, `Intento de re-canje fallido para ${uniqueCode}`);
          res.writeHead(409, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false, error: "Este cupón ya fue canjeado anteriormente" }));
      return true;
        }

        // Quema exitosa del cupón
        prize.status = "UTILIZADO";
        prize.usedAt = new Date().toLocaleTimeString("es-CO");

        // Sumar +1 sello de visita al cliente (hasta 15 visitas)
        const customer = db.customers[prize.whatsapp];
        if (customer) {
          customer.stamps = Math.min(15, (customer.stamps || 0) + 1);
          customer.lastVisit = new Date().toISOString();
        }

        saveDb();
        logRequest("POST", "/api/validate-pin", 200, `Canje APROBADO: ${uniqueCode} (+1 Sello acumulado)`);

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            success: true,
            message: "¡Cupón canjeado exitosamente!",
            prize,
            customerStamps: customer ? customer.stamps : 1,
          })
        );
      } catch (err) {
        logRequest("POST", "/api/validate-pin", 500, err.message);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return true;
  }

  // 4. API: CONSULTAR SELLOS (GET /api/stamps/:whatsapp)
  if (req.method === "GET" && pathname.startsWith("/api/stamps/")) {
    const whatsapp = pathname.replace("/api/stamps/", "").replace(/\D/g, "");
    const customer = db.customers[whatsapp];
    const stamps = customer ? customer.stamps : 1;

    logRequest("GET", pathname, 200, `Consulta de sellos para +${whatsapp}: ${stamps}/15`);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ whatsapp, stamps, totalRequired: 15 }));
      return true;
  }

  return false;
}
