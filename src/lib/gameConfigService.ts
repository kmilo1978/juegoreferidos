import { GameConfig, DEFAULT_GAME_CONFIG, PrecisionDifficulty } from "../components/qr-game/gameTypes";

const STORAGE_KEY = "juegoreferidos_game_config";
const BACKEND_URL = "http://localhost:3001/api/game-config";

export const DIFFICULTY_SETTINGS: Record<PrecisionDifficulty, { label: string; toleranceMs: number; rangeText: string; desc: string }> = {
  facil: {
    label: "Fácil / Amigable",
    toleranceMs: 80,
    rangeText: "9.920s a 10.080s",
    desc: "Margen generoso (±80ms). Alta tasa de ganadores para generar sonrisas inmediatas.",
  },
  medio: {
    label: "Equilibrado (Recomendado)",
    toleranceMs: 40,
    rangeText: "9.960s a 10.040s",
    desc: "Margen estándar (±40ms). Retador y emocionante sin llegar a ser frustrante.",
  },
  dificil: {
    label: "Boutique Experto",
    toleranceMs: 15,
    rangeText: "9.985s a 10.015s",
    desc: "Precisión milimétrica (±15ms). Ideal para eventos especiales y premios exclusivos.",
  },
};

export class GameConfigService {
  /**
   * Obtiene la configuración de juego actual
   */
  static getGameConfig(): GameConfig {
    if (typeof window === "undefined") return DEFAULT_GAME_CONFIG;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...DEFAULT_GAME_CONFIG, ...parsed };
      }
    } catch (e) {
      console.warn("Error leyendo gameConfig local:", e);
    }

    // Intentar sincronizar en segundo plano con el backend
    this.syncFromBackend();
    return DEFAULT_GAME_CONFIG;
  }

  /**
   * Sincroniza la configuración desde el backend
   */
  static async syncFromBackend(): Promise<GameConfig | null> {
    if (typeof window === "undefined") return null;

    try {
      const res = await fetch(BACKEND_URL);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.gameConfig) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data.gameConfig));
          window.dispatchEvent(new CustomEvent("game-config-changed", { detail: data.gameConfig }));
          return data.gameConfig;
        }
      }
    } catch {
      // Backend desconectado, operar offline sin interrupciones
    }
    return null;
  }

  /**
   * Guarda y propaga la configuración de juego tanto localmente como al backend
   */
  static saveGameConfig(config: Partial<GameConfig>): GameConfig {
    const current = this.getGameConfig();
    const updated: GameConfig = {
      ...current,
      ...config,
    };

    if (config.precisionDifficulty && DIFFICULTY_SETTINGS[config.precisionDifficulty]) {
      updated.toleranceMs = DIFFICULTY_SETTINGS[config.precisionDifficulty].toleranceMs;
    }

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent("game-config-changed", { detail: updated }));
      } catch (e) {
        console.error("Error guardando gameConfig local:", e);
      }

      // Enviar al servidor en segundo plano
      fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameConfig: updated }),
      }).catch(() => {});
    }

    return updated;
  }
}
