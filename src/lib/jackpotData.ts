/**
 * Módulo de Datos y Motor de Audio para el Juego de JACKPOT (Tragaperras / Slot Machine de Marca)
 * Inspirado en la estética retroiluminada de marquesina y rodillos dorados
 * 100% modular, con soporte para temáticas de Viajes/Aviones, Cafetería, Restaurante y Marca Personalizada
 */

export interface JackpotSymbol {
  id: string;
  name: string;
  emoji: string;
  isJackpot: boolean; // Si es el símbolo del premio gordo (ej. Avión ✈️)
  multiplier?: number;
  color?: string;
}

export interface JackpotTheme {
  id: "travel_vip" | "cafe_bakery" | "restaurant_gourmet" | "custom";
  name: string;
  category: string;
  topHeader: string;
  marqueeText: string;
  targetInstruction: string;
  accentColor: string;
  frameColor: string;
  reelBg: string;
  jackpotPrizeName: string;
  jackpotPrizeValue: string;
  symbols: JackpotSymbol[];
}

export const JACKPOT_THEMES: Record<string, JackpotTheme> = {
  travel_vip: {
    id: "travel_vip",
    name: "Salidas Internacionales (Viajes & Experiencias)",
    category: "Aventura & Gran Premio",
    topHeader: "✈️ SALIDAS INTERNACIONALES",
    marqueeText: "JACKPOT",
    targetInstruction: "CONSIGUE TRES AVIONES EN LÍNEA",
    accentColor: "#f59e0b",
    frameColor: "#d97706",
    reelBg: "#0f172a",
    jackpotPrizeName: "2 Billetes de Avión / Escapada VIP",
    jackpotPrizeValue: "$450.000 COP",
    symbols: [
      { id: "plane", name: "Avión Comercial", emoji: "✈️", isJackpot: true, color: "#38bdf8" },
      { id: "luggage", name: "Maleta de Viaje", emoji: "🧳", isJackpot: false, color: "#fbbf24" },
      { id: "train", name: "Tren Rápido", emoji: "🚆", isJackpot: false, color: "#a855f7" },
      { id: "car", name: "Coche de Alquiler", emoji: "🚗", isJackpot: false, color: "#34d399" },
      { id: "bike", name: "Bicicleta Urbana", emoji: "🚲", isJackpot: false, color: "#f472b6" },
    ],
  },
  cafe_bakery: {
    id: "cafe_bakery",
    name: "Cafetería & Panadería Gourmet",
    category: "Gastronomía Diaria",
    topHeader: "☕ ESTACIÓN DEL SABOR",
    marqueeText: "GOLDEN BAKE",
    targetInstruction: "CONSIGUE TRES CROISSANTS DE ORO",
    accentColor: "#f2be71",
    frameColor: "#d97706",
    reelBg: "#1c140e",
    jackpotPrizeName: "Brunch Completo para 2 Personas",
    jackpotPrizeValue: "$65.000 COP",
    symbols: [
      { id: "croissant", name: "Croissant Dorado", emoji: "🥐", isJackpot: true, color: "#f2be71" },
      { id: "coffee", name: "Capuchino Latte", emoji: "☕", isJackpot: false, color: "#e2e8f0" },
      { id: "cake", name: "Tarta Vasca", emoji: "🍰", isJackpot: false, color: "#fb7185" },
      { id: "cookie", name: "Cookie Choco", emoji: "🍪", isJackpot: false, color: "#d97706" },
      { id: "donut", name: "Donut Glaseado", emoji: "🍩", isJackpot: false, color: "#c084fc" },
    ],
  },
  restaurant_gourmet: {
    id: "restaurant_gourmet",
    name: "Restaurante & Trattoria de Autor",
    category: "Cena & Vinos",
    topHeader: "🍷 CARTA DEL CHEF",
    marqueeText: "ROYAL CHEF",
    targetInstruction: "CONSIGUE TRES COPAS DE VINO RESERVA",
    accentColor: "#ef4444",
    frameColor: "#b91c1c",
    reelBg: "#180d0e",
    jackpotPrizeName: "Cena Degustación con Botella de Vino",
    jackpotPrizeValue: "$120.000 COP",
    symbols: [
      { id: "wine", name: "Copa de Vino Reserva", emoji: "🍷", isJackpot: true, color: "#f43f5e" },
      { id: "pizza", name: "Pizza Artesanal", emoji: "🍕", isJackpot: false, color: "#f59e0b" },
      { id: "burger", name: "Hamburguesa Trufada", emoji: "🍔", isJackpot: false, color: "#fbbf24" },
      { id: "steak", name: "Corte Gourmet", emoji: "🥩", isJackpot: false, color: "#ef4444" },
      { id: "dessert", name: "Postre de Autor", emoji: "🍮", isJackpot: false, color: "#e879f9" },
    ],
  },
};

export interface JackpotSettings {
  themeId: "travel_vip" | "cafe_bakery" | "restaurant_gourmet" | "custom";
  winProbability: number; // Porcentaje de 0 a 100 (ej. 35%)
  maxAttempts: number; // Típicamente 5 vidas (como los 5 avioncitos de la foto)
  soundEnabled: boolean;
  rewardPrizeName: string;
  rewardPrizeValue: string;
}

export const DEFAULT_JACKPOT_SETTINGS: JackpotSettings = {
  themeId: "travel_vip",
  winProbability: 40,
  maxAttempts: 5,
  soundEnabled: true,
  rewardPrizeName: "2 Billetes de Avión / Escapada VIP",
  rewardPrizeValue: "$450.000 COP",
};

/**
 * Motor de Efectos de Sonido Nativo con Web Audio API para JACKPOT
 */
class JackpotAudioEngine {
  private ctx: AudioContext | null = null;

  private initCtx() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
  }

  // Sonido de clic mecánico cuando los rodillos están girando
  playReelSpinClick() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(220, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, this.ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.045);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch {}
  }

  // Sonido seco y metálico de freno cuando se detiene un rodillo (Clack!)
  playReelStop(reelIndex: number) {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const baseFreq = 440 + reelIndex * 120;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.09);
      gain.gain.setValueAtTime(0.28, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.11);
    } catch {}
  }

  // Sonido de fallo
  playMiss() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(260, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(140, this.ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.27);
    } catch {}
  }

  // Fanfarria clásica de cascada de monedas de JACKPOT
  playJackpotWin() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5]; // C5, E5, G5, C6, E6
      const now = this.ctx.currentTime;
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + idx * 0.09);
        gain.gain.setValueAtTime(0.3, now + idx * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.09 + 0.4);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + idx * 0.09);
        osc.stop(now + idx * 0.09 + 0.45);
      });
    } catch {}
  }
}

export const jackpotAudio = new JackpotAudioEngine();
