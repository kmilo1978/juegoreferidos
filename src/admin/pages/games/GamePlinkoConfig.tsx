import { useState } from "react";
import {
  Sparkles,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  Sliders,
  RotateCcw,
  Smartphone,
  Volume2,
  Gift,
  HelpCircle,
  Trophy,
} from "lucide-react";
import {
  PlinkoConfigService,
  PlinkoGameSettings,
  PLINKO_THEMES,
  PlinkoSlot,
} from "../../../lib/plinkoData";
import { StepPlinkoGame } from "../../../components/qr-game/StepPlinkoGame";

export function GamePlinkoConfig() {
  const [activeTab, setActiveTab] = useState<"settings" | "simulator">("settings");
  const [settings, setSettings] = useState<PlinkoGameSettings>(() =>
    PlinkoConfigService.getSettings()
  );
  const [success, setSuccess] = useState<string | null>(null);
  const [simulatorKey, setSimulatorKey] = useState(1);

  // Cambiar tema predefinido
  const handleSelectTheme = (themeId: string) => {
    const selected = PLINKO_THEMES[themeId];
    if (!selected) return;
    setSettings((prev) => ({
      ...prev,
      themeId,
      bannerTitle: selected.bannerTitle,
      bannerSubtitle: selected.bannerSubtitle,
      slots: selected.slots,
    }));
  };

  // Modificar slot individual
  const handleUpdateSlot = (idx: number, field: keyof PlinkoSlot, val: string | number | boolean) => {
    setSettings((prev) => {
      const nextSlots = [...prev.slots];
      nextSlots[idx] = { ...nextSlots[idx], [field]: val };
      return { ...prev, slots: nextSlots };
    });
  };

  // Guardar configuración
  const handleSave = () => {
    PlinkoConfigService.saveSettings(settings);
    setSuccess("✓ Configuración de 'Suelta y Gana' (Plinko) guardada con éxito.");
    setSimulatorKey((k) => k + 1);
    setTimeout(() => setSuccess(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Encabezado y Selector de Pestañas */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#363439] pb-4">
        <div>
          <h2 className="text-xl font-bold text-[#e6e1e7] font-['Epilogue'] flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#ef4444]" />
            <span>Módulo: Suelta y Gana (Plinko / Pachinko de Marca)</span>
          </h2>
          <p className="text-xs text-[#ccc3d8]">
            Tablero de clavijas y obstáculos donde la bola desciende de forma emocionante hasta la casilla de premio.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-[#201f23] p-1 rounded-xl border border-[#363439]">
            <button
              type="button"
              onClick={() => setActiveTab("settings")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "settings"
                  ? "bg-[#ef4444] text-white"
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
                  ? "bg-[#ef4444] text-white"
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
            className="bg-[#ef4444] hover:bg-[#dc2626] active:scale-98 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Guardar Plinko</span>
          </button>
        </div>
      </div>

      {success && (
        <div className="bg-[#0d2e1f] border border-[#10b981]/50 text-[#10b981] px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* PESTAÑA 1: CONFIGURACIÓN MODULAR DEL JUEGO                     */}
      {/* ============================================================== */}
      {activeTab === "settings" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* COLUMNA IZQUIERDA: TEMAS VISUALES Y COPIES */}
          <div className="lg:col-span-6 space-y-6">
            {/* 1. Selector de Temas */}
            <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-5 space-y-4 shadow-lg">
              <h3 className="text-sm font-bold text-[#e6e1e7] flex items-center gap-2 border-b border-[#2b292e] pb-3 font-['Epilogue']">
                <span>🎨</span>
                <span>Temática Visual del Tablero</span>
              </h3>

              <div className="grid grid-cols-1 gap-3">
                {Object.values(PLINKO_THEMES).map((th) => {
                  const isSelected = settings.themeId === th.id;
                  return (
                    <div
                      key={th.id}
                      onClick={() => handleSelectTheme(th.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? "bg-[#25171d] border-[#ef4444] shadow-md"
                          : "bg-[#201f23] border-[#363439] hover:border-[#ef4444]/50"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{th.ballEmoji}</span>
                          <span className="text-xs font-bold text-white">{th.name}</span>
                          {isSelected && (
                            <span className="text-[10px] bg-[#ef4444]/20 text-[#ef4444] font-bold px-2 py-0.5 rounded-full border border-[#ef4444]/40">
                              Activo
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#ccc3d8]">{th.tagline}</p>
                      </div>

                      <div className="flex gap-1 text-sm">
                        {th.slots.slice(0, 4).map((s, idx) => (
                          <span key={idx}>{s.icon}</span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Personalización de Textos y Copywriting */}
            <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-5 space-y-4 shadow-lg">
              <h3 className="text-sm font-bold text-[#e6e1e7] flex items-center gap-2 border-b border-[#2b292e] pb-3 font-['Epilogue']">
                <span>✍️</span>
                <span>Copys & Textos de Portada</span>
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="text-[10px] text-[#ccc3d8] block mb-1 uppercase font-bold">
                    Título Principal del Cartel
                  </label>
                  <input
                    type="text"
                    value={settings.bannerTitle}
                    onChange={(e) => setSettings({ ...settings, bannerTitle: e.target.value })}
                    className="w-full bg-[#201f23] border border-[#363439] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ef4444]"
                    placeholder="Ej. SUELTA LA BOLA Y GANA"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-[#ccc3d8] block mb-1 uppercase font-bold">
                    Subtítulo / Mensaje de Campaña
                  </label>
                  <input
                    type="text"
                    value={settings.bannerSubtitle}
                    onChange={(e) => setSettings({ ...settings, bannerSubtitle: e.target.value })}
                    className="w-full bg-[#201f23] border border-[#363439] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ef4444]"
                    placeholder="Ej. ¡Juega y descubre qué premio navideño te espera!"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-[#ccc3d8] block mb-1 uppercase font-bold">
                    Texto del Botón Central de Soltar
                  </label>
                  <input
                    type="text"
                    value={settings.customButtonText}
                    onChange={(e) => setSettings({ ...settings, customButtonText: e.target.value })}
                    className="w-full bg-[#201f23] border border-[#363439] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ef4444]"
                    placeholder="Ej. SOLTAR LA BOLA"
                  />
                </div>

                {/* Switch de Sonido Web Audio API */}
                <div className="flex items-center justify-between pt-2 border-t border-[#2b292e]">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-amber-400" />
                    <div>
                      <span className="text-xs font-bold text-white block">Efectos de Sonido Mecánicos</span>
                      <span className="text-[10px] text-[#ccc3d8]">Rebotes en clavijas metálicas y fanfarria</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.soundEnabled}
                    onChange={(e) => setSettings({ ...settings, soundEnabled: e.target.checked })}
                    className="w-4 h-4 accent-[#ef4444] cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: CONFIGURACIÓN DE CASILLAS DE PREMIOS (SLOTS) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-5 space-y-4 shadow-lg">
              <div className="flex items-center justify-between border-b border-[#2b292e] pb-3">
                <h3 className="text-sm font-bold text-[#e6e1e7] flex items-center gap-2 font-['Epilogue']">
                  <Gift className="w-4 h-4 text-emerald-400" />
                  <span>Casillas de Premios Inferiores ({settings.slots.length} Slots)</span>
                </h3>
                <span className="text-[10px] text-amber-300 font-bold bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/30">
                  Control de Probabilidades
                </span>
              </div>

              <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                {settings.slots.map((slot, idx) => (
                  <div
                    key={slot.id || idx}
                    className={`p-3 rounded-xl border flex flex-col gap-2 ${
                      slot.isGrandPrize
                        ? "bg-[#1f1912] border-amber-500/60"
                        : "bg-[#201f23] border-[#363439]"
                    }`}
                  >
                    <div className="flex items-center gap-2 justify-between">
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          value={slot.icon}
                          onChange={(e) => handleUpdateSlot(idx, "icon", e.target.value)}
                          className="w-9 h-9 text-center bg-[#141317] border border-[#363439] rounded-lg text-lg focus:outline-none"
                          title="Icono o emoji"
                        />
                        <div className="flex-1">
                          <input
                            type="text"
                            value={slot.name}
                            onChange={(e) => handleUpdateSlot(idx, "name", e.target.value)}
                            className="w-full bg-[#141317] border border-[#363439] rounded-lg px-2 py-1 text-xs text-white font-bold focus:outline-none focus:border-[#ef4444]"
                            placeholder="Nombre del Premio"
                          />
                        </div>
                      </div>

                      <div className="w-24">
                        <input
                          type="text"
                          value={slot.value}
                          onChange={(e) => handleUpdateSlot(idx, "value", e.target.value)}
                          className="w-full bg-[#141317] border border-[#363439] rounded-lg px-2 py-1 text-[11px] text-amber-300 font-mono text-right focus:outline-none"
                          placeholder="Valor comercial"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[#2b292e]">
                      <div className="flex items-center gap-2">
                        <span className="text-[#ccc3d8]">Probabilidad:</span>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={slot.probability}
                          onChange={(e) =>
                            handleUpdateSlot(idx, "probability", parseInt(e.target.value, 10) || 10)
                          }
                          className="w-14 bg-[#141317] border border-[#363439] rounded px-1.5 py-0.5 text-xs text-white text-center"
                        />
                        <span className="text-[#958da1]">%</span>
                      </div>

                      <label className="flex items-center gap-1.5 cursor-pointer text-[10px] text-amber-400 font-bold">
                        <input
                          type="checkbox"
                          checked={!!slot.isGrandPrize}
                          onChange={(e) => handleUpdateSlot(idx, "isGrandPrize", e.target.checked)}
                          className="w-3.5 h-3.5 accent-amber-400"
                        />
                        <span>Gran Premio VIP</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* PESTAÑA 2: SIMULADOR MÓVIL EN VIVO                             */}
      {/* ============================================================== */}
      {activeTab === "simulator" && (
        <div className="flex flex-col items-center justify-center p-4 bg-[#141317] rounded-3xl border border-[#363439]">
          <div className="flex items-center gap-2 mb-4 text-xs text-[#ccc3d8]">
            <Smartphone className="w-4 h-4 text-[#ef4444]" />
            <span>Simulador de Pantalla Móvil (Smartphone 390 × 844 px)</span>
          </div>

          <div
            key={simulatorKey}
            className="w-[390px] h-[780px] bg-[#000000] rounded-[48px] p-3.5 border-[6px] border-[#2b292e] shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col relative"
          >
            {/* Dynamic Island superior */}
            <div className="w-24 h-4 bg-black rounded-full mx-auto mb-2 shrink-0 border border-white/10" />

            <div className="flex-1 overflow-y-auto no-scrollbar rounded-2xl flex flex-col">
              <StepPlinkoGame
                participantName="Laura Gómez"
                tableNumber="Mesa 4"
                onWinPrize={(name, val) => {
                  alert(`¡Premio obtenido en simulador! \n${name} (${val})`);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
