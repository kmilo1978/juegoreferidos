/**
 * SISTEMA CENTRALIZADO Y MODULAR DE CONFIGURACIÓN
 * Gestiona de forma unificada:
 * 1. Activación y desactivación de módulos independientes (ON / OFF)
 * 2. Paleta cromática global (primario, secundario, fondos, textos, bordes, estados y alertas)
 * 3. Tipografía, fuentes Google Fonts, tamaños, pesos y espaciados
 * 4. Geometría: radios de redondeo, sombras y bordes
 * 5. Identidad de marca, textos institucionales y logotipos
 * 6. Modo claro / oscuro y persistencia
 * 7. Motor de validación y propagación reactiva en tiempo real (CSS Custom Properties)
 */

export interface SystemModulesConfig {
  roulette: boolean;
  scratch: boolean;
  memory: boolean;
  pickWin: boolean;
  jackpot: boolean;
  plinko: boolean;
  secondChance: boolean;
  stampsCard: boolean;
  missions: boolean;
  vipContest: boolean;
  reputationReviews: boolean;
  wifiCaptivePortal: boolean;
  pushNotifications: boolean;
  hermesAiAssistant: boolean;
  nfcContactless: boolean;
  guestModeAllowed: boolean;
}

export interface SystemColorsConfig {
  primary: string; // ej. #f2be71 (Dorado cálido)
  primaryHover: string;
  secondary: string; // ej. #ccc3d8
  background: string; // ej. #141317 (Dark) o #fcfaf7 (Light)
  cardBackground: string; // ej. #1c1b1f
  surfaceInput: string; // ej. #201f23
  textPrimary: string; // ej. #e6e1e7
  textSecondary: string; // ej. #958da1
  borderColor: string; // ej. #363439
  borderFocus: string; // ej. #f2be71
  // Estados y Alertas
  success: string; // ej. #10b981
  warning: string; // ej. #f59e0b
  error: string; // ej. #ef4444
  info: string; // ej. #3b82f6
}

export interface SystemTypographyConfig {
  fontHeading: string; // ej. Epilogue, Playfair Display, Montserrat
  fontBody: string; // ej. Manrope, Inter, Plus Jakarta Sans
  fontSizeBase: number; // 14, 15, 16, 18 px
  headingScale: "compact" | "normal" | "spacious";
  fontWeightHeading: "600" | "700" | "800" | "900";
  lineHeight: "tight" | "normal" | "relaxed";
  letterSpacing: "tight" | "normal" | "wide";
}

export interface SystemGeometryConfig {
  borderRadius: "none" | "small" | "medium" | "large" | "full";
  shadowLevel: "none" | "subtle" | "medium" | "dramatic" | "neon_glow";
  borderWidth: "1px" | "2px" | "3px";
}

export interface SystemBrandConfig {
  brandName: string;
  tagline: string;
  taglineEn: string;
  logoUrl: string;
  emblemUrl: string;
  currency: string;
  footerNotice: string;
  privacyPolicyUrl: string;
  termsConditionsUrl: string;
}

export interface CentralSystemConfig {
  version: string;
  themeMode: "dark" | "light";
  modules: SystemModulesConfig;
  colors: SystemColorsConfig;
  typography: SystemTypographyConfig;
  geometry: SystemGeometryConfig;
  brand: SystemBrandConfig;
}

export const DEFAULT_CENTRAL_CONFIG: CentralSystemConfig = {
  version: "2.5.0",
  themeMode: "dark",
  modules: {
    roulette: true,
    scratch: true,
    memory: true,
    pickWin: true,
    jackpot: true,
    plinko: true,
    secondChance: true,
    stampsCard: true,
    missions: true,
    vipContest: true,
    reputationReviews: true,
    wifiCaptivePortal: true,
    pushNotifications: true,
    hermesAiAssistant: true,
    nfcContactless: true,
    guestModeAllowed: true,
  },
  colors: {
    primary: "#f2be71",
    primaryHover: "#ffddb1",
    secondary: "#ccc3d8",
    background: "#141317",
    cardBackground: "#1c1b1f",
    surfaceInput: "#201f23",
    textPrimary: "#e6e1e7",
    textSecondary: "#958da1",
    borderColor: "#363439",
    borderFocus: "#f2be71",
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
    info: "#3b82f6",
  },
  typography: {
    fontHeading: "Epilogue",
    fontBody: "Manrope",
    fontSizeBase: 15,
    headingScale: "normal",
    fontWeightHeading: "800",
    lineHeight: "normal",
    letterSpacing: "normal",
  },
  geometry: {
    borderRadius: "medium", // 16px
    shadowLevel: "medium",
    borderWidth: "1px",
  },
  brand: {
    brandName: "Tu Restaurante & Café",
    tagline: "Sabores inolvidables, momentos que alegran el día.",
    taglineEn: "Unforgettable flavors, moments that brighten your day.",
    logoUrl: "/src/assets/logo-header.png",
    emblemUrl: "/src/assets/emblema-dorado.png",
    currency: "COP",
    footerNotice: "Experiencia gastronómica y programa de fidelización interactivo en mesa.",
    privacyPolicyUrl: "#/privacy",
    termsConditionsUrl: "#/terms",
  },
};

const STORAGE_KEY = "juegoreferidos_central_system_config";

export class CentralSystemConfigService {
  private static listeners: Array<(config: CentralSystemConfig) => void> = [];

  /**
   * Obtiene la configuración activa desde localStorage o los valores por defecto
   */
  static getConfig(): CentralSystemConfig {
    if (typeof window === "undefined") return DEFAULT_CENTRAL_CONFIG;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return DEFAULT_CENTRAL_CONFIG;
      const parsed = JSON.parse(saved);
      return {
        ...DEFAULT_CENTRAL_CONFIG,
        ...parsed,
        modules: { ...DEFAULT_CENTRAL_CONFIG.modules, ...(parsed.modules || {}) },
        colors: { ...DEFAULT_CENTRAL_CONFIG.colors, ...(parsed.colors || {}) },
        typography: { ...DEFAULT_CENTRAL_CONFIG.typography, ...(parsed.typography || {}) },
        geometry: { ...DEFAULT_CENTRAL_CONFIG.geometry, ...(parsed.geometry || {}) },
        brand: { ...DEFAULT_CENTRAL_CONFIG.brand, ...(parsed.brand || {}) },
      };
    } catch {
      return DEFAULT_CENTRAL_CONFIG;
    }
  }

  /**
   * Guarda y aplica de inmediato las variables CSS en todo el DOM
   */
  static saveConfig(newConfig: CentralSystemConfig): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
      this.applyToDOM(newConfig);

      // Notificar a observadores locales
      this.listeners.forEach((listener) => {
        try {
          listener(newConfig);
        } catch (e) {
          console.error("Error in config listener:", e);
        }
      });

      // Notificar a otras pestañas o iframes vía BroadcastChannel
      if (typeof BroadcastChannel !== "undefined") {
        const bc = new BroadcastChannel("system_config_channel");
        bc.postMessage({ type: "CONFIG_UPDATED", config: newConfig });
        bc.close();
      }
    } catch (err) {
      console.error("Error guardando central config:", err);
    }
  }

  /**
   * Aplica variables CSS Custom Properties al elemento raíz del documento
   */
  static applyToDOM(config: CentralSystemConfig): void {
    if (typeof document === "undefined") return;
    const root = document.documentElement;

    // Colores
    root.style.setProperty("--color-brand-primary", config.colors.primary);
    root.style.setProperty("--color-brand-primary-hover", config.colors.primaryHover);
    root.style.setProperty("--color-brand-secondary", config.colors.secondary);
    root.style.setProperty("--color-brand-bg", config.colors.background);
    root.style.setProperty("--color-brand-card", config.colors.cardBackground);
    root.style.setProperty("--color-brand-input", config.colors.surfaceInput);
    root.style.setProperty("--color-brand-text", config.colors.textPrimary);
    root.style.setProperty("--color-brand-text-muted", config.colors.textSecondary);
    root.style.setProperty("--color-brand-border", config.colors.borderColor);
    root.style.setProperty("--color-brand-border-focus", config.colors.borderFocus);
    root.style.setProperty("--color-brand-success", config.colors.success);
    root.style.setProperty("--color-brand-warning", config.colors.warning);
    root.style.setProperty("--color-brand-error", config.colors.error);
    root.style.setProperty("--color-brand-info", config.colors.info);

    // Tipografía
    root.style.setProperty("--font-brand-heading", config.typography.fontHeading);
    root.style.setProperty("--font-brand-body", config.typography.fontBody);
    root.style.setProperty("--font-size-base", `${config.typography.fontSizeBase}px`);

    // Radio de redondeo
    const radiusMap: Record<string, string> = {
      none: "0px",
      small: "8px",
      medium: "16px",
      large: "24px",
      full: "9999px",
    };
    root.style.setProperty("--radius-brand", radiusMap[config.geometry.borderRadius] || "16px");

    // Sombra
    const shadowMap: Record<string, string> = {
      none: "none",
      subtle: "0 2px 8px rgba(0, 0, 0, 0.2)",
      medium: "0 8px 24px rgba(0, 0, 0, 0.4)",
      dramatic: "0 16px 40px rgba(0, 0, 0, 0.7)",
      neon_glow: `0 0 25px ${config.colors.primary}66`,
    };
    root.style.setProperty("--shadow-brand", shadowMap[config.geometry.shadowLevel] || "none");

    // Bordes
    root.style.setProperty("--border-width-brand", config.geometry.borderWidth);

    // Atributo data-theme
    root.setAttribute("data-theme", config.themeMode);
  }

  /**
   * Suscribe un callback a cambios de configuración
   */
  static subscribe(listener: (config: CentralSystemConfig) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  /**
   * Restaura la configuración a los valores por defecto
   */
  static resetToDefaults(): CentralSystemConfig {
    this.saveConfig(DEFAULT_CENTRAL_CONFIG);
    return DEFAULT_CENTRAL_CONFIG;
  }

  /**
   * Validador de consistencia de configuración
   */
  static validate(config: CentralSystemConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const hexRegex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

    if (!hexRegex.test(config.colors.primary)) {
      errors.push("El color primario debe ser un valor hexadecimal válido (ej: #f2be71).");
    }
    if (!hexRegex.test(config.colors.background)) {
      errors.push("El color de fondo debe ser un valor hexadecimal válido (ej: #141317).");
    }
    if (!config.brand.brandName.trim()) {
      errors.push("El nombre de la marca no puede estar vacío.");
    }
    if (config.typography.fontSizeBase < 12 || config.typography.fontSizeBase > 22) {
      errors.push("El tamaño de fuente base debe estar entre 12px y 22px.");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
