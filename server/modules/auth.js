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

// --- Rate limiting del login (anti fuerza bruta de PIN) ---
const MAX_ATTEMPTS = 5; // intentos fallidos permitidos por ventana
const LOCK_MS = 5 * 60 * 1000; // bloqueo de 5 min al superar el máximo
const ATTEMPT_WINDOW_MS = 5 * 60 * 1000; // ventana para contar intentos
const loginAttempts = new Map(); // ip -> { count, firstAt, lockedUntil }

function clientIp(req) {
  // Respeta X-Forwarded-For si hay proxy; cae al socket.
  const fwd = req.headers["x-forwarded-for"];
  if (fwd) return String(fwd).split(",")[0].trim();
  return req.socket?.remoteAddress || "unknown";
}

/** Devuelve { blocked, retryAfterMs } para la IP dada. */
function checkRateLimit(ip) {
  const now = Date.now();
  const rec = loginAttempts.get(ip);
  if (rec?.lockedUntil && now < rec.lockedUntil) {
    return { blocked: true, retryAfterMs: rec.lockedUntil - now };
  }
  return { blocked: false, retryAfterMs: 0 };
}

/** Registra un intento fallido; bloquea la IP si supera el máximo. */
function registerFailedAttempt(ip) {
  const now = Date.now();
  let rec = loginAttempts.get(ip);
  // Reiniciar la ventana si expiró
  if (!rec || now - rec.firstAt > ATTEMPT_WINDOW_MS) {
    rec = { count: 0, firstAt: now, lockedUntil: 0 };
  }
  rec.count += 1;
  if (rec.count >= MAX_ATTEMPTS) {
    rec.lockedUntil = now + LOCK_MS;
  }
  loginAttempts.set(ip, rec);
}

/** Limpia los intentos de una IP tras un login exitoso. */
function clearAttempts(ip) {
  loginAttempts.delete(ip);
}

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
    const ip = clientIp(req);

    // Freno anti fuerza bruta: si la IP está bloqueada, responder 429.
    const rl = checkRateLimit(ip);
    if (rl.blocked) {
      const secs = Math.ceil(rl.retryAfterMs / 1000);
      logRequest("POST", "/api/auth/login", 429, `Login bloqueado por rate-limit (IP ${ip}, ${secs}s)`);
      res.writeHead(429, { "Content-Type": "application/json", "Retry-After": String(secs) });
      res.end(JSON.stringify({
        success: false,
        error: `Demasiados intentos. Espera ${secs} segundos antes de volver a intentar.`,
        retryAfterSeconds: secs,
      }));
      return;
    }

    readBody(req)
      .then((data) => {
        const role = roleForPin(data.pin);
        if (!role) {
          registerFailedAttempt(ip);
          logRequest("POST", "/api/auth/login", 401, `Intento de login con PIN inválido (IP ${ip})`);
          res.writeHead(401, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false, error: "PIN incorrecto" }));
          return;
        }
        clearAttempts(ip);
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
