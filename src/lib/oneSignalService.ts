import { clientConfig } from "../config/clientConfig";

export interface PushRuntimeConfig {
  enabled: boolean;
  appId: string;
  safariWebId?: string;
  promptTitle: string;
  promptMessage: string;
  allowLocalhost: boolean;
}

declare global {
  interface Window {
    OneSignalDeferred?: Array<(oneSignal: any) => Promise<void> | void>;
    OneSignal?: any;
  }
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
 * Guarda la configuración de OneSignal en localStorage para cambios en vivo desde el Panel Admin
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
   * Inicializa el SDK de OneSignal si está habilitado y tiene App ID
   */
  static init(): void {
    if (typeof window === "undefined" || this.isInitialized) return;

    const config = getPushConfig();
    if (!config.enabled) return;

    // Inyectar el script oficial si no está en el DOM
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

  /**
   * Verifica si el navegador soporta Notificaciones Push
   */
  static isSupported(): boolean {
    return typeof window !== "undefined" && "Notification" in window;
  }

  /**
   * Verifica si el usuario ya concedió el permiso
   */
  static isSubscribed(): boolean {
    if (typeof window === "undefined") return false;
    if ("Notification" in window && Notification.permission === "granted") {
      return true;
    }
    return localStorage.getItem("juegoreferidos_push_subscribed") === "true";
  }

  /**
   * Solicita el permiso al usuario y etiqueta su perfil en OneSignal
   */
  static async requestPermission(leadData?: {
    name?: string;
    prize?: string;
    code?: string;
    table?: string;
  }): Promise<boolean> {
    if (!this.isSupported()) return false;

    try {
      // 1. Si OneSignal está disponible, usar el flujo oficial
      if (window.OneSignal?.Notifications) {
        await window.OneSignal.Notifications.requestPermission();
        const permission = window.OneSignal.Notifications.permission;
        if (permission) {
          localStorage.setItem("juegoreferidos_push_subscribed", "true");

          // Etiquetar usuario en OneSignal para remarketing segmentado
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

      // 2. Fallback estándar PWA directo (Notification API nativo)
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
   * Simula o dispara una notificación local de prueba
   */
  static showLocalTestNotification(title: string, body: string): void {
    if (!this.isSupported()) {
      alert("Este navegador no soporta notificaciones de escritorio o móvil.");
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
        // En móviles algunos navegadores requieren ServiceWorker
        if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: "SHOW_NOTIFICATION",
            title,
            body,
          });
        }
      }
    } else {
      alert("Debes conceder permisos de notificación primero.");
    }
  }
}
