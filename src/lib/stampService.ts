/**
 * SERVICIO DE TARJETA DE SELLOS DIGITALES (DIGITAL STAMP CARD)
 * Controla la acumulación de visitas de clientes con el PIN del cajero
 */

export interface StampCardState {
  currentStamps: number;
  totalRequired: number;
  rewardTitle: string;
  isRewardUnlocked: boolean;
  historyVisits: string[];
}

const DEFAULT_REQUIRED_STAMPS = 5;
const DEFAULT_REWARD = "¡Postre o Café de Especialidad Gratis!";

export class StampService {
  private static getKey(whatsapp: string): string {
    const clean = whatsapp.replace(/\D/g, "") || "generic";
    return `juegoreferidos_stamps_${clean}`;
  }

  /**
   * Obtiene el estado actual de sellos del cliente
   */
  static getCustomerStampCard(whatsapp: string): StampCardState {
    if (typeof window === "undefined") {
      return {
        currentStamps: 1,
        totalRequired: DEFAULT_REQUIRED_STAMPS,
        rewardTitle: DEFAULT_REWARD,
        isRewardUnlocked: false,
        historyVisits: [],
      };
    }

    try {
      const stored = localStorage.getItem(this.getKey(whatsapp));
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          currentStamps: parsed.currentStamps || 1,
          totalRequired: parsed.totalRequired || DEFAULT_REQUIRED_STAMPS,
          rewardTitle: parsed.rewardTitle || DEFAULT_REWARD,
          isRewardUnlocked: (parsed.currentStamps || 1) >= (parsed.totalRequired || DEFAULT_REQUIRED_STAMPS),
          historyVisits: parsed.historyVisits || [],
        };
      }
    } catch {
      // ignore
    }

    return {
      currentStamps: 1, // Su primera visita activa
      totalRequired: DEFAULT_REQUIRED_STAMPS,
      rewardTitle: DEFAULT_REWARD,
      isRewardUnlocked: false,
      historyVisits: [new Date().toLocaleDateString("es-CO")],
    };
  }

  /**
   * Agrega un sello al validar con el PIN del cajero
   */
  static addStamp(whatsapp: string): StampCardState {
    const current = this.getCustomerStampCard(whatsapp);
    const newCount = Math.min(current.totalRequired, current.currentStamps + 1);
    const today = new Date().toLocaleDateString("es-CO");

    const updated: StampCardState = {
      ...current,
      currentStamps: newCount,
      isRewardUnlocked: newCount >= current.totalRequired,
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
    const resetState: StampCardState = {
      currentStamps: 0,
      totalRequired: DEFAULT_REQUIRED_STAMPS,
      rewardTitle: DEFAULT_REWARD,
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
