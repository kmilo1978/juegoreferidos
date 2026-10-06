import { useEffect, useState } from "react";
import {
  Loader2,
  Zap,
  Save,
  CheckCircle2,
  HardDrive,
  Database,
  GitBranch,
  FileSpreadsheet,
  MessageCircle,
  Mail,
  BookOpen,
  Bell,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  Layers,
  ArrowRight,
} from "lucide-react";

interface Connector {
  id: string;
  name: string;
  category: string;
  desc: string;
  icon: any;
  color: string;
  badge: string;
}

const AVAILABLE_CONNECTORS: Connector[] = [
  {
    id: "googleDrive",
    name: "Google Drive",
    category: "Almacenamiento en la Nube",
    desc: "Crea respaldos automáticos de la base de datos (db.json) y almacena capturas de misiones sociales en carpetas privadas.",
    icon: HardDrive,
    color: "#4285F4",
    badge: "BACKUPS NUBE",
  },
  {
    id: "supabase",
    name: "Supabase (PostgreSQL)",
    category: "Base de Datos en Tiempo Real",
    desc: "Sincroniza cada comensal, puntos, sellos de visita y cupones redimidos en tu base de datos relacional de Supabase.",
    icon: Database,
    color: "#3ECF8E",
    badge: "POSTGRESQL",
  },
  {
    id: "github",
    name: "GitHub",
    category: "Control de Código y Backups",
    desc: "Guarda snapshots de configuración en repositorios privados, audita cambios de menús y activa flujos de GitHub Actions.",
    icon: GitBranch,
    color: "#E6E1E7",
    badge: "VERSIONADO",
  },
  {
    id: "googleSheets",
    name: "Google Sheets",
    category: "Hojas de Cálculo en Vivo",
    desc: "Inserta filas en tiempo real por cada ruleta girada, comensal registrado o canje de caja sin configurar Google Cloud.",
    icon: FileSpreadsheet,
    color: "#0F9D58",
    badge: "HOJAS EN VIVO",
  },
  {
    id: "whatsapp",
    name: "WhatsApp Business Cloud",
    category: "Mensajería Oficial",
    desc: "Envía confirmación de sellos, código de boletos VIP para el sorteo mensual y recordatorios automáticos de visita.",
    icon: MessageCircle,
    color: "#25D366",
    badge: "MENSAJERÍA",
  },
  {
    id: "gmail",
    name: "Gmail / Correo Corporativo",
    category: "Auditoría & Notificaciones",
    desc: "Envía un reporte nocturno al cierre de jornada a la gerencia con los premios entregados y comensales del día.",
    icon: Mail,
    color: "#EA4335",
    badge: "REPORTES",
  },
  {
    id: "notion",
    name: "Notion CRM",
    category: "Gestión de Embajadores",
    desc: "Registra a los comensales más leales en un tablero de Notion para coordinar invitaciones exclusivas y catas privadas.",
    icon: BookOpen,
    color: "#FFFFFF",
    badge: "CRM",
  },
  {
    id: "slack",
    name: "Slack / Discord Staff",
    category: "Alertas al Equipo en Sala",
    desc: "Avisa en el canal de cocina o camareros cuando una mesa gana el premio mayor o solicita validación de PIN en caja.",
    icon: Bell,
    color: "#ECB22E",
    badge: "ALERTAS STAFF",
  },
];

export function Composio() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Estados de conexión
  const [apiKey, setApiKey] = useState("");
  const [entityId, setEntityId] = useState("default");
  const [apps, setApps] = useState<Record<string, boolean>>({
    googleDrive: true,
    supabase: true,
    github: true,
    googleSheets: true,
    whatsapp: true,
    gmail: false,
    notion: false,
    slack: false,
  });

  // Estado del diagnóstico unificado
  const [diagResults, setDiagResults] = useState<any[] | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/config");
      if (!res.ok) throw new Error("Error al consultar configuración");
      const data = await res.json();

      if (data.settings?.composio) {
        setApiKey(data.settings.composio.apiKey || "");
        setEntityId(data.settings.composio.entityId || "default");
        if (data.settings.composio.integrations) {
          setApps((prev) => ({ ...prev, ...data.settings.composio.integrations }));
        }
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          composio: {
            enabled: true,
            apiKey,
            entityId,
            integrations: apps,
          },
        }),
      });

      if (!res.ok) throw new Error("Error al guardar la integración de Composio");
      setSuccess("¡Configuración de Composio guardada y sincronizada correctamente!");
      setTimeout(() => setSuccess(null), 3500);
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setSaving(false);
    }
  };

  const handleTestAll = async () => {
    setTesting(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/integrations/composio/test-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey,
          entityId,
          integrations: apps,
        }),
      });

      if (!res.ok) throw new Error("Fallo en la prueba de diagnóstico");
      const data = await res.json();
      setDiagResults(data.connectors || []);
      setSuccess(`⚡ ¡Diagnóstico unificado exitoso! ${data.totalActive} conectores listos para operar desde tu única llave de Composio.`);
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo completar el diagnóstico");
    } finally {
      setTesting(false);
    }
  };

  const toggleAll = (enable: boolean) => {
    const updated: Record<string, boolean> = {};
    AVAILABLE_CONNECTORS.forEach((c) => {
      updated[c.id] = enable;
    });
    setApps(updated);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-[var(--gold)] animate-spin" />
          <span className="text-sm text-[#ccc3d8] font-medium font-['Epilogue']">Cargando centro de integraciones Composio...</span>
        </div>
      </div>
    );
  }

  const activeCount = Object.values(apps).filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Cabecera y Título */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[var(--gold)]/15 text-[var(--gold)] border border-[var(--gold)]/30">
              Conexión Única Universal
            </span>
            <span className="text-xs text-[#10b981] font-mono font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></span>
              {activeCount} Conectores Habilitados
            </span>
          </div>
          <h2 className="text-[#e6e1e7] font-bold text-2xl font-['Epilogue'] flex items-center gap-2.5">
            <Zap className="w-6 h-6 text-[var(--gold)]" />
            <span>Centro de Integraciones Composio</span>
          </h2>
          <p className="text-sm text-[#ccc3d8]">
            Conéctate a <strong>Google Drive, Supabase, GitHub, Google Sheets y WhatsApp</strong> utilizando una única API Key y una sola cuenta centralizada.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href="https://app.composio.dev"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 bg-[#201f23] hover:bg-[#252429] text-[#ccc3d8] hover:text-[var(--gold)] border border-[#363439] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <span>Consola de Composio</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            type="button"
            onClick={handleTestAll}
            disabled={testing}
            className="px-4 py-2.5 bg-[#2b292e] hover:bg-[#363439] text-[var(--gold)] border border-[var(--gold)]/40 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            {testing ? <Loader2 className="w-4 h-4 animate-spin text-[var(--gold)]" /> : <RefreshCw className="w-4 h-4 text-[var(--gold)]" />}
            <span>Probar Conexión Única</span>
          </button>
        </div>
      </div>

      {/* Alertas de Éxito / Error */}
      {error && (
        <div className="bg-red-950/40 border border-red-500/50 text-red-300 px-4 py-3 rounded-xl flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-xs underline cursor-pointer">Cerrar</button>
        </div>
      )}

      {success && (
        <div className="bg-[#0d2e1f] border border-[#10b981]/50 text-[#10b981] px-4 py-3 rounded-xl flex items-center gap-2 shadow-lg">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-sm font-semibold">{success}</span>
        </div>
      )}

      {/* Tarjeta Informativa: Cómo Funciona la Conexión Única */}
      <section className="bg-gradient-to-r from-[#1c1b1f] via-[#201f23] to-[#1c1b1f] border border-[var(--gold)]/30 rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[var(--gold)]/15 border border-[var(--gold)]/40 flex items-center justify-center text-[var(--gold)] shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-[#e6e1e7] font-['Epilogue']">
                ¿Por qué una sola conexión con Composio reemplaza decenas de configuraciones?
              </h3>
              <p className="text-xs text-[#ccc3d8] leading-relaxed max-w-3xl">
                Normalmente tendrías que registrarte en Google Cloud Console para Drive y Sheets, crear un proyecto en Supabase, generar Personal Access Tokens en GitHub y configurar Webhooks de WhatsApp por separado.
                Con **Composio**, vinculas tus cuentas con 1 clic en su panel y aquí solo pegas tu <strong>API Key</strong>. Tu juego puede guardar backups en Drive, insertar en Supabase y actualizar GitHub automáticamente en cada partida.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="px-3 py-1.5 rounded-xl bg-[#0f0e12] border border-[#363439] text-[var(--gold)] text-xs font-mono font-bold">
              1 Token = +150 Apps
            </span>
          </div>
        </div>
      </section>

      {/* Formulario de Credenciales Centrales */}
      <form onSubmit={handleSave} className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-6 space-y-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#363439] pb-4">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-[var(--gold)]" />
            <div>
              <h3 className="text-base font-bold text-[#e6e1e7] font-['Epilogue']">
                Credencial Maestra de Composio
              </h3>
              <span className="text-xs text-[#958da1]">Esta llave autoriza las llamadas hacia Google Drive, Supabase, GitHub y Sheets</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="bg-[var(--gold)] text-[#121115] font-bold rounded-xl px-5 py-2.5 hover:brightness-105 active:scale-98 cursor-pointer transition-all flex items-center gap-2 text-xs"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Guardar Configuración</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider block">
              Composio API Key (comp_live_...)
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="comp_live_9824xyz..."
              className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-4 py-2.5 w-full text-xs font-mono focus:border-[var(--gold)] focus:outline-none"
            />
            <span className="text-[11px] text-[#958da1]">
              Obtenida en tu cuenta de <a href="https://app.composio.dev/settings" target="_blank" rel="noreferrer" className="text-[var(--gold)] underline">composio.dev/settings</a>.
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider block">
              Entity ID (Identificador de Sucursal / Negocio)
            </label>
            <input
              type="text"
              value={entityId}
              onChange={(e) => setEntityId(e.target.value)}
              placeholder="ej: sucursal-principal o mi-restaurante"
              className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-4 py-2.5 w-full text-xs font-mono focus:border-[var(--gold)] focus:outline-none"
            />
            <span className="text-[11px] text-[#958da1]">
              Agrupa todas las conexiones bajo un mismo perfil (por defecto: <code>default</code>).
            </span>
          </div>
        </div>

        {/* Sección de Conectores Modulares */}
        <div className="space-y-4 pt-4 border-t border-[#363439]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-[#e6e1e7] font-['Epilogue'] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[var(--gold)]" />
                <span>Servicios Conectados a Través de Composio</span>
              </h4>
              <span className="text-xs text-[#958da1]">
                Activa los destinos a los que quieres que el sistema envíe información en cada evento:
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => toggleAll(true)}
                className="text-[11px] px-2.5 py-1 bg-[#201f23] hover:bg-[#252429] text-[#ccc3d8] hover:text-white rounded-lg border border-[#363439] cursor-pointer"
              >
                Activar Todos
              </button>
              <button
                type="button"
                onClick={() => toggleAll(false)}
                className="text-[11px] px-2.5 py-1 bg-[#201f23] hover:bg-[#252429] text-[#ccc3d8] hover:text-white rounded-lg border border-[#363439] cursor-pointer"
              >
                Desactivar Todos
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {AVAILABLE_CONNECTORS.map((connector) => {
              const Icon = connector.icon;
              const isChecked = !!apps[connector.id];
              const diag = diagResults?.find((d) => d.id === connector.id);

              return (
                <div
                  key={connector.id}
                  onClick={() => setApps({ ...apps, [connector.id]: !isChecked })}
                  className={`p-4 rounded-xl border transition-all cursor-pointer select-none flex items-start gap-3.5 ${
                    isChecked
                      ? "bg-[#252429] border-[var(--gold)]/60 shadow-[0_2px_12px_rgba(242,190,113,0.1)]"
                      : "bg-[#201f23]/60 border-[#363439] opacity-75 hover:opacity-100 hover:border-[#4a4455]"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => {
                      e.stopPropagation();
                      setApps({ ...apps, [connector.id]: e.target.checked });
                    }}
                    className="mt-1 w-4 h-4 accent-[var(--gold)] shrink-0"
                  />

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 shrink-0" style={{ color: connector.color }} />
                        <span className="text-xs font-bold text-[#e6e1e7]">{connector.name}</span>
                      </div>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#141317] border border-[#363439] text-[var(--gold)]">
                        {connector.badge}
                      </span>
                    </div>

                    <p className="text-[11px] text-[#ccc3d8] leading-relaxed line-clamp-2">
                      {connector.desc}
                    </p>

                    {diag && (
                      <div className="pt-1 flex items-center gap-1.5 text-[10px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
                        <span className="text-[#10b981] font-mono font-bold">Latencia: {diag.latencyMs}ms • Listo</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </form>
    </div>
  );
}
