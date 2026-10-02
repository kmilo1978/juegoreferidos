/**
 * SERVICIO CENTRALIZADO DE PERSONALIZACIÓN EXCLUSIVA COMERCIAL
 * Permite adaptar:
 * 1. Estética (Colores, texturas, reversos, emblema de marca)
 * 2. Narrativa (Storytelling, titulares Cara 1, CTAs, mensajes de victoria/consolación)
 * 3. Reglas del Juego (Dificultad, vidas/intentos, probabilidades %, modo de asignación)
 * 4. Premios & Vouchers (Premios, valores, stock diario, formato cupón/billete)
 * 5. Duración & Urgencia (Tiempo de juego en segundos, vigencia de campaña, caducidad)
 */

export type GameIdentifier = "jackpot" | "pick-win" | "memory" | "scratch" | "plinko";

export interface CommercialGameProfile {
  id: GameIdentifier;
  name: string;
  category: string;
  subtitle: string;
  badge: string;

  // 1. ESTÉTICA & IDENTIDAD VISUAL
  aesthetics: {
    themePreset: "navidad" | "halloween" | "dia_muertos" | "viajes_vip" | "gourmet_lujo" | "custom";
    primaryColor: string;
    accentColor: string;
    backgroundColor: string;
    textColor: string;
    borderColor: string;
    backgroundTexture: "stars" | "snow" | "papel_picado" | "rustic_wood" | "luxury_airport" | "clean";
    brandBadgeText: string;
    cardBackStyle: "pumpkin" | "gift" | "skull" | "airplane" | "coffee";
  };

  // 2. NARRATIVA & STORYTELLING COMERCIAL
  narrative: {
    face1Title: string;
    face1Subtitle: string;
    face1CtaButton: string;
    step1Instruction: string;
    step2Instruction: string;
    face2Title: string;
    victoryTitle: string;
    victorySubtitle: string;
    consolationTitle: string;
    consolationSubtitle: string;
    claimButtonText: string;
  };

  // 3. REGLAS DEL JUEGO & DIFICULTAD
  rules: {
    difficulty: "facil" | "medio" | "dificil";
    maxAttempts: number;
    winProbability: number; // 0 - 100%
    gameplayMode: "aleatorio" | "habilidad" | "garantizado_por_campana";
    soundEnabled: boolean;
    requireRegistration: boolean;
    mechanicDescription: string;
  };

  // 4. PREMIOS & VOUCHERS COMERCIALES
  prizes: {
    mainPrizeName: string;
    mainPrizeCategory: string;
    mainPrizeValue: string;
    mainPrizeIcon: string;
    voucherType: "boarding_pass" | "scratch_foil" | "digital_ticket" | "pin_table";
    voucherValidityHours: number;
    dailyStockLimit: number;
    consolationPrizeName: string;
    consolationPrizeValue: string;
    termsAndConditionsText: string;
  };

  // 5. DURACIÓN & URGENCIA COMERCIAL
  timing: {
    timeLimitSeconds: number; // 0 = sin límite
    campaignStartDate: string;
    campaignEndDate: string;
    urgencyTimerVisible: boolean;
    redemptionCountdownMinutes: number;
  };
}

export const DEFAULT_COMMERCIAL_PROFILES: Record<GameIdentifier, CommercialGameProfile> = {
  jackpot: {
    id: "jackpot",
    name: "Máquina de Jackpot (Tragaperras)",
    category: "Gran Premio & Expectación",
    subtitle: "Inspirada en salas de salidas internacionales y viajes VIP",
    badge: "Especial Viajes VIP",
    aesthetics: {
      themePreset: "viajes_vip",
      primaryColor: "#0284c7",
      accentColor: "#f59e0b",
      backgroundColor: "#07172c",
      textColor: "#ffffff",
      borderColor: "#38bdf8",
      backgroundTexture: "luxury_airport",
      brandBadgeText: "TERMINAL VIP • PUERTA 01",
      cardBackStyle: "airplane",
    },
    narrative: {
      face1Title: "¡Prueba tu suerte en la Tragaperras VIP!",
      face1Subtitle: "Alinea 3 aviones o medios de transporte para ganar 2 billetes directos.",
      face1CtaButton: "JUGAR",
      step1Instruction: "1) Toca el botón de tirar",
      step2Instruction: "2) Alinea 3 figuras iguales",
      face2Title: "SALIDAS INTERNACIONALES",
      victoryTitle: "¡Enhorabuena! Este es tu premio:",
      victorySubtitle: "2 billetes de avión o escapada exclusiva de la casa.",
      consolationTitle: "¡Casi lo consigues!",
      consolationSubtitle: "Disfruta de una degustación o prueba una 2ª oportunidad.",
      claimButtonText: "RECLAMAR MI BILLETE VIP",
    },
    rules: {
      difficulty: "medio",
      maxAttempts: 1,
      winProbability: 60,
      gameplayMode: "aleatorio",
      soundEnabled: true,
      requireRegistration: false,
      mechanicDescription: "3 rodillos rotativos sincronizados con 5 símbolos",
    },
    prizes: {
      mainPrizeName: "2 Billetes de Avión / Escapada VIP",
      mainPrizeCategory: "GRAN PREMIO",
      mainPrizeValue: "Vuelo Directo",
      mainPrizeIcon: "✈️",
      voucherType: "boarding_pass",
      voucherValidityHours: 48,
      dailyStockLimit: 10,
      consolationPrizeName: "Cóctel o Bebida de Bienvenida",
      consolationPrizeValue: "$12.000 COP",
      termsAndConditionsText: "Válido para canjear en mostrador o caja presentando pantalla.",
    },
    timing: {
      timeLimitSeconds: 0,
      campaignStartDate: "2026-10-01",
      campaignEndDate: "2026-11-30",
      urgencyTimerVisible: true,
      redemptionCountdownMinutes: 60,
    },
  },

  "pick-win": {
    id: "pick-win",
    name: "Descubre y Gana (Día de Muertos / Triplete)",
    category: "Azar, Intuición & Búsqueda",
    subtitle: "Inspirada en altares tradicionales, calaveras de azúcar y cempasúchil",
    badge: "Especial Tradición",
    aesthetics: {
      themePreset: "dia_muertos",
      primaryColor: "#ea580c",
      accentColor: "#ec4899",
      backgroundColor: "#1c0a00",
      textColor: "#ffffff",
      borderColor: "#f97316",
      backgroundTexture: "papel_picado",
      brandBadgeText: "OFRENDA ESPECIAL • EDICIÓN LIMITADA",
      cardBackStyle: "skull",
    },
    narrative: {
      face1Title: "¡Juega y gana perfume exclusivo!",
      face1Subtitle: "Descubre y gana para celebrar con fragancias y detalles únicos.",
      face1CtaButton: "🌸 PARTICIPA 🌸",
      step1Instruction: "1) Elige una casilla floral",
      step2Instruction: "2) Encuentra 3 figuras idénticas",
      face2Title: "Encuentra 3 iguales. Tienes 3 intentos.",
      victoryTitle: "¡Encontraste la combinación ganadora!",
      victorySubtitle: "Tu frasco de perfume exclusivo está listo para entrega.",
      consolationTitle: "¡Buena intuición!",
      consolationSubtitle: "Te llevas un detalle aromático o postre especial.",
      claimButtonText: "RECLAMAR MI PERFUME EXCLUSIVO",
    },
    rules: {
      difficulty: "medio",
      maxAttempts: 3,
      winProbability: 50,
      gameplayMode: "aleatorio",
      soundEnabled: true,
      requireRegistration: false,
      mechanicDescription: "Tablero 3x3 de casillas cubiertas con 3 intentos máximos",
    },
    prizes: {
      mainPrizeName: "Frasco de Perfume Calavera Gold",
      mainPrizeCategory: "EDICIÓN DE COLECCIÓN",
      mainPrizeValue: "$65.000 COP",
      mainPrizeIcon: "🌸",
      voucherType: "digital_ticket",
      voucherValidityHours: 24,
      dailyStockLimit: 15,
      consolationPrizeName: "Muestra Aromática & Café",
      consolationPrizeValue: "$9.000 COP",
      termsAndConditionsText: "Canjeable hoy en caja presentando la mesa activa.",
    },
    timing: {
      timeLimitSeconds: 45,
      campaignStartDate: "2026-10-15",
      campaignEndDate: "2026-11-05",
      urgencyTimerVisible: true,
      redemptionCountdownMinutes: 30,
    },
  },

  memory: {
    id: "memory",
    name: "Juego de Memoria (Halloween)",
    category: "Retención, Memoria & Agilidad",
    subtitle: "Inspirada en mansión embrujada, calabazas y fantasma amistoso",
    badge: "Especial Halloween",
    aesthetics: {
      themePreset: "halloween",
      primaryColor: "#d91b7d",
      accentColor: "#fbbf24",
      backgroundColor: "#180924",
      textColor: "#ffffff",
      borderColor: "#f59e0b",
      backgroundTexture: "stars",
      brandBadgeText: "NOCHE EMBRUJADA • PROMOCIÓN VIP",
      cardBackStyle: "pumpkin",
    },
    narrative: {
      face1Title: "¡Juega al Memory de Halloween!",
      face1Subtitle: "Encuentra las parejas y gana premios espeluznantes. Pon a prueba tu memoria.",
      face1CtaButton: "¡JUGAR!",
      step1Instruction: "1) Voltea 2 cartas",
      step2Instruction: "2) Empareja todos los símbolos",
      face2Title: "TABLERO DE PAREJAS 4x4",
      victoryTitle: "¡Memoria perfecta!",
      victorySubtitle: "Has completado todas las parejas antes de que termine el tiempo.",
      consolationTitle: "¡Se agotó el tiempo!",
      consolationSubtitle: "¡Estuviste muy cerca! Puedes intentarlo de nuevo o reclamar tu dulce.",
      claimButtonText: "RECLAMAR MI RECOMPENSA DE HALLOWEEN",
    },
    rules: {
      difficulty: "medio",
      maxAttempts: 1,
      winProbability: 70,
      gameplayMode: "habilidad",
      soundEnabled: true,
      requireRegistration: false,
      mechanicDescription: "Cuadrícula 4x4 (16 naipes con 8 pares)",
    },
    prizes: {
      mainPrizeName: "Combo Dulzura Espeluznante",
      mainPrizeCategory: "POSTRE ESPECIAL",
      mainPrizeValue: "$24.000 COP",
      mainPrizeIcon: "🎃",
      voucherType: "digital_ticket",
      voucherValidityHours: 24,
      dailyStockLimit: 25,
      consolationPrizeName: "Galleta Calabaza de Cortesía",
      consolationPrizeValue: "$6.000 COP",
      termsAndConditionsText: "Presentar en barra para canje instantáneo.",
    },
    timing: {
      timeLimitSeconds: 40,
      campaignStartDate: "2026-10-20",
      campaignEndDate: "2026-11-02",
      urgencyTimerVisible: true,
      redemptionCountdownMinutes: 20,
    },
  },

  scratch: {
    id: "scratch",
    name: "Raspa y Gana Digital (Navidad)",
    category: "Misterio & Sorpresa Táctil",
    subtitle: "Inspirada en postales navideñas, guirnaldas y lámina plateada rascable",
    badge: "Especial Navidad",
    aesthetics: {
      themePreset: "navidad",
      primaryColor: "#dc2626",
      accentColor: "#16a34a",
      backgroundColor: "#1c0406",
      textColor: "#ffffff",
      borderColor: "#fbbf24",
      backgroundTexture: "snow",
      brandBadgeText: "CAMPAÑA NAVIDEÑA • REGALO DIRECTO",
      cardBackStyle: "gift",
    },
    narrative: {
      face1Title: "¡Rasca y descubre si te ha tocado premio!",
      face1Subtitle: "Participa y gana fantásticos regalos navideños y degustaciones.",
      face1CtaButton: "¡PARTICIPA! >",
      step1Instruction: "1) Desliza con tu dedo la lámina plateada",
      step2Instruction: "2) Descubre tu regalo oculto",
      face2Title: "¡PREMIO! KIT NAVIDEÑO",
      victoryTitle: "¡Enhorabuena! Te ha tocado un premio navideño.",
      victorySubtitle: "Disfruta de este kit exclusivo de temporada preparado con esmero.",
      consolationTitle: "¡Gracias por participar!",
      consolationSubtitle: "Te obsequiamos una infusión o dulce artesanal.",
      claimButtonText: "OBTENER MI VOUCHER OFICIAL",
    },
    rules: {
      difficulty: "facil",
      maxAttempts: 1,
      winProbability: 80,
      gameplayMode: "aleatorio",
      soundEnabled: true,
      requireRegistration: false,
      mechanicDescription: "Lámina rascable de 310x220 px con umbral de revelado al 45%",
    },
    prizes: {
      mainPrizeName: "Kit Navideño Gourmet de la Casa",
      mainPrizeCategory: "KIT EXCLUSIVO",
      mainPrizeValue: "$35.000 COP",
      mainPrizeIcon: "🎁",
      voucherType: "scratch_foil",
      voucherValidityHours: 24,
      dailyStockLimit: 30,
      consolationPrizeName: "Bebida Caliente Navideña",
      consolationPrizeValue: "$9.500 COP",
      termsAndConditionsText: "Válido hoy en caja presentando la pantalla de tu mesa.",
    },
    timing: {
      timeLimitSeconds: 0,
      campaignStartDate: "2026-12-01",
      campaignEndDate: "2026-12-31",
      urgencyTimerVisible: true,
      redemptionCountdownMinutes: 45,
    },
  },

  plinko: {
    id: "plinko",
    name: "Suelta la Bola y Gana (Plinko)",
    category: "Física, Emoción & Expectativa",
    subtitle: "Inspirada en letrero de madera en nieve, faroles y recorrido dinámico",
    badge: "Feria de Invierno",
    aesthetics: {
      themePreset: "navidad",
      primaryColor: "#dc2626",
      accentColor: "#10b981",
      backgroundColor: "#160507",
      textColor: "#ffffff",
      borderColor: "#f59e0b",
      backgroundTexture: "rustic_wood",
      brandBadgeText: "FERIA DE NAVIDAD • TABLERO OFICIAL",
      cardBackStyle: "gift",
    },
    narrative: {
      face1Title: "SUELTA LA BOLA Y GANA",
      face1Subtitle: "¡Juega y descubre qué premio navideño te espera!",
      face1CtaButton: "JUGAR",
      step1Instruction: "1) Suelta la bola",
      step2Instruction: "2) Sigue el recorrido",
      face2Title: "TABLERO DE CLAVIJAS & PREMIOS",
      victoryTitle: "¡La bola ha elegido tu premio!",
      victorySubtitle: "Reclama tu regalo en caja presentando este comprobante.",
      consolationTitle: "¡Buen lanzamiento!",
      consolationSubtitle: "Te llevas un detalle especial de consolación.",
      claimButtonText: "RECLAMAR MI PREMIO EN CAJA",
    },
    rules: {
      difficulty: "facil",
      maxAttempts: 1,
      winProbability: 75,
      gameplayMode: "aleatorio",
      soundEnabled: true,
      requireRegistration: false,
      mechanicDescription: "11 filas de clavijas 3D con simulación de física a 60 FPS",
    },
    prizes: {
      mainPrizeName: "Gran Estrella de Oro Navideña",
      mainPrizeCategory: "PREMIO MAYOR",
      mainPrizeValue: "$50.000 COP",
      mainPrizeIcon: "⭐",
      voucherType: "digital_ticket",
      voucherValidityHours: 24,
      dailyStockLimit: 20,
      consolationPrizeName: "Bastón Navideño Artesanal",
      consolationPrizeValue: "$6.000 COP",
      termsAndConditionsText: "Válido para consumo inmediato o llevar.",
    },
    timing: {
      timeLimitSeconds: 0,
      campaignStartDate: "2026-12-01",
      campaignEndDate: "2026-12-31",
      urgencyTimerVisible: true,
      redemptionCountdownMinutes: 30,
    },
  },
};

const STORAGE_KEY = "juegoreferidos_commercial_exclusive_profiles";

export class CommercialCustomizerService {
  static getProfiles(): Record<GameIdentifier, CommercialGameProfile> {
    if (typeof window === "undefined") return DEFAULT_COMMERCIAL_PROFILES;
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return DEFAULT_COMMERCIAL_PROFILES;
      const parsed = JSON.parse(data);
      return {
        ...DEFAULT_COMMERCIAL_PROFILES,
        ...parsed,
      };
    } catch {
      return DEFAULT_COMMERCIAL_PROFILES;
    }
  }

  static getProfile(gameId: GameIdentifier): CommercialGameProfile {
    const profiles = this.getProfiles();
    return profiles[gameId] || DEFAULT_COMMERCIAL_PROFILES[gameId];
  }

  static saveProfile(profile: CommercialGameProfile): void {
    if (typeof window === "undefined") return;
    try {
      const current = this.getProfiles();
      current[profile.id] = profile;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    } catch (e) {
      console.error("Error saving commercial profile:", e);
    }
  }

  static resetToDefault(gameId?: GameIdentifier): void {
    if (typeof window === "undefined") return;
    try {
      if (gameId) {
        const current = this.getProfiles();
        current[gameId] = DEFAULT_COMMERCIAL_PROFILES[gameId];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      console.error("Error resetting commercial profile:", e);
    }
  }
}
