// Motor de datos, configuración y presets para el juego "Suelta y Gana" (Plinko / Pachinko)
// 100% personalizable: temas visuales, clavijas, casillas de premios, probabilidades y efectos sonoros

export interface PlinkoSlot {
  id: string;
  name: string;
  nameEn: string;
  value: string;
  icon: string; // Emoji o imagen decorativa
  color: string;
  probability: number; // Porcentaje relativo
  isGrandPrize?: boolean;
}

export interface PlinkoThemeConfig {
  id: string;
  name: string;
  tagline: string;
  bannerTitle: string;
  bannerSubtitle: string;
  ballEmoji: string;
  bgGradient: string;
  boardBorderColor: string;
  pegColor: string;
  pegGlowColor: string;
  slots: PlinkoSlot[];
}

export interface PlinkoGameSettings {
  themeId: string;
  bannerTitle: string;
  bannerSubtitle: string;
  customButtonText: string;
  soundEnabled: boolean;
  maxAttempts: number;
  slots: PlinkoSlot[];
}

export const PLINKO_THEMES: Record<string, PlinkoThemeConfig> = {
  christmas: {
    id: "christmas",
    name: "Especial Navidad (Suelta y Gana)",
    tagline: "¡Descubre qué premio navideño te espera!",
    bannerTitle: "SUELTA LA BOLA Y GANA",
    bannerSubtitle: "¡Juega y descubre qué premio navideño te espera!",
    ballEmoji: "🔴",
    bgGradient: "from-[#1a0a14] via-[#0d1f18] to-[#120810]",
    boardBorderColor: "#ef4444",
    pegColor: "#fbbf24",
    pegGlowColor: "rgba(251, 191, 36, 0.6)",
    slots: [
      { id: "slot-1", name: "Caja de Regalo Sorpresa", nameEn: "Surprise Gift Box", value: "$25.000 COP", icon: "🎁", color: "#ef4444", probability: 15 },
      { id: "slot-2", name: "Bastón Navideño & Postre", nameEn: "Candy Cane Dessert", value: "$15.000 COP", icon: "🦯", color: "#f43f5e", probability: 20 },
      { id: "slot-3", name: "Galleta de Jengibre Artesanal", nameEn: "Gingerbread Cookie", value: "$12.000 COP", icon: "🍪", color: "#d97706", probability: 25 },
      { id: "slot-4", name: "Postre Árbol Nevado", nameEn: "Snowy Tree Dessert", value: "$18.000 COP", icon: "🎄", color: "#10b981", probability: 15 },
      { id: "slot-5", name: "Degustación Navideña Dulce", nameEn: "Sweet Holiday Tasting", value: "$18.000 COP", icon: "🎄", color: "#10b981", probability: 15 },
      { id: "slot-6", name: "Bota Navideña de Autor", nameEn: "Holiday Treat Stocking", value: "$25.000 COP", icon: "🧦", color: "#e11d48", probability: 10 },
      { id: "slot-7", name: "Gran Estrella de Oro", nameEn: "Golden VIP Star", value: "$50.000 COP", icon: "⭐", color: "#eab308", probability: 10, isGrandPrize: true },
    ],
  },
  gastro: {
    id: "gastro",
    name: "Café, Panadería & Gastronomía",
    tagline: "Desciende por los sabores de la casa",
    bannerTitle: "DEJA CAER Y GANA",
    bannerSubtitle: "¡Sigue la bola y descubre tu cortesía artesanal de hoy!",
    ballEmoji: "☕",
    bgGradient: "from-[#1a1410] via-[#141317] to-[#1c1815]",
    boardBorderColor: "#f2be71",
    pegColor: "#f2be71",
    pegGlowColor: "rgba(242, 190, 113, 0.6)",
    slots: [
      { id: "slot-g1", name: "Café de Especialidad Gratis", nameEn: "Free Specialty Coffee", value: "$9.000 COP", icon: "☕", color: "#b45309", probability: 25 },
      { id: "slot-g2", name: "Croissant Francés de Mantequilla", nameEn: "Butter Croissant", value: "$12.000 COP", icon: "🥐", color: "#d97706", probability: 20 },
      { id: "slot-g3", name: "Tarta Vasca de Pistacho", nameEn: "Basque Cheesecake", value: "$18.000 COP", icon: "🍰", color: "#10b981", probability: 15, isGrandPrize: true },
      { id: "slot-g4", name: "2x1 en Bebidas de Autor", nameEn: "2x1 Signature Drinks", value: "$20.000 COP", icon: "🥂", color: "#8b5cf6", probability: 20 },
      { id: "slot-g5", name: "Bono Descuento 20%", nameEn: "20% Discount Voucher", value: "$25.000 COP", icon: "🎟️", color: "#f59e0b", probability: 20 },
    ],
  },
  neon: {
    id: "neon",
    name: "Cyber Neon / Noche de Fiesta",
    tagline: "Luces, adrenalina y premios nocturnos",
    bannerTitle: "SUELTA LA BOLA Y GANA",
    bannerSubtitle: "¡Desafía la gravedad y llévate coctelería o cena gratis!",
    ballEmoji: "🔮",
    bgGradient: "from-[#0a0f1d] via-[#120a1f] to-[#0d0718]",
    boardBorderColor: "#06b6d4",
    pegColor: "#a855f7",
    pegGlowColor: "rgba(168, 85, 247, 0.7)",
    slots: [
      { id: "slot-n1", name: "Shot de Bienvenida", nameEn: "Welcome Shot", value: "$12.000 COP", icon: "🍸", color: "#06b6d4", probability: 30 },
      { id: "slot-n2", name: "Cóctel de Autor", nameEn: "Signature Cocktail", value: "$32.000 COP", icon: "🍹", color: "#ec4899", probability: 20 },
      { id: "slot-n3", name: "Cena VIP para 2 Personas", nameEn: "VIP Dinner for 2", value: "$120.000 COP", icon: "👑", color: "#fbbf24", probability: 5, isGrandPrize: true },
      { id: "slot-n4", name: "Tabla de Tapas Gourmet", nameEn: "Gourmet Tapas Board", value: "$38.000 COP", icon: "🧀", color: "#10b981", probability: 20 },
      { id: "slot-n5", name: "Postre Flameado Especial", nameEn: "Special Flambé Dessert", value: "$22.000 COP", icon: "🔥", color: "#f97316", probability: 25 },
    ],
  },
};

export const DEFAULT_PLINKO_SETTINGS: PlinkoGameSettings = {
  themeId: "christmas",
  bannerTitle: "SUELTA LA BOLA Y GANA",
  bannerSubtitle: "¡Juega y descubre qué premio navideño te espera!",
  customButtonText: "SOLTAR LA BOLA",
  soundEnabled: true,
  maxAttempts: 3,
  slots: PLINKO_THEMES.christmas.slots,
};

// Generador de audio Web Audio API para rebotes y fanfarria
class PlinkoAudioEngine {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
  }

  // Sonido de rebote contra clavija metálica / obstáculo
  playPegBounce(intensity = 1) {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      // Sonido de campanilla / click de madera metálica con variación aleatoria de tono
      const baseFreq = 620 + Math.random() * 380;
      osc.type = "sine";
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.04);

      gain.gain.setValueAtTime(0.2 * intensity, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch {}
  }

  // Sonido de lanzamiento / caída
  playRelease() {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = "triangle";
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.18);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.18);
    } catch {}
  }

  // Sonido triunfal de aterrizaje en casilla ganadora
  playSlotWin() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // Do - Mi - Sol - Do agudo

      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const start = now + idx * 0.09;

        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.25, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(start);
        osc.stop(start + 0.35);
      });
    } catch {}
  }
}

export const plinkoAudio = new PlinkoAudioEngine();

// Servicio gestor de persistencia en localStorage
export const PlinkoConfigService = {
  STORAGE_KEY: "app_plinko_game_settings",

  getSettings(): PlinkoGameSettings {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          return { ...DEFAULT_PLINKO_SETTINGS, ...parsed };
        }
      } catch {}
    }
    return DEFAULT_PLINKO_SETTINGS;
  },

  saveSettings(settings: PlinkoGameSettings): void {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(settings));
      } catch {}
    }
  },
};
