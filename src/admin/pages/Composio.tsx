import { useEffect, useState } from "react";
import { Loader2, Zap, Save, CheckCircle2, Layers } from "lucide-react";

export function Composio() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [apiKey, setApiKey] = useState("");
  const [entityId, setEntityId] = useState("default");
  const [apps, setApps] = useState({
    googleSheets: true,
    whatsapp: true,
    gmail: false,
    slack: false,
  });

  const fetchData = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/config");
      if (!res.ok) throw new Error("Error al cargar Composio");
      const data = await res.json();
      setConfig(data.settings);

      if (data.settings?.composio) {
        setApiKey(data.settings.composio.apiKey || "");
        setEntityId(data.settings.composio.entityId || "default");
        if (data.settings.composio.integrations) {
          setApps((prev) => ({ ...prev, ...data.settings.composio.integrations }));
        }
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
          composio: {
            apiKey,
            entityId,
            integrations: apps,
          },
        }),
      });

      if (!res.ok) throw new Error("Error al guardar Composio");
      setSuccess("Integración de Composio guardada correctamente");
      setTimeout(() => setSuccess(null), 3000);
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setSaving(false);
    }
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
          <h2 className="text-[#e6e1e7] font-bold text-2xl font-['Epilogue']">Integraciones & Automatización Composio</h2>
          <p className="text-sm text-[#ccc3d8]">Conecta tus aplicaciones externas para sincronizar comensales, enviar emails y conectar webhooks.</p>
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

      <form onSubmit={handleSave} className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-[#363439] pb-4">
          <h3 className="text-lg font-bold text-[#e6e1e7] font-['Epilogue'] flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#f2be71]" />
            <span>Credenciales de Composio API</span>
          </h3>
          <button
            type="submit"
            disabled={saving}
            className="bg-[#f2be71] text-[#121115] font-bold rounded-xl px-5 py-2.5 hover:brightness-105 active:scale-98 cursor-pointer transition-all flex items-center gap-2 text-sm"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Guardar Composio</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider block">
              Composio API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="comp_live_..."
              className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-4 py-3 w-full text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider block">
              Entity ID (Restaurante o Sucursal)
            </label>
            <input
              type="text"
              value={entityId}
              onChange={(e) => setEntityId(e.target.value)}
              className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-4 py-3 w-full text-sm"
            />
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-[#363439]">
          <h4 className="text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider">Conectores Activos</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { id: "googleSheets", name: "Google Sheets", desc: "Fila automática por cada premio ganado" },
              { id: "whatsapp", name: "WhatsApp Business Cloud", desc: "Envío de recordatorio y cupones" },
              { id: "gmail", name: "Gmail / Mailgun", desc: "Reporte diario al cierre de caja" },
              { id: "slack", name: "Slack / Telegram Alerts", desc: "Notificar al staff de nuevos ganadores" },
            ].map((app) => (
              <label
                key={app.id}
                className="flex items-start gap-3 bg-[#201f23] border border-[#363439] p-4 rounded-xl cursor-pointer hover:bg-[#252429] transition-colors"
              >
                <input
                  type="checkbox"
                  checked={(apps as any)[app.id] ?? false}
                  onChange={(e) => setApps({ ...apps, [app.id]: e.target.checked })}
                  className="mt-0.5 w-4 h-4 accent-[#f2be71]"
                />
                <div>
                  <span className="text-sm font-bold text-[#e6e1e7] block">{app.name}</span>
                  <span className="text-xs text-[#958da1]">{app.desc}</span>
                </div>
              </label>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}
