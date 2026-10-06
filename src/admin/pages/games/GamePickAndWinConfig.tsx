import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Sliders,
  Eye,
  CheckCircle2,
  Volume2,
  Trophy,
  Save,
  ArrowLeft,
  Smartphone,
  Layers,
  RotateCcw,
} from "lucide-react";
import {
  PickAndWinSettings,
  DEFAULT_PICK_AND_WIN_SETTINGS,
  PICK_AND_WIN_THEMES,
} from "@/lib/pickAndWinData";
import { StepPickAndWin } from "@/components/qr-game/StepPickAndWin";

export function GamePickAndWinConfig() {
  const [activeTab, setActiveTab] = useState<"settings" | "simulator">("settings");
  const [settings, setSettings] = useState<PickAndWinSettings>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("juegoreferidos_pick_win_settings");
      if (saved) {
        try {
          return { ...DEFAULT_PICK_AND_WIN_SETTINGS, ...JSON.parse(saved) };
        } catch {}
      }
    }
    return DEFAULT_PICK_AND_WIN_SETTINGS;
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [previewKey, setPreviewKey] = useState(1);

  const handleSave = () => {
    setSaving(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("juegoreferidos_pick_win_settings", JSON.stringify(settings));
    }
    setTimeout(() => {
      setSaving(false);
      setSuccess("¡Configuración de 'Descubre y Gana' guardada con éxito!");
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
              <span className="text-xl">🏵️</span>
              <span>Módulo: Descubre y Gana (Día de Muertos / Triplete)</span>
            </h2>
            <p className="text-xs text-[#ccc3d8]">
              Tablero interactivo 3x3 donde el público destapa casillas para encontrar 3 figuras iguales antes de agotar sus intentos.
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
            <span>{saving ? "Guardando..." : "Guardar Dinámica"}</span>
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
              <span className="text-base">🏵️</span>
              <span>Temática Visual & Elementos de Casilla</span>
            </h3>

            <div className="space-y-3">
              {Object.values(PICK_AND_WIN_THEMES).map((th) => {
                const isSelected = settings.themeId === th.id;
                return (
                  <div
                    key={th.id}
                    onClick={() => setSettings({ ...settings, themeId: th.id as any })}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col gap-2 ${
                      isSelected
                        ? "bg-[#271520] border-[#e6007e] ring-1 ring-[#e6007e]/40 shadow-md"
                        : "bg-[#201f23] border-[#363439] hover:border-[var(--gold)]/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{th.coverPattern}</span>
                        <div>
                          <h4 className="text-xs font-bold text-[#e6e1e7]">{th.name}</h4>
                          <span className="text-[10px] text-[#ccc3d8]">{th.category}</span>
                        </div>
                      </div>
                      {isSelected && (
                        <span className="text-[10px] font-bold text-[#e6007e] bg-[#e6007e]/15 px-2 py-0.5 rounded-full border border-[#e6007e]/30">
                          ✓ Activo
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                      <span className="text-[10px] text-[#ccc3d8]">Figuras:</span>
                      <div className="flex gap-2 text-base">
                        {th.items.map((item) => (
                          <span key={item.id} title={item.name} className="filter drop-shadow">
                            {item.emoji}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reglas de Juego & Premio */}
          <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-5 space-y-5 shadow-lg">
            <h3 className="text-sm font-bold text-[#e6e1e7] flex items-center gap-2 border-b border-[#2b292e] pb-3">
              <Sliders className="w-4 h-4 text-[var(--gold)]" />
              <span>Reglas de Juego, Intentos & Recompensa</span>
            </h3>

            {/* Número de intentos permitidos */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#ccc3d8] block">
                Número de Intentos Máximos para Descubrir Casillas
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[3, 4, 5, 6].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setSettings({ ...settings, maxAttempts: num })}
                    className={`py-3 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                      settings.maxAttempts === num
                        ? "bg-[#fbbf24] text-[#121115] border-[#fbbf24] shadow-md"
                        : "bg-[#201f23] text-[#ccc3d8] border-[#363439] hover:border-[var(--gold)]/40"
                    }`}
                  >
                    <span>{num} Intentos</span>
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-[#ccc3d8]">
                {settings.maxAttempts === 3
                  ? "Modo Retador (3 intentos exactos como la foto): Requiere intuición precisa."
                  : "Modo Flexible: Aumenta la probabilidad de que los comensales ganen."}
              </p>
            </div>

            {/* Toggle de Sonido */}
            <div className="flex items-center justify-between p-3.5 bg-[#201f23] rounded-xl border border-[#363439]">
              <div className="flex items-center gap-3">
                <Volume2 className="w-4 h-4 text-[#e6007e]" />
                <div>
                  <h4 className="text-xs font-bold text-[#e6e1e7]">Efectos de Sonido Inmersivos</h4>
                  <p className="text-[10px] text-[#ccc3d8]">Destape de casillas, campanadas de acierto y fanfarria</p>
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
                <span>Premio Instantáneo para el Ganador</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-[#ccc3d8] block mb-1">Nombre del Premio</label>
                  <input
                    type="text"
                    value={settings.rewardPrizeName}
                    onChange={(e) => setSettings({ ...settings, rewardPrizeName: e.target.value })}
                    className="w-full bg-[#201f23] border border-[#363439] rounded-xl px-3 py-2 text-xs text-[#e6e1e7] focus:outline-none focus:border-[#fbbf24]"
                    placeholder="Ej. Postre o Regalo de la Casa"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#ccc3d8] block mb-1">Valor Estimado</label>
                  <input
                    type="text"
                    value={settings.rewardPrizeValue}
                    onChange={(e) => setSettings({ ...settings, rewardPrizeValue: e.target.value })}
                    className="w-full bg-[#201f23] border border-[#363439] rounded-xl px-3 py-2 text-xs text-[#e6e1e7] focus:outline-none focus:border-[#fbbf24]"
                    placeholder="Ej. $20.000 COP"
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
              <Eye className="w-4 h-4 text-[#e6007e]" />
              <span>Simulador Móvil en Vivo ({PICK_AND_WIN_THEMES[settings.themeId]?.name})</span>
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
            <div className="w-full rounded-[28px] overflow-hidden bg-[#120716] min-h-[620px]">
              <StepPickAndWin
                key={previewKey}
                customSettings={settings}
                onWinPrize={(name, val) => {
                  alert(`¡Premio ganado en el simulador: ${name} (${val})!`);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
