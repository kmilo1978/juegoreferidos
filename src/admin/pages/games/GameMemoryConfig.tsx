import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Brain,
  Save,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Sparkles,
  Sliders,
  Timer,
  Trophy,
  Gift,
  Volume2,
  Eye,
  RotateCcw,
  Palette,
} from "lucide-react";
import {
  MEMORY_THEMES,
  MemoryThemePreset,
  MemoryGameSettings,
  DEFAULT_MEMORY_SETTINGS,
} from "@/lib/memoryGameData";
import { StepMemoryGame } from "@/components/qr-game/StepMemoryGame";

export function GameMemoryConfig() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Estados de configuración de Memory
  const [activeThemeId, setActiveThemeId] = useState<string>("halloween");
  const [timeLimitSeconds, setTimeLimitSeconds] = useState<number>(40);
  const [pairsCount, setPairsCount] = useState<number>(8);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [allowRanking, setAllowRanking] = useState<boolean>(true);
  const [rewardPrizeName, setRewardPrizeName] = useState<string>("Postre o Cóctel Espeluznante Gratis");
  const [rewardPrizeValue, setRewardPrizeValue] = useState<string>("$18.000 COP");

  // Tab de vista previa o ajustes
  const [activeTab, setActiveTab] = useState<"settings" | "simulator">("settings");
  const [previewKey, setPreviewKey] = useState(0);

  useEffect(() => {
    fetch("/api/game-config")
      .then((res) => res.json())
      .then((data) => {
        if (data.gameConfig?.memorySettings) {
          const m = data.gameConfig.memorySettings;
          if (m.activeThemeId) setActiveThemeId(m.activeThemeId);
          if (m.timeLimitSeconds) setTimeLimitSeconds(m.timeLimitSeconds);
          if (m.pairsCount) setPairsCount(m.pairsCount);
          if (m.soundEnabled !== undefined) setSoundEnabled(m.soundEnabled);
          if (m.allowRanking !== undefined) setAllowRanking(m.allowRanking);
          if (m.rewardPrizeName) setRewardPrizeName(m.rewardPrizeName);
          if (m.rewardPrizeValue) setRewardPrizeValue(m.rewardPrizeValue);
        }
      })
      .catch(() => setError("Error al conectar con la configuración"))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    const memorySettings: MemoryGameSettings = {
      activeThemeId,
      timeLimitSeconds,
      pairsCount,
      allowRanking,
      soundEnabled,
      requireLeadRegistration: false,
      rewardType: "instant_voucher",
      rewardPrizeName,
      rewardPrizeValue,
    };

    try {
      const res = await fetch("/api/game-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memorySettings,
        }),
      });
      if (!res.ok) throw new Error("Error al guardar configuración de Memory");
      setSuccess("✓ Módulo de Juego de Memoria guardado correctamente.");
      setTimeout(() => setSuccess(null), 3000);
      setPreviewKey((k) => k + 1);
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
              <Brain className="w-5 h-5 text-[#ff007f]" />
              <span>Módulo: Juego de Memoria (Memory Match)</span>
            </h2>
            <p className="text-xs text-[#ccc3d8]">
              Personaliza el reto de parejas, elige entre temática de Halloween o productos de tu marca, y calibra tiempos y recompensas.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-[#201f23] p-1 rounded-xl border border-[#363439]">
            <button
              type="button"
              onClick={() => setActiveTab("settings")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "settings"
                  ? "bg-[#f2be71] text-[#121115]"
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
            <span>{saving ? "Guardando..." : "Guardar Memory"}</span>
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

      {/* 2. PESTAÑA: CONFIGURACIÓN */}
      {activeTab === "settings" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tarjeta de Temática de Temporada */}
          <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-5 shadow-lg space-y-4">
            <h3 className="text-sm font-bold text-[#e6e1e7] flex items-center gap-2 border-b border-[#2b292e] pb-3">
              <Palette className="w-4 h-4 text-[#ff007f]" />
              <span>Temática Visual & Ilustraciones de Cartas</span>
            </h3>

            <div className="space-y-3">
              {Object.values(MEMORY_THEMES).map((theme) => {
                const isSelected = activeThemeId === theme.id;
                return (
                  <div
                    key={theme.id}
                    onClick={() => setActiveThemeId(theme.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${
                      isSelected
                        ? "bg-[#27102e] border-[#ff007f] ring-1 ring-[#ff007f]/40 shadow-md"
                        : "bg-[#201f23] border-[#363439] hover:border-[#ff007f]/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{theme.cardBackIcon}</span>
                        <div>
                          <h4 className="text-xs font-bold text-white">{theme.name}</h4>
                          <span className="text-[10px] text-[#ccc3d8]">{theme.category}</span>
                        </div>
                      </div>

                      {isSelected && (
                        <span className="text-[10px] font-bold text-[#ff007f] bg-[#ff007f]/15 px-2.5 py-0.5 rounded-full border border-[#ff007f]/30">
                          ✓ Activo
                        </span>
                      )}
                    </div>

                    {/* Muestra de las 8 cartas de la temática */}
                    <div className="flex items-center gap-1.5 pt-1 overflow-x-auto pb-1">
                      {theme.items.map((item) => (
                        <div
                          key={item.id}
                          className="w-8 h-8 rounded-lg bg-[#140b1c] border border-[#363439] flex items-center justify-center text-base shrink-0 shadow-xs"
                          title={item.name}
                        >
                          {item.emoji}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tarjeta de Dificultad, Tiempos y Premios */}
          <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-5 shadow-lg space-y-5">
            <h3 className="text-sm font-bold text-[#e6e1e7] flex items-center gap-2 border-b border-[#2b292e] pb-3">
              <Sliders className="w-4 h-4 text-[#f2be71]" />
              <span>Reglas de Juego, Tiempo & Premio</span>
            </h3>

            <div className="space-y-4">
              {/* Dificultad / Número de Parejas */}
              <div>
                <label className="text-xs font-semibold text-[#ccc3d8] block mb-1">
                  Nivel de Dificultad (Número de Parejas)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { count: 4, label: "Fácil (8 cartas)", desc: "Cuadrícula 2x4" },
                    { count: 6, label: "Medio (12 cartas)", desc: "Cuadrícula 3x4" },
                    { count: 8, label: "Difícil (16 cartas)", desc: "Cuadrícula 4x4 (Como la foto)" },
                  ].map((lvl) => (
                    <button
                      key={lvl.count}
                      type="button"
                      onClick={() => setPairsCount(lvl.count)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        pairsCount === lvl.count
                          ? "bg-[#f2be71] text-[#121115] border-[#f2be71] font-bold shadow-xs"
                          : "bg-[#201f23] text-[#ccc3d8] border-[#363439] hover:border-[#f2be71]/40"
                      }`}
                    >
                      <span className="text-xs block font-bold">{lvl.count} Parejas</span>
                      <span className="text-[9px] block opacity-80">{lvl.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tiempo límite */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-[#ccc3d8]">
                    Tiempo Límite para Resolver la Partida
                  </label>
                  <span className="font-mono text-xs font-bold text-[#f2be71]">{timeLimitSeconds} segundos</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="90"
                  step="5"
                  value={timeLimitSeconds}
                  onChange={(e) => setTimeLimitSeconds(parseInt(e.target.value, 10))}
                  className="w-full accent-[#f2be71] cursor-pointer"
                />
                <div className="flex items-center justify-between text-[10px] text-[#ccc3d8] mt-1">
                  <span>Rápido (20s)</span>
                  <span>Equilibrado (40s)</span>
                  <span>Relajado (90s)</span>
                </div>
              </div>

              {/* Efectos de sonido */}
              <div className="flex items-center justify-between bg-[#201f23] p-3 rounded-xl border border-[#363439]">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-[#ff007f]" />
                  <div>
                    <span className="text-xs font-bold text-white block">Efectos de Sonido Inmersivos</span>
                    <span className="text-[10px] text-[#ccc3d8]">Giro de cartas, aciertos y fanfarria de victoria</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                    soundEnabled ? "bg-[#10b981]" : "bg-[#363439]"
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      soundEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Recompensa al Completar */}
              <div className="space-y-2 pt-2 border-t border-[#2b292e]">
                <label className="text-xs font-semibold text-[#f2be71] flex items-center gap-1.5">
                  <Gift className="w-3.5 h-3.5" />
                  <span>Premio Instantáneo para el Ganador</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={rewardPrizeName}
                    onChange={(e) => setRewardPrizeName(e.target.value)}
                    placeholder="Nombre del premio (ej: Tarta o Cóctel gratis)"
                    className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] text-xs rounded-xl px-3 py-2 focus:border-[#f2be71]/60 focus:outline-none"
                  />
                  <input
                    type="text"
                    value={rewardPrizeValue}
                    onChange={(e) => setRewardPrizeValue(e.target.value)}
                    placeholder="Valor referencial (ej: $18.000 COP)"
                    className="bg-[#201f23] border border-[#363439] text-[#ccc3d8] text-xs rounded-xl px-3 py-2 focus:border-[#f2be71]/60 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. PESTAÑA: SIMULADOR INTERACTIVO EN VIVO */}
      {activeTab === "simulator" && (
        <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-6 shadow-lg flex flex-col items-center">
          <div className="flex items-center justify-between w-full max-w-md mb-4">
            <span className="text-xs font-bold text-[#e6e1e7] flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-[#ff007f]" />
              <span>Simulador Móvil en Vivo ({MEMORY_THEMES[activeThemeId]?.name})</span>
            </span>
            <button
              type="button"
              onClick={() => setPreviewKey((k) => k + 1)}
              className="text-xs text-[#f2be71] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reiniciar Simulación</span>
            </button>
          </div>

          <div key={previewKey} className="w-full flex justify-center py-2">
            <StepMemoryGame
              onWinPrize={(name, val) => alert(`🎉 ¡Victoria en el Simulador! Premio: ${name} (${val})`)}
              initialSettings={{
                activeThemeId,
                timeLimitSeconds,
                pairsCount,
                soundEnabled,
                rewardPrizeName,
                rewardPrizeValue,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
