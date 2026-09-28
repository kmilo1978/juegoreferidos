/**
 * ============================================================================
 * SERVICIO DE INTEGRACIÓN CON SUPABASE (BASE DE DATOS POSTGRESQL EN LA NUBE)
 * ============================================================================
 * Permite sincronizar los cupones y tarjetas de sellos directamente con Supabase
 * usando la API REST nativa (sin librerías pesadas externas).
 */

import { WonPrize } from "../components/qr-game/gameTypes";

export interface SupabaseConfig {
  enabled: boolean;
  projectUrl: string;
  anonKey: string;
  tableName: string;
}

const STORAGE_KEY = "juegoreferidos_supabase_config";

export function getSupabaseConfig(): SupabaseConfig {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
  }

  return {
    enabled: false,
    projectUrl: "",
    anonKey: "",
    tableName: "cupones_sellos",
  };
}

export function saveSupabaseConfig(config: SupabaseConfig): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch {
      // ignore
    }
  }
}

export class SupabaseService {
  /**
   * Registra un nuevo cupón ganado en la tabla de Supabase
   */
  static async recordWonPrize(prize: WonPrize, stampsCount: number = 1): Promise<boolean> {
    const config = getSupabaseConfig();
    if (!config.enabled || !config.projectUrl || !config.anonKey) {
      return false;
    }

    const cleanUrl = config.projectUrl.replace(/\/$/, "");
    const endpoint = `${cleanUrl}/rest/v1/${config.tableName}`;

    try {
      const payload = {
        unique_code: prize.uniqueCode,
        participant_name: prize.participantName,
        participant_whatsapp: prize.participantWhatsapp,
        participant_email: prize.participantEmail || null,
        prize_name: prize.prizeName,
        table_number: prize.tableNumber,
        won_at: prize.wonAt,
        status: prize.status,
        stamps_count: stampsCount,
        birth_date: prize.birthDate || null,
        created_at: new Date().toISOString(),
      };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: config.anonKey,
          Authorization: `Bearer ${config.anonKey}`,
          Prefer: "resolution=merge-duplicates",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        console.log("[Supabase] Cupón sincronizado con éxito:", prize.uniqueCode);
        return true;
      } else {
        const errorText = await response.text();
        console.warn("[Supabase] Error al guardar cupón:", response.status, errorText);
        return false;
      }
    } catch (err) {
      console.error("[Supabase] Excepción en recordWonPrize:", err);
      return false;
    }
  }

  /**
   * Actualiza el cupón en Supabase cuando el cajero digita el PIN
   */
  static async validateCashierPin(uniqueCode: string, newStamps: number): Promise<boolean> {
    const config = getSupabaseConfig();
    if (!config.enabled || !config.projectUrl || !config.anonKey) {
      return false;
    }

    const cleanUrl = config.projectUrl.replace(/\/$/, "");
    const endpoint = `${cleanUrl}/rest/v1/${config.tableName}?unique_code=eq.${encodeURIComponent(uniqueCode)}`;

    try {
      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          apikey: config.anonKey,
          Authorization: `Bearer ${config.anonKey}`,
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          status: "UTILIZADO",
          used_at: new Date().toLocaleTimeString("es-CO"),
          stamps_count: newStamps,
          updated_at: new Date().toISOString(),
        }),
      });

      return response.ok;
    } catch (err) {
      console.error("[Supabase] Error al validar cupón con PIN:", err);
      return false;
    }
  }

  /**
   * Prueba de conexión con Supabase
   */
  static async testConnection(): Promise<{ success: boolean; message: string }> {
    const config = getSupabaseConfig();
    if (!config.projectUrl || !config.anonKey) {
      return { success: false, message: "Ingresa la URL del proyecto y la Anon Key de Supabase." };
    }

    const cleanUrl = config.projectUrl.replace(/\/$/, "");
    const endpoint = `${cleanUrl}/rest/v1/${config.tableName}?limit=1`;

    try {
      const res = await fetch(endpoint, {
        method: "GET",
        headers: {
          apikey: config.anonKey,
          Authorization: `Bearer ${config.anonKey}`,
        },
      });

      if (res.ok) {
        return { success: true, message: "¡Conexión exitosa con Supabase! La tabla responde correctamente." };
      } else if (res.status === 404) {
        return {
          success: false,
          message: `La tabla '${config.tableName}' no existe aún en Supabase. Cópia y ejecuta el script SQL que te dejamos abajo.`,
        };
      } else {
        const txt = await res.text();
        return { success: false, message: `Error ${res.status}: ${txt}` };
      }
    } catch (err: any) {
      return { success: false, message: `Error de red: ${err?.message || "No se pudo conectar"}` };
    }
  }

  /**
   * Script SQL listo para copiar y pegar en Supabase SQL Editor
   */
  static getSqlCreationScript(): string {
    const config = getSupabaseConfig();
    const table = config.tableName || "cupones_sellos";
    return `-- =======================================================
-- TABLA DE FIDELIZACIÓN Y CUPONES BLISS SOUL BAKERY
-- Copia este código y ejecútalo en: Supabase -> SQL Editor -> Run
-- =======================================================

create table if not exists public.${table} (
  id bigint generated by default as identity primary key,
  unique_code text unique not null,
  participant_name text not null,
  participant_whatsapp text not null,
  participant_email text,
  prize_name text not null,
  table_number text default '1',
  won_at text not null,
  status text default 'DISPONIBLE',
  used_at text,
  stamps_count integer default 1,
  birth_date text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Habilitar lectura y escritura anónima con la Anon Key
alter table public.${table} enable row level security;

create policy "Permitir inserción y lectura anónima"
  on public.${table}
  for all
  using (true)
  with check (true);
`;
  }
}
