import { useEffect, useState } from "react";
import { Loader2, Star, Save, ShieldAlert, ExternalLink, ThumbsUp } from "lucide-react";

export function Reputation() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Formulario editable
  const [googleMapsUrl, setGoogleMapsUrl] = useState("");
  const [whatsappManager, setWhatsappManager] = useState("");
  const [minStarsGoogle, setMinStarsGoogle] = useState(4);
  const [complaintMessage, setComplaintMessage] = useState("");

  const fetchData = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/reputation");
      if (!res.ok) throw new Error("Error al obtener datos de reputación");
      const json = await res.json();
      setData(json);

      if (json.config) {
        setGoogleMapsUrl(json.config.googleMapsUrl || "");
        setWhatsappManager(json.config.whatsappManager || "");
        setMinStarsGoogle(json.config.minStarsGoogle || 4);
        setComplaintMessage(json.config.complaintMessage || "");
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
      const res = await fetch("http://localhost:3001/api/reputation/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          googleMapsUrl,
          whatsappManager,
          minStarsGoogle,
          complaintMessage,
        }),
      });
      if (!res.ok) throw new Error("Error al guardar configuración");
      setSuccess("Configuración del embudo de reputación guardada correctamente");
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

  const avgRating = data?.stats?.avgRating || "5.0";
  const totalReviews = data?.stats?.totalReviews || 0;
  const googleRedirects = data?.stats?.googleRedirects || 0;
  const privateFeedbacks = data?.stats?.privateFeedbacks || 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-[#e6e1e7] font-bold text-2xl font-['Epilogue']">Embudo Inteligente de Reputación</h2>
          <p className="text-sm text-[#ccc3d8]">Filtra calificaciones: 4-5★ van a Google Maps público y 1-3★ van a WhatsApp privado de gerencia.</p>
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

      {/* Tarjetas de Métricas del Embudo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold text-[#ccc3d8]">Calificación Promedio</span>
            <Star className="w-4 h-4 text-[#f2be71] fill-[#f2be71]" />
          </div>
          <div className="text-2xl font-black text-[#f2be71] mt-2 font-mono">{avgRating} ★</div>
          <span className="text-[11px] text-[#ccc3d8]">{totalReviews} opiniones de clientes</span>
        </div>

        <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold text-[#ccc3d8]">Desviadas a Google</span>
            <ThumbsUp className="w-4 h-4 text-[#10b981]" />
          </div>
          <div className="text-2xl font-black text-[#10b981] mt-2 font-mono">+{googleRedirects}</div>
          <span className="text-[11px] text-[#ccc3d8]">Calificaciones de 4 y 5 estrellas</span>
        </div>

        <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold text-[#ccc3d8]">Filtro Privado WhatsApp</span>
            <ShieldAlert className="w-4 h-4 text-[#f59e0b]" />
          </div>
          <div className="text-2xl font-black text-[#f59e0b] mt-2 font-mono">{privateFeedbacks}</div>
          <span className="text-[11px] text-[#ccc3d8]">Quejas contenidas sin daño público</span>
        </div>

        <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold text-[#ccc3d8]">Tasa de Protección</span>
            <span className="text-xs text-[#d1bcff]">🛡️ Activo</span>
          </div>
          <div className="text-2xl font-black text-[#d1bcff] mt-2 font-mono">100%</div>
          <span className="text-[11px] text-[#ccc3d8]">Cero quejas directas en Google</span>
        </div>
      </div>

      {/* Formulario de Configuración del Embudo */}
      <form onSubmit={handleSave} className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-6 space-y-6">
        <h3 className="text-lg font-bold text-[#e6e1e7] font-['Epilogue'] flex items-center gap-2">
          <span>⚙️ Reglas del Embudo de Reseñas</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider block">
              Enlace de tu Perfil en Google Maps / My Business
            </label>
            <input
              type="url"
              value={googleMapsUrl}
              onChange={(e) => setGoogleMapsUrl(e.target.value)}
              placeholder="https://maps.google.com/..."
              className="bg-[#201f23] border border-[#363439] focus:border-[#f2be71]/60 focus:outline-none text-[#e6e1e7] rounded-xl px-4 py-3 w-full text-sm"
              required
            />
            <p className="text-[11px] text-[#958da1]">Aquí serán enviados los comensales que califiquen con 4 o 5 estrellas.</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider block">
              WhatsApp Privado de Gerencia / Administración
            </label>
            <input
              type="text"
              value={whatsappManager}
              onChange={(e) => setWhatsappManager(e.target.value)}
              placeholder="573001234567"
              className="bg-[#201f23] border border-[#363439] focus:border-[#f2be71]/60 focus:outline-none text-[#e6e1e7] rounded-xl px-4 py-3 w-full text-sm"
              required
            />
            <p className="text-[11px] text-[#958da1]">Los clientes con quejas (1 a 3 estrellas) enviarán su mensaje directo a este número.</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider block">
              Mínimo de Estrellas para ir a Google
            </label>
            <select
              value={minStarsGoogle}
              onChange={(e) => setMinStarsGoogle(Number(e.target.value))}
              className="bg-[#201f23] border border-[#363439] focus:border-[#f2be71]/60 focus:outline-none text-[#e6e1e7] rounded-xl px-4 py-3 w-full text-sm"
            >
              <option value={4}>4 Estrellas o más (Recomendado)</option>
              <option value={5}>Solo 5 Estrellas (Máxima exigencia)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider block">
              Mensaje de Reenvío para Clientes Insatisfechos
            </label>
            <input
              type="text"
              value={complaintMessage}
              onChange={(e) => setComplaintMessage(e.target.value)}
              placeholder="Hola, quiero compartir una sugerencia sobre mi experiencia..."
              className="bg-[#201f23] border border-[#363439] focus:border-[#f2be71]/60 focus:outline-none text-[#e6e1e7] rounded-xl px-4 py-3 w-full text-sm"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-[#363439]">
          <button
            type="submit"
            disabled={saving}
            className="bg-[#f2be71] text-[#121115] font-bold rounded-xl px-6 py-3 hover:brightness-105 active:scale-98 cursor-pointer transition-all flex items-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Guardar Configuración del Embudo</span>
          </button>
        </div>
      </form>
    </div>
  );
}
