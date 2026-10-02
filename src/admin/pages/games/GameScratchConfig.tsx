import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Flame,
  Save,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Sparkles,
  Sliders,
  Smartphone,
  Eye,
  Plus,
  Trash2,
  Trophy,
  Palette,
} from "lucide-react";
import {
  ScratchGameSettings,
  DEFAULT_SCRATCH_SETTINGS,
  SCRATCH_THEMES,
  ScratchGameConfigService,
  ScratchPrize,
} from "@/lib/scratchGameData";
import { StepScratchGame } from "@/components/qr-game/StepScratchGame";

export function GameScratchConfig() {
  const [activeTab, setActiveTab] = useState<"settings" | "simulator">("settings");
  const [settings, setSettings] = useState<ScratchGameSettings>(() => {
    return ScratchGameConfigService.getSettings();
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [simulatorKey, setSimulatorKey] = useState(1);

  const activeTheme = SCRATCH_THEMES[settings.themeId] || SCRATCH_THEMES.navidad;

  const handleSave = () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      ScratchGameConfigService.saveSettings(settings);
      setSuccess("✓ Módulo de Raspa y Gana guardado correctamente.");
      setSimulatorKey((k) => k + 1);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleAddPrize = () => {
    const newPrize: ScratchPrize = {
      id: `prize-${Date.now()}`,
      name: "Nuevo Regalo Especial",
      badge: "¡PREMIO!",
      category: "SORPRESA",
      value: "$20.000 COP",
      icon: "🎁",
      description: "Detalle o experiencia exclusiva de la casa.",
      isConsolation: false,
      probability: 10,
    };
    setSettings((prev) => ({
      ...prev,
      prizes: [...prev.prizes, newPrize],
    }));
  };

  const handleRemovePrize = (id: string) => {
    if (settings.prizes.length <= 1) return;
    setSettings((prev) => ({
      ...prev,
      prizes: prev.prizes.filter((p) => p.id !== id),
    }));
  };

  const handlePrizeChange = (index: number, field: keyof ScratchPrize, value: unknown) => {
    setSettings((prev) => {
      const next = [...prev.prizes];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, prizes: next };
    });
  };

  const totalProb = settings.prizes.reduce((acc, p) => acc + (p.probability || 0), 0);

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
              <Flame className="w-5 h-5 text-[#ef4444]" />
              <span>Módulo: Raspa y Gana Digital (Scratch & Win)</span>
            </h2>
            <p className="text-xs text-[#ccc3d8]">
              Promoción rascable táctil para smartphones inspirada en la campaña navideña. Personaliza copys, premios y láminas.
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
                  ? "bg-[#ef4444] text-white font-bold"
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
                  ? "bg-[#ef4444] text-white font-bold"
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
            className="bg-[#ef4444] text-white font-bold px-5 py-2.5 rounded-xl text-xs hover:brightness-105 transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Guardando..." : "Guardar Raspa y Gana"}</span>
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
        <div className="space-y-6">
          {/* A. SELECTOR DE TEMAS */}
          <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-5 shadow-lg space-y-4">
            <h3 className="text-sm font-bold text-[#e6e1e7] flex items-center gap-2 border-b border-[#2b292e] pb-3">
              <Palette className="w-4 h-4 text-[#ef4444]" />
              <span>Tema Visual & Estilo de Lámina</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {Object.values(SCRATCH_THEMES).map((th) => (
                <button
                  key={th.id}
                  type="button"
                  onClick={() => setSettings((prev) => ({ ...prev, themeId: th.id }))}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    settings.themeId === th.id
                      ? "border-[#ef4444] bg-[#ef4444]/10 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                      : "border-[#363439] bg-[#201f23] hover:border-[#ef4444]/40"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#e6e1e7]">{th.name}</span>
                    <span
                      className="w-3.5 h-3.5 rounded-full"
                      style={{ backgroundColor: th.primaryColor }}
                    />
                  </div>
                  <span className="text-[10px] text-[#ccc3d8]">
                    Lámina {th.foilType === "silver" ? "Plateada Escarchada" : th.foilType === "gold" ? "Dorada Metálica" : "Neón"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* B. COPYS Y TEXTOS DE LA EXPERIENCIA MÓVIL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-5 shadow-lg space-y-4">
              <h3 className="text-sm font-bold text-[#e6e1e7] flex items-center gap-2 border-b border-[#2b292e] pb-3">
                <Sparkles className="w-4 h-4 text-[#f59e0b]" />
                <span>Textos de Portada (Foto Izquierda)</span>
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-[#ccc3d8] block mb-1">
                    Título de Bienvenida
                  </label>
                  <input
                    type="text"
                    value={settings.welcomeTitle}
                    onChange={(e) => setSettings({ ...settings, welcomeTitle: e.target.value })}
                    className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] text-xs rounded-xl px-4 py-2.5 w-full focus:border-[#ef4444]/60 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#ccc3d8] block mb-1">
                    Subtítulo de Invitación
                  </label>
                  <input
                    type="text"
                    value={settings.welcomeSubtitle}
                    onChange={(e) => setSettings({ ...settings, welcomeSubtitle: e.target.value })}
                    className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] text-xs rounded-xl px-4 py-2.5 w-full focus:border-[#ef4444]/60 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#ccc3d8] block mb-1">
                    Texto del Botón Principal
                  </label>
                  <input
                    type="text"
                    value={settings.welcomeButtonText}
                    onChange={(e) => setSettings({ ...settings, welcomeButtonText: e.target.value })}
                    className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] text-xs rounded-xl px-4 py-2.5 w-full focus:border-[#ef4444]/60 focus:outline-none font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-5 shadow-lg space-y-4">
              <h3 className="text-sm font-bold text-[#e6e1e7] flex items-center gap-2 border-b border-[#2b292e] pb-3">
                <Trophy className="w-4 h-4 text-[#ef4444]" />
                <span>Textos de Victoria y Consolación</span>
              </h3>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-[#10b981] block mb-1">
                      Título Victoria
                    </label>
                    <input
                      type="text"
                      value={settings.winTitle}
                      onChange={(e) => setSettings({ ...settings, winTitle: e.target.value })}
                      className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] text-xs rounded-xl px-3 py-2 w-full focus:border-[#10b981]/60 focus:outline-none font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-[#f59e0b] block mb-1">
                      Título Consolación
                    </label>
                    <input
                      type="text"
                      value={settings.consolationTitle}
                      onChange={(e) => setSettings({ ...settings, consolationTitle: e.target.value })}
                      className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] text-xs rounded-xl px-3 py-2 w-full focus:border-[#f59e0b]/60 focus:outline-none font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#ccc3d8] block mb-1">
                    Subtítulo Victoria
                  </label>
                  <input
                    type="text"
                    value={settings.winSubtitle}
                    onChange={(e) => setSettings({ ...settings, winSubtitle: e.target.value })}
                    className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] text-xs rounded-xl px-4 py-2 w-full focus:border-[#ef4444]/60 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#ccc3d8] block mb-1">
                    Subtítulo Consolación
                  </label>
                  <input
                    type="text"
                    value={settings.consolationSubtitle}
                    onChange={(e) => setSettings({ ...settings, consolationSubtitle: e.target.value })}
                    className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] text-xs rounded-xl px-4 py-2 w-full focus:border-[#ef4444]/60 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* C. PARÁMETROS TÉCNICOS DE RASPADO */}
          <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-5 shadow-lg space-y-4">
            <h3 className="text-sm font-bold text-[#e6e1e7] flex items-center gap-2 border-b border-[#2b292e] pb-3">
              <Sliders className="w-4 h-4 text-[#ef4444]" />
              <span>Sensibilidad de Raspado Táctil</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-[#ccc3d8]">
                    Porcentaje para Auto-Revelar
                  </label>
                  <span className="font-mono text-xs font-bold text-[#ef4444]">{settings.revealThresholdPercent}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="80"
                  step="5"
                  value={settings.revealThresholdPercent}
                  onChange={(e) => setSettings({ ...settings, revealThresholdPercent: parseInt(e.target.value, 10) })}
                  className="w-full accent-[#ef4444] cursor-pointer"
                />
                <span className="text-[10px] text-[#ccc3d8] mt-1 block">
                  Al raspar este porcentaje, la lámina restante se desvanece y estalla el confeti.
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-[#ccc3d8]">
                    Grosor del Pincel Rascador
                  </label>
                  <span className="font-mono text-xs font-bold text-amber-400">{settings.brushSize} px</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="55"
                  step="5"
                  value={settings.brushSize}
                  onChange={(e) => setSettings({ ...settings, brushSize: parseInt(e.target.value, 10) })}
                  className="w-full accent-amber-400 cursor-pointer"
                />
                <span className="text-[10px] text-[#ccc3d8] mt-1 block">
                  Ajusta el radio del trazo al deslizar el dedo por la pantalla táctil del móvil.
                </span>
              </div>
            </div>
          </div>

          {/* D. PREMIOS CONFIGURADOS */}
          <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-[#2b292e] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#e6e1e7]">
                  Premios y Probabilidades de Asignación
                </h3>
                <p className="text-[11px] text-[#ccc3d8]">
                  Suma total actual: <strong className={totalProb === 100 ? "text-[#10b981]" : "text-amber-400"}>{totalProb}%</strong>
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddPrize}
                className="bg-[#201f23] hover:bg-[#2b292e] border border-[#ef4444]/40 text-[#ef4444] px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar Premio</span>
              </button>
            </div>

            <div className="space-y-3">
              {settings.prizes.map((prize, idx) => (
                <div
                  key={prize.id}
                  className="bg-[#201f23] border border-[#363439] rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-[#ef4444]/40 transition-colors"
                >
                  <div className="flex items-center gap-2.5 w-full sm:w-auto flex-1">
                    <span className="text-2xl p-2 rounded-xl bg-[#1c1b1f] border border-[#363439]">
                      {prize.icon}
                    </span>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={prize.badge}
                          onChange={(e) => handlePrizeChange(idx, "badge", e.target.value)}
                          placeholder="¡PREMIO!"
                          className="bg-[#1c1b1f] border border-[#363439] text-[#f59e0b] text-[10px] font-bold rounded-md px-2 py-0.5 w-24 focus:outline-none"
                        />
                        <input
                          type="text"
                          value={prize.category}
                          onChange={(e) => handlePrizeChange(idx, "category", e.target.value)}
                          placeholder="KIT NAVIDEÑO"
                          className="bg-[#1c1b1f] border border-[#363439] text-[#ccc3d8] text-[10px] uppercase font-bold rounded-md px-2 py-0.5 w-32 focus:outline-none"
                        />
                      </div>

                      <input
                        type="text"
                        value={prize.name}
                        onChange={(e) => handlePrizeChange(idx, "name", e.target.value)}
                        placeholder="Nombre del premio"
                        className="bg-[#1c1b1f] border border-[#363439] text-[#e6e1e7] text-xs font-bold rounded-lg px-3 py-1 w-full focus:border-[#ef4444]/60 focus:outline-none"
                      />

                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={prize.value}
                          onChange={(e) => handlePrizeChange(idx, "value", e.target.value)}
                          placeholder="Valor (ej: $45.000 COP)"
                          className="bg-[#1c1b1f] border border-[#363439] text-[#f2be71] text-[11px] rounded-lg px-2.5 py-1 w-32 focus:outline-none"
                        />
                        <input
                          type="text"
                          value={prize.description}
                          onChange={(e) => handlePrizeChange(idx, "description", e.target.value)}
                          placeholder="Descripción breve..."
                          className="bg-[#1c1b1f] border border-[#363439] text-[#ccc3d8] text-[11px] rounded-lg px-2.5 py-1 flex-1 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-[#ccc3d8]">Prob:</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={prize.probability}
                        onChange={(e) => handlePrizeChange(idx, "probability", parseInt(e.target.value, 10) || 0)}
                        className="w-16 bg-[#1c1b1f] border border-[#363439] text-[#ef4444] font-mono text-xs font-bold rounded-lg px-2 py-1 text-center focus:outline-none"
                      />
                      <span className="text-xs text-[#ccc3d8] font-mono">%</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemovePrize(prize.id)}
                      disabled={settings.prizes.length <= 1}
                      className="w-8 h-8 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 text-red-400 flex items-center justify-center transition-colors cursor-pointer shrink-0 disabled:opacity-40"
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

      {/* 3. PESTAÑA 2: SIMULADOR MÓVIL EN VIVO DE RASPA Y GANA */}
      {activeTab === "simulator" && (
        <div className="flex flex-col items-center justify-center p-4 bg-[#141317] rounded-3xl border border-[#363439]">
          <div className="flex items-center gap-2 mb-4 text-xs text-[#ccc3d8]">
            <Smartphone className="w-4 h-4 text-[#ef4444]" />
            <span>Simulador de Raspa y Gana Móvil (Smartphone 390 × 844 px)</span>
          </div>

          <div
            key={simulatorKey}
            className="w-[390px] h-[780px] bg-[#000000] rounded-[48px] p-3.5 border-[6px] border-[#2b292e] shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col relative"
          >
            {/* Dynamic Island superior */}
            <div className="w-24 h-4 bg-black rounded-full mx-auto mb-2 shrink-0 border border-white/10" />

            <div className="flex-1 overflow-y-auto no-scrollbar rounded-2xl flex flex-col justify-center">
              <StepScratchGame
                customSettings={settings}
                participantName="Laura Gómez (Demo)"
                tableNumber="Mesa 04"
                onWinPrize={(name, val) => {
                  alert(`¡Premio reclamado en Raspa y Gana!\n${name} (${val})\nCódigo emitido en mesa.`);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
