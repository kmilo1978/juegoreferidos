import { useEffect, useState } from "react";
import { Loader2, Bot, Save, Zap, CheckCircle2, Activity, Send } from "lucide-react";

export function Hermes() {
  const [hermes, setHermes] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Estados locales
  const [apiUrl, setApiUrl] = useState("http://localhost:3000");
  const [apiKey, setApiKey] = useState("");
  const [agentId, setAgentId] = useState("Hermes-Bliss");
  const [mode, setMode] = useState("autonomous");
  const [prompt, setPrompt] = useState("");

  const fetchData = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/hermes/config");
      if (!res.ok) throw new Error("Error al cargar Hermes");
      const data = await res.json();
      setHermes(data.hermes);

      if (data.hermes) {
        setApiUrl(data.hermes.apiUrl || "http://localhost:3000");
        setApiKey(data.hermes.apiKey || "");
        setAgentId(data.hermes.agentId || "Hermes-Bliss");
        setMode(data.hermes.mode || "autonomous");
        setPrompt(data.hermes.prompt || "Eres el Sommelier de Bliss Soul Bakery & Café...");
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

  const handleTestPing = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("http://localhost:3001/api/hermes/test", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Fallo en ping");
      setTestResult(data);
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error en ping");
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("http://localhost:3001/api/hermes/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hermes: {
            apiUrl,
            apiKey,
            agentId,
            mode,
            prompt,
          },
        }),
      });

      if (!res.ok) throw new Error("Error al guardar Hermes");
      setSuccess("Configuración de Hermes IA guardada con éxito");
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
          <h2 className="text-[#e6e1e7] font-bold text-2xl font-['Epilogue']">Hermes IA & WhatsApp Omnicanal</h2>
          <p className="text-sm text-[#ccc3d8]">Conecta el agente de inteligencia artificial para atender comensales por WhatsApp, sugerir postres y validar canjes.</p>
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

      {/* Monitor de Estado y Ping */}
      <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#d1bcff]/20 border border-[#d1bcff]/40 flex items-center justify-center text-[#d1bcff]">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#e6e1e7] text-base font-['Epilogue']">Agente Hermes: {agentId}</span>
              <span className="bg-[#10b981]/20 border border-[#10b981]/40 text-[#10b981] text-[10px] font-bold px-2 py-0.5 rounded-full">
                ONLINE
              </span>
            </div>
            <p className="text-xs text-[#ccc3d8] mt-0.5">
              Último Ping: {hermes?.lastPing || "Activo ahora"} • Latencia: {hermes?.stats?.lastLatencyMs || 28}ms
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleTestPing}
          disabled={testing}
          className="bg-[#201f23] border border-[#f2be71]/40 hover:bg-[#252429] text-[#f2be71] px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer transition-colors"
        >
          {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 text-[#f2be71]" />}
          <span>{testing ? "Probando..." : "Probar Conexión (Ping)"}</span>
        </button>
      </div>

      {testResult && (
        <div className="p-4 rounded-xl bg-[#14231b] border border-[#10b981]/40 text-xs text-[#10b981] flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{testResult.message}</span>
        </div>
      )}

      {/* Formulario */}
      <form onSubmit={handleSave} className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-[#363439] pb-4">
          <h3 className="text-lg font-bold text-[#e6e1e7] font-['Epilogue']">Parámetros del Agente</h3>
          <button
            type="submit"
            disabled={saving}
            className="bg-[#f2be71] text-[#121115] font-bold rounded-xl px-5 py-2.5 hover:brightness-105 active:scale-98 cursor-pointer transition-all flex items-center gap-2 text-sm"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Guardar Configuración IA</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider block">
              Endpoint API de Hermes
            </label>
            <input
              type="url"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-4 py-3 w-full text-sm"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider block">
              Identificador del Agente (Agent ID)
            </label>
            <input
              type="text"
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
              className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-4 py-3 w-full text-sm"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider block">
              Modo de Operación
            </label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-4 py-3 w-full text-sm"
            >
              <option value="autonomous">Autónomo (Atención y respuestas directas)</option>
              <option value="assisted">Asistido (Sugiere al personal antes de enviar)</option>
              <option value="monitor">Solo Monitor (Auditoría silenciosa)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider block">
              API Token (Opcional)
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Bearer hermes_live_..."
              className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-4 py-3 w-full text-sm"
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider block">
              Instrucción del Sommelier / Prompt Maestro
            </label>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-4 py-3 w-full text-sm resize-none"
            />
          </div>
        </div>
      </form>
    </div>
  );
}
