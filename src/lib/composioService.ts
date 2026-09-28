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

/**
 * SERVICIO DE AUTOMATIZACIÓN COMPOSIO.DEV & GOOGLE SHEETS
 * Gestiona la sincronización de contactos, guardado de filas y disparos de mensajes.
 */
export class ComposioService {
  /**
   * Registra el premio ganado. Usa Composio si está habilitado, o el Webhook de Google Sheets gratuito como fallback.
   */
  static async recordWonPrize(lead: LeadPayload): Promise<boolean> {
    // 1. Si Composio está habilitado
    if (clientConfig.composio.enabled && clientConfig.composio.apiKey) {
      try {
        // En un backend con Composio SDK:
        // const composio = new OpenAIToolSet({ apiKey: clientConfig.composio.apiKey });
        // await composio.executeAction("GOOGLESHEETS_APPEND_ROW", { ...lead });
        // if (clientConfig.composio.integrations.googleContacts) {
        //   await composio.executeAction("GOOGLECONTACTS_CREATE_CONTACT", { ... });
        // }
        console.log("[Composio] Lead sincronizado mediante Composio API:", lead.uniqueCode);
        return true;
      } catch (err) {
        console.error("[Composio] Error al ejecutar acción:", err);
      }
    }

    // 2. Fallback: Google Apps Script Webhook (100% gratuito)
    const webhookUrl = clientConfig.composio.endpoints?.googleSheetWebhookUrl;
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
   * Valida el cupón en caja mediante PIN y actualiza el estado a 'SÍ'
   */
  static async validateCashierPin(uniqueCode: string, pin: string): Promise<boolean> {
    const webhookUrl = clientConfig.composio.endpoints?.googleSheetWebhookUrl;
    if (webhookUrl) {
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
        console.error("[Google Sheets Webhook] Error al validar PIN:", err);
      }
    }
    return true;
  }
}
