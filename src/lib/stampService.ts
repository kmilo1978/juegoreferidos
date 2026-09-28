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
  { stamp: 5, title: "🎁 HITO 1: Porción de Torta Artesanal", description: "Cualquier porción de la vitrina pastelera del día por tus 5 visitas", category: "postre", icon: "🍰", highlight: true },
  { stamp: 6, title: "Bebida Fría o Frappé de Autor", description: "Frappé moka, té frío infusionado o soda saborizada", category: "bebida", icon: "🥤" },
  { stamp: 7, title: "Toast de Masa Madre Gourmet", description: "Tostada con aguacate fresco, queso o mantequilla trufada", category: "panaderia", icon: "🥪" },
  { stamp: 8, title: "Bono de 20% en tu Factura de Hoy", description: "Descuento aplicable a todo tu consumo en mesa", category: "descuento", icon: "🎟️" },
  { stamp: 9, title: "Caja de 4 Trufas de Chocolate Belga", description: "Empaque especial con trufas artesanales premium", category: "postre", icon: "🍫" },
  { stamp: 10, title: "👑 HITO 2: Brunch Completo de Autor", description: "Plato de brunch a elección con bebida de autor por tus 10 visitas", category: "vip", icon: "👑", highlight: true },
  { stamp: 11, title: "Dúo de Cupcakes de Autor para Llevar", description: "Pastelería fina empacada para disfrutar en casa", category: "postre", icon: "🧁" },
  { stamp: 12, title: "Método de Filtrado V60 o Prensa Francesa", description: "Preparación artesanal en mesa con café de origen", category: "bebida", icon: "☕" },
  { stamp: 13, title: "Bono de 25% en tu Cuenta Total", description: "Descuento exclusivo en el consumo de toda la mesa", category: "descuento", icon: "🏷️" },
  { stamp: 14, title: "Torta Mediana para Compartir", description: "Torta artesanal para llevar a casa o celebrar", category: "postre", icon: "🎂" },
  { stamp: 15, title: "🌟 HITO 3: Experiencia VIP Degustación para 2", description: "Menú degustación de autor completo para dos personas con atención VIP", category: "vip", icon: "🌟", highlight: true },
];

export interface StampCardState {
  currentStamps: number;
  totalRequired: number; // Siempre 15 sellos fijos
  mode: 15;
  rewardTitle: string;
  nextReward: StampReward;
  unlockedRewards: StampReward[];
  isRewardUnlocked: boolean;
  historyVisits: string[];
}

const DEFAULT_STAMP_MODE: 15 = 15;

export class StampService {
  private static getKey(whatsapp: string): string {
    const clean = whatsapp.replace(/\D/g, "") || "generic";
    return `juegoreferidos_stamps_${clean}`;
  }

  private static getGlobalModeKey(): string {
    return "juegoreferidos_stamp_mode_setting";
  }

  private static getRewardsKey(): string {
    return "juegoreferidos_custom_stamp_rewards";
  }

  /**
   * Obtiene la lista completa de recompensas de sellos (personalizadas o por defecto)
   */
  static getStampRewards(): StampReward[] {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(this.getRewardsKey());
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch {
        // ignore
      }
    }
    return STAMP_REWARDS_15;
  }

  /**
   * Guarda recompensas de sellos personalizadas
   */
  static saveStampRewards(rewards: StampReward[]): void {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(this.getRewardsKey(), JSON.stringify(rewards));
      } catch {
        // ignore
      }
    }
  }

  /**
   * Restablece las recompensas a los valores gastronómicos originales
   */
  static resetStampRewardsToDefault(): StampReward[] {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(this.getRewardsKey());
      } catch {
        // ignore
      }
    }
    return STAMP_REWARDS_15;
  }

  /**
   * Detecta si la hora actual está dentro de la Hora Feliz / Horas Muertas (3:00 PM a 6:00 PM)
   */
  static isHappyHour(): boolean {
    const hour = new Date().getHours();
    return hour >= 15 && hour < 18; // 15:00 a 17:59 (3 PM a 6 PM)
  }

  /**
   * Multiplicador de sellos: 2 en Hora Feliz (3 PM a 6 PM), 1 en horario habitual
   */
  static getStampMultiplier(): number {
    return this.isHappyHour() ? 2 : 1;
  }

  /**
   * Obtiene la modalidad configurada (Siempre 15 sellos fijos)
   */
  static getGlobalMode(): 15 {
    return 15;
  }

  /**
   * Mantiene compatibilidad: la modalidad está fija en 15 sellos con 3 hitos cada 5 visitas
   */
  static setGlobalMode(_mode?: number): void {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(this.getGlobalModeKey(), "15");
      } catch {
        // ignore
      }
    }
  }

  /**
   * Obtiene los 3 grandes hitos cada 5 visitas (Sello 5, 10 y 15)
   */
  static getMilestoneRewards(): StampReward[] {
    const rewards = this.getStampRewards();
    return [
      rewards[4] || STAMP_REWARDS_15[4],
      rewards[9] || STAMP_REWARDS_15[9],
      rewards[14] || STAMP_REWARDS_15[14],
    ];
  }

  /**
   * Obtiene el próximo hito a alcanzar (Sello 5, 10 o 15) y los sellos restantes
   */
  static getNextMilestone(currentStamps: number) {
    const milestones = this.getMilestoneRewards();
    if (currentStamps < 5) {
      return {
        targetStamp: 5,
        remaining: 5 - currentStamps,
        milestoneNumber: 1,
        reward: milestones[0],
      };
    }
    if (currentStamps < 10) {
      return {
        targetStamp: 10,
        remaining: 10 - currentStamps,
        milestoneNumber: 2,
        reward: milestones[1],
      };
    }
    if (currentStamps < 15) {
      return {
        targetStamp: 15,
        remaining: 15 - currentStamps,
        milestoneNumber: 3,
        reward: milestones[2],
      };
    }
    return {
      targetStamp: 15,
      remaining: 0,
      milestoneNumber: 3,
      reward: milestones[2],
    };
  }

  /**
   * Obtiene el premio correspondiente a un sello específico
   */
  static getRewardForStamp(stampNumber: number): StampReward {
    const rewards = this.getStampRewards();
    const index = Math.max(1, Math.min(rewards.length, stampNumber)) - 1;
    return rewards[index] || rewards[0] || STAMP_REWARDS_15[0];
  }

  /**
   * Obtiene el estado actual de sellos y recompensas del cliente
   */
  static getCustomerStampCard(whatsapp: string): StampCardState {
    const activeMode = this.getGlobalMode();
    const rewards = this.getStampRewards();
    const fallbackReward = this.getRewardForStamp(activeMode);

    if (typeof window === "undefined") {
      return {
        currentStamps: 1,
        totalRequired: activeMode,
        mode: activeMode,
        rewardTitle: fallbackReward.title,
        nextReward: this.getRewardForStamp(2),
        unlockedRewards: [rewards[0]],
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
    const unlockedRewards = rewards.slice(0, Math.min(currentStamps, totalRequired));

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
   * Agrega sellos al validar con el PIN del cajero.
   * Aplica automáticamente el multiplicador de sellos dobles (x2) en Horas Muertas (3 PM - 6 PM).
   */
  static addStamp(whatsapp: string, countOverride?: number): StampCardState & { addedCount: number; isHappyHour: boolean } {
    const activeMode = this.getGlobalMode();
    const current = this.getCustomerStampCard(whatsapp);
    const multiplier = countOverride ?? this.getStampMultiplier();
    const newCount = Math.min(activeMode, current.currentStamps + multiplier);
    const today = new Date().toLocaleDateString("es-CO");
    const rewards = this.getStampRewards();

    const isRewardUnlocked = newCount >= activeMode;
    const currentReward = this.getRewardForStamp(newCount);
    const nextReward = this.getRewardForStamp(Math.min(newCount + 1, activeMode));
    const unlockedRewards = rewards.slice(0, newCount);

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

    return {
      ...updated,
      addedCount: multiplier,
      isHappyHour: this.isHappyHour(),
    };
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
