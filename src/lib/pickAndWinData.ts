/**
 * Módulo de Datos y Motor de Audio para el Juego "Descubre y Gana" (Pick & Win / Triplete)
 * Temática por defecto: Día de Muertos (México festivo)
 * Arquitectura 100% modular y adaptable a cualquier sector comercial
 */

export interface PickItem {
  id: string;
  name: string;
  emoji: string;
  iconName?: string;
  isPrize: boolean;
  color?: string;
}

export interface PickAndWinTheme {
  id: "dia_de_muertos" | "cafe_bakery" | "restaurant_bistro" | "custom";
  name: string;
  category: string;
  accentColor: string;
  bannerTitle: string;
  bannerSubtitle: string;
  instructionText: string;
  buttonText: string;
  boardBg: string;
  boardBorder: string;
  coverPattern: string; // Emoji o gráfico de la casilla sin abrir
  targetCount: number; // Típicamente 3 iguales
  items: PickItem[];
}

export const PICK_AND_WIN_THEMES: Record<string, PickAndWinTheme> = {
  dia_de_muertos: {
    id: "dia_de_muertos",
    name: "Día de Muertos Festivo (Especial)",
    category: "Temporada & Tradición",
    accentColor: "#e6007e", // Fucsia mexicano festivo
    bannerTitle: "¡Juega y gana tu premio!",
    bannerSubtitle: "Descubre y gana para celebrar el Día de Muertos. Pon a prueba tu intuición y encuentra 3 figuras iguales.",
    instructionText: "Encuentra 3 iguales. Tienes 3 intentos.",
    buttonText: "🌸 PARTICIPA 🌸",
    boardBg: "#ea580c", // Naranja cempasúchil encendido
    boardBorder: "#fbbf24", // Cenefa dorada tradicional
    coverPattern: "🏵️", // Flor de Cempasúchil
    targetCount: 3,
    items: [
      { id: "perfume", name: "Frasco Especial", emoji: "✨🍾", isPrize: true, color: "#fffbeb" },
      { id: "calavera", name: "Calavera de Azúcar", emoji: "💀🌸", isPrize: false, color: "#fdf2f8" },
      { id: "huesos", name: "Huesos Cruzados", emoji: "🦴", isPrize: false, color: "#fef3c7" },
      { id: "vela", name: "Vela Votiva", emoji: "🕯️", isPrize: false, color: "#fff7ed" },
    ],
  },
  cafe_bakery: {
    id: "cafe_bakery",
    name: "Cafetería & Dulces Sorpresa",
    category: "Gastronomía Diaria",
    accentColor: "#d97706",
    bannerTitle: "¡Descubre tu Postre de la Casa!",
    bannerSubtitle: "Toca las campanas doradas. Si encuentras 3 postres iguales, ¡te lo llevas gratis a tu mesa!",
    instructionText: "Encuentra 3 iguales. Tienes 4 intentos.",
    buttonText: "☕ ABRIR CASILLAS ☕",
    boardBg: "#291b16",
    boardBorder: "#f2be71",
    coverPattern: "🛎️",
    targetCount: 3,
    items: [
      { id: "croissant", name: "Croissant de Pistacho", emoji: "🥐", isPrize: true, color: "#fef3c7" },
      { id: "cafe", name: "Capuchino de Autor", emoji: "☕", isPrize: false, color: "#fafaf9" },
      { id: "cookie", name: "Cookie Choco-Avellana", emoji: "🍪", isPrize: false, color: "#fef2f2" },
      { id: "cake", name: "Tarta Vasca", emoji: "🍰", isPrize: false, color: "#fffbeb" },
    ],
  },
  restaurant_bistro: {
    id: "restaurant_bistro",
    name: "Trattoria & Platos Estrella",
    category: "Restaurantes & Vino",
    accentColor: "#dc2626",
    bannerTitle: "¡La Mesa de la Suerte!",
    bannerSubtitle: "Destapa las casillas del chef. Encuentra 3 copas o 3 pizzas artesanales para ganar.",
    instructionText: "Encuentra 3 iguales. Tienes 4 intentos.",
    buttonText: "🍽️ PROBAR SUERTE 🍽️",
    boardBg: "#1c1917",
    boardBorder: "#ef4444",
    coverPattern: "🥘",
    targetCount: 3,
    items: [
      { id: "vino", name: "Copa de Vino Reserva", emoji: "🍷", isPrize: true, color: "#fdf2f8" },
      { id: "pizza", name: "Pizza Prosciutto", emoji: "🍕", isPrize: false, color: "#fef3c7" },
      { id: "pasta", name: "Pasta Trufada", emoji: "🍝", isPrize: false, color: "#fffbeb" },
      { id: "tiramisu", name: "Tiramisú Tradicional", emoji: "🍮", isPrize: false, color: "#fdf4ff" },
    ],
  },
};

export interface PickAndWinSettings {
  themeId: "dia_de_muertos" | "cafe_bakery" | "restaurant_bistro" | "custom";
  maxAttempts: number; // Intentos (ej. 3 o 4)
  gridSize: 9; // 3x3 casillas
  targetMatches: number; // 3 para ganar
  soundEnabled: boolean;
  rewardPrizeName: string;
  rewardPrizeValue: string;
}

export const DEFAULT_PICK_AND_WIN_SETTINGS: PickAndWinSettings = {
  themeId: "dia_de_muertos",
  maxAttempts: 3,
  gridSize: 9,
  targetMatches: 3,
  soundEnabled: true,
  rewardPrizeName: "Regalo o Postre Especial Día de Muertos",
  rewardPrizeValue: "$20.000 COP",
};

/**
 * Motor de Efectos de Sonido Nativo con Web Audio API para "Descubre y Gana"
 */
class PickAudioEngine {
  private ctx: AudioContext | null = null;

  private initCtx() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
  }

  // Sonido al pulsar y destapar casilla
  playOpenTile() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(480, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(760, this.ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.14);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    } catch {}
  }

  // Sonido cuando encuentra un elemento acertado
  playFoundTarget() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      [659.25, 830.61].forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + i * 0.08);
        gain.gain.setValueAtTime(0.28, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.08 + 0.2);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.22);
      });
    } catch {}
  }

  // Sonido al fallar o destapar elemento no premiado
  playMiss() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(260, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(180, this.ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.22);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.25);
    } catch {}
  }

  // Fanfarria festiva al completar los 3 iguales (Victoria)
  playVictory() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      const now = this.ctx.currentTime;
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);
        gain.gain.setValueAtTime(0.3, now + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.1 + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.4);
      });
    } catch {}
  }
}

export const pickAudio = new PickAudioEngine();
