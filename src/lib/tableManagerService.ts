/**
 * Servicio de Gestión y Monitoreo de 10 Mesas en Tiempo Real
 * Cada mesa está conectada a una variable de estado única y sincronizada con el backend.
 */

export interface RestaurantTable {
  id: string; // "mesa-1" ... "mesa-10"
  number: number; // 1 .. 10
  name: string; // "Mesa 1", "Mesa 2 - Ventana", etc.
  zone: string; // "Salón Principal", "Terraza", "VIP"
  capacity: number;
  status: "DISPONIBLE" | "JUGANDO" | "PREMIO_PENDIENTE" | "CANJEADO" | "INACTIVA";
  currentCustomer?: string | null;
  currentWhatsapp?: string | null;
  activeSessionId?: string | null;
  prizeWon?: string | null;
  uniqueCode?: string | null;
  startedAt?: string | null;
  lastActivityAt?: string | null;
  qrUrl: string;
}

const TABLES_STORAGE_KEY = "juegoreferidos_tables_config";

const DEFAULT_TABLES: RestaurantTable[] = Array.from({ length: 10 }, (_, i) => {
  const num = i + 1;
  const zone = num <= 4 ? "Salón Principal" : num <= 7 ? "Terraza Jardín" : "Zona VIP";
  const capacity = num === 10 ? 8 : num >= 7 ? 6 : 4;
  return {
    id: `mesa-${num}`,
    number: num,
    name: `Mesa ${num}`,
    zone,
    capacity,
    status: num === 3 ? "PREMIO_PENDIENTE" : num === 1 ? "JUGANDO" : "DISPONIBLE",
    currentCustomer: num === 3 ? "Carlos Andrés" : num === 1 ? "Invitado en Mesa" : null,
    currentWhatsapp: num === 3 ? "573009876543" : null,
    activeSessionId: num === 3 ? "SES-M3-8492" : num === 1 ? "SES-M1-1024" : null,
    prizeWon: num === 3 ? "Postre Artesanal de Cortesía" : null,
    uniqueCode: num === 3 ? "REST-8492" : null,
    startedAt: num === 3 ? "Hace 12 min" : num === 1 ? "Hace 3 min" : null,
    lastActivityAt: num === 3 ? "Hace 2 min" : num === 1 ? "Ahora" : null,
    qrUrl: typeof window !== "undefined" ? `${window.location.origin}/?mesa=${num}` : `http://localhost:5173/?mesa=${num}`,
  };
});

export const TableManagerService = {
  /**
   * Obtiene la lista de las 10 mesas
   */
  getTables(): RestaurantTable[] {
    if (typeof window === "undefined") return DEFAULT_TABLES;
    try {
      const raw = localStorage.getItem(TABLES_STORAGE_KEY);
      if (raw) {
        const parsed: RestaurantTable[] = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length === 10) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    this.saveTables(DEFAULT_TABLES);
    return DEFAULT_TABLES;
  },

  /**
   * Guarda la configuración y estado de las 10 mesas
   */
  saveTables(tables: RestaurantTable[]): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(TABLES_STORAGE_KEY, JSON.stringify(tables));
      // Notificar al servidor backend en segundo plano
      fetch("http://localhost:3001/api/tables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tables }),
      }).catch(() => {});
    } catch {
      // ignore
    }
  },

  /**
   * Obtiene una mesa específica por su número (1 a 10)
   */
  getTableByNumber(tableNumber: number): RestaurantTable | undefined {
    const tables = this.getTables();
    return tables.find((t) => t.number === tableNumber);
  },

  /**
   * Actualiza el estado de la variable de una mesa en tiempo real
   */
  updateTableStatus(
    tableNumber: number,
    status: RestaurantTable["status"],
    extraData?: Partial<RestaurantTable>
  ): RestaurantTable[] {
    const tables = this.getTables();
    const updated = tables.map((t) => {
      if (t.number === tableNumber) {
        return {
          ...t,
          status,
          lastActivityAt: "Ahora",
          ...(extraData || {}),
        };
      }
      return t;
    });
    this.saveTables(updated);
    return updated;
  },

  /**
   * Libera una mesa (vuelve a estado DISPONIBLE y limpia comensal)
   */
  resetTable(tableNumber: number): RestaurantTable[] {
    const tables = this.getTables();
    const updated = tables.map((t) => {
      if (t.number === tableNumber) {
        return {
          ...t,
          status: "DISPONIBLE" as const,
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
    this.saveTables(updated);
    try {
      fetch(`http://localhost:3001/api/tables/mesa-${tableNumber}/reset`, {
        method: "POST",
      }).catch(() => {});
    } catch {}
    return updated;
  },

  /**
   * Actualiza los datos de configuración de una mesa (nombre, zona, capacidad)
   */
  configureTable(
    tableNumber: number,
    config: { name?: string; zone?: string; capacity?: number }
  ): RestaurantTable[] {
    const tables = this.getTables();
    const updated = tables.map((t) => {
      if (t.number === tableNumber) {
        return {
          ...t,
          name: config.name || t.name,
          zone: config.zone || t.zone,
          capacity: config.capacity !== undefined ? config.capacity : t.capacity,
        };
      }
      return t;
    });
    this.saveTables(updated);
    return updated;
  },

  /**
   * Sincroniza las mesas con el backend
   */
  async syncWithBackend(): Promise<RestaurantTable[]> {
    try {
      const res = await fetch("http://localhost:3001/api/tables");
      if (res.ok) {
        const data = await res.json();
        if (data.tables && Array.isArray(data.tables) && data.tables.length === 10) {
          localStorage.setItem(TABLES_STORAGE_KEY, JSON.stringify(data.tables));
          return data.tables;
        }
      }
    } catch {
      // offline
    }
    return this.getTables();
  },
};
