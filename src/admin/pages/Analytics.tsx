import { useEffect, useState } from "react";
import {
  Loader2,
  BarChart3,
  Save,
  CheckCircle2,
  Code2,
  Search,
  Share2,
  Activity,
  Layers,
  Sparkles,
} from "lucide-react";
import { apiUrl, getAuthToken } from "../../lib/apiClient";

export function Analytics() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Estados de Analítica y Píxeles
  const [gtmId, setGtmId] = useState("");
  const [gtmEnabled, setGtmEnabled] = useState(false);

  const [ga4Id, setGa4Id] = useState("");
  const [ga4Enabled, setGa4Enabled] = useState(false);

  const [metaPixelId, setMetaPixelId] = useState("");
  const [metaPixelEnabled, setMetaPixelEnabled] = useState(false);

  const [tiktokPixelId, setTiktokPixelId] = useState("");
  const [tiktokPixelEnabled, setTiktokPixelEnabled] = useState(false);

  const [searchConsoleCode, setSearchConsoleCode] = useState("");

  const [customHeadScript, setCustomHeadScript] = useState("");
  const [customBodyScript, setCustomBodyScript] = useState("");

  const fetchData = async () => {
    try {
      const res = await fetch(apiUrl("/config"));
      if (!res.ok) throw new Error("Error al cargar analítica");
      const data = await res.json();

      const an = data.settings?.analytics;
      if (an) {
        setGtmId(an.gtmId || "");
        setGtmEnabled(an.gtmEnabled ?? false);

        setGa4Id(an.ga4Id || "");
        setGa4Enabled(an.ga4Enabled ?? false);

        setMetaPixelId(an.metaPixelId || "");
        setMetaPixelEnabled(an.metaPixelEnabled ?? false);

        setTiktokPixelId(an.tiktokPixelId || "");
        setTiktokPixelEnabled(an.tiktokPixelEnabled ?? false);

        setSearchConsoleCode(an.searchConsoleCode || "");

        setCustomHeadScript(an.customHeadScript || "");
        setCustomBodyScript(an.customBodyScript || "");
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
      const res = await fetch(apiUrl("/config"), {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {}) },
        body: JSON.stringify({
          analytics: {
            gtmId,
            gtmEnabled,
            ga4Id,
            ga4Enabled,
            metaPixelId,
            metaPixelEnabled,
            tiktokPixelId,
            tiktokPixelEnabled,
            searchConsoleCode,
            customHeadScript,
            customBodyScript,
          },
        }),
      });

      if (!res.ok) throw new Error("Error al guardar analítica y píxeles");
      setSuccess("Configuración de GTM, píxeles y analítica guardada con éxito");
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
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#f2be71] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[#e6e1e7] font-bold text-2xl font-['Epilogue']">
            Analítica, Google Tag Manager & Píxeles
          </h2>
          <p className="text-sm text-[#ccc3d8]">
            Rastrea conversiones en tus mesas, mide el retorno publicitario en Meta, TikTok y Google, y verifica tu dominio en Google Search Console.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="bg-[#f2be71] text-[#121115] font-bold rounded-xl px-6 py-3 hover:brightness-105 active:scale-98 cursor-pointer transition-all flex items-center gap-2 text-sm shrink-0 shadow-lg"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Guardar Analítica & Píxeles</span>
        </button>
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

      <form onSubmit={handleSave} className="space-y-6">
        {/* GOOGLE TAG MANAGER & GOOGLE ANALYTICS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* GTM */}
          <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-6 space-y-4 shadow-lg">
            <div className="flex items-center justify-between border-b border-[#363439] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#3b82f6]/20 border border-[#3b82f6]/40 flex items-center justify-center text-[#3b82f6]">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#e6e1e7] font-['Epilogue']">Google Tag Manager (GTM)</h3>
                  <span className="text-[11px] text-[#ccc3d8]">Contenedor maestro de etiquetas</span>
                </div>
              </div>

              <input
                type="checkbox"
                checked={gtmEnabled}
                onChange={(e) => setGtmEnabled(e.target.checked)}
                className="w-4 h-4 accent-[#f2be71]"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#ccc3d8] uppercase tracking-wider block mb-1">
                GTM Container ID
              </label>
              <input
                type="text"
                value={gtmId}
                onChange={(e) => setGtmId(e.target.value)}
                placeholder="GTM-XXXXXXX"
                className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-4 py-2.5 w-full text-xs font-mono focus:border-[#f2be71]/60 focus:outline-none"
              />
              <span className="text-[10px] text-[#958da1] mt-1 block">Inyecta automáticamente el script oficial en el &lt;head&gt; y &lt;noscript&gt;.</span>
            </div>
          </div>

          {/* GA4 */}
          <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-6 space-y-4 shadow-lg">
            <div className="flex items-center justify-between border-b border-[#363439] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#f59e0b]/20 border border-[#f59e0b]/40 flex items-center justify-center text-[#f59e0b]">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#e6e1e7] font-['Epilogue']">Google Analytics 4 (GA4)</h3>
                  <span className="text-[11px] text-[#ccc3d8]">Métricas de visitas y comportamiento</span>
                </div>
              </div>

              <input
                type="checkbox"
                checked={ga4Enabled}
                onChange={(e) => setGa4Enabled(e.target.checked)}
                className="w-4 h-4 accent-[#f2be71]"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#ccc3d8] uppercase tracking-wider block mb-1">
                Measurement ID (ID de Medición)
              </label>
              <input
                type="text"
                value={ga4Id}
                onChange={(e) => setGa4Id(e.target.value)}
                placeholder="G-XXXXXXXXXX"
                className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-4 py-2.5 w-full text-xs font-mono focus:border-[#f2be71]/60 focus:outline-none"
              />
              <span className="text-[10px] text-[#958da1] mt-1 block">Registra eventos de giros de ruleta, sellos y canjes en mesa.</span>
            </div>
          </div>
        </div>

        {/* PÍXELES PUBLICITARIOS: META (FACEBOOK/INSTAGRAM) & TIKTOK */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Meta Pixel */}
          <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-6 space-y-4 shadow-lg">
            <div className="flex items-center justify-between border-b border-[#363439] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#1877f2]/20 border border-[#1877f2]/40 flex items-center justify-center text-[#1877f2]">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#e6e1e7] font-['Epilogue']">Meta Pixel (Facebook / Instagram)</h3>
                  <span className="text-[11px] text-[#ccc3d8]">Retargeting de comensales en redes</span>
                </div>
              </div>

              <input
                type="checkbox"
                checked={metaPixelEnabled}
                onChange={(e) => setMetaPixelEnabled(e.target.checked)}
                className="w-4 h-4 accent-[#f2be71]"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#ccc3d8] uppercase tracking-wider block mb-1">
                Pixel ID
              </label>
              <input
                type="text"
                value={metaPixelId}
                onChange={(e) => setMetaPixelId(e.target.value)}
                placeholder="1234567890123456"
                className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-4 py-2.5 w-full text-xs font-mono focus:border-[#f2be71]/60 focus:outline-none"
              />
              <span className="text-[10px] text-[#958da1] mt-1 block">Dispara eventos estándar: PageView y Lead al registrarse.</span>
            </div>
          </div>

          {/* TikTok Pixel */}
          <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-6 space-y-4 shadow-lg">
            <div className="flex items-center justify-between border-b border-[#363439] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#fe2c55]/20 border border-[#fe2c55]/40 flex items-center justify-center text-[#fe2c55]">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#e6e1e7] font-['Epilogue']">TikTok Pixel</h3>
                  <span className="text-[11px] text-[#ccc3d8]">Audiencias y anuncios en TikTok</span>
                </div>
              </div>

              <input
                type="checkbox"
                checked={tiktokPixelEnabled}
                onChange={(e) => setTiktokPixelEnabled(e.target.checked)}
                className="w-4 h-4 accent-[#f2be71]"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#ccc3d8] uppercase tracking-wider block mb-1">
                TikTok Pixel Code ID
              </label>
              <input
                type="text"
                value={tiktokPixelId}
                onChange={(e) => setTiktokPixelId(e.target.value)}
                placeholder="CXXXXXXXXXXXXXXX"
                className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-4 py-2.5 w-full text-xs font-mono focus:border-[#f2be71]/60 focus:outline-none"
              />
              <span className="text-[10px] text-[#958da1] mt-1 block">Seguimiento de conversiones y público comensal en TikTok.</span>
            </div>
          </div>
        </div>

        {/* GOOGLE SEARCH CONSOLE */}
        <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-6 space-y-4 shadow-lg">
          <div className="flex items-center gap-2.5 border-b border-[#363439] pb-3">
            <Search className="w-5 h-5 text-[#f2be71]" />
            <div>
              <h3 className="text-base font-bold text-[#e6e1e7] font-['Epilogue']">Google Search Console</h3>
              <p className="text-xs text-[#ccc3d8]">Verificación de propiedad para posicionar tu web y juego en búsquedas de Google.</p>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider block mb-1">
              Código de Verificación HTML o Meta Tag
            </label>
            <input
              type="text"
              value={searchConsoleCode}
              onChange={(e) => setSearchConsoleCode(e.target.value)}
              placeholder='google-site-verification=abcde12345... o <meta name="google-site-verification" content="..." />'
              className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-4 py-2.5 w-full text-xs font-mono focus:border-[#f2be71]/60 focus:outline-none"
            />
          </div>
        </div>

        {/* SCRIPTS PERSONALIZADOS (HEAD Y BODY) */}
        <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-6 space-y-4 shadow-lg">
          <div className="flex items-center gap-2.5 border-b border-[#363439] pb-3">
            <Code2 className="w-5 h-5 text-[#d1bcff]" />
            <div>
              <h3 className="text-base font-bold text-[#e6e1e7] font-['Epilogue']">Inyección de Scripts Personalizados</h3>
              <p className="text-xs text-[#ccc3d8]">Agrega cualquier herramienta externa (Hotjar, Microsoft Clarity, Chatbot, etc.).</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider block mb-1">
                Scripts en &lt;head&gt;
              </label>
              <textarea
                rows={4}
                value={customHeadScript}
                onChange={(e) => setCustomHeadScript(e.target.value)}
                placeholder="<!-- Scripts adicionales en head -->"
                className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-3 py-2 w-full text-xs font-mono focus:border-[#f2be71]/60 focus:outline-none resize-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider block mb-1">
                Scripts antes del cierre de &lt;/body&gt;
              </label>
              <textarea
                rows={4}
                value={customBodyScript}
                onChange={(e) => setCustomBodyScript(e.target.value)}
                placeholder="<!-- Scripts adicionales en body -->"
                className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-3 py-2 w-full text-xs font-mono focus:border-[#f2be71]/60 focus:outline-none resize-none"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
