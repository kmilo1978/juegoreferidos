/**
 * ============================================================================
 * SERVICIO CENTRAL DE NOTIFICACIONES WEB PUSH PERSONALIZABLES
 * ============================================================================
 * OneSignal SDK + Notification API nativo de navegador.
 * Soporta personalización total de títulos, mensajes y variables dinámicas:
 * {nombre}, {premio}, {codigo}, {mesa}, {restaurante}.
 */

import { clientConfig } from "../config/clientConfig";

export interface PushRuntimeConfig {
  enabled: boolean;
  appId: string;
  safariWebId?: string;
  promptTitle: string;
  promptMessage: string;
  allowLocalhost: boolean;
}

export interface PushNotificationTemplate {
  id: string;
  name: string;
  category: "happy_hour" | "abandoned_prize" | "expiring_soon" | "birthday" | "custom_broadcast";
  title: string;
  body: string;
  badge: string;
  tagDescription: string;
}

export const DEFAULT_PUSH_TEMPLATES: PushNotificationTemplate[] = [
  {
    id: "happy_hour",
    name: "1. Horas Muertas & Happy Hour (3 PM - 6 PM)",
    category: "happy_hour",
    title: "⚡ ¡Happy Hour en {restaurante}!",
    body: "¡Hola {nombre}! Hoy de 3:00 a 6:00 PM tus visitas valen el DOBLE de sellos. ¡Ven y endulza tu tarde en tu mesa!",
    badge: "Sellos Dobles",
    tagDescription: "Se envía automáticamente en horas lentas (3:00 PM - 6:00 PM)",
  },
  {
    id: "abandoned_prize",
    name: "2. Rescate de Cupones no Canjeados (48 Horas)",
    category: "abandoned_prize",
    title: "🎁 ¡{nombre}, tu {premio} te está esperando!",
    body: "Aún tienes activo tu beneficio de la ruleta en la Mesa {mesa}. Presenta tu código {codigo} hoy y disfrútalo.",
    badge: "Rescate 48h",
    tagDescription: "Se envía 48h después de ganar si el cliente no validó el PIN en caja",
  },
  {
    id: "expiring_soon",
    name: "3. Urgencia de Caducidad (Últimas 24 Horas)",
    category: "expiring_soon",
    title: "⚠️ ¡Tu beneficio en {restaurante} vence mañana!",
    body: "¡Última oportunidad! Tu cupón {codigo} ({premio}) vence pronto. ¡Ven hoy y no dejes perder tu regalo!",
    badge: "Vence en 24h",
    tagDescription: "Se envía 24h antes del vencimiento oficial de 7 días",
  },
  {
    id: "birthday",
    name: "4. Regalo Especial de Cumpleaños",
    category: "birthday",
    title: "🎂 ¡Feliz Cumpleaños te desea {restaurante}! 🎉",
    body: "¡{nombre}, hoy la casa invita! Ven a celebrar tu cumpleaños con nosotros y reclama tu postre artesanal gratis.",
    badge: "Cumpleaños",
    tagDescription: "Se envía automáticamente en la fecha de cumpleaños del cliente",
  },
  {
    id: "custom_broadcast",
    name: "5. Anuncio Masivo / Promoción de Hoy",
    category: "custom_broadcast",
    title: "✨ Experiencia Especial de Hoy en {restaurante}",
    body: "¡Tenemos nuevas delicias horneadas y beneficios sorpresa exclusivos al escanear tu mesa hoy!",
    badge: "Mensaje Libre",
    tagDescription: "Envío inmediato a todos los comensales suscritos",
  },
];

const TEMPLATES_STORAGE_KEY = "juegoreferidos_custom_push_templates";

declare global {
  interface Window {
    OneSignalDeferred?: Array<(oneSignal: any) => Promise<void> | void>;
    OneSignal?: any;
  }
}

/**
 * Obtiene las plantillas de push personalizadas desde localStorage o los valores por defecto
 */
export function getCustomPushTemplates(): PushNotificationTemplate[] {
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(TEMPLATES_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Combinar con defaults para garantizar que no falten plantillas nuevas
          return DEFAULT_PUSH_TEMPLATES.map((def) => {
            const found = parsed.find((p: PushNotificationTemplate) => p.id === def.id);
            return found || def;
          });
        }
      }
    } catch {
      // ignore
    }
  }
  return DEFAULT_PUSH_TEMPLATES;
}

/**
 * Guarda las plantillas de mensajes push editadas por el usuario
 */
export function saveCustomPushTemplates(templates: PushNotificationTemplate[]): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(templates));
    } catch {
      // ignore
    }
  }
}

/**
 * Restablece las plantillas a los textos recomendados por defecto
 */
export function resetPushTemplates(): PushNotificationTemplate[] {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(TEMPLATES_STORAGE_KEY);
    } catch {
      // ignore
    }
  }
  return DEFAULT_PUSH_TEMPLATES;
}

/**
 * Reemplaza las variables dinámicas en el texto del mensaje
 */
export function formatPushText(
  text: string,
  context?: {
    name?: string;
    prize?: string;
    code?: string;
    table?: string;
    restaurant?: string;
  }
): string {
  const brand = context?.restaurant || clientConfig.brand.name;
  const name = context?.name || "Carlos Andrés";
  const prize = context?.prize || "Postre o Café Gratis";
  const code = context?.code || "REST-7X9A";
  const table = context?.table || "Mesa 3";

  return text
    .replace(/{nombre}/gi, name)
    .replace(/{premio}/gi, prize)
    .replace(/{codigo}/gi, code)
    .replace(/{mesa}/gi, table)
    .replace(/{restaurante}/gi, brand);
}

/**
 * Obtiene la configuración de Push desde localStorage o clientConfig por defecto
 */
export function getPushConfig(): PushRuntimeConfig {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("juegoreferidos_push_config");
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
  }
  return {
    enabled: clientConfig.pushNotifications?.enabled ?? true,
    appId: clientConfig.pushNotifications?.appId || "",
    safariWebId: clientConfig.pushNotifications?.safariWebId || "",
    promptTitle: clientConfig.pushNotifications?.promptTitle || "¡No pierdas tu beneficio!",
    promptMessage:
      clientConfig.pushNotifications?.promptMessage ||
      "¿Deseas recibir un recordatorio antes de que venza tu premio y avisos de 2x1 exclusivos en tu celular?",
    allowLocalhost: clientConfig.pushNotifications?.allowLocalhost ?? true,
  };
}

/**
 * Guarda la configuración de OneSignal en localStorage
 */
export function savePushConfig(config: PushRuntimeConfig): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("juegoreferidos_push_config", JSON.stringify(config));
    } catch {
      // ignore
    }
  }
}

/**
 * Servicio Central de Notificaciones Web Push (OneSignal & PWA)
 */
export class OneSignalService {
  private static isInitialized = false;

  /**
   * Inicializa el SDK de OneSignal
   */
  static init(): void {
    if (typeof window === "undefined" || this.isInitialized) return;

    const config = getPushConfig();
    if (!config.enabled) return;

    if (!document.getElementById("onesignal-sdk")) {
      const script = document.createElement("script");
      script.id = "onesignal-sdk";
      script.src = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js";
      script.defer = true;
      document.head.appendChild(script);
    }

    window.OneSignalDeferred = window.OneSignalDeferred || [];

    if (config.appId) {
      window.OneSignalDeferred.push(async function (OneSignal) {
        try {
          await OneSignal.init({
            appId: config.appId,
            safari_web_id: config.safariWebId || undefined,
            notifyButton: { enable: false },
            allowLocalhostAsSecureOrigin: config.allowLocalhost,
          });
          console.log("[OneSignal] Inicializado con éxito con App ID:", config.appId);
        } catch (err) {
          console.warn("[OneSignal] Error al inicializar:", err);
        }
      });
    }

    this.isInitialized = true;
  }

  static isSupported(): boolean {
    return typeof window !== "undefined" && "Notification" in window;
  }

  static isSubscribed(): boolean {
    if (typeof window === "undefined") return false;
    if ("Notification" in window && Notification.permission === "granted") {
      return true;
    }
    return localStorage.getItem("juegoreferidos_push_subscribed") === "true";
  }

  static async requestPermission(leadData?: {
    name?: string;
    prize?: string;
    code?: string;
    table?: string;
  }): Promise<boolean> {
    if (!this.isSupported()) return false;

    try {
      if (window.OneSignal?.Notifications) {
        await window.OneSignal.Notifications.requestPermission();
        const permission = window.OneSignal.Notifications.permission;
        if (permission) {
          localStorage.setItem("juegoreferidos_push_subscribed", "true");

          if (leadData && window.OneSignal.User?.addTags) {
            await window.OneSignal.User.addTags({
              cliente_nombre: leadData.name || "Comensal",
              premio_ganado: leadData.prize || "Premio",
              codigo_cupon: leadData.code || "N/A",
              mesa_origen: leadData.table || "Sala",
              fecha_visita: new Date().toISOString().split("T")[0],
            });
          }
          return true;
        }
      }

      const res = await Notification.requestPermission();
      if (res === "granted") {
        localStorage.setItem("juegoreferidos_push_subscribed", "true");
        return true;
      }
      return false;
    } catch (err) {
      console.error("[Push] Error solicitando permisos:", err);
      return false;
    }
  }

  /**
   * Dispara una notificación de prueba usando una plantilla personalizada
   */
  static triggerTemplateNotification(
    templateId: string,
    context?: { name?: string; prize?: string; code?: string; table?: string }
  ): void {
    const templates = getCustomPushTemplates();
    const template = templates.find((t) => t.id === templateId) || templates[0];

    const renderedTitle = formatPushText(template.title, context);
    const renderedBody = formatPushText(template.body, context);

    this.showLocalTestNotification(renderedTitle, renderedBody);
  }

  /**
   * Muestra la notificación local en pantalla (desktop / mobile)
   */
  static showLocalTestNotification(title: string, body: string): void {
    if (!this.isSupported()) {
      alert("Este navegador no soporta notificaciones push.");
      return;
    }

    if (Notification.permission === "granted") {
      try {
        new Notification(title, {
          body,
          icon: "/assets/emblema-dorado.png",
          badge: "/assets/emblema-dorado.png",
        });
      } catch {
        if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: "SHOW_NOTIFICATION",
            title,
            body,
          });
        }
      }
    } else {
      // Solicitar permiso amablemente
      Notification.requestPermission().then((res) => {
        if (res === "granted") {
          this.showLocalTestNotification(title, body);
        } else {
          alert("Debes conceder permisos de notificación en tu navegador para ver la alerta.");
        }
      });
    }
  }
}
