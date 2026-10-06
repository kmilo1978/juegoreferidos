/**
 * MÓDULO DE AUTENTICACIÓN (TOKEN DE SESIÓN EN MEMORIA)
 * ----------------------------------------------------
 * Protege los endpoints administrativos de escritura. El flujo es:
 *   1. El panel hace POST /api/auth/login con el PIN del dueño/gerente/cajero.
 *   2. Si el PIN es válido, se emite un token aleatorio con rol y expiración.
 *   3. Los endpoints protegidos exigen el header: Authorization: Bearer <token>.
 *
 * Los tokens viven en memoria (se pierden al reiniciar el server). Para un
 * entorno multi-instancia habría que moverlos a un store compartido; para un
 * único proceso en el local esto es suficiente y sin dependencias externas.
 */

import crypto from "node:crypto";
import { db, DEFAULT_SETTINGS, logRequest, readBody } from "../state.js";

const TOKEN_TTL_MS = 12 * 60 * 60 * 1000; // 12 horas
const sessions = new Map(); // token -> { role, expiresAt }

function resolvePins() {
  const sec = db.settings?.security || DEFAULT_SETTINGS.security;
  return {
    master: String(sec.roles?.admin?.pin || sec.masterAdminPin || "").trim(),
    manager: String(sec.roles?.manager?.pin || sec.managerAdminPin || "").trim(),
    cashier: String(sec.roles?.cashier?.pin || sec.cashierPin || "").trim(),
  };
}

function roleForPin(pin) {
  const input = String(pin || "").trim();
  if (!input) return null;
  const pins = resolvePins();
  if (input === pins.master && pins.master) return "admin";
  if (input === pins.manager && pins.manager) return "manager";
  if (input === pins.cashier && pins.cashier) return "cashier";
  return null;
}

function issueToken(role) {
  const token = crypto.randomBytes(24).toString("hex");
  sessions.set(token, { role, expiresAt: Date.now() + TOKEN_TTL_MS });
  return token;
}

function getSession(token) {
  const s = sessions.get(token);
  if (!s) return null;
  if (Date.now() > s.expiresAt) {
    sessions.delete(token);
    return null;
  }
  return s;
}

/**
 * Verifica si la petición está autorizada. Acepta:
 *   - Authorization: Bearer <token> emitido por /api/auth/login
 * Devuelve la sesión { role } o null.
 */
export function getAuthSession(req) {
  const header = req.headers["authorization"] || req.headers["Authorization"];
  if (!header || !String(header).startsWith("Bearer ")) return null;
  const token = String(header).slice(7).trim();
  return getSession(token);
}

/**
 * Guard para endpoints protegidos. Si no hay sesión válida, responde 401 y
 * devuelve false (el handler debe hacer `return true`). Si hay sesión, devuelve
 * true y el handler continúa.
 */
export function requireAuth(req, res) {
  const session = getAuthSession(req);
  if (!session) {
    res.writeHead(401, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: false, error: "No autorizado. Inicia sesión con tu PIN." }));
    return false;
  }
  return true;
}

export function handleAuth(req, res, pathname) {
  // POST /api/auth/login  { pin }
  if (pathname === "/api/auth/login" && req.method === "POST") {
    readBody(req)
      .then((data) => {
        const role = roleForPin(data.pin);
        if (!role) {
          logRequest("POST", "/api/auth/login", 401, "Intento de login con PIN inválido");
          res.writeHead(401, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false, error: "PIN incorrecto" }));
          return;
        }
        const token = issueToken(role);
        logRequest("POST", "/api/auth/login", 200, `Sesión iniciada (rol: ${role})`);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, token, role, expiresInMs: TOKEN_TTL_MS }));
      })
      .catch((err) => {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: err.message }));
      });
    return true;
  }

  // POST /api/auth/logout  (Authorization: Bearer <token>)
  if (pathname === "/api/auth/logout" && req.method === "POST") {
    const header = req.headers["authorization"] || "";
    if (String(header).startsWith("Bearer ")) {
      sessions.delete(String(header).slice(7).trim());
    }
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: true }));
    return true;
  }

  // GET /api/auth/verify  — comprobar si el token sigue vigente
  if (pathname === "/api/auth/verify" && req.method === "GET") {
    const session = getAuthSession(req);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: true, valid: !!session, role: session?.role || null }));
    return true;
  }

  return false;
}
