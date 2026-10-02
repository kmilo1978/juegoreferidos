/**
 * Motor de datos y configuración del juego "Raspa y Gana" (Scratch & Win)
 * Adaptado a temática festiva/navideña y totalmente modular y personalizable.
 */

export interface ScratchPrize {
  id: string;
  name: string;
  badge: string; // ej: "¡PREMIO!"
  category: string; // ej: "KIT NAVIDEÑO"
  value: string; // ej: "$45.000 COP"
  icon: string;
  description: string;
  isConsolation: boolean;
  probability: number; // Porcentaje relativo
}

export interface ScratchTheme {
  id: string;
  name: string;
  primaryColor: string;
  cardBorderColor: string;
  foilType: "silver" | "gold" | "festive_red";
  foilColor: string;
  foilAccent: string;
  bgGradient: string;
  cardBgGradient: string;
}

export interface ScratchGameSettings {
  themeId: string;
  welcomeTitle: string;
  welcomeSubtitle: string;
  welcomeButtonText: string;
  winTitle: string;
  winSubtitle: string;
  consolationTitle: string;
  consolationSubtitle: string;
  revealThresholdPercent: number; // Porcentaje requerido para auto-revelar
  brushSize: number; // Radio del pincel rascador en px
  soundEnabled: boolean;
  prizes: ScratchPrize[];
}

export const SCRATCH_THEMES: Record<string, ScratchTheme> = {
  navidad: {
    id: "navidad",
    name: "Especial Navidad & Reyes (Como en la foto)",
    primaryColor: "#dc2626", // Rojo festivo
    cardBorderColor: "#f59e0b", // Dorado festivo
    foilType: "silver",
    foilColor: "#d1d5db", // Lámina plateada escarchada
    foilAccent: "#f3f4f6",
    bgGradient: "from-[#450a0a] via-[#1c0407] to-[#0f0203]",
    cardBgGradient: "from-[#881337] via-[#991b1b] to-[#7f1d1d]",
  },
  cafe_gourmet: {
    id: "cafe_gourmet",
    name: "Café & Repostería Gourmet",
    primaryColor: "#f2be71",
    cardBorderColor: "#f2be71",
    foilType: "gold",
    foilColor: "#d4af37",
    foilAccent: "#fff3b0",
    bgGradient: "from-[#1f1912] via-[#14120e] to-[#0d0c0a]",
    cardBgGradient: "from-[#2e2316] via-[#211a11] to-[#17120c]",
  },
  cyber_neon: {
    id: "cyber_neon",
    name: "Cyber Neón & Noche",
    primaryColor: "#ec4899",
    cardBorderColor: "#06b6d4",
    foilType: "festive_red",
    foilColor: "#9333ea",
    foilAccent: "#f43f5e",
    bgGradient: "from-[#1e102e] via-[#11071d] to-[#07020d]",
    cardBgGradient: "from-[#3b0764] via-[#581c87] to-[#2e1065]",
  },
};

export const DEFAULT_SCRATCH_SETTINGS: ScratchGameSettings = {
  themeId: "navidad",
  welcomeTitle: "¡Rasca y descubre si te ha tocado premio!",
  welcomeSubtitle: "Participa y gana fantásticos regalos navideños.",
  welcomeButtonText: "¡PARTICIPA! >",
  winTitle: "¡Enhorabuena!",
  winSubtitle: "Te ha tocado un premio navideño.",
  consolationTitle: "¡Casi lo tienes!",
  consolationSubtitle: "Gracias por participar, tienes un detalle de cortesía.",
  revealThresholdPercent: 50,
  brushSize: 32,
  soundEnabled: true,
  prizes: [
    {
      id: "prize-kit-navidad",
      name: "Kit Navideño Especial de la Casa",
      badge: "¡PREMIO!",
      category: "KIT NAVIDEÑO",
      value: "$45.000 COP",
      icon: "🎁",
      description: "Caja de regalo sorpresa con taza navideña, dulces y detalles de autor.",
      isConsolation: false,
      probability: 60,
    },
    {
      id: "prize-postre-festivo",
      name: "Postre Especial Festivo",
      badge: "¡PREMIO!",
      category: "DEGUSTACIÓN DULCE",
      value: "$18.000 COP",
      icon: "🍰",
      description: "Una porción de tarta o postre de temporada sin costo.",
      isConsolation: false,
      probability: 25,
    },
    {
      id: "prize-consolation-coffee",
      name: "Café Americano o Capuchino de Cortesía",
      badge: "CONSOLACIÓN",
      category: "CORTESÍA EN MESA",
      value: "$8.500 COP",
      icon: "☕",
      description: "Bebida caliente para acompañar tu visita hoy.",
      isConsolation: true,
      probability: 15,
    },
  ],
};

const STORAGE_KEY = "juegoreferidos_scratch_settings";

export const ScratchGameConfigService = {
  getSettings(): ScratchGameSettings {
    if (typeof window === "undefined") return DEFAULT_SCRATCH_SETTINGS;
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        return {
          ...DEFAULT_SCRATCH_SETTINGS,
          ...parsed,
          prizes: parsed.prizes?.length ? parsed.prizes : DEFAULT_SCRATCH_SETTINGS.prizes,
        };
      }
    } catch (e) {
      console.warn("Error leyendo configuración de Raspa y Gana de localStorage", e);
    }
    return DEFAULT_SCRATCH_SETTINGS;
  },

  saveSettings(settings: ScratchGameSettings): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error("Error guardando configuración de Raspa y Gana en localStorage", e);
    }
  },

  reset(): ScratchGameSettings {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
    return DEFAULT_SCRATCH_SETTINGS;
  },
};

// Generador de audio Web Audio API
class ScratchSoundEffects {
  private ctx: AudioContext | null = null;

  private initCtx() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
  }

  // Sonido de fricción / rasguño
  playScratch() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      if (this.ctx.state === "suspended") this.ctx.resume();

      const bufferSize = this.ctx.sampleRate * 0.05; // 50ms de ruido
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 1800 + Math.random() * 400;
      filter.Q.value = 3.0;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      whiteNoise.start();
    } catch {}
  }

  // Fanfarria triunfal al revelar premio
  playWin() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      if (this.ctx.state === "suspended") this.ctx.resume();

      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 (Acorde mayor)

      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);

        gain.gain.setValueAtTime(0.12, now + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.5);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.5);
      });
    } catch {}
  }
}

export const scratchAudio = new ScratchSoundEffects();
