import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  RotateCw,
  Sparkles,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Eye,
  Sliders,
  ArrowLeft,
  Smartphone,
} from "lucide-react";
import { StepRouletteWheel } from "../../../components/qr-game/StepRouletteWheel";
import { DEFAULT_PRIZES } from "../../../components/qr-game/gameTypes";

export function GameRouletteConfig() {
  const [activeTab, setActiveTab] = useState<"settings" | "simulator">("settings");
  const [simulatorKey, setSimulatorKey] = useState(1);
  const [prizes, setPrizes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [spinSpeed, setSpinSpeed] = useState<number>(4); // segundos de giro

  useEffect(() => {
    fetch("/api/config")
      .then((res) => res.json())
      .then((data) => {
        if (data.settings?.prizes && Array.isArray(data.settings.prizes)) {
          setPrizes(data.settings.prizes);
        } else {
          setPrizes(DEFAULT_PRIZES);
        }
      })
      .catch(() => setError("Error al conectar con la configuración de premios"))
      .finally(() => setLoading(false));
  }, []);

  const totalProbability = useMemo(() => {
    return prizes.reduce((acc, p) => acc + (Number(p.probability) || 0), 0);
  }, [prizes]);

  const handleAddPrize = () => {
    const newPrize = {
      id: `p_${Date.now()}`,
      name: "Nuevo Premio Especial",
      value: "Cortesia",
      probability: 10,
      color: "#f2be71",
      active: true,
    };
    setPrizes([...prizes, newPrize]);
  };

  const handleDeletePrize = (id: string) => {
    if (prizes.length <= 2) {
      alert("La ruleta requiere al menos 2 premios para funcionar.");
      return;
    }
    setPrizes(prizes.filter((p) => p.id !== id));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totalProbability !== 100) {
      if (!window.confirm(`La suma de probabilidades es ${totalProbability}%, no 100%. ¿Deseas guardar de todas formas?`)) {
        return;
      }
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prizes }),
      });
      if (!res.ok) throw new Error("Error al guardar configuración de ruleta");
      setSuccess("✓ Ruleta de premios y probabilidades guardadas exitosamente en la base de datos.");
      setSimulatorKey((k) => k + 1);
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
              <RotateCw className="w-5 h-5 text-[#f2be71]" />
              <span>Módulo: Ruleta de Premios & Probabilidades</span>
            </h2>
            <p className="text-xs text-[#ccc3d8]">
              Personaliza los gajos de la ruleta, el porcentaje de probabilidad de cada premio y los colores de la dinámica.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-[#201f23] p-1 rounded-xl border border-[#363439]">
            <button
              type="button"
              onClick={() => setActiveTab("settings")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "settings"
                  ? "bg-[#f2be71] text-[#121115]"
                  : "text-[#ccc3d8] hover:text-white"
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Configuración</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("simulator")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "simulator"
                  ? "bg-[#f2be71] text-[#121115]"
                  : "text-[#ccc3d8] hover:text-white"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Probar Simulador</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="bg-[#f2be71] text-[#121115] font-bold px-5 py-2.5 rounded-xl text-xs hover:brightness-105 transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Guardando..." : "Guardar Ruleta"}</span>
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
        <div className="bg-red-950/40 border border-red-500/50 text-red-300 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* PESTAÑA 1: CONFIGURACIÓN DE SECTORES Y PROBABILIDADES */}
      {activeTab === "settings" && (
        <div className="space-y-6">
          {/* 2. REGLA MATEMÁTICA Y ACCIÓN RÁPIDA */}
          <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-[#e6e1e7] flex items-center gap-2">
                <span>Suma Total de Probabilidades:</span>
                <span
                  className={`font-mono text-sm px-2.5 py-0.5 rounded-full font-bold ${
                    totalProbability === 100
                      ? "bg-[#0d2e1f] text-[#10b981] border border-[#10b981]/40"
                      : "bg-red-950/60 text-red-400 border border-red-500/40"
                  }`}
                >
                  {totalProbability}%
                </span>
              </span>
              <p className="text-[11px] text-[#ccc3d8]">
                {totalProbability === 100
                  ? "✓ La probabilidad matemática es perfecta (100%)."
                  : `⚠️ Ajusta las probabilidades para que sumen exactamente 100% (faltan o sobran ${(100 - totalProbability).toFixed(0)}%).`}
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddPrize}
              className="bg-[#201f23] hover:bg-[#2b292e] border border-[#f2be71]/40 text-[#f2be71] px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Agregar Premio / Sector</span>
            </button>
          </div>

          {/* 3. LISTADO EDITABLE DE SECTORES DE RULETA */}
          <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-5 shadow-lg space-y-4">
            <h3 className="text-sm font-bold text-[#e6e1e7] border-b border-[#2b292e] pb-3">
              Sectores Configurados ({prizes.length})
            </h3>

            <div className="space-y-3">
              {prizes.map((prize, idx) => (
                <div
                  key={prize.id || idx}
                  className="bg-[#201f23] border border-[#363439] rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-[#f2be71]/40 transition-colors"
                >
                  <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
                    <input
                      type="color"
                      value={prize.color || "#f2be71"}
                      onChange={(e) => {
                        const next = [...prizes];
                        next[idx].color = e.target.value;
                        setPrizes(next);
                      }}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 shrink-0"
                      title="Color del sector en la ruleta"
                    />

                    <div className="flex-1 space-y-1">
                      <input
                        type="text"
                        value={prize.name}
                        onChange={(e) => {
                          const next = [...prizes];
                          next[idx].name = e.target.value;
                          setPrizes(next);
                        }}
                        placeholder="Nombre del premio"
                        className="bg-[#1c1b1f] border border-[#363439] text-[#e6e1e7] text-xs font-bold rounded-lg px-3 py-1.5 w-full focus:border-[#f2be71]/60 focus:outline-none"
                      />
                      <input
                        type="text"
                        value={prize.value || ""}
                        onChange={(e) => {
                          const next = [...prizes];
                          next[idx].value = e.target.value;
                          setPrizes(next);
                        }}
                        placeholder="Valor referencial (ej: $18.000 COP o Gratis)"
                        className="bg-[#1c1b1f] border border-[#363439] text-[#ccc3d8] text-[11px] rounded-lg px-3 py-1 w-full focus:border-[#f2be71]/60 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-[#ccc3d8]">Probabilidad:</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={prize.probability}
                        onChange={(e) => {
                          const next = [...prizes];
                          next[idx].probability = parseInt(e.target.value, 10) || 0;
                          setPrizes(next);
                        }}
                        className="w-16 bg-[#1c1b1f] border border-[#363439] text-[#f2be71] font-mono text-xs font-bold rounded-lg px-2 py-1 text-center focus:border-[#f2be71]/60 focus:outline-none"
                      />
                      <span className="text-xs text-[#ccc3d8] font-mono">%</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeletePrize(prize.id)}
                      className="w-8 h-8 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 text-red-400 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                      title="Eliminar este sector"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA 2: SIMULADOR MÓVIL EN VIVO DE RULETA */}
      {activeTab === "simulator" && (
        <div className="flex flex-col items-center justify-center p-4 bg-[#141317] rounded-3xl border border-[#363439]">
          <div className="flex items-center gap-2 mb-4 text-xs text-[#ccc3d8]">
            <Smartphone className="w-4 h-4 text-[#f2be71]" />
            <span>Simulador de Ruleta Móvil (Smartphone 390 × 844 px)</span>
          </div>

          <div
            key={simulatorKey}
            className="w-[390px] h-[780px] bg-[#000000] rounded-[48px] p-3.5 border-[6px] border-[#2b292e] shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col relative"
          >
            {/* Dynamic Island superior */}
            <div className="w-24 h-4 bg-black rounded-full mx-auto mb-2 shrink-0 border border-white/10" />

            <div className="flex-1 overflow-y-auto no-scrollbar rounded-2xl flex flex-col justify-center">
              <StepRouletteWheel
                prizes={prizes.length > 0 ? prizes : DEFAULT_PRIZES}
                participantName="Comensal Demo"
                onPrizeWon={(prize) => {
                  alert(`¡Premio ganado en la ruleta! \n${prize.name} (${prize.value})`);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
