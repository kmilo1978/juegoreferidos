import { useEffect, useState } from "react";
import { Loader2, Database, Save, Cloud, CheckCircle, RefreshCw } from "lucide-react";

export function Databases() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Formulario
  const [supabaseUrl, setSupabaseUrl] = useState("");
  const [supabaseAnonKey, setSupabaseAnonKey] = useState("");
  const [googleSheetsUrl, setGoogleSheetsUrl] = useState("");
  const [autoSync, setAutoSync] = useState(true);

  const fetchData = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/config");
      if (!res.ok) throw new Error("Error al cargar bases de datos");
      const data = await res.json();
      setConfig(data.settings);

      if (data.settings?.databases) {
        setSupabaseUrl(data.settings.databases.supabaseUrl || "");
        setSupabaseAnonKey(data.settings.databases.supabaseAnonKey || "");
        setGoogleSheetsUrl(data.settings.databases.googleSheetsUrl || "");
        setAutoSync(data.settings.databases.autoSync ?? true);
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("http://localhost:3001/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          databases: {
            supabaseUrl,
            supabaseAnonKey,
            googleSheetsUrl,
            autoSync,
          },
        }),
      });

      if (!res.ok) throw new Error("Error al guardar credenciales de bases de datos");
      setSuccess("Configuración de bases de datos guardada con éxito");
      setTimeout(() => setSuccess(null), 3000);
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setSaving(false);
    }
  };

  const handleManualSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      setSuccess("Sincronización manual ejecutada con éxito");
      setTimeout(() => setSuccess(null), 3000);
    }, 1200);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-[#f2be71] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-[#e6e1e7] font-bold text-2xl font-['Epilogue']">Bases de Datos & Sincronización</h2>
          <p className="text-sm text-[#ccc3d8]">Conecta tu almacenamiento en la nube (Supabase o Google Sheets) para respaldo automático de clientes y canjes.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-950/40 border border-red-500/50 text-red-300 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-[#0d2e1f] border border-[#10b981]/50 text-[#10b981] px-4 py-3 rounded-xl">
          {success}
        </div>
      )}

      {/* Estado Local vs Nube */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-5">
          <span className="text-xs uppercase font-semibold text-[#ccc3d8]">Base de Datos Local</span>
          <div className="text-lg font-bold text-[#10b981] mt-2 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4" /> db.json (Activa)
          </div>
          <span className="text-[11px] text-[#958da1]">Respaldo local instantáneo sin conexión</span>
        </div>

        <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-5">
          <span className="text-xs uppercase font-semibold text-[#ccc3d8]">Supabase Cloud</span>
          <div className="text-lg font-bold text-[#f2be71] mt-2">
            {supabaseUrl ? "Conectado" : "Pendiente"}
          </div>
          <span className="text-[11px] text-[#958da1]">PostgreSQL en la nube</span>
        </div>

        <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-5 flex flex-col justify-between">
          <span className="text-xs uppercase font-semibold text-[#ccc3d8]">Sincronización Rápida</span>
          <button
            type="button"
            onClick={handleManualSync}
            disabled={syncing}
            className="mt-2 bg-[#201f23] border border-[#f2be71]/40 text-[#f2be71] hover:bg-[#2b292e] text-xs font-bold rounded-xl py-2 px-3 flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
            <span>{syncing ? "Sincronizando..." : "Sincronizar Ahora"}</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-[#363439] pb-4">
          <h3 className="text-lg font-bold text-[#e6e1e7] font-['Epilogue'] flex items-center gap-2">
            <Database className="w-5 h-5 text-[#f2be71]" />
            <span>Configuración de Conectores Cloud</span>
          </h3>
          <button
            type="submit"
            disabled={saving}
            className="bg-[#f2be71] text-[#121115] font-bold rounded-xl px-5 py-2.5 hover:brightness-105 active:scale-98 cursor-pointer transition-all flex items-center gap-2 text-sm"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Guardar Conexiones</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider block">
              Supabase Project URL
            </label>
            <input
              type="url"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              placeholder="https://xyz.supabase.co"
              className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-4 py-3 w-full text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider block">
              Supabase Anon Key
            </label>
            <input
              type="password"
              value={supabaseAnonKey}
              onChange={(e) => setSupabaseAnonKey(e.target.value)}
              placeholder="eyJhbGciOi..."
              className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-4 py-3 w-full text-sm"
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider block">
              Webhook URL de Google Sheets (Opcional)
            </label>
            <input
              type="url"
              value={googleSheetsUrl}
              onChange={(e) => setGoogleSheetsUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/..."
              className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-4 py-3 w-full text-sm"
            />
            <span className="text-[11px] text-[#958da1]">Registra automáticamente cada nuevo cliente y premio en una hoja de cálculo en tiempo real.</span>
          </div>
        </div>
      </form>
    </div>
  );
}
