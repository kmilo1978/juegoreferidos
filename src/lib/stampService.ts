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
  totalRequired: number; // Configurable: 6, 8, 10, 12, 15, etc.
  mode: number;
  rewardTitle: string;
  nextReward: StampReward | null;
  unlockedRewards: StampReward[];
  isRewardUnlocked: boolean;
  historyVisits: string[];
}

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
   * Obtiene el número total de sellos configurados (ej: 6, 8, 10, 12, 15)
   */
  static getTotalRequired(): number {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("juegoreferidos_stamp_total");
        if (stored) {
          const num = parseInt(stored, 10);
          if (num > 0) return num;
        }
      } catch {}
    }
    return 15;
  }

  static setTotalRequired(total: number): void {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("juegoreferidos_stamp_total", String(total));
      } catch {}
    }
  }

  /**
   * Compatibilidad con getGlobalMode
   */
  static getGlobalMode(): number {
    return this.getTotalRequired();
  }

  static setGlobalMode(mode?: number): void {
    if (mode && mode > 0) {
      this.setTotalRequired(mode);
    }
  }

  /**
   * Obtiene la lista completa de hitos con premios
   */
  static getMilestoneRewards(): StampReward[] {
    const rewards = this.getStampRewards();
    return Array.isArray(rewards) && rewards.length > 0 ? rewards : STAMP_MILESTONES_3;
  }

  /**
   * Indica si un sello específico es un hito con premio
   */
  static isPrizeStamp(stampNumber: number): boolean {
    const prizes = this.getMilestoneRewards();
    return prizes.some((p) => p.stamp === stampNumber);
  }

  /**
   * Obtiene el premio asignado a un sello específico
   */
  static getRewardForStamp(stampNumber: number): StampReward | null {
    const prizes = this.getMilestoneRewards();
    return prizes.find((p) => p.stamp === stampNumber) || null;
  }

  /**
   * Obtiene el próximo hito a alcanzar y los sellos restantes
   */
  static getNextMilestone(currentStamps: number) {
    const milestones = [...this.getMilestoneRewards()].sort((a, b) => a.stamp - b.stamp);
    const next = milestones.find((m) => m.stamp > currentStamps);

    if (next) {
      return {
        targetStamp: next.stamp,
        remaining: Math.max(0, next.stamp - currentStamps),
        milestoneNumber: milestones.indexOf(next) + 1,
        reward: next,
      };
    }

    const last = milestones[milestones.length - 1] || STAMP_MILESTONES_3[2];
    return {
      targetStamp: last.stamp,
      remaining: 0,
      milestoneNumber: milestones.length,
      reward: last,
    };
  }

  /**
   * Obtiene el estado actual de sellos y recompensas del cliente
   */
  static getCustomerStampCard(whatsapp: string): StampCardState {
    const totalRequired = this.getTotalRequired();
    const milestones = this.getMilestoneRewards();

    if (typeof window === "undefined") {
      const first = milestones[0] || STAMP_MILESTONES_3[0];
      return {
        currentStamps: 1,
        totalRequired,
        mode: totalRequired,
        rewardTitle: first.title,
        nextReward: first,
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

    const isRewardUnlocked = currentStamps >= totalRequired;
    const nextMilestone = this.getNextMilestone(currentStamps);
    const unlockedRewards = milestones.filter((m) => currentStamps >= m.stamp);

    return {
      currentStamps,
      totalRequired,
      mode: totalRequired,
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
    const totalRequired = this.getTotalRequired();
    const current = this.getCustomerStampCard(whatsapp);
    const multiplier = countOverride ?? this.getStampMultiplier();
    const newCount = Math.min(totalRequired, current.currentStamps + multiplier);
    const today = new Date().toLocaleDateString("es-CO");
    const milestones = this.getMilestoneRewards();

    const isRewardUnlocked = newCount >= totalRequired;
    const currentReward = this.getRewardForStamp(newCount);
    const nextMilestone = this.getNextMilestone(newCount);
    const unlockedRewards = milestones.filter((m) => newCount >= m.stamp);

    const updated: StampCardState = {
      currentStamps: newCount,
      totalRequired,
      mode: totalRequired,
      rewardTitle: currentReward ? currentReward.title : nextMilestone.reward.title,
      nextReward: nextMilestone.reward,
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
   * Fija el conteo de sellos recibido del BACKEND (fuente de verdad) y
   * lo cachea en localStorage. Devuelve el StampCardState resultante.
   * Se usa para que la UI refleje siempre el total autoritativo del servidor.
   */
  static applyServerStamps(whatsapp: string, serverStamps: number): StampCardState {
    const totalRequired = this.getTotalRequired();
    const milestones = this.getMilestoneRewards();
    const currentStamps = Math.max(0, Math.min(totalRequired, Number(serverStamps) || 0));

    const isRewardUnlocked = currentStamps >= totalRequired;
    const nextMilestone = this.getNextMilestone(currentStamps);
    const unlockedRewards = milestones.filter((m) => currentStamps >= m.stamp);

    const state: StampCardState = {
      currentStamps,
      totalRequired,
      mode: totalRequired,
      rewardTitle: nextMilestone.reward.title,
      nextReward: nextMilestone.reward,
      unlockedRewards,
      isRewardUnlocked,
      historyVisits: [new Date().toLocaleDateString("es-CO")],
    };

    if (typeof window !== "undefined") {
      try {
        // Preservar historial previo si existe
        const prev = localStorage.getItem(this.getKey(whatsapp));
        if (prev) {
          const parsed = JSON.parse(prev);
          if (Array.isArray(parsed.historyVisits)) {
            state.historyVisits = parsed.historyVisits;
          }
        }
        localStorage.setItem(this.getKey(whatsapp), JSON.stringify(state));
      } catch {
        /* ignore */
      }
    }

    return state;
  }

  /**
   * Canjea el premio de sellos y reinicia el ciclo para la siguiente tarjeta
   */
  static resetAfterRedemption(whatsapp: string): StampCardState {
    const totalRequired = this.getTotalRequired();
    const milestones = this.getMilestoneRewards();
    const firstReward = milestones[0] || STAMP_MILESTONES_3[0];

    const resetState: StampCardState = {
      currentStamps: 0,
      totalRequired,
      mode: totalRequired,
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
