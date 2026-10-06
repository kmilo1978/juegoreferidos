/**
 * ============================================================================
 * MOTOR DE PERSONALIZACIÓN Y MARCA BLANCA (WHITE-LABEL CONFIG)
 * ============================================================================
 * Edita este archivo para adaptar el sistema a cualquier restaurante o negocio
 * en menos de 5 minutos (Pizzerías, Hamburgueserías, Bares, Cafés, etc.).
 */

export interface ClientConfig {
  // 1. Identidad de Marca
  brand: {
    name: string;
    tagline: string;
    taglineEn: string;
    logoUrl: string;
    emblemUrl: string; // Para el centro de la ruleta y el código QR
    currency: string;  // COP, USD, MXN, EUR, etc.
    fontHeading?: string; // Fuente de Google Fonts para títulos (ej: "Playfair Display", "Epilogue")
    fontBody?: string;    // Fuente de Google Fonts para textos (ej: "Manrope", "Montserrat")
    fontHeadingCustom?: string;
    fontBodyCustom?: string;
  };

  // 2. Paleta Cromática Dinámica
  theme: {
    primaryColor: string;     // Color de botones, aguja y bordes dorados/principales
    primaryHover: string;
    backgroundColor: string;  // Color de fondo de la aplicación
    cardColor: string;        // Fondo de tarjetas y modales
    textColor: string;        // Texto principal
    mutedColor: string;       // Textos secundarios y leyendas
  };

  // 3. Contacto, Redes y Reputación
  channels: {
    instagramHandle: string;        // Ej: "@turestaurante"
    instagramProfileUrl: string;
    whatsappNumber: string;         // Con código de país (ej: "573022777295")
    googleMapsReviewUrl: string;    // Enlace directo a reseñas de Google Business
    tripadvisorReviewUrl?: string;  // Enlace directo a perfil de TripAdvisor
    whatsappCommunityUrl?: string;  // Enlace directo a comunidad o canal oficial de WhatsApp
    supportEmail?: string;
    enableWhatsAppPhotoSubmission: boolean; // Si está activo, permite al cliente enviar foto por WhatsApp además de Instagram
    whatsappPhotoMessage?: string;          // Plantilla de mensaje predeterminado para WhatsApp
  };

  // 4. Seguridad en Caja y Operaciones
  security: {
    cashierPin: string;             // PIN de 4 dígitos para que el mesero/cajero valide
    sessionDurationMinutes: number; // Vigencia de la sesión en mesa
    singlePlayPerDay: boolean;      // Evitar que el mismo cliente juegue varias veces al día
  };

  // 5. Integración con Composio.dev & Automatizaciones
  composio: {
    enabled: boolean;
    apiKey?: string;
    integrations: {
      googleContacts: boolean;  // Guardar contacto en la agenda del teléfono automáticamente
      googleSheets: boolean;    // Escribir fila en Google Sheets sin scripts manuales
      whatsAppAutoSend: boolean;// Enviar mensaje de WhatsApp oficial al ganar
      dailyEmailSummary: boolean;// Enviar reporte diario nocturno al dueño
    };
    endpoints?: {
      googleSheetWebhookUrl?: string; // Fallback para Google Apps Script gratuito
    };
  };

  // 6. Experiencia Sensorial
  experience: {
    enableSoundEffects: boolean; // Sonido realista de ruleta y fanfarria al ganar
    enableConfetti: boolean;     // Explosión de confeti dorado
  };

  // 7. Notificaciones Web Push (OneSignal / PWA)
  pushNotifications: {
    enabled: boolean;
    appId: string; // OneSignal App ID
    safariWebId?: string;
    promptTitle: string;
    promptMessage: string;
    allowLocalhost: boolean;
  };
}

import emblemaDorado from "@/assets/emblema-dorado.png";

// Obtener datos personalizados si el usuario los configuró desde el panel de control
const getStoredBrand = () => {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("juegoreferidos_brand_identity");
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
  }
  return null;
};

/**
 * Branding por querystring — habilita el "demo en vivo personalizado desde la calle".
 *
 * Un comercial comparte un enlace como:
 *   https://app.tudominio.com/?demo=true&brand=Café%20Luna&color=%23c0392b&tel=573001234567&logo=https://.../logo.png
 * y la app se autoconfigura al abrir (sin login ni backend). Los valores leídos
 * de la URL se mezclan sobre lo guardado en localStorage y se persisten, de modo
 * que sobreviven a recargas y a la navegación interna del demo.
 *
 * Parámetros aceptados: brand (nombre), color (hex primario), tel (WhatsApp),
 * logo (URL de imagen ya hospedada), tagline, ig (handle de Instagram).
 */
const getUrlBrandOverride = (): Record<string, unknown> | null => {
  if (typeof window === "undefined") return null;
  try {
    const p = new URLSearchParams(window.location.search);
    const override: Record<string, unknown> = {};

    const brand = p.get("brand");
    if (brand) override.name = brand.trim();

    const tagline = p.get("tagline");
    if (tagline) override.tagline = tagline.trim();

    const color = p.get("color");
    if (color) {
      // Acepta "#c0392b" o "c0392b" (sin #, común al pasar por URL)
      const hex = color.startsWith("#") ? color : `#${color}`;
      if (/^#[0-9a-fA-F]{6}$/.test(hex)) {
        override.primaryColor = hex;
      }
    }

    const logo = p.get("logo");
    if (logo && /^https?:\/\//i.test(logo)) override.logoUrl = logo.trim();

    const tel = p.get("tel");
    if (tel) override.whatsappNumber = tel.replace(/[^0-9]/g, "");

    const ig = p.get("ig");
    if (ig) override.instagramHandle = ig.startsWith("@") ? ig : `@${ig}`;

    return Object.keys(override).length > 0 ? override : null;
  } catch {
    return null;
  }
};

const urlBrandOverride = getUrlBrandOverride();

// La marca de la URL tiene prioridad sobre lo guardado. Se persiste para que el
// demo personalizado sobreviva a recargas y a la navegación interna.
const storedBrand = (() => {
  const base = getStoredBrand() || {};
  if (!urlBrandOverride) return getStoredBrand();
  const merged = { ...base, ...urlBrandOverride };
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("juegoreferidos_brand_identity", JSON.stringify(merged));
    } catch {
      // ignore
    }
  }
  return merged;
})();

export const clientConfig: ClientConfig = {
  brand: {
    name: storedBrand?.name || "Tu Restaurante & Café",
    tagline: storedBrand?.tagline || "Sabores inolvidables, momentos que alegran el día.",
    taglineEn: storedBrand?.taglineEn || "Unforgettable flavors, moments that brighten your day.",
    logoUrl: storedBrand?.logoUrl || "",
    emblemUrl: storedBrand?.emblemUrl || "",
    currency: storedBrand?.currency || "COP",
    fontHeading: storedBrand?.fontHeading || "Epilogue",
    fontBody: storedBrand?.fontBody || "Manrope",
    fontHeadingCustom: storedBrand?.fontHeadingCustom || "",
    fontBodyCustom: storedBrand?.fontBodyCustom || "",
  },
  theme: {
    // Dorado de marca por defecto = el dorado real del diseño (--gold en index.css).
    // Al cambiarlo en el panel, se propaga a todo el sistema vía la variable CSS --gold.
    primaryColor: storedBrand?.primaryColor || "#f2be71",    // Color corporativo principal
    primaryHover: storedBrand?.primaryHover || "#ffddb1",
    backgroundColor: storedBrand?.backgroundColor || "#fcfaf7", // Fondo claro y elegante
    cardColor: storedBrand?.cardColor || "#ffffff",
    textColor: storedBrand?.textColor || "#1e1b18",       // Carbón de lectura
    mutedColor: storedBrand?.mutedColor || "#737373",
  },
  channels: {
    instagramHandle: storedBrand?.instagramHandle || "@turestaurante",
    instagramProfileUrl: storedBrand?.instagramProfileUrl || "https://www.instagram.com/",
    whatsappNumber: storedBrand?.whatsappNumber || "573000000000",
    googleMapsReviewUrl: storedBrand?.googleMapsReviewUrl || "https://maps.google.com",
    tripadvisorReviewUrl: storedBrand?.tripadvisorReviewUrl || "https://www.tripadvisor.com",
    whatsappCommunityUrl: storedBrand?.whatsappCommunityUrl || "https://chat.whatsapp.com/invite",
    supportEmail: storedBrand?.supportEmail || "contacto@turestaurante.com",
    enableWhatsAppPhotoSubmission: storedBrand?.enableWhatsAppPhotoSubmission !== undefined ? storedBrand.enableWhatsAppPhotoSubmission : true,
    whatsappPhotoMessage: storedBrand?.whatsappPhotoMessage || "¡Hola! 📸 Aquí les comparto la foto de mi pedido en la mesa {tableNumber} (Cliente: {participantName}) para validar mi visita y jugar en la Ruleta de Premios.",
  },
  security: {
    cashierPin: "1978",
    sessionDurationMinutes: 20,
    singlePlayPerDay: true,
  },
  composio: {
    enabled: false, // Activar cuando se configure la API Key de Composio
    apiKey: "",
    integrations: {
      googleContacts: true,
      googleSheets: true,
      whatsAppAutoSend: false,
      dailyEmailSummary: true,
    },
    endpoints: {
      googleSheetWebhookUrl: "", // Pega aquí tu URL de Google Apps Script si no usas Composio
    },
  },
  experience: {
    enableSoundEffects: true,
    enableConfetti: true,
  },
  pushNotifications: {
    enabled: true,
    appId: "", // El cliente pega aquí su App ID de OneSignal o desde el Panel Admin
    safariWebId: "",
    promptTitle: "¡No pierdas tu beneficio!",
    promptMessage: "¿Deseas recibir un recordatorio antes de que venza tu premio y avisos de 2x1 exclusivos en tu celular?",
    allowLocalhost: true,
  },
};
