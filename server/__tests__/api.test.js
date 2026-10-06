/**
 * Pruebas de integración del backend.
 * Arranca el servidor real en un puerto de test con una base de datos aislada
 * (DB_FILE temporal) y verifica los endpoints críticos de seguridad y negocio.
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SERVER_ENTRY = path.join(__dirname, "..", "index.js");
const PORT = 3099;
const BASE = `http://localhost:${PORT}`;

let child;
let tmpDbFile;

const TEST_PINS = { MASTER_ADMIN_PIN: "7777", MANAGER_ADMIN_PIN: "6666", CASHIER_PIN: "5151" };

function waitForServer(timeoutMs = 10000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const tick = async () => {
      try {
        const r = await fetch(`${BASE}/api/config`);
        if (r.ok) return resolve();
      } catch {
        /* aún no levanta */
      }
      if (Date.now() - start > timeoutMs) return reject(new Error("El servidor no arrancó a tiempo"));
      setTimeout(tick, 200);
    };
    tick();
  });
}

beforeAll(async () => {
  tmpDbFile = path.join(os.tmpdir(), `juegoreferidos-test-db-${Date.now()}.json`);
  child = spawn(process.execPath, [SERVER_ENTRY], {
    env: {
      ...process.env,
      PORT: String(PORT),
      DB_FILE: tmpDbFile,
      ...TEST_PINS,
      HERMES_API_KEY: "", // sin credenciales reales de Hermes
    },
    stdio: "ignore",
  });
  await waitForServer();
}, 20000);

afterAll(() => {
  if (child) child.kill();
  if (tmpDbFile && fs.existsSync(tmpDbFile)) {
    try { fs.unlinkSync(tmpDbFile); } catch { /* ignore */ }
  }
});

async function login(pin) {
  const r = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pin }),
  });
  return r;
}

describe("Autenticación", () => {
  it("login con PIN maestro válido devuelve token y rol admin", async () => {
    const r = await login(TEST_PINS.MASTER_ADMIN_PIN);
    expect(r.status).toBe(200);
    const data = await r.json();
    expect(data.success).toBe(true);
    expect(data.role).toBe("admin");
    expect(typeof data.token).toBe("string");
    expect(data.token.length).toBeGreaterThan(16);
  });

  it("login con PIN inválido devuelve 401", async () => {
    const r = await login("0000");
    expect(r.status).toBe(401);
  });

  it("endpoint protegido sin token devuelve 401", async () => {
    const r = await fetch(`${BASE}/api/config`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brandName: "Hack" }),
    });
    expect(r.status).toBe(401);
  });

  it("endpoint protegido con token válido es aceptado", async () => {
    const lr = await login(TEST_PINS.MASTER_ADMIN_PIN);
    const { token } = await lr.json();
    const r = await fetch(`${BASE}/api/config`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ brandName: "Mi Negocio" }),
    });
    expect(r.status).toBe(200);
    const data = await r.json();
    expect(data.success).toBe(true);
  });
});

describe("Seguridad: /api/config no expone secretos", () => {
  it("GET /api/config enmascara PINs y apiKey", async () => {
    const r = await fetch(`${BASE}/api/config`);
    const data = await r.json();
    expect(data.settings.security.masterAdminPin).toBe("***");
    expect(data.settings.security.cashierPin).toBe("***");
    // No debe filtrarse el PIN de test real por ningún lado del JSON.
    const raw = JSON.stringify(data);
    expect(raw).not.toContain(TEST_PINS.MASTER_ADMIN_PIN);
    expect(raw).not.toContain(TEST_PINS.CASHIER_PIN);
  });
});

describe("Validación de PIN de canje (sin backdoor)", () => {
  it("los PINs backdoor 1234 y 4321 ya NO son válidos", async () => {
    for (const bad of ["1234", "4321"]) {
      const r = await fetch(`${BASE}/api/validate-pin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uniqueCode: "NO-EXISTE", pin: bad }),
      });
      expect(r.status).toBe(401); // rechazado por PIN, no por cupón
    }
  });

  it("PIN configurado válido pasa la verificación de PIN (cupón inexistente -> 404)", async () => {
    const r = await fetch(`${BASE}/api/validate-pin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uniqueCode: "NO-EXISTE", pin: TEST_PINS.CASHIER_PIN }),
    });
    expect(r.status).toBe(404); // PIN aceptado, pero el cupón no existe
  });
});

describe("Sellos One-Tap (anti-duplicado diario server-side)", () => {
  const wa = "573000000111";

  it("GET inicial devuelve 0 sellos", async () => {
    const r = await fetch(`${BASE}/api/stamps/${wa}`);
    const data = await r.json();
    expect(data.stamps).toBe(0);
    expect(data.totalRequired).toBe(15);
  });

  it("primer POST /stamps/add suma 1 sello", async () => {
    const r = await fetch(`${BASE}/api/stamps/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ whatsapp: wa }),
    });
    const data = await r.json();
    expect(data.added).toBe(true);
    expect(data.stamps).toBe(1);
  });

  it("segundo POST el mismo día NO suma (anti-duplicado)", async () => {
    const r = await fetch(`${BASE}/api/stamps/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ whatsapp: wa }),
    });
    const data = await r.json();
    expect(data.added).toBe(false);
    expect(data.alreadyStampedToday).toBe(true);
    expect(data.stamps).toBe(1);
  });
});

describe("Portal cautivo: no es fail-open", () => {
  it("sin router accesible, accessGranted es false (no finge éxito)", async () => {
    const r = await fetch(`${BASE}/api/portal/connect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName: "Test", whatsapp: "573000000222" }),
    });
    expect(r.status).toBe(200);
    const data = await r.json();
    expect(data.success).toBe(true); // el registro CRM sí ocurre
    expect(data.accessGranted).toBe(false); // pero el router no autorizó
    expect(data.routerHandshake.status).toBe("error");
  }, 15000);
});
