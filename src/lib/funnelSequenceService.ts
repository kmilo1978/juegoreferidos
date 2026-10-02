/**
 * Servicio Gestor de Secuencia Modular del Embudo y Juegos
 * Permite ordenar los pasos (mover arriba/abajo), activarlos/desactivarlos
 * y sincronizar la experiencia tanto en el simulador como en los teléfonos de los comensales.
 */

export interface FunnelStepItem {
  id: string;
  name: string;
  shortLabel: string;
  description: string;
  category: "captacion" | "juego" | "recompensa" | "fidelizacion";
  iconName: string;
  enabled: boolean;
  canDisable?: boolean;
}

export const DEFAULT_FUNNEL_STEPS: FunnelStepItem[] = [
  {
    id: "step_user_data",
    name: "Registro de Comensal",
    shortLabel: "Datos",
    description: "Captación de Nombre, WhatsApp y Fecha de Cumpleaños para tu base de datos.",
    category: "captacion",
    iconName: "Users",
    enabled: true,
    canDisable: true,
  },
  {
    id: "step_instagram",
    name: "Validación Social en Redes",
    shortLabel: "Social",
    description: "Seguimiento en Instagram o subida de historia mencionando tu cuenta oficial.",
    category: "captacion",
    iconName: "Sparkles",
    enabled: true,
    canDisable: true,
  },
  {
    id: "step_game",
    name: "Minijuego en Vivo de Mesa",
    shortLabel: "Juego",
    description: "La dinámica interactiva seleccionada (Jackpot, Ruleta, Memoria, Raspa o Pick & Win).",
    category: "juego",
    iconName: "Gamepad2",
    enabled: true,
    canDisable: false, // El juego central es el corazón del embudo
  },
  {
    id: "step_voucher",
    name: "Voucher Digital & Código de Canje",
    shortLabel: "Voucher",
    description: "Entrega del premio ganado con código QR y validación de seguridad con PIN de caja.",
    category: "recompensa",
    iconName: "Gift",
    enabled: true,
    canDisable: true,
  },
  {
    id: "step_feedback",
    name: "Embudo de Calificación & Reputación",
    shortLabel: "Reseña",
    description: "Filtro inteligente: 1-3★ van a WhatsApp privado de gerencia; 4-5★ a Google Maps.",
    category: "fidelizacion",
    iconName: "Star",
    enabled: true,
    canDisable: true,
  },
  {
    id: "step_second_chance",
    name: "2ª Oportunidad Viral (Revancha)",
    shortLabel: "2ª Op.",
    description: "Si el comensal no ganó, se le ofrece una revancha compartiendo en WhatsApp.",
    category: "juego",
    iconName: "Share2",
    enabled: true,
    canDisable: true,
  },
  {
    id: "step_stamps",
    name: "Pasaporte VIP de 15 Sellos",
    shortLabel: "Sellos",
    description: "Tarjeta de fidelización digital de 15 visitas para incentivar la recurrencia.",
    category: "fidelizacion",
    iconName: "Award",
    enabled: true,
    canDisable: true,
  },
  {
    id: "step_missions",
    name: "Misiones de Embajador VIP",
    shortLabel: "Misiones",
    description: "Retos de recomendación boca a boca (TikTok, Google Maps, traer amigos).",
    category: "fidelizacion",
    iconName: "Target",
    enabled: true,
    canDisable: true,
  },
];

const STORAGE_KEY = "juegoreferidos_funnel_sequence";

export class FunnelSequenceService {
  static getSequence(): FunnelStepItem[] {
    if (typeof window === "undefined") return DEFAULT_FUNNEL_STEPS;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as FunnelStepItem[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Asegurar que todos los pasos por defecto estén presentes
          const existingIds = new Set(parsed.map((p) => p.id));
          const missing = DEFAULT_FUNNEL_STEPS.filter((d) => !existingIds.has(d.id));
          return [...parsed, ...missing];
        }
      }
    } catch {}
    return DEFAULT_FUNNEL_STEPS;
  }

  static saveSequence(steps: FunnelStepItem[]) {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(steps));
      window.dispatchEvent(new CustomEvent("funnel-sequence-changed", { detail: steps }));
    }
  }

  static moveUp(index: number, steps: FunnelStepItem[]): FunnelStepItem[] {
    if (index <= 0) return steps;
    const next = [...steps];
    const temp = next[index - 1];
    next[index - 1] = next[index];
    next[index] = temp;
    this.saveSequence(next);
    return next;
  }

  static moveDown(index: number, steps: FunnelStepItem[]): FunnelStepItem[] {
    if (index >= steps.length - 1) return steps;
    const next = [...steps];
    const temp = next[index + 1];
    next[index + 1] = next[index];
    next[index] = temp;
    this.saveSequence(next);
    return next;
  }

  static toggleStep(id: string, steps: FunnelStepItem[]): FunnelStepItem[] {
    const next = steps.map((s) => (s.id === id && s.canDisable !== false ? { ...s, enabled: !s.enabled } : s));
    this.saveSequence(next);
    return next;
  }

  static resetDefault(): FunnelStepItem[] {
    this.saveSequence(DEFAULT_FUNNEL_STEPS);
    return DEFAULT_FUNNEL_STEPS;
  }
}
