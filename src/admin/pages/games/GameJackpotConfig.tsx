import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Sliders,
  Eye,
  CheckCircle2,
  Volume2,
  Trophy,
  Save,
  ArrowLeft,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import {
  JackpotSettings,
  DEFAULT_JACKPOT_SETTINGS,
  JACKPOT_THEMES,
} from "@/lib/jackpotData";
import { StepJackpotGame } from "@/components/qr-game/StepJackpotGame";

export function GameJackpotConfig() {
  const [activeTab, setActiveTab] = useState<"settings" | "simulator">("settings");
  const [settings, setSettings] = useState<JackpotSettings>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("juegoreferidos_jackpot_settings");
      if (saved) {
        try {
          return { ...DEFAULT_JACKPOT_SETTINGS, ...JSON.parse(saved) };
        } catch {}
      }
    }
    return DEFAULT_JACKPOT_SETTINGS;
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [previewKey, setPreviewKey] = useState(1);

  const handleSave = () => {
    setSaving(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("juegoreferidos_jackpot_settings", JSON.stringify(settings));
    }
    setTimeout(() => {
      setSaving(false);
      setSuccess("¡Configuración del Jackpot guardada con éxito!");
      setPreviewKey((k) => k + 1);
      setTimeout(() => setSuccess(null), 3000);
    }, 400);
  };

  return (
    <div className="space-y-6">
      {/* 1. ENCABEZADO MODULAR */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#363439] pb-4">
        <div className="flex items-center gap-3">
          <Link
            to="/games"
            className="w-9 h-9 rounded-xl bg-[#201f23] hover:bg-[#2b292e] border border-[#363439] flex items-center justify-center text-[#ccc3d8] hover:text-[var(--gold)] transition-colors cursor-pointer"
            title="Volver al Catálogo de Juegos"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h2 className="text-xl font-bold text-[#e6e1e7] font-['Epilogue'] flex items-center gap-2">
              <span className="text-xl">🎰</span>
              <span>Módulo: Máquina de Jackpot (Tragaperras de Marca)</span>
            </h2>
            <p className="text-xs text-[#ccc3d8]">
              3 rodillos giratorios con marquesina retroiluminada. El comensal tira de la máquina para conseguir la combinación ganadora.
            </p>
          </div>
        </div>

        {/* Pestañas & Guardar */}
        <div className="flex items-center gap-2">
          <div className="flex bg-[#201f23] p-1 rounded-xl border border-[#363439]">
            <button
              type="button"
              onClick={() => setActiveTab("settings")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "settings"
                  ? "bg-[var(--gold)] text-[#121115]"
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
                  ? "bg-[var(--gold)] text-[#121115]"
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
            className="bg-[var(--gold)] hover:brightness-105 active:scale-98 text-[#121115] px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? "Guardando..." : "Guardar Jackpot"}</span>
          </button>
        </div>
      </div>

      {success && (
        <div className="bg-[#0d2e1f] border border-[#10b981]/50 text-[#10b981] px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* PESTAÑA 1: CONFIGURACIÓN */}
      {activeTab === "settings" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Temática Visual */}
          <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-5 space-y-4 shadow-lg">
            <h3 className="text-sm font-bold text-[#e6e1e7] flex items-center gap-2 border-b border-[#2b292e] pb-3">
              <span className="text-base">✈️</span>
              <span>Temática Visual & Símbolos de Rodillos</span>
            </h3>

            <div className="space-y-3">
              {Object.values(JACKPOT_THEMES).map((th) => {
                const isSelected = settings.themeId === th.id;
                return (
                  <div
                    key={th.id}
                    onClick={() => setSettings({ ...settings, themeId: th.id as any })}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col gap-2 ${
                      isSelected
                        ? "bg-[#1e293b] border-[#38bdf8] ring-1 ring-[#38bdf8]/40 shadow-md"
                        : "bg-[#201f23] border-[#363439] hover:border-[var(--gold)]/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-[#e6e1e7]">{th.name}</h4>
                        <span className="text-[10px] text-[#ccc3d8]">{th.category}</span>
                      </div>
                      {isSelected && (
                        <span className="text-[10px] font-bold text-[#38bdf8] bg-[#38bdf8]/15 px-2 py-0.5 rounded-full border border-[#38bdf8]/30">
                          ✓ Activo
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                      <span className="text-[10px] text-[#ccc3d8]">Símbolos:</span>
                      <div className="flex gap-2 text-base">
                        {th.symbols.map((sym) => (
                          <span
                            key={sym.id}
                            title={`${sym.name} ${sym.isJackpot ? "(Premio Gordo)" : ""}`}
                            className={`filter drop-shadow ${sym.isJackpot ? "scale-120 text-[#fbbf24]" : ""}`}
                          >
                            {sym.emoji}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Probabilidades, Intentos & Premio */}
          <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-5 space-y-5 shadow-lg">
            <h3 className="text-sm font-bold text-[#e6e1e7] flex items-center gap-2 border-b border-[#2b292e] pb-3">
              <Sliders className="w-4 h-4 text-[var(--gold)]" />
              <span>Probabilidad de Acierto, Intentos & Premio</span>
            </h3>

            {/* Slider de Probabilidad */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-[#ccc3d8]">Probabilidad de Asignación de Premio:</span>
                <span className="font-mono font-bold text-[var(--gold)]">{settings.winProbability}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="90"
                step="5"
                value={settings.winProbability}
                onChange={(e) => setSettings({ ...settings, winProbability: parseInt(e.target.value, 10) })}
                className="w-full accent-[var(--gold)] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#958da1]">
                <span>Exclusivo (10%)</span>
                <span>Equilibrado (40%)</span>
                <span>Generoso (90%)</span>
              </div>
            </div>

            {/* Selector de Intentos / Vidas */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#ccc3d8] block">
                Número de Intentos / Vidas por Comensal
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[3, 5, 7].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setSettings({ ...settings, maxAttempts: num })}
                    className={`py-3 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                      settings.maxAttempts === num
                        ? "bg-[var(--gold)] text-[#121115] border-[var(--gold)] shadow-md"
                        : "bg-[#201f23] text-[#ccc3d8] border-[#363439] hover:border-[var(--gold)]/40"
                    }`}
                  >
                    <span>{num} Vidas (Tiradas)</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Toggle de Sonido */}
            <div className="flex items-center justify-between p-3.5 bg-[#201f23] rounded-xl border border-[#363439]">
              <div className="flex items-center gap-3">
                <Volume2 className="w-4 h-4 text-[var(--gold)]" />
                <div>
                  <h4 className="text-xs font-bold text-[#e6e1e7]">Efectos de Sonido Mecánicos</h4>
                  <p className="text-[10px] text-[#ccc3d8]">Giro mecánico de carretes, freno metálico y lluvia de monedas</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={(e) => setSettings({ ...settings, soundEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-[#363439] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#10b981]" />
              </label>
            </div>

            {/* Recompensa Instantánea */}
            <div className="space-y-3 pt-2 border-t border-[#2b292e]">
              <label className="text-xs font-semibold text-[#ccc3d8] flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-[#fbbf24]" />
                <span>Premio Gordo de la Combinación 3 Iguales</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-[#ccc3d8] block mb-1">Nombre del Premio</label>
                  <input
                    type="text"
                    value={settings.rewardPrizeName}
                    onChange={(e) => setSettings({ ...settings, rewardPrizeName: e.target.value })}
                    className="w-full bg-[#201f23] border border-[#363439] rounded-xl px-3 py-2 text-xs text-[#e6e1e7] focus:outline-none focus:border-[#fbbf24]"
                    placeholder="Ej. 2 Billetes de Avión / Escapada"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#ccc3d8] block mb-1">Valor Estimado</label>
                  <input
                    type="text"
                    value={settings.rewardPrizeValue}
                    onChange={(e) => setSettings({ ...settings, rewardPrizeValue: e.target.value })}
                    className="w-full bg-[#201f23] border border-[#363439] rounded-xl px-3 py-2 text-xs text-[#e6e1e7] focus:outline-none focus:border-[#fbbf24]"
                    placeholder="Ej. $450.000 COP"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA 2: SIMULADOR MÓVIL EN VIVO */}
      {activeTab === "simulator" && (
        <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-6 shadow-xl flex flex-col items-center justify-center space-y-4">
          <div className="flex items-center justify-between w-full max-w-md px-2 text-xs text-[#ccc3d8]">
            <span className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-[var(--gold)]" />
              <span>Simulador Móvil en Vivo ({JACKPOT_THEMES[settings.themeId]?.name})</span>
            </span>
            <button
              type="button"
              onClick={() => setPreviewKey((k) => k + 1)}
              className="text-[var(--gold)] hover:underline flex items-center gap-1 cursor-pointer font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reiniciar Simulación</span>
            </button>
          </div>

          {/* Marco de Smartphone */}
          <div className="w-full max-w-[390px] rounded-[38px] p-3 bg-gradient-to-b from-[#2b292e] to-[#121115] shadow-2xl border-4 border-[#363439]">
            <div className="w-full rounded-[28px] overflow-hidden bg-[#0a0f1d] min-h-[640px]">
              <StepJackpotGame
                key={previewKey}
                customSettings={settings}
                onWinPrize={(name, val) => {
                  alert(`¡Jackpot Ganado en el simulador: ${name} (${val})!`);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
