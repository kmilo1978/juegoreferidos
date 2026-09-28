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
    supportEmail?: string;
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

import logoHeader from "@/assets/logo-header.png";
import emblemaDorado from "@/assets/emblema-dorado.png";

export const clientConfig: ClientConfig = {
  brand: {
    name: "Tu Restaurante & Café",
    tagline: "Sabores inolvidables, momentos que alegran el día.",
    taglineEn: "Unforgettable flavors, moments that brighten your day.",
    logoUrl: logoHeader,
    emblemUrl: emblemaDorado,
    currency: "COP",
  },
  theme: {
    primaryColor: "#a27e2c",    // Color corporativo principal
    primaryHover: "#8c6b22",
    backgroundColor: "#fcfaf7", // Fondo claro y elegante
    cardColor: "#ffffff",
    textColor: "#1e1b18",       // Carbón de lectura
    mutedColor: "#737373",
  },
  channels: {
    instagramHandle: "@turestaurante",
    instagramProfileUrl: "https://www.instagram.com/",
    whatsappNumber: "573000000000",
    googleMapsReviewUrl: "https://maps.google.com",
    supportEmail: "contacto@turestaurante.com",
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
