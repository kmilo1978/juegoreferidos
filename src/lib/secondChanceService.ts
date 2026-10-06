import {
  SecondChanceConfig,
  DEFAULT_SECOND_CHANCE_CONFIG,
  PrecisionDifficulty,
} from "../components/qr-game/gameTypes";
import { DIFFICULTY_SETTINGS } from "./gameConfigService";
import { apiUrl, getAuthToken } from "./apiClient";

const STORAGE_KEY = "juegoreferidos_second_chance_config";
const BACKEND_URL = apiUrl("/second-chance-config");

export class SecondChanceService {
  /**
   * Obtiene la configuración de Segunda Oportunidad actual
   */
  static getSecondChanceConfig(): SecondChanceConfig {
    if (typeof window === "undefined") return DEFAULT_SECOND_CHANCE_CONFIG;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...DEFAULT_SECOND_CHANCE_CONFIG, ...parsed };
      }
    } catch (e) {
      console.warn("Error leyendo secondChanceConfig local:", e);
    }

    // Intentar sincronizar en segundo plano con el backend
    this.syncFromBackend();
    return DEFAULT_SECOND_CHANCE_CONFIG;
  }

  /**
   * Sincroniza la configuración desde el backend
   */
  static async syncFromBackend(): Promise<SecondChanceConfig | null> {
    if (typeof window === "undefined") return null;

    try {
      const res = await fetch(BACKEND_URL);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.secondChance) {
          const merged: SecondChanceConfig = {
            ...DEFAULT_SECOND_CHANCE_CONFIG,
            ...data.secondChance,
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          window.dispatchEvent(new CustomEvent("second-chance-config-changed", { detail: merged }));
          return merged;
        }
      }
    } catch {
      // Backend desconectado, operar offline sin interrupciones
    }
    return null;
  }

  /**
   * Guarda y propaga la configuración tanto localmente como al backend
   */
  static saveSecondChanceConfig(config: Partial<SecondChanceConfig>): SecondChanceConfig {
    const current = this.getSecondChanceConfig();
    const updated: SecondChanceConfig = {
      ...current,
      ...config,
    };

    if (config.difficulty && DIFFICULTY_SETTINGS[config.difficulty]) {
      updated.toleranceMs = DIFFICULTY_SETTINGS[config.difficulty].toleranceMs;
    }

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent("second-chance-config-changed", { detail: updated }));
      } catch (e) {
        console.error("Error guardando secondChanceConfig local:", e);
      }

      // Enviar al servidor en segundo plano (endpoint protegido: requiere token)
      const token = getAuthToken();
      fetch(BACKEND_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ secondChance: updated }),
      }).catch(() => {});
    }

    return updated;
  }
}
