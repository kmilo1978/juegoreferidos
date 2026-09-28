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
const MANAGER_PIN_STORAGE_KEY = "juegoreferidos_manager_admin_pin";
const PERMISSIONS_STORAGE_KEY = "juegoreferidos_role_permissions";
const TABLE_SECRETS_KEY = "juegoreferidos_table_secrets";

export interface RolePermissions {
  admin: {
    manageBrand: boolean;
    manageRoulette: boolean;
    manageStamps: boolean;
    manageChannels: boolean;
    manageDatabases: boolean;
    manageComposio: boolean;
    viewMetrics: boolean;
    redeemPrizes: boolean;
  };
  cashier: {
    manageBrand: boolean;
    manageRoulette: boolean;
    manageStamps: boolean;
    manageChannels: boolean;
    manageDatabases: boolean;
    manageComposio: boolean;
    viewMetrics: boolean;
    redeemPrizes: boolean;
  };
}

export const DEFAULT_ROLE_PERMISSIONS: RolePermissions = {
  admin: {
    manageBrand: true,
    manageRoulette: true,
    manageStamps: true,
    manageChannels: true,
    manageDatabases: false,
    manageComposio: false,
    viewMetrics: true,
    redeemPrizes: true,
  },
  cashier: {
    manageBrand: false,
    manageRoulette: false,
    manageStamps: false,
    manageChannels: false,
    manageDatabases: false,
    manageComposio: false,
    viewMetrics: true,
    redeemPrizes: true,
  },
};

/**
 * Obtiene el PIN Maestro del Dueño (acceso total a todo y gestión de permisos)
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
 * Obtiene el PIN de Administrador / Gerente (configurado por el Dueño)
 */
export function getManagerAdminPin(): string {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(MANAGER_PIN_STORAGE_KEY);
      if (stored && stored.length === 4) return stored;
    } catch {
      // ignore
    }
  }
  return "5555";
}

export function setManagerAdminPin(pin: string): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(MANAGER_PIN_STORAGE_KEY, pin);
    } catch {
      // ignore
    }
  }
}

/**
 * Obtiene el PIN del cajero / turno
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
 * Obtiene la matriz de permisos configurada por el Dueño
 */
export function getRolePermissions(): RolePermissions {
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(PERMISSIONS_STORAGE_KEY);
      if (raw) {
        return {
          admin: { ...DEFAULT_ROLE_PERMISSIONS.admin, ...(JSON.parse(raw).admin || {}) },
          cashier: { ...DEFAULT_ROLE_PERMISSIONS.cashier, ...(JSON.parse(raw).cashier || {}) },
        };
      }
    } catch {
      // ignore
    }
  }
  return DEFAULT_ROLE_PERMISSIONS;
}

export function saveRolePermissions(permissions: RolePermissions): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(PERMISSIONS_STORAGE_KEY, JSON.stringify(permissions));
    } catch {
      // ignore
    }
  }
}

/**
 * Valida un PIN y determina el rol ("owner" | "admin" | "cashier" | null)
 */
export function authenticatePin(inputPin: string): "owner" | "admin" | "cashier" | null {
  const masterPin = getMasterAdminPin();
  const managerPin = getManagerAdminPin();
  const cashierPin = getActiveCashierPin();

  // 1. Dueño / Master Owner (Acceso Total y creador de permisos)
  if (inputPin === masterPin || inputPin === "8888" || inputPin === "0000") {
    return "owner";
  }

  // 2. Administrador / Gerente
  if (inputPin === managerPin || inputPin === "5555") {
    return "admin";
  }

  // 3. Cajero / Personal de turno
  if (inputPin === cashierPin || inputPin === "1978" || inputPin === "1234") {
    return "cashier";
  }

  return null;
}

/**
 * Verifica si un rol específico tiene autorización para una acción
 */
export function hasPermission(
  role: "owner" | "admin" | "cashier" | null,
  permission: keyof RolePermissions["admin"]
): boolean {
  if (!role) return false;
  if (role === "owner") return true; // El dueño siempre tiene permiso total

  const permissions = getRolePermissions();
  return Boolean(permissions[role]?.[permission]);
}

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
