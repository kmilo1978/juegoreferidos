/**
 * ============================================================================
 * SERVICIO DE TARJETA DE SELLOS DIGITALES CON 15 PREMIOS PROGRESIVOS
 * ============================================================================
 * Controla la acumulación de visitas de clientes con el PIN del cajero.
 * Permite modalidades de 10 o 15 sellos, con 15 recompensas progresivas.
 */

export interface StampReward {
  stamp: number;
  title: string;
  description: string;
  category: "bebida" | "panaderia" | "postre" | "descuento" | "vip";
  icon: string;
  highlight?: boolean; // Para hitos especiales como sellos 5, 10 y 15
}

export const STAMP_REWARDS_15: StampReward[] = [
  { stamp: 1, title: "Café Americano de Especialidad", description: "Bebida caliente de bienvenida recién infusionada", category: "bebida", icon: "☕" },
  { stamp: 2, title: "Galleta Artesanal de Pistacho", description: "Galleta horneada con trozos de pistacho y chocolate", category: "panaderia", icon: "🍪" },
  { stamp: 3, title: "Croissant Francés de Mantequilla", description: "Hojaldre clásico crocante elaborado a mano", category: "panaderia", icon: "🥐" },
  { stamp: 4, title: "Upgrade de Leche Vegetal / Topping", description: "Gratis en cualquier café o bebida fría de la casa", category: "bebida", icon: "🥛" },
  { stamp: 5, title: "Porción de Torta Artesanal Bliss Soul", description: "Cualquier porción de la vitrina pastelera del día", category: "postre", icon: "🍰", highlight: true },
  { stamp: 6, title: "Bebida Fría o Frappé de Autor", description: "Frappé moka, té frío infusionado o soda saborizada", category: "bebida", icon: "🥤" },
  { stamp: 7, title: "Toast de Masa Madre Gourmet", description: "Tostada con aguacate fresco, queso o mantequilla trufada", category: "panaderia", icon: "🥪" },
  { stamp: 8, title: "Bono de 20% en tu Factura de Hoy", description: "Descuento aplicable a todo tu consumo en mesa", category: "descuento", icon: "🎟️" },
  { stamp: 9, title: "Caja de 4 Trufas de Chocolate Belga", description: "Empaque especial con trufas artesanales premium", category: "postre", icon: "🍫" },
  { stamp: 10, title: "Brunch Completo Individual", description: "Plato de brunch a elección con bebida y acompañamiento", category: "vip", icon: "👑", highlight: true },
  { stamp: 11, title: "Dúo de Cupcakes de Autor para Llevar", description: "Pastelería fina empacada para disfrutar en casa", category: "postre", icon: "🧁" },
  { stamp: 12, title: "Método de Filtrado V60 o Prensa Francesa", description: "Preparación artesanal en mesa con café de origen", category: "bebida", icon: "☕" },
  { stamp: 13, title: "Bono de 25% en tu Cuenta Total", description: "Descuento exclusivo en el consumo de toda la mesa", category: "descuento", icon: "🏷️" },
  { stamp: 14, title: "Torta Mediana para Compartir", description: "Torta artesanal para llevar a casa o celebrar", category: "postre", icon: "🎂" },
  { stamp: 15, title: "Experiencia VIP: Menú Degustación para 2", description: "Cena o merienda exclusiva de autor para dos personas", category: "vip", icon: "🌟", highlight: true },
];

export interface StampCardState {
  currentStamps: number;
  totalRequired: number; // 10 o 15
  mode: 10 | 15;
  rewardTitle: string;
  nextReward: StampReward;
  unlockedRewards: StampReward[];
  isRewardUnlocked: boolean;
  historyVisits: string[];
}

const DEFAULT_STAMP_MODE: 10 | 15 = 15;

export class StampService {
  private static getKey(whatsapp: string): string {
    const clean = whatsapp.replace(/\D/g, "") || "generic";
    return `juegoreferidos_stamps_${clean}`;
  }

  private static getGlobalModeKey(): string {
    return "juegoreferidos_stamp_mode_setting";
  }

  /**
   * Obtiene la modalidad configurada (10 o 15 sellos)
   */
  static getGlobalMode(): 10 | 15 {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(this.getGlobalModeKey());
        if (stored === "10") return 10;
        if (stored === "15") return 15;
      } catch {
        // ignore
      }
    }
    return DEFAULT_STAMP_MODE;
  }

  /**
   * Cambia la modalidad de la tarjeta (10 o 15 sellos)
   */
  static setGlobalMode(mode: 10 | 15): void {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(this.getGlobalModeKey(), String(mode));
      } catch {
        // ignore
      }
    }
  }

  /**
   * Obtiene el premio correspondiente a un sello específico
   */
  static getRewardForStamp(stampNumber: number): StampReward {
    const index = Math.max(1, Math.min(15, stampNumber)) - 1;
    return STAMP_REWARDS_15[index] || STAMP_REWARDS_15[0];
  }

  /**
   * Obtiene el estado actual de sellos y recompensas del cliente
   */
  static getCustomerStampCard(whatsapp: string): StampCardState {
    const activeMode = this.getGlobalMode();
    const fallbackReward = this.getRewardForStamp(activeMode);

    if (typeof window === "undefined") {
      return {
        currentStamps: 1,
        totalRequired: activeMode,
        mode: activeMode,
        rewardTitle: fallbackReward.title,
        nextReward: this.getRewardForStamp(2),
        unlockedRewards: [STAMP_REWARDS_15[0]],
        isRewardUnlocked: false,
        historyVisits: [],
      };
    }

    let currentStamps = 1;
    let historyVisits = [new Date().toLocaleDateString("es-CO")];

    try {
      const stored = localStorage.getItem(this.getKey(whatsapp));
      if (stored) {
        const parsed = JSON.parse(stored);
        currentStamps = Number(parsed.currentStamps) || 1;
        if (Array.isArray(parsed.historyVisits)) {
          historyVisits = parsed.historyVisits;
        }
      }
    } catch {
      // ignore
    }

    const totalRequired = activeMode;
    const isRewardUnlocked = currentStamps >= totalRequired;
    const currentReward = this.getRewardForStamp(Math.min(currentStamps, totalRequired));
    const nextReward = this.getRewardForStamp(Math.min(currentStamps + 1, totalRequired));
    const unlockedRewards = STAMP_REWARDS_15.slice(0, Math.min(currentStamps, totalRequired));

    return {
      currentStamps,
      totalRequired,
      mode: activeMode,
      rewardTitle: currentReward.title,
      nextReward,
      unlockedRewards,
      isRewardUnlocked,
      historyVisits,
    };
  }

  /**
   * Agrega un sello al validar con el PIN del cajero
   */
  static addStamp(whatsapp: string): StampCardState {
    const activeMode = this.getGlobalMode();
    const current = this.getCustomerStampCard(whatsapp);
    const newCount = Math.min(activeMode, current.currentStamps + 1);
    const today = new Date().toLocaleDateString("es-CO");

    const isRewardUnlocked = newCount >= activeMode;
    const currentReward = this.getRewardForStamp(newCount);
    const nextReward = this.getRewardForStamp(Math.min(newCount + 1, activeMode));
    const unlockedRewards = STAMP_REWARDS_15.slice(0, newCount);

    const updated: StampCardState = {
      currentStamps: newCount,
      totalRequired: activeMode,
      mode: activeMode,
      rewardTitle: currentReward.title,
      nextReward,
      unlockedRewards,
      isRewardUnlocked,
      historyVisits: [today, ...current.historyVisits],
    };

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(this.getKey(whatsapp), JSON.stringify(updated));
      } catch {
        // ignore
      }
    }

    return updated;
  }

  /**
   * Canjea el premio de sellos y reinicia el ciclo para la siguiente tarjeta
   */
  static resetAfterRedemption(whatsapp: string): StampCardState {
    const activeMode = this.getGlobalMode();
    const firstReward = STAMP_REWARDS_15[0];

    const resetState: StampCardState = {
      currentStamps: 0,
      totalRequired: activeMode,
      mode: activeMode,
      rewardTitle: firstReward.title,
      nextReward: firstReward,
      unlockedRewards: [],
      isRewardUnlocked: false,
      historyVisits: [],
    };

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(this.getKey(whatsapp), JSON.stringify(resetState));
      } catch {
        // ignore
      }
    }

    return resetState;
  }
}
