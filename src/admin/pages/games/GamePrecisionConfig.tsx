import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Timer,
  Save,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Sliders,
  Target,
  Zap,
  Eye,
  Smartphone,
  Trophy,
} from "lucide-react";
import { StepPrecisionTimer } from "../../../components/qr-game/StepPrecisionTimer";
import { DEFAULT_PRIZES } from "../../../components/qr-game/gameTypes";

export function GamePrecisionConfig() {
  const [activeTab, setActiveTab] = useState<"settings" | "simulator">("settings");
  const [simulatorKey, setSimulatorKey] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Estados de calibración del reto
  const [targetSeconds, setTargetSeconds] = useState(10.0);
  const [toleranceMs, setToleranceMs] = useState(45);
  const [maxAttempts, setMaxAttempts] = useState(3);
  const [winPrizeName, setWinPrizeName] = useState("Porción de Tarta Vasca o Postre VIP");
  const [closePrizeName, setClosePrizeName] = useState("Café Americano o Capuchino de Cortesía");

  useEffect(() => {
    fetch("/api/game-config")
      .then((res) => res.json())
      .then((data) => {
        if (data.gameConfig) {
          if (data.gameConfig.toleranceMs) setToleranceMs(data.gameConfig.toleranceMs);
          if (data.gameConfig.maxAttempts) setMaxAttempts(data.gameConfig.maxAttempts);
          if (data.gameConfig.targetSeconds) setTargetSeconds(data.gameConfig.targetSeconds);
          if (data.gameConfig.winPrizeName) setWinPrizeName(data.gameConfig.winPrizeName);
          if (data.gameConfig.closePrizeName) setClosePrizeName(data.gameConfig.closePrizeName);
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
      const res = await fetch("/api/game-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetSeconds,
          toleranceMs,
          maxAttempts,
          winPrizeName,
          closePrizeName,
        }),
      });
      if (!res.ok) throw new Error("Error al guardar calibración de precisión");
      setSuccess("✓ Calibración del Cronómetro de Precisión 10s guardada exitosamente.");
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
              <Timer className="w-5 h-5 text-[#10b981]" />
              <span>Módulo: Reto Cronómetro de Precisión (10.000s)</span>
            </h2>
            <p className="text-xs text-[#ccc3d8]">
              Ajusta la dificultad matemática, la tolerancia en milisegundos y los premios del reto de reflejos en mesa.
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
                  ? "bg-[#10b981] text-[#121115] font-bold"
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
                  ? "bg-[#10b981] text-[#121115] font-bold"
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
            className="bg-[#10b981] text-[#121115] font-bold px-5 py-2.5 rounded-xl text-xs hover:brightness-105 transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Guardando..." : "Guardar Calibración"}</span>
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

      {/* 2. CONTENIDO CONDICIONAL POR PESTAÑAS */}
      {activeTab === "settings" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-5 shadow-lg space-y-4">
            <h3 className="text-sm font-bold text-[#e6e1e7] flex items-center gap-2 border-b border-[#2b292e] pb-3">
              <Target className="w-4 h-4 text-[#f2be71]" />
              <span>Reglas de Destreza & Margen de Error</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#ccc3d8] block mb-1">
                  Objetivo del Temporizador (Segundos)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    value={targetSeconds}
                    onChange={(e) => setTargetSeconds(parseFloat(e.target.value) || 10.0)}
                    className="bg-[#201f23] border border-[#363439] text-[#f2be71] font-mono text-sm font-bold rounded-xl px-4 py-2.5 w-32 focus:border-[#f2be71]/60 focus:outline-none"
                  />
                  <span className="text-xs text-[#ccc3d8]">segundos exactos (Recomendado: 10.000s)</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-[#ccc3d8]">
                    Tolerancia de Victoria (± Milisegundos)
                  </label>
                  <span className="font-mono text-xs font-bold text-[#10b981]">±{toleranceMs} ms</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="120"
                  step="5"
                  value={toleranceMs}
                  onChange={(e) => setToleranceMs(parseInt(e.target.value, 10))}
                  className="w-full accent-[#10b981] cursor-pointer"
                />
                <div className="flex items-center justify-between text-[10px] text-[#ccc3d8] mt-1">
                  <span>Experto (±10ms)</span>
                  <span>Equilibrado (±45ms)</span>
                  <span>Fácil (±120ms)</span>
                </div>
                <p className="text-[11px] text-[#ccc3d8] mt-2 italic bg-[#201f23] p-2.5 rounded-xl border border-[#363439]">
                  El comensal ganará si detiene el cronómetro entre {(targetSeconds - toleranceMs / 1000).toFixed(3)}s y {(targetSeconds + toleranceMs / 1000).toFixed(3)}s.
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#ccc3d8] block mb-1">
                  Intentos Máximos por Mesa / Comensal
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 5].map((att) => (
                    <button
                      key={att}
                      type="button"
                      onClick={() => setMaxAttempts(att)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        maxAttempts === att
                          ? "bg-[#f2be71] text-[#121115] border-[#f2be71] shadow-xs"
                          : "bg-[#201f23] text-[#ccc3d8] border-[#363439] hover:border-[#f2be71]/40"
                      }`}
                    >
                      {att} {att === 1 ? "Intento" : "Intentos"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 3. RECOMPENSAS POR PRECISIÓN */}
          <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-5 shadow-lg space-y-4">
            <h3 className="text-sm font-bold text-[#e6e1e7] flex items-center gap-2 border-b border-[#2b292e] pb-3">
              <Trophy className="w-4 h-4 text-[#f2be71]" />
              <span>Premios del Reto</span>
            </h3>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#10b981] flex items-center gap-1.5">
                  <span>🏆 Premio por Victoria Exacta (10.000s)</span>
                </label>
                <input
                  type="text"
                  value={winPrizeName}
                  onChange={(e) => setWinPrizeName(e.target.value)}
                  placeholder="Ej: Postre de la casa gratis"
                  className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] text-xs rounded-xl px-4 py-2.5 w-full focus:border-[#10b981]/60 focus:outline-none"
                />
                <span className="text-[10px] text-[#ccc3d8]">Se desbloquea al frenar dentro de la tolerancia de ±{toleranceMs}ms.</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#f59e0b] flex items-center gap-1.5">
                  <span>🥈 Premio de Consolación (Estuvo muy cerca)</span>
                </label>
                <input
                  type="text"
                  value={closePrizeName}
                  onChange={(e) => setClosePrizeName(e.target.value)}
                  placeholder="Ej: Café Americano de cortesía o 10% OFF"
                  className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] text-xs rounded-xl px-4 py-2.5 w-full focus:border-[#f59e0b]/60 focus:outline-none"
                />
                <span className="text-[10px] text-[#ccc3d8]">Premia al comensal si quedó a menos de ±{(toleranceMs * 2.5).toFixed(0)}ms para no dejarlo con las manos vacías.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA 2: SIMULADOR MÓVIL EN VIVO DE PRECISIÓN */}
      {activeTab === "simulator" && (
        <div className="flex flex-col items-center justify-center p-4 bg-[#141317] rounded-3xl border border-[#363439]">
          <div className="flex items-center gap-2 mb-4 text-xs text-[#ccc3d8]">
            <Smartphone className="w-4 h-4 text-[#10b981]" />
            <span>Simulador de Reto Precisión Móvil (Smartphone 390 × 844 px)</span>
          </div>

          <div
            key={simulatorKey}
            className="w-[390px] h-[780px] bg-[#000000] rounded-[48px] p-3.5 border-[6px] border-[#2b292e] shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col relative"
          >
            {/* Dynamic Island superior */}
            <div className="w-24 h-4 bg-black rounded-full mx-auto mb-2 shrink-0 border border-white/10" />

            <div className="flex-1 overflow-y-auto no-scrollbar rounded-2xl flex flex-col justify-center">
              <StepPrecisionTimer
                prizes={DEFAULT_PRIZES}
                participantName="Comensal Demo"
                onPrizeWon={(prize) => {
                  alert(`¡Completaste el reto de precisión! \nPremio: ${prize.name}`);
                }}
                onExit={() => {
                  setSimulatorKey((k) => k + 1);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
