/**
 * FUENTE ÚNICA DE VERDAD de los pasos del embudo (funnel) del comensal.
 *
 * Antes existían tres conjuntos de ids distintos (App.tsx, GameMode.tsx y
 * FunnelSequenceService), por lo que activar/desactivar un paso en el panel
 * no se reflejaba en la app. Este módulo centraliza los ids canónicos y el
 * metadato de cada paso para que todos los sistemas hablen el mismo idioma.
 *
 * REGLA: cualquier parte del sistema que necesite referirse a un paso DEBE
 * usar estos ids (FUNNEL_STEP_IDS) y nunca strings sueltos.
 */

export type FunnelStepId =
  | "step_user_data"
  | "step_instagram"
  | "step_game"
  | "step_voucher"
  | "step_feedback"
  | "step_second_chance"
  | "step_stamps"
  | "step_missions";

export interface FunnelStepMeta {
  /** Id canónico del paso (única clave válida en todo el sistema). */
  id: FunnelStepId;
  /** Número de paso por defecto en la app del comensal (currentStep 1..8). */
  stepNumber: number;
  /** Nombre legible mostrado en paneles. */
  name: string;
  /** Etiqueta corta para chips/barras compactas. */
  shortLabel: string;
  /** Descripción para el checklist del panel. */
  description: string;
  /** Categoría temática. */
  category: "captacion" | "juego" | "recompensa" | "fidelizacion";
  /** Nombre del icono (lucide-react) usado en los paneles. */
  iconName: string;
  /** Emoji usado por el checklist clásico de GameMode. */
  emoji: string;
  /**
   * Si es false, el paso NO se puede desactivar (es el corazón del embudo).
   * Hoy solo el minijuego central (step_game) y el registro (step_user_data).
   */
  canDisable: boolean;
}

/**
 * Catálogo canónico de pasos, en orden por defecto.
 * Reemplaza a los módulos fantasma anteriores (step_dice, step_betting) que no
 * renderizaban nada en la app.
 */
export const FUNNEL_STEPS: FunnelStepMeta[] = [
  {
    id: "step_user_data",
    stepNumber: 1,
    name: "Registro del Comensal",
    shortLabel: "Datos",
    description:
      "Captación de Nombre, WhatsApp y Fecha de Cumpleaños para tu base de datos y los primeros sellos.",
    category: "captacion",
    iconName: "Users",
    emoji: "👤",
    canDisable: false, // Sin registro no hay comensal: paso base
  },
  {
    id: "step_instagram",
    stepNumber: 2,
    name: "Validación Social en Redes",
    shortLabel: "Social",
    description:
      "Seguimiento en Instagram o subida de historia etiquetando tu cuenta oficial.",
    category: "captacion",
    iconName: "Sparkles",
    emoji: "📸",
    canDisable: true,
  },
  {
    id: "step_game",
    stepNumber: 3,
    name: "Minijuego en Vivo de Mesa",
    shortLabel: "Juego",
    description:
      "La dinámica interactiva seleccionada (Jackpot, Plinko, Ruleta, Memoria, Raspa o Pick & Win).",
    category: "juego",
    iconName: "Gamepad2",
    emoji: "🎰",
    canDisable: false, // El juego central es el corazón del embudo
  },
  {
    id: "step_voucher",
    stepNumber: 4,
    name: "Voucher Digital & Código de Canje",
    shortLabel: "Voucher",
    description:
      "Entrega del premio ganado con código único y validación de seguridad con PIN de caja.",
    category: "recompensa",
    iconName: "Gift",
    emoji: "🎁",
    canDisable: true,
  },
  {
    id: "step_feedback",
    stepNumber: 5,
    name: "Embudo de Calificación & Reputación",
    shortLabel: "Reseña",
    description:
      "Filtro inteligente: 1-3★ van a WhatsApp privado de gerencia; 4-5★ a Google Maps.",
    category: "fidelizacion",
    iconName: "Star",
    emoji: "⭐",
    canDisable: true,
  },
  {
    id: "step_second_chance",
    stepNumber: 6,
    name: "2ª Oportunidad — Reto de Precisión 10s",
    shortLabel: "2ª Op.",
    description:
      "Si el comensal no ganó, revancha deteniendo el cronómetro exactamente en 10.00s.",
    category: "juego",
    iconName: "Timer",
    emoji: "⏱️",
    canDisable: true,
  },
  {
    id: "step_stamps",
    stepNumber: 7,
    name: "Pasaporte VIP de 15 Sellos",
    shortLabel: "Sellos",
    description:
      "Tarjeta de fidelización digital de 15 visitas para incentivar la recurrencia.",
    category: "fidelizacion",
    iconName: "Award",
    emoji: "🎟️",
    canDisable: true,
  },
  {
    id: "step_missions",
    stepNumber: 8,
    name: "Misiones de Embajador VIP",
    shortLabel: "Misiones",
    description:
      "Retos de recomendación boca a boca (TikTok, Google Maps, traer amigos).",
    category: "fidelizacion",
    iconName: "Target",
    emoji: "🎯",
    canDisable: true,
  },
];

/** Lista plana de ids canónicos, en orden. */
export const FUNNEL_STEP_IDS: FunnelStepId[] = FUNNEL_STEPS.map((s) => s.id);

/** Ids que no se pueden desactivar (siempre activos). */
export const REQUIRED_STEP_IDS: FunnelStepId[] = FUNNEL_STEPS.filter(
  (s) => !s.canDisable
).map((s) => s.id);

/** Búsqueda rápida de metadato por id. */
export const FUNNEL_STEP_BY_ID: Record<string, FunnelStepMeta> = Object.fromEntries(
  FUNNEL_STEPS.map((s) => [s.id, s])
);

/** Mapa de id canónico → número de paso en la app (currentStep). */
export const STEP_NUMBER_BY_ID: Record<string, number> = Object.fromEntries(
  FUNNEL_STEPS.map((s) => [s.id, s.stepNumber])
);

/**
 * Compatibilidad hacia atrás: ids antiguos → id canónico.
 * Permite leer configuraciones ya guardadas en localStorage/backend con los
 * nombres viejos sin perder la selección del usuario.
 */
export const LEGACY_STEP_ID_MAP: Record<string, FunnelStepId> = {
  // GameMode.tsx (checklist clásico)
  step_register: "step_user_data",
  step_social: "step_instagram",
  step_roulette: "step_game",
  step_precision: "step_second_chance",
  // FunnelSequenceService ya usaba los canónicos; se incluyen por robustez
  step_user_data: "step_user_data",
  step_instagram: "step_instagram",
  step_game: "step_game",
  step_voucher: "step_voucher",
  step_feedback: "step_feedback",
  step_second_chance: "step_second_chance",
  step_stamps: "step_stamps",
  step_missions: "step_missions",
};

/**
 * Normaliza una lista de ids (posiblemente antiguos o con fantasmas) a la lista
 * de ids canónicos válidos, sin duplicados y descartando los desconocidos
 * (p. ej. los antiguos step_dice / step_betting que ya no existen).
 */
export function normalizeActiveStepIds(ids: string[] | undefined | null): FunnelStepId[] {
  if (!Array.isArray(ids)) return [...FUNNEL_STEP_IDS];
  const result = new Set<FunnelStepId>();
  for (const raw of ids) {
    const canonical = LEGACY_STEP_ID_MAP[raw];
    if (canonical) result.add(canonical);
  }
  // Los pasos obligatorios siempre están activos
  for (const req of REQUIRED_STEP_IDS) result.add(req);
  // Devolver en el orden canónico
  return FUNNEL_STEP_IDS.filter((id) => result.has(id));
}
