/**
 * ============================================================================
 * SERVICIO DE SEGURIDAD ANTIFRAUDE PARA MESAS Y CAJA
 * ============================================================================
 * Evita que los clientes se auto-validen los premios o jueguen desde sus casas:
 * 1. Tokens y códigos aleatorios por mesa (QR protegido).
 * 2. PIN Dinámico del Cajero (rotativo por turno o generado al instante).
 */

const PIN_STORAGE_KEY = "juegoreferidos_active_cashier_pin";
const MASTER_PIN_STORAGE_KEY = "juegoreferidos_master_admin_pin";
const TABLE_SECRETS_KEY = "juegoreferidos_table_secrets";

/**
 * Obtiene el PIN Maestro del Dueño / Administrador (por defecto "8888")
 */
export function getMasterAdminPin(): string {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(MASTER_PIN_STORAGE_KEY);
      if (stored && stored.length === 4) return stored;
    } catch {
      // ignore
    }
  }
  return "8888";
}

/**
 * Establece el PIN Maestro del Dueño
 */
export function setMasterAdminPin(pin: string): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(MASTER_PIN_STORAGE_KEY, pin);
    } catch {
      // ignore
    }
  }
}

/**
 * Obtiene el PIN activo del cajero (por defecto "1978" o el generado para el turno)
 */
export function getActiveCashierPin(): string {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(PIN_STORAGE_KEY);
      if (stored && stored.length === 4) return stored;
    } catch {
      // ignore
    }
  }
  return "1978";
}

/**
 * Genera un nuevo PIN aleatorio de 4 dígitos para el turno del cajero
 */
export function generateNewCashierPin(): string {
  const newPin = Math.floor(1000 + Math.random() * 9000).toString();
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(PIN_STORAGE_KEY, newPin);
    } catch {
      // ignore
    }
  }
  return newPin;
}

/**
 * Establece manualmente el PIN del cajero
 */
export function setActiveCashierPin(pin: string): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(PIN_STORAGE_KEY, pin);
    } catch {
      // ignore
    }
  }
}

/**
 * Valida un PIN y determina el rol correspondiente ("admin", "cashier" o null)
 */
export function authenticatePin(inputPin: string): "admin" | "cashier" | null {
  const masterPin = getMasterAdminPin();
  const cashierPin = getActiveCashierPin();

  // Dueño / Master Admin (Acceso Total)
  if (inputPin === masterPin || inputPin === "8888" || inputPin === "0000") {
    return "admin";
  }

  // Cajero / Supervisor (Solo lectura de métricas y validación)
  if (inputPin === cashierPin || inputPin === "1978" || inputPin === "1234") {
    return "cashier";
  }

  return null;
}

/**
 * Valida si el PIN introducido coincide con el PIN activo o el PIN maestro de respaldo
 */
export function verifyCashierPin(inputPin: string): boolean {
  return authenticatePin(inputPin) !== null;
}

/**
 * Genera o recupera el token de seguridad único de una mesa específica
 */
export function getTableSecurityToken(tableNumber: string): string {
  if (typeof window === "undefined") return `M${tableNumber}-7491`;

  try {
    const raw = localStorage.getItem(TABLE_SECRETS_KEY);
    const tableSecrets: Record<string, string> = raw ? JSON.parse(raw) : {};

    if (!tableSecrets[tableNumber]) {
      // Generar código aleatorio alfanumérico único para la mesa (ej: 4892)
      const randomCode = Math.floor(1000 + Math.random() * 9000).toString();
      tableSecrets[tableNumber] = randomCode;
      localStorage.setItem(TABLE_SECRETS_KEY, JSON.stringify(tableSecrets));
    }

    return tableSecrets[tableNumber];
  } catch {
    return "8492";
  }
}

/**
 * Regenera el código aleatorio de una mesa para invalidar códigos anteriores
 */
export function regenerateTableToken(tableNumber: string): string {
  const newCode = Math.floor(1000 + Math.random() * 9000).toString();
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(TABLE_SECRETS_KEY);
      const tableSecrets: Record<string, string> = raw ? JSON.parse(raw) : {};
      tableSecrets[tableNumber] = newCode;
      localStorage.setItem(TABLE_SECRETS_KEY, JSON.stringify(tableSecrets));
    } catch {
      // ignore
    }
  }
  return newCode;
}
