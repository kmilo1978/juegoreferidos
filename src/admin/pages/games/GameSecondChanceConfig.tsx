import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Share2,
  Save,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  MessageCircle,
  Gift,
  Sparkles,
} from "lucide-react";

export function GameSecondChanceConfig() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Estados de 2ª Oportunidad
  const [enabled, setEnabled] = useState(true);
  const [prizeName, setPrizeName] = useState("Postre Artesanal de Cortesía");
  const [prizeValue, setPrizeValue] = useState("$18.000 COP");
  const [prizeDescription, setPrizeDescription] = useState("Una porción de repostería artesanal de la casa");
  const [whatsappStatus, setWhatsappStatus] = useState("¡Disfrutando de una experiencia increíble en {restaurante}! ☕🍰 10/10 ✨");
  const [terms, setTerms] = useState("Válido hoy en caja.");

  useEffect(() => {
    fetch("/api/second-chance-config")
      .then((res) => res.json())
      .then((data) => {
        if (data.secondChance) {
          setEnabled(data.secondChance.enabled ?? true);
          if (data.secondChance.prizeName) setPrizeName(data.secondChance.prizeName);
          if (data.secondChance.prizeValue) setPrizeValue(data.secondChance.prizeValue);
          if (data.secondChance.prizeDescription) setPrizeDescription(data.secondChance.prizeDescription);
          if (data.secondChance.whatsappStatus) setWhatsappStatus(data.secondChance.whatsappStatus);
          if (data.secondChance.terms) setTerms(data.secondChance.terms);
        }
      })
      .catch(() => setError("Error al conectar con el servidor"))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/second-chance-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enabled,
          prizeName,
          prizeValue,
          prizeDescription,
          whatsappStatus,
          terms,
        }),
      });
      if (!res.ok) throw new Error("Error al guardar Segunda Oportunidad");
      setSuccess("✓ Configuración de Segunda Oportunidad guardada exitosamente.");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. NAVEGACIÓN Y ENCABEZADO */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#363439] pb-4">
        <div className="flex items-center gap-3">
          <Link
            to="/games"
            className="w-8 h-8 rounded-xl bg-[#201f23] hover:bg-[#2b292e] border border-[#363439] flex items-center justify-center text-[#ccc3d8] hover:text-[#f2be71] transition-all cursor-pointer"
            title="Volver al Catálogo de Juegos"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h2 className="text-xl font-bold text-[#e6e1e7] font-['Epilogue'] flex items-center gap-2">
              <Share2 className="w-5 h-5 text-[#8b5cf6]" />
              <span>Módulo: Segunda Oportunidad & Viralidad</span>
            </h2>
            <p className="text-xs text-[#ccc3d8]">
              Convierte a comensales que no ganaron en la primera ronda en promotores de tu marca en WhatsApp.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="bg-[#f2be71] text-[#121115] font-bold px-5 py-2.5 rounded-xl text-xs hover:brightness-105 transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? "Guardando..." : "Guardar 2ª Oportunidad"}</span>
        </button>
      </div>

      {success && (
        <div className="bg-[#0d2e1f] border border-[#10b981]/50 text-[#10b981] px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-950/40 border border-red-500/50 text-red-300 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 2. SWITCH ACTIVAR / DESACTIVAR */}
      <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-5 shadow-lg flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-[#e6e1e7]">Habilitar Segunda Oportunidad en Mesas</h3>
          <p className="text-xs text-[#ccc3d8]">
            Permite al cliente desbloquear un tiro de revancha si comparte su visita en WhatsApp.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEnabled(!enabled)}
          className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
            enabled ? "bg-[#10b981]" : "bg-[#363439]"
          }`}
        >
          <div
            className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
              enabled ? "translate-x-6" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {/* 3. FORMULARIO DE DETALLES */}
      <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-5 shadow-lg space-y-4">
        <h3 className="text-sm font-bold text-[#e6e1e7] flex items-center gap-2 border-b border-[#2b292e] pb-3">
          <Gift className="w-4 h-4 text-[#8b5cf6]" />
          <span>Recompensa de Revancha & Mensaje Viral</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-[#ccc3d8] block mb-1">Nombre del Premio</label>
            <input
              type="text"
              value={prizeName}
              onChange={(e) => setPrizeName(e.target.value)}
              className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] text-xs rounded-xl px-4 py-2.5 w-full focus:border-[#8b5cf6]/60 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#ccc3d8] block mb-1">Valor Comercial Estimado</label>
            <input
              type="text"
              value={prizeValue}
              onChange={(e) => setPrizeValue(e.target.value)}
              className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] text-xs rounded-xl px-4 py-2.5 w-full focus:border-[#8b5cf6]/60 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-[#ccc3d8] block mb-1">Descripción del Beneficio</label>
            <input
              type="text"
              value={prizeDescription}
              onChange={(e) => setPrizeDescription(e.target.value)}
              className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] text-xs rounded-xl px-4 py-2.5 w-full focus:border-[#8b5cf6]/60 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-[#ccc3d8] block mb-1 flex items-center gap-1.5">
              <MessageCircle className="w-3.5 h-3.5 text-[#10b981]" />
              <span>Plantilla de Estado de WhatsApp (Viralidad)</span>
            </label>
            <textarea
              rows={3}
              value={whatsappStatus}
              onChange={(e) => setWhatsappStatus(e.target.value)}
              className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] text-xs rounded-xl px-4 py-2.5 w-full focus:border-[#8b5cf6]/60 focus:outline-none"
            />
            <span className="text-[10px] text-[#ccc3d8]">Usa <strong className="text-[#f2be71]">{"{restaurante}"}</strong> para reemplazar automáticamente por el nombre de tu marca.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
