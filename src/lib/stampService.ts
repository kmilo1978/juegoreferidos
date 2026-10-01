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

export interface StampReward {
  stamp: number; // 5, 10 o 15
  title: string;
  description: string;
  category: "bebida" | "panaderia" | "postre" | "descuento" | "vip";
  icon: string;
  highlight?: boolean;
}

export const STAMP_MILESTONES_3: StampReward[] = [
  {
    stamp: 5,
    title: "🎁 Premio Sello 5: Porción de Torta Artesanal",
    description: "Cualquier porción de la vitrina pastelera de la casa por tus 5 visitas.",
    category: "postre",
    icon: "🍰",
    highlight: true,
  },
  {
    stamp: 10,
    title: "👑 Premio Sello 10: Brunch Completo de Autor",
    description: "Plato de brunch o especialidad a elección con bebida de autor por tus 10 visitas.",
    category: "vip",
    icon: "👑",
    highlight: true,
  },
  {
    stamp: 15,
    title: "🌟 Gran Premio Sello 15: Menú Degustación para 2",
    description: "Experiencia gastronómica VIP de autor para 2 personas con atención de la casa.",
    category: "vip",
    icon: "🌟",
    highlight: true,
  },
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
    return "juegoreferidos_custom_milestone_prizes_v2";
  }

  private static getVisitIconKey(): string {
    return "juegoreferidos_custom_visit_icon";
  }

  /**
   * Obtiene el icono configurado para los sellos de visita intermedia (ej: ☕, 🥐, 🍪, 🍔, 🍕, etc.)
   */
  static getVisitIcon(): string {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(this.getVisitIconKey());
        if (stored) return stored;
      } catch {
        // ignore
      }
    }
    return "☕";
  }

  /**
   * Guarda el icono de sellos de visita intermedia
   */
  static setVisitIcon(icon: string): void {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(this.getVisitIconKey(), icon);
      } catch {
        // ignore
      }
    }
  }

  /**
   * Obtiene los 3 grandes premios (Sellos 5, 10 y 15)
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
    return STAMP_MILESTONES_3;
  }

  /**
   * Guarda los premios personalizados de los sellos 5, 10 y 15
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
   * Restablece los premios a los 3 hitos originales
   */
  static resetStampRewardsToDefault(): StampReward[] {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(this.getRewardsKey());
      } catch {
        // ignore
      }
    }
    return STAMP_MILESTONES_3;
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
   * Obtiene los 3 grandes premios cada 5 visitas (Sello 5, 10 y 15)
   */
  static getMilestoneRewards(): StampReward[] {
    const rewards = this.getStampRewards();
    return [
      rewards[0] || STAMP_MILESTONES_3[0],
      rewards[1] || STAMP_MILESTONES_3[1],
      rewards[2] || STAMP_MILESTONES_3[2],
    ];
  }

  /**
   * Indica si un sello específico es un hito con premio (5, 10 o 15)
   */
  static isPrizeStamp(stampNumber: number): boolean {
    return stampNumber === 5 || stampNumber === 10 || stampNumber === 15;
  }

  /**
   * Obtiene el premio si es sello 5, 10 o 15. Si es de visita (1-4, etc.) devuelve null.
   */
  static getRewardForStamp(stampNumber: number): StampReward | null {
    const prizes = this.getMilestoneRewards();
    if (stampNumber === 5) return prizes[0];
    if (stampNumber === 10) return prizes[1];
    if (stampNumber === 15) return prizes[2];
    return null;
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
   * Obtiene el estado actual de sellos y recompensas del cliente
   */
  static getCustomerStampCard(whatsapp: string): StampCardState {
    const activeMode = 15;
    const milestones = this.getMilestoneRewards();

    if (typeof window === "undefined") {
      return {
        currentStamps: 1,
        totalRequired: 15,
        mode: 15,
        rewardTitle: milestones[0].title,
        nextReward: milestones[0],
        unlockedRewards: [],
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

    const totalRequired = 15;
    const isRewardUnlocked = currentStamps >= totalRequired;
    const nextMilestone = this.getNextMilestone(currentStamps);
    const unlockedRewards = milestones.filter((m) => currentStamps >= m.stamp);

    return {
      currentStamps,
      totalRequired,
      mode: 15,
      rewardTitle: nextMilestone.reward.title,
      nextReward: nextMilestone.reward,
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
    const firstReward = STAMP_MILESTONES_3[0];

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
