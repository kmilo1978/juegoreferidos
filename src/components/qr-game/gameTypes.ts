export interface GamePrize {
  id: string;
  name: string;
  nameEn: string;
  type: "discount_percent" | "free_item" | "special_experience";
  value: string;
  probability: number; // Porcentaje (1 a 100)
  color: string;
  textColor: string;
  active: boolean;
  terms: string;
  termsEn: string;
}

export interface TableSession {
  id: string;
  tableNumber: string;
  createdAt: number;
  expiresAt: number;
  status: "active" | "completed" | "expired";
}

export interface ParticipantData {
  fullName: string;
  whatsapp: string;
  email?: string | undefined;
  birthDate?: string | undefined; // Formato DD/MM para regalos de cumpleaños
  consentData: boolean;
  consentMarketing: boolean;
  tableNumber?: string;
  registeredAt?: number;
}

export interface FeedbackData {
  rating: number;
  comment?: string | undefined;
  createdAt?: number;
  customerName?: string;
}

export interface InstagramEvidence {
  storyGenerated: boolean;
  screenshotFileUrl?: string | undefined;
  instagramHandle?: string | undefined;
  sharedVia?: "instagram" | "whatsapp" | "skipped" | undefined;
}

export interface WonPrize {
  uniqueCode: string;
  prizeId: string;
  prizeName: string;
  prizeNameEn: string;
  value: string;
  tableNumber: string;
  participantName: string;
  participantWhatsapp: string;
  participantEmail?: string;
  birthDate?: string;
  wonAt: string;
  createdAt?: number;
  expiresAtFormatted?: string;
  stamps?: number;
  status: "DISPONIBLE" | "UTILIZADO";
  usedAt?: string;
}

export type GameMode = "roulette" | "precision" | "hybrid" | "stamps" | "scratch" | "memory" | "pick-win" | "jackpot";
export type PrecisionDifficulty = "facil" | "medio" | "dificil";

export interface GameConfig {
  gameMode: GameMode;
  precisionTarget: number; // 10.000s
  precisionDifficulty: PrecisionDifficulty;
  toleranceMs: number; // milisegundos de margen (80ms, 40ms, 15ms)
  maxAttempts: number; // 1, 2 o 3 intentos
  validationChannel: "both" | "instagram" | "whatsapp";
  reviewTiming: "after_game" | "before_game";
  activeSteps?: string[];
}

export const DEFAULT_GAME_CONFIG: GameConfig = {
  gameMode: "hybrid",
  precisionTarget: 10.0,
  precisionDifficulty: "medio",
  toleranceMs: 40,
  maxAttempts: 3,
  validationChannel: "both",
  reviewTiming: "after_game",
};

export interface SecondChanceConfig {
  enabled: boolean;
  prizeName: string;
  prizeDescription: string;
  prizeImageUrl: string;
  prizeImageSize: "small" | "medium" | "large";
  prizeValue?: string;
  claimTerms?: string;
  maxAttempts: number;
  difficulty: PrecisionDifficulty;
  toleranceMs: number;
  whatsappStatusText?: string;
  whatsappVerificationMessage?: string;
}

export const DEFAULT_SECOND_CHANCE_CONFIG: SecondChanceConfig = {
  enabled: true,
  prizeName: "Postre Artesanal de Autor Gratis",
  prizeDescription: "Una porción de nuestra Tarta Vasca artesanal del día",
  prizeImageUrl: "/src/assets/tarta-vasca.jpg",
  prizeImageSize: "medium",
  prizeValue: "$18.000 COP",
  claimTerms: "Canjeable en mesa o para llevar presentando el código único en caja.",
  maxAttempts: 3,
  difficulty: "medio",
  toleranceMs: 40,
  whatsappStatusText: "¡Disfrutando de una tarde increíble en nuestro restaurante favorito! ☕🍰 Les recomiendo probar sus postres artesanales. 10/10 ✨",
  whatsappVerificationMessage: "¡Hola! 📸 Acabo de compartir en mis Estados de WhatsApp la experiencia. Aquí les envío la captura de pantalla de mi estado para reclamar mi 2ª oportunidad en el Reto del Cronómetro.",
};

export const DEFAULT_PRIZES: GamePrize[] = [
  {
    id: "p1",
    name: "20% de Descuento",
    nameEn: "20% Discount",
    type: "discount_percent",
    value: "20%",
    probability: 30,
    color: "#a27e2c", // Dorado Luxor
    textColor: "#ffffff",
    active: true,
    terms: "Aplica en el total de la cuenta actual de consumo. No acumulable.",
    termsEn: "Applies to today's consumption bill. Not accumulative.",
  },
  {
    id: "p2",
    name: "15% de Descuento",
    nameEn: "15% Discount",
    type: "discount_percent",
    value: "15%",
    probability: 20,
    color: "#fcfaf7", // Crema suave
    textColor: "#1e1b18",
    active: true,
    terms: "Aplica en el total de la cuenta actual de consumo. No acumulable.",
    termsEn: "Applies to today's consumption bill. Not accumulative.",
  },
  {
    id: "p3",
    name: "Café de Especialidad Gratis",
    nameEn: "Free Specialty Coffee",
    type: "free_item",
    value: "Café",
    probability: 20,
    color: "#d1b374", // Champagne dorado
    textColor: "#1e1b18",
    active: true,
    terms: "Válido para un Cappuccino, Latte, Espresso o Tinto de autor.",
    termsEn: "Valid for one Cappuccino, Latte, Espresso, or artisan Tinto.",
  },
  {
    id: "p4",
    name: "Postre Artesanal Gratis",
    nameEn: "Free Artisan Dessert",
    type: "free_item",
    value: "Postre",
    probability: 15,
    color: "#24201d", // Carbón editorial
    textColor: "#d1b374",
    active: true,
    terms: "Una porción de tarta vasca, cheesecake o roll recién horneado.",
    termsEn: "One slice of Basque cheesecake, cheesecake, or fresh-baked roll.",
  },
  {
    id: "p5",
    name: "Bono Dulce Sorpresa",
    nameEn: "Sweet Surprise Voucher",
    type: "free_item",
    value: "Sorpresa",
    probability: 10,
    color: "#8c6b22", // Oro viejo
    textColor: "#ffffff",
    active: true,
    terms: "Cortesía del maestro pastelero para tu mesa.",
    termsEn: "Complimentary gift from the master pastry chef.",
  },
  {
    id: "p6",
    name: "Cena Especial para 2",
    nameEn: "Special Dinner for 2",
    type: "special_experience",
    value: "Cena 2P",
    probability: 5,
    color: "#594314", // Bronce profundo
    textColor: "#ffffff",
    active: true,
    terms: "Premio mayor especial semanal. Válido con reserva previa.",
    termsEn: "Weekly grand prize. Valid with prior reservation.",
  },
];
