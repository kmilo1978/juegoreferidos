import { clientConfig } from "../config/clientConfig";

export interface LeadPayload {
  fullName: string;
  whatsapp: string;
  email?: string;
  instagramHandle?: string;
  prizeName: string;
  uniqueCode: string;
  wonAt: string;
}

export interface ComposioRuntimeConfig {
  enabled: boolean;
  apiKey: string;
  integrations: {
    googleContacts: boolean;
    googleSheets: boolean;
    whatsAppAutoSend: boolean;
    dailyEmailSummary: boolean;
  };
  endpoints: {
    googleSheetWebhookUrl: string;
    customWebhookUrl?: string;
  };
}

export function getComposioConfig(): ComposioRuntimeConfig {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("juegoreferidos_composio_config");
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
  }
  return {
    enabled: clientConfig.composio.enabled,
    apiKey: clientConfig.composio.apiKey || "",
    integrations: { ...clientConfig.composio.integrations },
    endpoints: {
      googleSheetWebhookUrl: clientConfig.composio.endpoints?.googleSheetWebhookUrl || "",
      customWebhookUrl: "",
    },
  };
}

export function saveComposioConfig(config: ComposioRuntimeConfig): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("juegoreferidos_composio_config", JSON.stringify(config));
    } catch {
      // ignore
    }
  }
}

/**
 * SERVICIO DE AUTOMATIZACIÓN COMPOSIO.DEV & GOOGLE SHEETS
 * Gestiona la sincronización de contactos, guardado de filas y disparos de eventos.
 */
export class ComposioService {
  /**
   * Registra el premio ganado. Usa Composio si está habilitado, o el Webhook de Google Sheets como fallback.
   */
  static async recordWonPrize(lead: LeadPayload): Promise<boolean> {
    const config = getComposioConfig();

    // 1. Si Composio está habilitado con su API Key oficial
    if (config.enabled && config.apiKey) {
      try {
        // Enviar a la API de Composio para disparar la acción de Google Sheets o CRM
        const response = await fetch("https://backend.composio.dev/api/v1/actions/GOOGLESHEETS_APPEND_ROW/execute", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": config.apiKey,
          },
          body: JSON.stringify({
            data: {
              values: [
                lead.wonAt,
                lead.fullName,
                lead.whatsapp,
                lead.email || "N/A",
                lead.instagramHandle || "N/A",
                lead.prizeName,
                lead.uniqueCode,
                "NO",
                "",
              ],
            },
          }),
        });

        if (response.ok) {
          console.log("[Composio] Sincronizado exitosamente con Composio API:", lead.uniqueCode);
          return true;
        }
      } catch (err) {
        console.warn("[Composio API] Intentando fallback tras error:", err);
      }
    }

    // 2. Fallback: Google Apps Script Webhook (100% gratuito sin costo de API)
    const webhookUrl = config.endpoints.googleSheetWebhookUrl || clientConfig.composio.endpoints?.googleSheetWebhookUrl;
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "CREATE_PRIZE",
            fullName: lead.fullName,
            whatsapp: lead.whatsapp,
            email: lead.email || "N/A",
            instagram: lead.instagramHandle || "N/A",
            prizeName: lead.prizeName,
            uniqueCode: lead.uniqueCode,
          }),
        });
        return true;
      } catch (err) {
        console.error("[Google Sheets Webhook] Error al enviar fila:", err);
      }
    }

    return false;
  }

  /**
   * Sincroniza a Google Sheets el canje de un cupón (lo marca como validado en caja).
   *
   * IMPORTANTE: este método NO valida el PIN del cajero. La validación del PIN
   * ocurre antes, de forma local, en `verifyCashierPin` (tableSecurityService);
   * aquí el `pin` se envía solo como dato informativo para la hoja de cálculo.
   *
   * Devuelve `true` únicamente cuando hay webhook configurado y el POST se envió
   * sin excepción; devuelve `false` si no hay webhook o si la petición falla, para
   * no reportar un éxito de sincronización inexistente (evita "fail-open").
   * Nota: con `mode: "no-cors"` el navegador no expone el status HTTP, por lo que
   * `true` significa "enviado sin error de red", no "aceptado por el servidor".
   */
  static async validateCashierPin(uniqueCode: string, pin: string): Promise<boolean> {
    const config = getComposioConfig();
    const webhookUrl = config.endpoints.googleSheetWebhookUrl || clientConfig.composio.endpoints?.googleSheetWebhookUrl;
    if (!webhookUrl) {
      // Sin webhook no hay nada que sincronizar: no es un éxito.
      return false;
    }
    try {
      await fetch(webhookUrl, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "VALIDATE_PIN",
          uniqueCode,
          pin,
        }),
      });
      return true;
    } catch (err) {
      console.error("[Google Sheets Webhook] Error al sincronizar canje de cupón:", err);
      return false;
    }
  }
}
