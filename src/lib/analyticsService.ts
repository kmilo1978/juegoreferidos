/**
 * ============================================================================
 * SERVICIO DE MÉTRICAS Y ANALÍTICA EN TIEMPO REAL
 * ============================================================================
 * Registra vistas y calcula estadísticas de rendimiento:
 * - Vistas: Hoy, Esta Semana, Este Mes, Total
 * - Transacciones y canjes en caja este mes
 * - Tasa de conversión de comensales
 * - Mejor día de la semana con distribución de afluencia
 */

import { WonPrize } from "../components/qr-game/gameTypes";

const VIEWS_STORAGE_KEY = "juegoreferidos_views_log";
const HISTORY_STORAGE_KEY = "juegoreferidos_history_log";

export interface DayDistribution {
  dayName: string;
  dayShort: string;
  count: number;
  percentage: number;
}

export interface AnalyticsSummary {
  views: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    total: number;
  };
  transactions: {
    totalThisMonth: number;
    redeemedThisMonth: number;
    conversionRate: number; // Porcentaje de redención en caja
  };
  timing: {
    bestDay: string;
    bestDayCount: number;
    dayDistribution: DayDistribution[];
  };
}

/**
 * Registra una nueva vista / escaneo de código QR
 */
export function recordPageView(): void {
  if (typeof window === "undefined") return;

  try {
    const raw = localStorage.getItem(VIEWS_STORAGE_KEY);
    const timestamps: number[] = raw ? JSON.parse(raw) : [];
    
    // Guardar timestamp actual
    timestamps.push(Date.now());

    // Mantener los últimos 3.000 registros para no sobrecargar el storage
    const trimmed = timestamps.slice(-3000);
    localStorage.setItem(VIEWS_STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // Modo incógnito o storage lleno
  }
}

/**
 * Obtiene el historial persistente de participaciones
 */
export function getStoredHistory(): WonPrize[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Guarda el historial de participaciones de forma persistente
 */
export function saveStoredHistory(history: WonPrize[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
  } catch {
    // ignore
  }
}

/**
 * Calcula todas las métricas en tiempo real a partir de las vistas y el historial
 */
export function calculateAnalytics(history: WonPrize[]): AnalyticsSummary {
  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;
  const sevenDaysMs = 7 * oneDayMs;
  const thirtyDaysMs = 30 * oneDayMs;

  // 1. Obtener timestamps de vistas
  let viewTimestamps: number[] = [];
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(VIEWS_STORAGE_KEY);
      if (raw) viewTimestamps = JSON.parse(raw);
    } catch {
      viewTimestamps = [];
    }
  }

  // Asegurar que si hay participaciones pero pocas vistas registradas, se sincronice
  const totalViews = Math.max(viewTimestamps.length, history.length);

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfTodayMs = startOfToday.getTime();

  const viewsToday = viewTimestamps.filter((t) => t >= startOfTodayMs).length;
  const viewsThisWeek = viewTimestamps.filter((t) => t >= now - sevenDaysMs).length;
  const viewsThisMonth = viewTimestamps.filter((t) => t >= now - thirtyDaysMs).length;

  // 2. Transacciones y canjes del mes
  // Si no tienen timestamp explícito, usamos la fecha wonAt o asumimos los últimos registros
  const prizesThisMonth = history.filter((p) => {
    if (p.createdAt) return p.createdAt >= now - thirtyDaysMs;
    return true; // Si es sesión actual, entra en el mes
  });

  const redeemedThisMonth = prizesThisMonth.filter((p) => p.status === "UTILIZADO").length;
  const totalPlaysThisMonth = Math.max(prizesThisMonth.length, 1);
  const conversionRate = prizesThisMonth.length > 0 
    ? Math.round((redeemedThisMonth / prizesThisMonth.length) * 100) 
    : 0;

  // 3. Distribución por días de la semana y "Mejor Día"
  const dayNames = [
    { name: "Domingo", short: "Dom" },
    { name: "Lunes", short: "Lun" },
    { name: "Martes", short: "Mar" },
    { name: "Miércoles", short: "Mié" },
    { name: "Jueves", short: "Jue" },
    { name: "Viernes", short: "Vie" },
    { name: "Sábado", short: "Sáb" },
  ];

  const countsByDay = [0, 0, 0, 0, 0, 0, 0];

  // Contabilizar fechas de participaciones
  history.forEach((prize) => {
    const timestamp = prize.createdAt || now;
    const dayIndex = new Date(timestamp).getDay();
    countsByDay[dayIndex] = (countsByDay[dayIndex] ?? 0) + 1;
  });

  // Si aún no hay participaciones, usar las vistas registradas
  if (history.length === 0 && viewTimestamps.length > 0) {
    viewTimestamps.forEach((ts) => {
      const dayIndex = new Date(ts).getDay();
      countsByDay[dayIndex] = (countsByDay[dayIndex] ?? 0) + 1;
    });
  }

  const maxCount = Math.max(...countsByDay);
  const bestDayIndex = countsByDay.indexOf(maxCount);
  const totalActivity = countsByDay.reduce((a, b) => a + b, 0);

  const dayDistribution: DayDistribution[] = dayNames.map((d, index) => {
    const count = countsByDay[index] ?? 0;
    const percentage = totalActivity > 0 ? Math.round((count / totalActivity) * 100) : 0;
    return {
      dayName: d.name,
      dayShort: d.short,
      count,
      percentage,
    };
  });

  const bestDayName = totalActivity > 0 && dayNames[bestDayIndex]
    ? dayNames[bestDayIndex].name 
    : "Sin datos aún";

  return {
    views: {
      today: Math.max(viewsToday, 1),
      thisWeek: Math.max(viewsThisWeek, viewsToday, 1),
      thisMonth: Math.max(viewsThisMonth, viewsThisWeek, 1),
      total: Math.max(totalViews, 1),
    },
    transactions: {
      totalThisMonth: prizesThisMonth.length,
      redeemedThisMonth,
      conversionRate,
    },
    timing: {
      bestDay: bestDayName,
      bestDayCount: maxCount,
      dayDistribution,
    },
  };
}
