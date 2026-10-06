/**
 * CLIENTE API CENTRAL
 * -------------------
 * Un único punto para hablar con el backend. Resuelve la URL base desde
 * `VITE_API_URL` (producción) y cae a `/api` relativo en desarrollo, que el
 * proxy de Vite redirige a http://localhost:3001.
 *
 * Antes había ~16 archivos con `http://localhost:3001` escrito a mano, lo que
 * rompía en producción (HTTPS/dominio). Ahora todo pasa por aquí.
 *
 * También gestiona el token de sesión del panel admin: tras hacer login con el
 * PIN, el token se guarda y se adjunta como `Authorization: Bearer <token>` en
 * las peticiones protegidas.
 */

const TOKEN_KEY = "juegoreferidos_admin_token";

/** Base de la API. Vacío/undefined => "/api" relativo (proxy en dev, mismo host en prod). */
export function apiBase(): string {
  const fromEnv = (import.meta as any).env?.VITE_API_URL as string | undefined;
  const base = (fromEnv && fromEnv.trim()) || "/api";
  return base.replace(/\/$/, "");
}

/** Construye la URL completa a partir de una ruta tipo "/config" o "config". */
export function apiUrl(path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  // Permitir pasar rutas que ya incluyen el prefijo /api
  const normalized = clean.startsWith("/api/") ? clean.slice(4) : clean;
  return `${apiBase()}${normalized}`;
}

export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAuthToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

export function clearAuthToken(): void {
  setAuthToken(null);
}

function authHeaders(extra?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = { ...(extra || {}) };
  const token = getAuthToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

/** GET JSON. Lanza Error si la respuesta no es ok. */
export async function apiGet<T = any>(path: string): Promise<T> {
  const res = await fetch(apiUrl(path), { headers: authHeaders() });
  if (!res.ok) {
    throw new Error(`GET ${path} falló (${res.status})`);
  }
  return res.json();
}

/** POST JSON. Lanza Error si la respuesta no es ok. */
export async function apiPost<T = any>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(apiUrl(path), {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    if (res.status === 401 && getAuthToken()) handleAuthExpired();
    let detail = "";
    try {
      const data = await res.json();
      detail = data?.error ? `: ${data.error}` : "";
    } catch {
      /* ignore */
    }
    throw new Error(`POST ${path} falló (${res.status})${detail}`);
  }
  return res.json();
}

/** DELETE JSON con cuerpo opcional. */
export async function apiDelete<T = any>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(apiUrl(path), {
    method: "DELETE",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    throw new Error(`DELETE ${path} falló (${res.status})`);
  }
  return res.json();
}

/**
 * Inicia sesión en el backend con un PIN. Devuelve el rol si tuvo éxito y
 * guarda el token para futuras peticiones. Devuelve null si el PIN es inválido.
 */
export async function loginWithPin(pin: string): Promise<{ role: string } | null> {
  try {
    const res = await fetch(apiUrl("/auth/login"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.success && data?.token) {
      setAuthToken(data.token);
      return { role: data.role };
    }
    return null;
  } catch {
    return null;
  }
}

export async function logout(): Promise<void> {
  try {
    await fetch(apiUrl("/auth/logout"), { method: "POST", headers: authHeaders() });
  } catch {
    /* ignore */
  }
  clearAuthToken();
}

export const AUTH_EXPIRED_EVENT = "admin-auth-expired";

/**
 * Marca la sesión admin como expirada: limpia el token y notifica a la UI
 * (vía un evento de window) para que vuelva a pedir el PIN.
 */
export function handleAuthExpired(): void {
  clearAuthToken();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT));
  }
}

/** Suscribe un callback al evento de sesión expirada. Devuelve la función de limpieza. */
export function onAuthExpired(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => cb();
  window.addEventListener(AUTH_EXPIRED_EVENT, handler);
  return () => window.removeEventListener(AUTH_EXPIRED_EVENT, handler);
}

/**
 * `fetch` con token de admin que detecta expiración de sesión: si el backend
 * responde 401 (token vencido o servidor reiniciado), limpia el token y emite
 * el evento para que el panel re-pida el PIN. Devuelve la Response tal cual.
 */
export async function authFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    ...(init.headers as Record<string, string> | undefined),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(apiUrl(path), { ...init, headers });
  if (res.status === 401 && token) {
    // Teníamos token pero el backend lo rechazó: la sesión caducó.
    handleAuthExpired();
  }
  return res;
}
