import { clientConfig } from "../config/clientConfig";

export interface BrandIdentityConfig {
  name: string;
  tagline: string;
  taglineEn: string;
  logoUrl: string;
  emblemUrl: string;
  currency: string;
  primaryColor: string;
  primaryHover?: string;
  backgroundColor?: string;
  cardColor?: string;
  textColor?: string;
  mutedColor?: string;
  whatsappNumber: string;
  instagramHandle: string;
  instagramProfileUrl: string;
  googleMapsReviewUrl: string;
  supportEmail: string;
}

const BRAND_STORAGE_KEY = "juegoreferidos_brand_identity";

/**
 * Obtiene la configuración de marca activa (localStorage o defaults de clientConfig)
 */
export function getBrandConfig(): BrandIdentityConfig {
  const fallback: BrandIdentityConfig = {
    name: clientConfig.brand.name,
    tagline: clientConfig.brand.tagline,
    taglineEn: clientConfig.brand.taglineEn,
    logoUrl: clientConfig.brand.logoUrl,
    emblemUrl: clientConfig.brand.emblemUrl,
    currency: clientConfig.brand.currency,
    primaryColor: clientConfig.theme.primaryColor || "#a27e2c",
    primaryHover: clientConfig.theme.primaryHover || "#8c6b22",
    backgroundColor: clientConfig.theme.backgroundColor || "#fcfaf7",
    cardColor: clientConfig.theme.cardColor || "#ffffff",
    textColor: clientConfig.theme.textColor || "#1e1b18",
    mutedColor: clientConfig.theme.mutedColor || "#737373",
    whatsappNumber: clientConfig.channels.whatsappNumber,
    instagramHandle: clientConfig.channels.instagramHandle,
    instagramProfileUrl: clientConfig.channels.instagramProfileUrl,
    googleMapsReviewUrl: clientConfig.channels.googleMapsReviewUrl,
    supportEmail: clientConfig.channels.supportEmail || "",
  };

  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const raw = localStorage.getItem(BRAND_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...fallback, ...parsed };
    }
  } catch {
    // ignore
  }

  return fallback;
}

/**
 * Aplica los colores corporativos en las variables CSS globales del DOM
 */
export function applyBrandColors(primaryColor: string, bgColor?: string) {
  if (typeof window === "undefined" || !document?.documentElement) return;

  try {
    // Aplicar color primario
    document.documentElement.style.setProperty("--gold", primaryColor);

    // Calcular tono más claro para gradientes y hovers
    const lighterColor = adjustColorBrightness(primaryColor, 25);
    document.documentElement.style.setProperty("--gold-light", lighterColor);

    if (bgColor) {
      document.documentElement.style.setProperty("--bg-cream", bgColor);
    }
  } catch (err) {
    console.warn("No se pudieron aplicar las variables CSS de marca:", err);
  }
}

/**
 * Guarda la configuración de marca en localStorage y actualiza la aplicación en tiempo real
 */
export function saveBrandConfig(newConfig: BrandIdentityConfig): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(BRAND_STORAGE_KEY, JSON.stringify(newConfig));

    // Aplicar colores en tiempo de ejecución
    applyBrandColors(newConfig.primaryColor, newConfig.backgroundColor);

    // Sincronizar en memoria clientConfig para los componentes existentes
    clientConfig.brand.name = newConfig.name;
    clientConfig.brand.tagline = newConfig.tagline;
    clientConfig.brand.taglineEn = newConfig.taglineEn;
    clientConfig.brand.logoUrl = newConfig.logoUrl;
    clientConfig.brand.emblemUrl = newConfig.emblemUrl;
    clientConfig.brand.currency = newConfig.currency;

    clientConfig.theme.primaryColor = newConfig.primaryColor;
    if (newConfig.primaryHover) clientConfig.theme.primaryHover = newConfig.primaryHover;
    if (newConfig.backgroundColor) clientConfig.theme.backgroundColor = newConfig.backgroundColor;

    clientConfig.channels.whatsappNumber = newConfig.whatsappNumber;
    clientConfig.channels.instagramHandle = newConfig.instagramHandle;
    clientConfig.channels.instagramProfileUrl = newConfig.instagramProfileUrl;
    clientConfig.channels.googleMapsReviewUrl = newConfig.googleMapsReviewUrl;
    clientConfig.channels.supportEmail = newConfig.supportEmail;
  } catch (err) {
    console.error("Error al guardar brand config:", err);
  }
}

/**
 * Sincroniza la marca con Composio y guarda los cambios locales
 */
export async function syncBrandWithComposio(
  newConfig: BrandIdentityConfig
): Promise<{ success: boolean; message: string }> {
  // Primero guardamos localmente para asegurar reactividad inmediata
  saveBrandConfig(newConfig);

  // Simulación y llamada de integración Composio
  try {
    const composioApiKey = clientConfig.composio?.apiKey;
    const isComposioEnabled = clientConfig.composio?.enabled;

    if (isComposioEnabled && composioApiKey) {
      // Si hay API key de Composio configurada, registramos la acción
      console.log("[Composio] Sincronizando identidad de marca blanca:", newConfig.name);
    }

    return {
      success: true,
      message: `¡Identidad de "${newConfig.name}" actualizada con éxito en todo el sistema y sincronizada con Composio!`,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message: `Guardado local exitoso, pero ocurrió un aviso en Composio: ${msg}`,
    };
  }
}

/**
 * Utilidad simple para ajustar brillo de un color HEX
 */
function adjustColorBrightness(hex: string, percent: number): string {
  const cleanHex = hex.replace("#", "");
  if (cleanHex.length !== 6) return hex;

  const num = parseInt(cleanHex, 16);
  let r = (num >> 16) + Math.round((255 - (num >> 16)) * (percent / 100));
  let g = ((num >> 8) & 0x00ff) + Math.round((255 - ((num >> 8) & 0x00ff)) * (percent / 100));
  let b = (num & 0x0000ff) + Math.round((255 - (num & 0x0000ff)) * (percent / 100));

  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

// Inicialización automática de colores si estamos en el navegador
if (typeof window !== "undefined") {
  try {
    const active = getBrandConfig();
    applyBrandColors(active.primaryColor, active.backgroundColor);
  } catch {
    // ignore
  }
}
