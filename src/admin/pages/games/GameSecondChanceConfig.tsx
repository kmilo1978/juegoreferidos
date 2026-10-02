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
  Eye,
  RotateCcw,
  Smartphone,
  HelpCircle,
  Check,
} from "lucide-react";
import { StepSecondChancePrecision } from "@/components/qr-game/StepSecondChancePrecision";
import { DEFAULT_SECOND_CHANCE_CONFIG, SecondChanceConfig } from "@/components/qr-game/gameTypes";

export function GameSecondChanceConfig() {
  const [activeTab, setActiveTab] = useState<"settings" | "simulator">("settings");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewKey, setPreviewKey] = useState(1);

  // Estados de 2ª Oportunidad
  const [enabled, setEnabled] = useState(true);
  const [prizeName, setPrizeName] = useState("Postre Artesanal de Cortesía");
  const [prizeValue, setPrizeValue] = useState("$18.000 COP");
  const [prizeDescription, setPrizeDescription] = useState("Una porción de repostería artesanal de la casa");
  const [whatsappStatus, setWhatsappStatus] = useState("¡Disfrutando de una experiencia increíble en este restaurante! ☕🍰 10/10 ✨");
  const [terms, setTerms] = useState("Válido hoy en caja con PIN de autorización.");

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

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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
      setPreviewKey((k) => k + 1);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setSaving(false);
    }
  };

  const currentSecondChanceConfig: SecondChanceConfig = {
    ...DEFAULT_SECOND_CHANCE_CONFIG,
    enabled,
    prizeName,
    prizeValue,
    prizeDescription,
  };

  return (
    <div className="space-y-6">
      {/* 1. NAVEGACIÓN Y ENCABEZADO */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#363439] pb-4">
        <div className="flex items-center gap-3">
          <Link
            to="/games"
            className="w-9 h-9 rounded-xl bg-[#201f23] hover:bg-[#2b292e] border border-[#363439] flex items-center justify-center text-[#ccc3d8] hover:text-[#f2be71] transition-all cursor-pointer"
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
              Mecanismo de revancha viral: transforma partidas no premiadas en recomendaciones directas en WhatsApp.
            </p>
          </div>
        </div>

        {/* Pestañas & Botón Guardar */}
        <div className="flex items-center gap-2">
          <div className="flex bg-[#201f23] p-1 rounded-xl border border-[#363439]">
            <button
              type="button"
              onClick={() => setActiveTab("settings")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "settings"
                  ? "bg-[#8b5cf6] text-white"
                  : "text-[#ccc3d8] hover:text-white"
              }`}
            >
              Configuración
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("simulator");
                setPreviewKey((k) => k + 1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "simulator"
                  ? "bg-[#8b5cf6] text-white"
                  : "text-[#ccc3d8] hover:text-white"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Probar Simulador</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => handleSave()}
            disabled={saving}
            className="bg-[#f2be71] hover:brightness-105 active:scale-98 text-[#121115] px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? "Guardando..." : "Guardar Cambios"}</span>
          </button>
        </div>
      </div>

      {success && (
        <div className="bg-[#0d2e1f] border border-[#10b981]/50 text-[#10b981] px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="bg-[#2a0f12] border border-red-500/50 text-red-300 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* PESTAÑA 1: CONFIGURACIÓN Y EXPLICACIÓN CLARA */}
      {activeTab === "settings" && (
        <div className="space-y-6">
          {/* CUADRO EXPLICATIVO CLARO Y DIDÁCTICO */}
          <div className="bg-gradient-to-r from-[#201533] via-[#1a112a] to-[#140e21] border border-[#8b5cf6]/40 rounded-2xl p-5 shadow-lg space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-[#c4b5fd]">
              <HelpCircle className="w-4 h-4 text-[#8b5cf6]" />
              <span>¿Qué es la Segunda Oportunidad y por qué es tan poderosa?</span>
            </div>
            <p className="text-xs text-[#e6e1e7] leading-relaxed">
              En cualquier juego de azar tradicional, cuando un cliente pierde se siente desilusionado.
              Con la <strong>Segunda Oportunidad</strong>, el sistema detecta que el cliente no obtuvo premio y le ofrece una <em>revancha</em>:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="bg-[#140b20] p-3 rounded-xl border border-[#3f2560] text-xs space-y-1">
                <span className="font-bold text-[#f2be71] block">1. Sin Frustración</span>
                <span className="text-[11px] text-[#ccc3d8]">El cliente no se va triste; siente que la casa le da una segunda opción.</span>
              </div>
              <div className="bg-[#140b20] p-3 rounded-xl border border-[#3f2560] text-xs space-y-1">
                <span className="font-bold text-[#8b5cf6] block">2. Viralidad en WhatsApp</span>
                <span className="text-[11px] text-[#ccc3d8]">Para desbloquearla, comparte un estado o foto en WhatsApp recomendando el local.</span>
              </div>
              <div className="bg-[#140b20] p-3 rounded-xl border border-[#3f2560] text-xs space-y-1">
                <span className="font-bold text-[#10b981] block">3. Nuevos Clientes</span>
                <span className="text-[11px] text-[#ccc3d8]">Sus amigos y contactos ven el estado y visitan el local motivados por el juego.</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Activar / Desactivar y Recompensa */}
            <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-5 space-y-4 shadow-lg">
              <h3 className="text-sm font-bold text-[#e6e1e7] flex items-center gap-2 border-b border-[#2b292e] pb-3">
                <Gift className="w-4 h-4 text-[#f2be71]" />
                <span>Estado & Recompensa de Revancha</span>
              </h3>

              {/* Toggle Habilitar */}
              <div className="flex items-center justify-between p-3.5 bg-[#201f23] rounded-xl border border-[#363439]">
                <div>
                  <h4 className="text-xs font-bold text-[#e6e1e7]">Activar Segunda Oportunidad</h4>
                  <p className="text-[10px] text-[#ccc3d8]">Muestra la opción de revancha tras una tirada no ganadora</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => setEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-[#363439] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#10b981]" />
                </label>
              </div>

              {/* Nombre y Valor del Premio */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-[#ccc3d8] block mb-1 font-semibold">Premio de la Segunda Oportunidad</label>
                  <input
                    type="text"
                    value={prizeName}
                    onChange={(e) => setPrizeName(e.target.value)}
                    className="w-full bg-[#201f23] border border-[#363439] rounded-xl px-3 py-2 text-xs text-[#e6e1e7] focus:outline-none focus:border-[#8b5cf6]"
                    placeholder="Ej. Postre Artesanal de Cortesía"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-[#ccc3d8] block mb-1">Valor Comercial</label>
                    <input
                      type="text"
                      value={prizeValue}
                      onChange={(e) => setPrizeValue(e.target.value)}
                      className="w-full bg-[#201f23] border border-[#363439] rounded-xl px-3 py-2 text-xs text-[#e6e1e7] focus:outline-none focus:border-[#8b5cf6]"
                      placeholder="Ej. $18.000 COP"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#ccc3d8] block mb-1">Condición de Canje</label>
                    <input
                      type="text"
                      value={terms}
                      onChange={(e) => setTerms(e.target.value)}
                      className="w-full bg-[#201f23] border border-[#363439] rounded-xl px-3 py-2 text-xs text-[#e6e1e7] focus:outline-none focus:border-[#8b5cf6]"
                      placeholder="Ej. Válido hoy en caja"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-[#ccc3d8] block mb-1">Descripción Breve</label>
                  <textarea
                    rows={2}
                    value={prizeDescription}
                    onChange={(e) => setPrizeDescription(e.target.value)}
                    className="w-full bg-[#201f23] border border-[#363439] rounded-xl px-3 py-2 text-xs text-[#e6e1e7] focus:outline-none focus:border-[#8b5cf6] resize-none"
                    placeholder="Describe el beneficio para el cliente..."
                  />
                </div>
              </div>
            </div>

            {/* Mensaje de WhatsApp Viral */}
            <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-5 space-y-4 shadow-lg">
              <h3 className="text-sm font-bold text-[#e6e1e7] flex items-center gap-2 border-b border-[#2b292e] pb-3">
                <MessageCircle className="w-4 h-4 text-[#25d366]" />
                <span>Mensaje Predefinido para el Estado de WhatsApp</span>
              </h3>

              <div className="space-y-3">
                <p className="text-xs text-[#ccc3d8]">
                  Este texto se copiará automáticamente al abrir WhatsApp para que el cliente lo publique como estado o mensaje:
                </p>

                <textarea
                  rows={4}
                  value={whatsappStatus}
                  onChange={(e) => setWhatsappStatus(e.target.value)}
                  className="w-full bg-[#201f23] border border-[#363439] rounded-xl p-3 text-xs text-[#e6e1e7] focus:outline-none focus:border-[#25d366] resize-none leading-relaxed"
                />

                <div className="bg-[#201f23] p-3 rounded-xl border border-[#363439] flex items-center gap-2 text-[11px] text-[#25d366]">
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  <span>El cliente puede añadir su foto en la mesa antes de publicar.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA 2: SIMULADOR MÓVIL EN VIVO DE SEGUNDA OPORTUNIDAD */}
      {activeTab === "simulator" && (
        <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-6 shadow-xl flex flex-col items-center justify-center space-y-4">
          <div className="flex items-center justify-between w-full max-w-md px-2 text-xs text-[#ccc3d8]">
            <span className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#8b5cf6]" />
              <span>Simulador Móvil en Vivo: Pantalla de Revancha / 2ª Oportunidad</span>
            </span>
            <button
              type="button"
              onClick={() => setPreviewKey((k) => k + 1)}
              className="text-[#f2be71] hover:underline flex items-center gap-1 cursor-pointer font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reiniciar Simulación</span>
            </button>
          </div>

          {/* Marco de Smartphone */}
          <div className="w-full max-w-[390px] rounded-[38px] p-3 bg-gradient-to-b from-[#2b292e] to-[#121115] shadow-2xl border-4 border-[#363439]">
            <div className="w-full rounded-[28px] overflow-hidden bg-[#141317] min-h-[620px] p-4 flex flex-col justify-center">
              <StepSecondChancePrecision
                key={previewKey}
                secondChanceConfig={currentSecondChanceConfig}
                participantName="Comensal de Prueba"
                tableNumber="Mesa 5"
                onPrizeWon={(prize) => {
                  alert(`¡Premio ganado en la Segunda Oportunidad: ${prize.name}!`);
                }}
                onExit={() => {
                  alert("Flujo completado hacia los sellos de fidelización.");
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
