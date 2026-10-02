/**
 * MÓDULO DE DATOS Y CONFIGURACIÓN MODULAR DEL JUEGO DE MEMORIA (MEMORY MATCH)
 * Permite cambiar de temática instantáneamente (Halloween, Cafetería, Restaurante, Navidad o Personalizado).
 */

export interface MemoryCardItem {
  id: string;
  name: string;
  emoji: string;
  imageUrl?: string;
  color?: string;
}

export interface MemoryThemePreset {
  id: string;
  name: string;
  category: string;
  tagline: string;
  bannerTitle: string;
  bannerSubtitle: string;
  buttonText: string;
  accentColor: string;
  headerBg: string;
  cardBackBg: string;
  cardBackIcon: string;
  cardBackBorder: string;
  items: MemoryCardItem[];
}

export interface MemoryGameSettings {
  activeThemeId: string;
  timeLimitSeconds: number; // Tiempo por defecto (ej: 40 segundos)
  pairsCount: number; // 4 (Fácil), 6 (Medio), 8 (Difícil 4x4)
  allowRanking: boolean;
  soundEnabled: boolean;
  requireLeadRegistration: boolean;
  rewardType: "instant_voucher" | "points" | "wheel_spin";
  rewardPrizeName: string;
  rewardPrizeValue: string;
  customItems?: MemoryCardItem[];
}

export const MEMORY_THEMES: Record<string, MemoryThemePreset> = {
  halloween: {
    id: "halloween",
    name: "Halloween Espeluznante (Especial)",
    category: "Temporada & Fiestas",
    tagline: "¡Encuentra las parejas mágicas antes de que la noche termine!",
    bannerTitle: "¡Juega al Memory de Halloween!",
    bannerSubtitle: "Encuentra las parejas y gana premios espeluznantes. Pon a prueba tu memoria y diviértete.",
    buttonText: "¡JUGAR!",
    accentColor: "#ff007f", // Magenta neón de la imagen de referencia
    headerBg: "#2d1033",
    cardBackBg: "#e8651a", // Naranja calabaza de la imagen
    cardBackIcon: "🎃",
    cardBackBorder: "#ff8c42",
    items: [
      { id: "pumpkin", name: "Calabaza Linterna", emoji: "🎃", color: "#ffefe5" },
      { id: "witch_hat", name: "Sombrero de Bruja", emoji: "🧙‍♀️", color: "#f3e8ff" },
      { id: "black_cat", name: "Gato Negro Tierno", emoji: "🐈‍⬛", color: "#ffebee" },
      { id: "ghost", name: "Fantasmita Volador", emoji: "👻", color: "#f0fdf4" },
      { id: "potion", name: "Poción Mágica Verde", emoji: "🧪", color: "#ecfdf5" },
      { id: "spider", name: "Arañita Simpática", emoji: "🕷️", color: "#fffbeb" },
      { id: "broom", name: "Escoba Voladora", emoji: "🧹", color: "#fef3c7" },
      { id: "bat", name: "Murciélago Morado", emoji: "🦇", color: "#f5f3ff" },
    ],
  },
  cafe_bakery: {
    id: "cafe_bakery",
    name: "Cafetería & Repostería Gourmet",
    category: "Gastronomía Diaria",
    tagline: "¡Empareja los mejores cafés y postres de la casa!",
    bannerTitle: "¡Memory de Dulces & Café!",
    bannerSubtitle: "Empareja nuestras especialidades de panadería y café de origen para ganar un premio directo a tu mesa.",
    buttonText: "¡EMPEZAR A JUGAR!",
    accentColor: "#f2be71",
    headerBg: "#1c140a",
    cardBackBg: "#8b5a2b",
    cardBackIcon: "☕",
    cardBackBorder: "#f2be71",
    items: [
      { id: "latte", name: "Café Latte Art", emoji: "☕", color: "#fffbeb" },
      { id: "croissant", name: "Croissant Mantequilla", emoji: "🥐", color: "#fef3c7" },
      { id: "tarta", name: "Tarta Vasca Pistacho", emoji: "🍰", color: "#f0fdf4" },
      { id: "cupcake", name: "Cupcake de Fresa", emoji: "🧁", color: "#fdf2f8" },
      { id: "cookie", name: "Cookie con Chispas", emoji: "🍪", color: "#fff7ed" },
      { id: "teapot", name: "Té de Especialidad", emoji: "🫖", color: "#f0fdfa" },
      { id: "pancake", name: "Pancakes con Miel", emoji: "🥞", color: "#fefce8" },
      { id: "donut", name: "Donut Glaseado", emoji: "🍩", color: "#faf5ff" },
    ],
  },
  restaurant_bistro: {
    id: "restaurant_bistro",
    name: "Restaurante & Trattoria Gourmet",
    category: "Restaurantes & Vino",
    tagline: "¡Encuentra los platos estrella de nuestro menú!",
    bannerTitle: "¡Reto Gastronómico en Mesa!",
    bannerSubtitle: "Encuentra las parejas de nuestros platos principales y cócteles para ganar una entrada o postre de cortesía.",
    buttonText: "¡JUGAR AHORA!",
    accentColor: "#e11d48",
    headerBg: "#1f0a0d",
    cardBackBg: "#7a1828",
    cardBackIcon: "🍷",
    cardBackBorder: "#f43f5e",
    items: [
      { id: "pizza", name: "Pizza a la Leña", emoji: "🍕", color: "#fff1f2" },
      { id: "wine", name: "Copa de Vino Tinto", emoji: "🍷", color: "#ffe4e6" },
      { id: "burger", name: "Burger Smash", emoji: "🍔", color: "#fffbeb" },
      { id: "pasta", name: "Pasta Fresca Italiana", emoji: "🍝", color: "#fefce8" },
      { id: "cocktail", name: "Cóctel Spritz", emoji: "🍹", color: "#fff7ed" },
      { id: "cheese", name: "Tabla de Quesos", emoji: "🧀", color: "#fef3c7" },
      { id: "taco", name: "Tacos de Autor", emoji: "🌮", color: "#fef2f2" },
      { id: "gelato", name: "Gelato Artesanal", emoji: "🍨", color: "#f0fdf4" },
    ],
  },
};

export const DEFAULT_MEMORY_SETTINGS: MemoryGameSettings = {
  activeThemeId: "halloween",
  timeLimitSeconds: 40,
  pairsCount: 8, // 8 parejas = 16 cartas (cuadrícula 4x4 como la imagen)
  allowRanking: true,
  soundEnabled: true,
  requireLeadRegistration: false,
  rewardType: "instant_voucher",
  rewardPrizeName: "Postre o Cóctel Espeluznante Gratis",
  rewardPrizeValue: "$18.000 COP",
};

// Generador de Efectos de Sonido usando Web Audio API nativo (0 dependencias)
export class MemoryAudioEngine {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
  }

  playFlip() {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(450, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch {}
  }

  playMatch() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);
        gain.gain.setValueAtTime(0.18, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.06 + 0.2);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.2);
      });
    } catch {}
  }

  playError() {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(220, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(160, this.ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    } catch {}
  }

  playVictory() {
    try {
      this.init();
      if (!this.ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
      const now = this.ctx.currentTime;
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);
        gain.gain.setValueAtTime(0.25, now + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.1 + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.35);
      });
    } catch {}
  }
}

export const memoryAudio = new MemoryAudioEngine();
