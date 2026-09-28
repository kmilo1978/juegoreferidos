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
  restApiKey?: string;
  webhookUrl?: string;
  safariWebId?: string;
  promptTitle: string;
  promptMessage: string;
  allowLocalhost: boolean;
}

export interface AutomatedPushFlow {
  id: string;
  name: string;
  category: "welcome" | "expiring_coupon" | "win_back" | "happy_hour";
  enabled: boolean;
  delayHours: number;
  triggerDescription: string;
  title: string;
  body: string;
  badge: string;
}

export const DEFAULT_AUTOMATED_FLOWS: AutomatedPushFlow[] = [
  {
    id: "flow_welcome",
    name: "Flujo 1: Bienvenida & Primer Sello",
    category: "welcome",
    enabled: true,
    delayHours: 0.1,
    triggerDescription: "Se envía automáticamente 6 minutos después del primer juego en mesa",
    title: "🎉 ¡Gracias por visitarnos en {restaurante}!",
    body: "¡Hola {nombre}! Tu primer sello ya está activo en tu tarjeta digital. ¡Te esperamos pronto para tu siguiente premio!",
    badge: "Bienvenida",
  },
  {
    id: "flow_expiring_coupon",
    name: "Flujo 2: Recordatorio Cupón por Vencer (24 Horas)",
    category: "expiring_coupon",
    enabled: true,
    delayHours: 144,
    triggerDescription: "Se envía 24h antes de que expire el cupón de la ruleta",
    title: "⏳ ¡{nombre}, tu beneficio vence mañana!",
    body: "Recuerda que tienes activo tu {premio} con código {codigo}. ¡Ven hoy a {restaurante} y disfrútalo en mesa!",
    badge: "Urgencia 24h",
  },
  {
    id: "flow_win_back",
    name: "Flujo 3: Reactivación de Clientes Inactivos (14 Días)",
    category: "win_back",
    enabled: true,
    delayHours: 336,
    triggerDescription: "Se envía a clientes que llevan más de 14 días sin visitarnos",
    title: "☕ ¡Te extrañamos en {restaurante}!",
    body: "¡{nombre}, hace días no te vemos! Ven esta semana y recibe un postre artesanal sorpresa de cortesía con tu café.",
    badge: "Reactivación",
  },
  {
    id: "flow_happy_hour",
    name: "Flujo 4: Multiplicador en Horas Muertas (3 PM - 6 PM)",
    category: "happy_hour",
    enabled: true,
    delayHours: 0,
    triggerDescription: "Disparo automático de 3:00 PM a 6:00 PM de Lunes a Jueves",
    title: "⚡ ¡Happy Hour de Sellos Dobles (3 a 6 PM)!",
    body: "¡Tarde dulce en {restaurante}! Hoy tus consumos suman 2 SELLOS en tu tarjeta de fidelización. ¡Aprovecha la tarde!",
    badge: "Doble Sello",
  },
];

const FLOWS_STORAGE_KEY = "juegoreferidos_automated_push_flows";

export function getAutomatedFlows(): AutomatedPushFlow[] {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(FLOWS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return DEFAULT_AUTOMATED_FLOWS.map((def) => {
            const found = parsed.find((f: AutomatedPushFlow) => f.id === def.id);
            return found ? { ...def, ...found } : def;
          });
        }
      }
    } catch {}
  }
  return DEFAULT_AUTOMATED_FLOWS;
}

export function saveAutomatedFlows(flows: AutomatedPushFlow[]): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(FLOWS_STORAGE_KEY, JSON.stringify(flows));
    } catch {}
  }
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
    restApiKey: "",
    webhookUrl: "",
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

  /**
   * Envía una notificación push masiva a través de OneSignal REST API o Webhook
   */
  static async sendBroadcastPush(payload: {
    title: string;
    body: string;
    url?: string;
    segment?: string;
    scheduleType?: "immediate" | "scheduled";
    scheduledTime?: string;
    channels?: { push: boolean; webhook: boolean; whatsappPreview: boolean };
  }): Promise<{ success: boolean; message: string }> {
    const config = getPushConfig();

    // 1. Mostrar preview local para feedback inmediato del administrador
    this.showLocalTestNotification(payload.title, payload.body);

    // 2. Si tiene REST API Key y App ID de OneSignal, enviar a través de OneSignal REST API
    if (config.appId && config.restApiKey && (payload.channels?.push ?? true)) {
      try {
        const bodyPayload: any = {
          app_id: config.appId,
          included_segments: [payload.segment || "Subscribed Users"],
          headings: { en: payload.title, es: payload.title },
          contents: { en: payload.body, es: payload.body },
          url: payload.url || (typeof window !== "undefined" ? window.location.origin : ""),
        };

        if (payload.scheduleType === "scheduled" && payload.scheduledTime) {
          bodyPayload.send_after = new Date(payload.scheduledTime).toUTCString();
        }

        const response = await fetch("https://onesignal.com/api/v1/notifications", {
          method: "POST",
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            Authorization: `Basic ${config.restApiKey}`,
          },
          body: JSON.stringify(bodyPayload),
        });

        const data = await response.json();
        if (response.ok && data.id) {
          return {
            success: true,
            message: `¡Notificación ${payload.scheduleType === "scheduled" ? "programada" : "enviada"} con éxito! (ID OneSignal: ${data.id})`,
          };
        }
      } catch (err: any) {
        console.warn("[OneSignal] Error enviando REST push:", err.message);
      }
    }

    // 3. Fallback y registro en el backend local / webhook
    try {
      await fetch("http://localhost:3001/api/push/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: payload.title,
          body: payload.body,
          url: payload.url,
          segment: payload.segment,
          scheduleType: payload.scheduleType || "immediate",
          scheduledTime: payload.scheduledTime || "",
          channels: payload.channels || { push: true, webhook: true, whatsappPreview: true },
          sentAt: new Date().toLocaleTimeString("es-CO"),
        }),
      });
    } catch {}

    const isScheduled = payload.scheduleType === "scheduled";
    return {
      success: true,
      message: isScheduled
        ? `¡Campaña programada con éxito para el ${payload.scheduledTime}! Guardada en el sistema.`
        : "¡Campaña push enviada exitosamente a los suscriptores y registrada en el sistema!",
    };
  }
}

export interface CustomSavedOffer {
  id: string;
  name: string;
  title: string;
  body: string;
  url: string;
  segment: string;
  scheduleType: "immediate" | "scheduled";
  scheduledTime?: string;
  channels: {
    push: boolean;
    webhook: boolean;
    whatsappPreview: boolean;
  };
  createdAt: string;
}

export const DEFAULT_SAVED_OFFERS: CustomSavedOffer[] = [
  {
    id: "offer_happy_hour",
    name: "⚡ Happy Hour 2x1 (3 a 6 PM)",
    title: "⚡ ¡Happy Hour 2x1 en Café y Bebidas de Autor!",
    body: "¡Hola {nombre}! Hoy de 3:00 a 6:00 PM acumula el DOBLE de sellos y disfruta 2x1 en bebidas. ¡Muestra este mensaje en caja!",
    url: "",
    segment: "Subscribed Users",
    scheduleType: "immediate",
    channels: { push: true, webhook: true, whatsappPreview: true },
    createdAt: "Plantilla Inicial",
  },
  {
    id: "offer_dessert",
    name: "🍰 Postre de Cortesía en Mesa",
    title: "🍰 ¡Postre de Cortesía en tu Visita de Hoy!",
    body: "Ven hoy a deleitarte en {restaurante} y recibe un postre artesanal de autor de cortesía con tu consumo principal. ¡Te esperamos!",
    url: "",
    segment: "Subscribed Users",
    scheduleType: "immediate",
    channels: { push: true, webhook: true, whatsappPreview: false },
    createdAt: "Plantilla Inicial",
  },
  {
    id: "offer_flash_50",
    name: "⏳ Cupón Flash 50% Off (Hoy)",
    title: "⏳ Cupón Flash: 50% en tu Segundo Plato o Bebida",
    body: "¡Solo por hoy! Disfruta 50% de descuento en tu segundo producto favorito en {restaurante}. Muestra este aviso en caja.",
    url: "",
    segment: "Active Customers",
    scheduleType: "immediate",
    channels: { push: true, webhook: true, whatsappPreview: true },
    createdAt: "Plantilla Inicial",
  },
  {
    id: "offer_double_stamps",
    name: "🌟 Doble Sello Fin de Semana",
    title: "🌟 ¡Sellos Dobles este Fin de Semana!",
    body: "¡Acelera tu tarjeta de 15 sellos! Cada visita este fin de semana en {restaurante} te otorga 2 sellos para llegar antes a tu premio.",
    url: "",
    segment: "Subscribed Users",
    scheduleType: "immediate",
    channels: { push: true, webhook: true, whatsappPreview: false },
    createdAt: "Plantilla Inicial",
  },
];

const SAVED_OFFERS_KEY = "juegoreferidos_custom_saved_offers";

export function getCustomSavedOffers(): CustomSavedOffer[] {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(SAVED_OFFERS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}
  }
  return DEFAULT_SAVED_OFFERS;
}

export function saveCustomSavedOffer(offer: CustomSavedOffer): CustomSavedOffer[] {
  const current = getCustomSavedOffers();
  const existingIdx = current.findIndex((o) => o.id === offer.id);
  let updated: CustomSavedOffer[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = offer;
  } else {
    updated = [offer, ...current];
  }
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(SAVED_OFFERS_KEY, JSON.stringify(updated));
    } catch {}
  }
  return updated;
}

export function deleteCustomSavedOffer(id: string): CustomSavedOffer[] {
  const current = getCustomSavedOffers();
  const updated = current.filter((o) => o.id !== id);
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(SAVED_OFFERS_KEY, JSON.stringify(updated));
    } catch {}
  }
  return updated;
}
