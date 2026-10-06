import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Sliders,
  Palette,
  FileText,
  Settings2,
  Gift,
  Clock,
  Save,
  RotateCcw,
  CheckCircle2,
  Smartphone,
  Sparkles,
  ExternalLink,
  Coins,
  Flame,
  Brain,
  CircleDot,
  Volume2,
  Calendar,
  AlertTriangle,
  Award,
  Zap,
} from "lucide-react";
import {
  CommercialCustomizerService,
  CommercialGameProfile,
  GameIdentifier,
  DEFAULT_COMMERCIAL_PROFILES,
} from "@/lib/exclusiveCommercialData";

// Juegos interactivos reales con soporte de dos caras
import { StepJackpotGame } from "@/components/qr-game/StepJackpotGame";
import { StepPickAndWin } from "@/components/qr-game/StepPickAndWin";
import { StepMemoryGame } from "@/components/qr-game/StepMemoryGame";
import { StepScratchGame } from "@/components/qr-game/StepScratchGame";
import { StepPlinkoGame } from "@/components/qr-game/StepPlinkoGame";

export function GameExclusiveCustomizer() {
  const [selectedGameId, setSelectedGameId] = useState<GameIdentifier>("jackpot");
  const [activeTab, setActiveTab] = useState<"aesthetics" | "narrative" | "rules" | "prizes" | "timing">("aesthetics");
  const [simulatorFace, setSimulatorFace] = useState<"face1" | "face2">("face1");
  const [simulatorKey, setSimulatorKey] = useState(1);

  // Perfiles cargados
  const [profiles, setProfiles] = useState<Record<GameIdentifier, CommercialGameProfile>>(() => {
    return CommercialCustomizerService.getProfiles();
  });

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const currentProfile = useMemo(() => {
    return profiles[selectedGameId] || DEFAULT_COMMERCIAL_PROFILES[selectedGameId];
  }, [profiles, selectedGameId]);

  // Actualizador universal de campos anidados
  const handleUpdate = <K extends keyof CommercialGameProfile>(
    section: K,
    data: Partial<CommercialGameProfile[K]>
  ) => {
    setProfiles((prev) => {
      const updatedProfile = {
        ...prev[selectedGameId],
        [section]: {
          ...(prev[selectedGameId][section] as object),
          ...data,
        },
      };
      return {
        ...prev,
        [selectedGameId]: updatedProfile,
      };
    });
  };

  // Guardar en almacenamiento y propagar
  const handleSave = () => {
    setSaving(true);
    setSuccessMsg(null);
    try {
      CommercialCustomizerService.saveProfile(currentProfile);

      // Si es memoria o scratch, sincronizar también en sus servicios dedicados
      if (selectedGameId === "memory") {
        try {
          const memorySettings = {
            timeLimitSeconds: currentProfile.timing.timeLimitSeconds || 40,
            rewardPrizeName: currentProfile.prizes.mainPrizeName,
            rewardPrizeValue: currentProfile.prizes.mainPrizeValue,
            soundEnabled: currentProfile.rules.soundEnabled,
          };
          localStorage.setItem("juegoreferidos_memory_settings", JSON.stringify(memorySettings));
        } catch {}
      } else if (selectedGameId === "scratch") {
        try {
          const scratchSettings = {
            winTitle: currentProfile.narrative.victoryTitle,
            winSubtitle: currentProfile.narrative.victorySubtitle,
            consolationTitle: currentProfile.narrative.consolationTitle,
            consolationSubtitle: currentProfile.narrative.consolationSubtitle,
            soundEnabled: currentProfile.rules.soundEnabled,
          };
          localStorage.setItem("juegoreferidos_scratch_settings", JSON.stringify(scratchSettings));
        } catch {}
      } else if (selectedGameId === "pick-win") {
        try {
          const pickSettings = {
            welcomeTitle: currentProfile.narrative.face1Title,
            welcomeSubtitle: currentProfile.narrative.face1Subtitle,
            rewardPrizeName: currentProfile.prizes.mainPrizeName,
            rewardPrizeValue: currentProfile.prizes.mainPrizeValue,
          };
          localStorage.setItem("juegoreferidos_pick_win_settings", JSON.stringify(pickSettings));
        } catch {}
      }

      setSuccessMsg(`✓ Dinámica "${currentProfile.name}" guardada y lista para las mesas.`);
      setSimulatorKey((k) => k + 1);
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm(`¿Restaurar los valores originales de fábrica para ${currentProfile.name}?`)) {
      CommercialCustomizerService.resetToDefault(selectedGameId);
      setProfiles(CommercialCustomizerService.getProfiles());
      setSimulatorKey((k) => k + 1);
      setSuccessMsg("Valores originales restaurados con éxito.");
      setTimeout(() => setSuccessMsg(null), 2500);
    }
  };

  const gameButtons: { id: GameIdentifier; name: string; icon: any; accent: string }[] = [
    { id: "jackpot", name: "Jackpot (Tragaperras)", icon: Coins, accent: "#f59e0b" },
    { id: "pick-win", name: "Descubre & Gana", icon: Sparkles, accent: "#ea580c" },
    { id: "memory", name: "Memoria (Halloween)", icon: Brain, accent: "#ff007f" },
    { id: "scratch", name: "Raspa y Gana (Navidad)", icon: Flame, accent: "#ef4444" },
    { id: "plinko", name: "Suelta y Gana (Plinko)", icon: CircleDot, accent: "#10b981" },
  ];

  return (
    <div className="space-y-6">
      {/* 1. ENCABEZADO Y PRESENTACIÓN COMERCIAL */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 border-b border-[#363439] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-[var(--gold)]/15 text-[var(--gold)] border border-[var(--gold)]/30 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" />
              DEPARTAMENTO COMERCIAL & MARKETING
            </span>
            <span className="text-xs text-[#958da1]">Arquitectura 100% Modular</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#e6e1e7] font-['Epilogue'] tracking-tight">
            Personalización Exclusiva de Dinámicas
          </h1>
          <p className="text-xs sm:text-sm text-[#ccc3d8] mt-1 max-w-3xl">
            Modifica la <strong>estética</strong>, la <strong>narrativa</strong>, las <strong>reglas del juego</strong>, los <strong>premios</strong> y la <strong>duración de los retos</strong> para crear experiencias promocionales únicas adaptadas a los objetivos de venta de tu marca.
          </p>
        </div>

        {/* Acciones principales */}
        <div className="flex items-center gap-2.5 w-full xl:w-auto">
          <button
            type="button"
            onClick={handleReset}
            className="flex-1 xl:flex-initial py-2.5 px-4 rounded-xl bg-[#201f23] hover:bg-[#2b292e] text-[#ccc3d8] hover:text-white border border-[#363439] text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
            title="Restaurar valores de fábrica"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar</span>
          </button>

          <a
            href={`http://localhost:5173/?paso=3&juego=${selectedGameId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 xl:flex-initial py-2.5 px-4 rounded-xl bg-[#201f23] hover:bg-[#2b292e] text-[var(--gold)] border border-[var(--gold)]/40 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Probar en Mesa</span>
          </a>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex-1 xl:flex-initial py-2.5 px-6 rounded-xl bg-gradient-to-r from-[var(--gold)] to-[var(--gold-light)] text-[#121115] font-black text-xs uppercase tracking-wider hover:brightness-105 active:scale-98 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {saving ? (
              <span className="w-3.5 h-3.5 border-2 border-[#121115] border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Guardar Cambios</span>
          </button>
        </div>
      </div>

      {/* Banner de confirmación */}
      {successMsg && (
        <div className="bg-emerald-950/40 border border-emerald-500/50 text-emerald-300 px-4 py-3 rounded-2xl flex items-center gap-3 text-xs sm:text-sm animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 2. SELECTOR DE JUEGO COMERCIAL ACTIVO */}
      <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-4">
        <label className="text-xs font-mono font-bold text-[var(--gold)] uppercase tracking-wider block mb-3">
          1. Selecciona la Dinámica a Personalizar para tu Campaña:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {gameButtons.map((g) => {
            const Icon = g.icon;
            const isSelected = selectedGameId === g.id;
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => {
                  setSelectedGameId(g.id);
                  setSimulatorKey((k) => k + 1);
                }}
                className={`py-3 px-3 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? "bg-[#2b292e] text-[var(--gold)] border-[var(--gold)] shadow-lg ring-1 ring-[var(--gold)]"
                    : "bg-[#201f23] text-[#ccc3d8] border-[#363439] hover:border-[var(--gold)]/50 hover:bg-[#252429]"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${g.accent}20`, color: g.accent }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-[var(--gold)] animate-ping" />
                  )}
                </div>
                <span className="text-xs font-bold leading-tight line-clamp-1">{g.name}</span>
                <span className="text-[10px] text-[#958da1] mt-0.5">{DEFAULT_COMMERCIAL_PROFILES[g.id].badge}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. LAYOUT PRINCIPAL: EDITOR DE 5 PILARES (IZQUIERDA) + SIMULADOR MÓVIL TÁCTIL (DERECHA) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* COLUMNA IZQUIERDA: LOS 5 PILARES COMERCIALES (7 COLUMNAS) */}
        <div className="lg:col-span-7 space-y-4">
          {/* TABS DE LOS 5 PILARES */}
          <div className="flex flex-wrap items-center gap-1.5 bg-[#1c1b1f] border border-[#363439] rounded-2xl p-1.5">
            <button
              type="button"
              onClick={() => setActiveTab("aesthetics")}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "aesthetics"
                  ? "bg-[var(--gold)] text-[#121115] shadow-md"
                  : "text-[#ccc3d8] hover:text-white hover:bg-[#201f23]"
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>1. Estética</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("narrative")}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "narrative"
                  ? "bg-[var(--gold)] text-[#121115] shadow-md"
                  : "text-[#ccc3d8] hover:text-white hover:bg-[#201f23]"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>2. Narrativa</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("rules")}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "rules"
                  ? "bg-[var(--gold)] text-[#121115] shadow-md"
                  : "text-[#ccc3d8] hover:text-white hover:bg-[#201f23]"
              }`}
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span>3. Reglas</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("prizes")}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "prizes"
                  ? "bg-[var(--gold)] text-[#121115] shadow-md"
                  : "text-[#ccc3d8] hover:text-white hover:bg-[#201f23]"
              }`}
            >
              <Gift className="w-3.5 h-3.5" />
              <span>4. Premios</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("timing")}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "timing"
                  ? "bg-[var(--gold)] text-[#121115] shadow-md"
                  : "text-[#ccc3d8] hover:text-white hover:bg-[#201f23]"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>5. Duración</span>
            </button>
          </div>

          {/* CONTENEDOR DEL EDITOR SEGÚN EL PILAR ACTIVO */}
          <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-5 space-y-5">
            {/* ============================================================== */}
            {/* PILAR 1: ESTÉTICA & IDENTIDAD VISUAL                            */}
            {/* ============================================================== */}
            {activeTab === "aesthetics" && (
              <div className="space-y-4 animate-fadeIn">
                <div className="border-b border-[#2b292e] pb-3">
                  <h3 className="text-sm font-bold text-[var(--gold)] font-['Epilogue'] flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Pilar 1: Estética, Texturas e Identidad Visual de Marca
                  </h3>
                  <p className="text-xs text-[#958da1] mt-0.5">
                    Define la paleta cromática, los fondos temáticos y el estilo visual de los elementos para armonizar con tu imagen comercial.
                  </p>
                </div>

                {/* Preajuste de Temática Comercial */}
                <div>
                  <label className="text-xs font-semibold text-[#ccc3d8] block mb-2">
                    Preajuste Temático de Campaña:
                  </label>
                  <select
                    value={currentProfile.aesthetics.themePreset}
                    onChange={(e) =>
                      handleUpdate("aesthetics", {
                        themePreset: e.target.value as any,
                      })
                    }
                    className="w-full bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-4 py-2.5 text-xs font-medium focus:border-[var(--gold)]/60 focus:outline-none"
                  >
                    <option value="navidad">🎄 Especial Navidad & Fin de Año</option>
                    <option value="halloween">🎃 Especial Halloween & Noche Mágica</option>
                    <option value="dia_muertos">🌸 Tradición, Flores & Día de Muertos</option>
                    <option value="viajes_vip">✈️ Salas VIP, Turismo & Salidas Internacionales</option>
                    <option value="gourmet_lujo">☕ Gastronomía Gourmet, Panadería & Café</option>
                    <option value="custom">✨ Personalización Completa (Custom)</option>
                  </select>
                </div>

                {/* Paleta de Colores */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-[#ccc3d8] block mb-1">
                      Color Primario (Fondos & Marcos):
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={currentProfile.aesthetics.primaryColor}
                        onChange={(e) =>
                          handleUpdate("aesthetics", { primaryColor: e.target.value })
                        }
                        className="w-10 h-10 rounded-lg bg-transparent border border-[#363439] cursor-pointer"
                      />
                      <input
                        type="text"
                        value={currentProfile.aesthetics.primaryColor}
                        onChange={(e) =>
                          handleUpdate("aesthetics", { primaryColor: e.target.value })
                        }
                        className="flex-1 bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-3 py-2 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#ccc3d8] block mb-1">
                      Color de Acento (Botones CTA & Resaltados):
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={currentProfile.aesthetics.accentColor}
                        onChange={(e) =>
                          handleUpdate("aesthetics", { accentColor: e.target.value })
                        }
                        className="w-10 h-10 rounded-lg bg-transparent border border-[#363439] cursor-pointer"
                      />
                      <input
                        type="text"
                        value={currentProfile.aesthetics.accentColor}
                        onChange={(e) =>
                          handleUpdate("aesthetics", { accentColor: e.target.value })
                        }
                        className="flex-1 bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-3 py-2 text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Textura Ambiental y Estilo de Naipes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-[#ccc3d8] block mb-1">
                      Textura Ambiental de Fondo:
                    </label>
                    <select
                      value={currentProfile.aesthetics.backgroundTexture}
                      onChange={(e) =>
                        handleUpdate("aesthetics", {
                          backgroundTexture: e.target.value as any,
                        })
                      }
                      className="w-full bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-3 py-2.5 text-xs"
                    >
                      <option value="snow">❄️ Copos de Nieve & Atmósfera Invernal</option>
                      <option value="stars">✨ Cielo Nocturno, Estrellas & Luna</option>
                      <option value="papel_picado">🌸 Cenefa de Papel Picado Festivo</option>
                      <option value="rustic_wood">🪵 Letrero de Madera Rústica</option>
                      <option value="luxury_airport">✈️ Sala de Salidas Aeroportuaria</option>
                      <option value="clean">⚪ Limpio & Minimalista</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#ccc3d8] block mb-1">
                      Estilo de Reverso / Icono Central:
                    </label>
                    <select
                      value={currentProfile.aesthetics.cardBackStyle}
                      onChange={(e) =>
                        handleUpdate("aesthetics", {
                          cardBackStyle: e.target.value as any,
                        })
                      }
                      className="w-full bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-3 py-2.5 text-xs"
                    >
                      <option value="pumpkin">🎃 Calabaza Mágica de Halloween</option>
                      <option value="gift">🎁 Caja de Regalo Navideña</option>
                      <option value="skull">💀 Calavera Tradicional de Azúcar</option>
                      <option value="airplane">✈️ Avión de Pasajeros VIP</option>
                      <option value="coffee">☕ Taza de Café Gourmet</option>
                    </select>
                  </div>
                </div>

                {/* Insignia de Campaña Comercial */}
                <div>
                  <label className="text-xs font-semibold text-[#ccc3d8] block mb-1">
                    Insignia de Campaña Comercial (Badge Superior):
                  </label>
                  <input
                    type="text"
                    value={currentProfile.aesthetics.brandBadgeText}
                    onChange={(e) =>
                      handleUpdate("aesthetics", { brandBadgeText: e.target.value })
                    }
                    className="w-full bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider"
                    placeholder="Ej: CAMPAÑA EXCLUSIVA • VERANO 2026"
                  />
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* PILAR 2: NARRATIVA & STORYTELLING COMERCIAL                     */}
            {/* ============================================================== */}
            {activeTab === "narrative" && (
              <div className="space-y-4 animate-fadeIn">
                <div className="border-b border-[#2b292e] pb-3">
                  <h3 className="text-sm font-bold text-[var(--gold)] font-['Epilogue'] flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Pilar 2: Narrativa, Mensajes de Atracción y Copys
                  </h3>
                  <p className="text-xs text-[#958da1] mt-0.5">
                    Diseña el discurso que seduce al comensal para que participe, comprenda el juego y celebre su victoria.
                  </p>
                </div>

                {/* Titular Cara 1 */}
                <div>
                  <label className="text-xs font-semibold text-[#ccc3d8] block mb-1">
                    Titular de Atracción en Portada (Cara 1):
                  </label>
                  <input
                    type="text"
                    value={currentProfile.narrative.face1Title}
                    onChange={(e) =>
                      handleUpdate("narrative", { face1Title: e.target.value })
                    }
                    className="w-full bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-4 py-2.5 text-xs font-bold"
                    placeholder="Ej: ¡Juega y gana 2 billetes de avión!"
                  />
                </div>

                {/* Subtítulo Cara 1 */}
                <div>
                  <label className="text-xs font-semibold text-[#ccc3d8] block mb-1">
                    Subtítulo Motivacional / Propuesta de Valor:
                  </label>
                  <textarea
                    rows={2}
                    value={currentProfile.narrative.face1Subtitle}
                    onChange={(e) =>
                      handleUpdate("narrative", { face1Subtitle: e.target.value })
                    }
                    className="w-full bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl p-3 text-xs leading-relaxed"
                    placeholder="Ej: Participa hoy en tu mesa y llévate premios exclusivos de la casa."
                  />
                </div>

                {/* Botón CTA y Título Cara 2 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-[#ccc3d8] block mb-1">
                      Texto del Botón CTA (Llamada a la Acción):
                    </label>
                    <input
                      type="text"
                      value={currentProfile.narrative.face1CtaButton}
                      onChange={(e) =>
                        handleUpdate("narrative", { face1CtaButton: e.target.value })
                      }
                      className="w-full bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-3 py-2 text-xs font-black uppercase"
                      placeholder="Ej: ¡PARTICIPA! >"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#ccc3d8] block mb-1">
                      Título en Pantalla de Juego (Cara 2):
                    </label>
                    <input
                      type="text"
                      value={currentProfile.narrative.face2Title}
                      onChange={(e) =>
                        handleUpdate("narrative", { face2Title: e.target.value })
                      }
                      className="w-full bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-3 py-2 text-xs font-bold"
                      placeholder="Ej: TABLERO DE PREMIOS EN MESA"
                    />
                  </div>
                </div>

                {/* Tutorial en 2 Pasos */}
                <div className="bg-[#141317] border border-[#363439] rounded-xl p-3 space-y-2">
                  <span className="text-[11px] font-bold text-[var(--gold)] block">
                    Tutorial Rápido en 2 Pasos (Iconos ilustrados):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={currentProfile.narrative.step1Instruction}
                      onChange={(e) =>
                        handleUpdate("narrative", { step1Instruction: e.target.value })
                      }
                      className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-lg px-3 py-1.5 text-xs"
                      placeholder="Paso 1: Suelta la bola"
                    />
                    <input
                      type="text"
                      value={currentProfile.narrative.step2Instruction}
                      onChange={(e) =>
                        handleUpdate("narrative", { step2Instruction: e.target.value })
                      }
                      className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-lg px-3 py-1.5 text-xs"
                      placeholder="Paso 2: Sigue el recorrido"
                    />
                  </div>
                </div>

                {/* Mensajes de Victoria & Consolación */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-3 space-y-2">
                    <span className="text-xs font-bold text-emerald-400 block flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5" /> Mensaje de Victoria:
                    </span>
                    <input
                      type="text"
                      value={currentProfile.narrative.victoryTitle}
                      onChange={(e) =>
                        handleUpdate("narrative", { victoryTitle: e.target.value })
                      }
                      className="w-full bg-[#201f23] border border-[#363439] text-white rounded-lg px-3 py-1.5 text-xs font-bold"
                    />
                    <input
                      type="text"
                      value={currentProfile.narrative.victorySubtitle}
                      onChange={(e) =>
                        handleUpdate("narrative", { victorySubtitle: e.target.value })
                      }
                      className="w-full bg-[#201f23] border border-[#363439] text-[#ccc3d8] rounded-lg px-3 py-1.5 text-[11px]"
                    />
                  </div>

                  <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-3 space-y-2">
                    <span className="text-xs font-bold text-amber-400 block flex items-center gap-1.5">
                      <RotateCcw className="w-3.5 h-3.5" /> Mensaje de Consolación / 2ª Oportunidad:
                    </span>
                    <input
                      type="text"
                      value={currentProfile.narrative.consolationTitle}
                      onChange={(e) =>
                        handleUpdate("narrative", { consolationTitle: e.target.value })
                      }
                      className="w-full bg-[#201f23] border border-[#363439] text-white rounded-lg px-3 py-1.5 text-xs font-bold"
                    />
                    <input
                      type="text"
                      value={currentProfile.narrative.consolationSubtitle}
                      onChange={(e) =>
                        handleUpdate("narrative", { consolationSubtitle: e.target.value })
                      }
                      className="w-full bg-[#201f23] border border-[#363439] text-[#ccc3d8] rounded-lg px-3 py-1.5 text-[11px]"
                    />
                  </div>
                </div>

                {/* Botón de Reclamo */}
                <div>
                  <label className="text-xs font-semibold text-[#ccc3d8] block mb-1">
                    Texto del Botón de Canje de Voucher:
                  </label>
                  <input
                    type="text"
                    value={currentProfile.narrative.claimButtonText}
                    onChange={(e) =>
                      handleUpdate("narrative", { claimButtonText: e.target.value })
                    }
                    className="w-full bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider"
                    placeholder="Ej: OBTENER MI VOUCHER OFICIAL"
                  />
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* PILAR 3: REGLAS DEL JUEGO & DIFICULTAD                          */}
            {/* ============================================================== */}
            {activeTab === "rules" && (
              <div className="space-y-4 animate-fadeIn">
                <div className="border-b border-[#2b292e] pb-3">
                  <h3 className="text-sm font-bold text-[var(--gold)] font-['Epilogue'] flex items-center gap-2">
                    <Settings2 className="w-4 h-4" />
                    Pilar 3: Reglas del Juego, Dificultad y Asignación
                  </h3>
                  <p className="text-xs text-[#958da1] mt-0.5">
                    Modera la competitividad, las probabilidades matemáticas y el número de oportunidades según el objetivo de tu campaña.
                  </p>
                </div>

                {/* Nivel de Dificultad */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(["facil", "medio", "dificil"] as const).map((dif) => (
                    <button
                      key={dif}
                      type="button"
                      onClick={() => handleUpdate("rules", { difficulty: dif })}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        currentProfile.rules.difficulty === dif
                          ? "bg-[#2b292e] text-[var(--gold)] border-[var(--gold)] shadow-md font-bold"
                          : "bg-[#201f23] text-[#ccc3d8] border-[#363439] hover:bg-[#252429]"
                      }`}
                    >
                      <span className="text-xs capitalize block font-bold mb-0.5">
                        {dif === "facil" && "🟢 Fácil (Masivo)"}
                        {dif === "medio" && "🟡 Moderado (Equilibrado)"}
                        {dif === "dificil" && "🔴 Exigente (Competitivo)"}
                      </span>
                      <span className="text-[10px] text-[#958da1]">
                        {dif === "facil" && "Alta conversión para acciones masivas"}
                        {dif === "medio" && "Reto balanceado para comensales"}
                        {dif === "dificil" && "Para grandes premios exclusivos"}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Vidas / Intentos y Probabilidad */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-[#ccc3d8] block mb-1">
                      Intentos / Vidas Permitidas por Comensal:
                    </label>
                    <select
                      value={currentProfile.rules.maxAttempts}
                      onChange={(e) =>
                        handleUpdate("rules", { maxAttempts: parseInt(e.target.value) || 1 })
                      }
                      className="w-full bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-4 py-2.5 text-xs font-bold"
                    >
                      <option value="1">1 Intento (Partida Rápida / Directa)</option>
                      <option value="2">2 Intentos</option>
                      <option value="3">3 Intentos (Recomendado para Descubre & Gana)</option>
                      <option value="5">5 Intentos (Modo Extendido)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#ccc3d8] block mb-1 flex items-center justify-between">
                      <span>Probabilidad de Acierto Global:</span>
                      <span className="font-mono text-xs text-[var(--gold)] font-bold">
                        {currentProfile.rules.winProbability}%
                      </span>
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      step="5"
                      value={currentProfile.rules.winProbability}
                      onChange={(e) =>
                        handleUpdate("rules", { winProbability: parseInt(e.target.value) || 50 })
                      }
                      className="w-full accent-[var(--gold)] cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-[#958da1] mt-1">
                      <span>10% (Muy Difícil)</span>
                      <span>50% (Equilibrado)</span>
                      <span>100% (Siempre Gana)</span>
                    </div>
                  </div>
                </div>

                {/* Modo de Asignación y Opciones */}
                <div className="bg-[#141317] border border-[#363439] rounded-xl p-4 space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-[#ccc3d8] block mb-1">
                      Mecánica de Asignación del Resultado:
                    </label>
                    <select
                      value={currentProfile.rules.gameplayMode}
                      onChange={(e) =>
                        handleUpdate("rules", { gameplayMode: e.target.value as any })
                      }
                      className="w-full bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-3 py-2 text-xs"
                    >
                      <option value="aleatorio">🎲 Azar Matemático Ponderado</option>
                      <option value="habilidad">🎯 Habilidad & Destreza Táctil</option>
                      <option value="garantizado_por_campana">🎁 Premio Directo Garantizado (100% Premiado)</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#2b292e]">
                    <div className="flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-[var(--gold)]" />
                      <span className="text-xs text-[#e6e1e7]">Efectos de Sonido Acústicos Táctiles</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={currentProfile.rules.soundEnabled}
                      onChange={(e) =>
                        handleUpdate("rules", { soundEnabled: e.target.checked })
                      }
                      className="w-4 h-4 accent-[var(--gold)] cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* PILAR 4: PREMIOS & VOUCHERS COMERCIALES                         */}
            {/* ============================================================== */}
            {activeTab === "prizes" && (
              <div className="space-y-4 animate-fadeIn">
                <div className="border-b border-[#2b292e] pb-3">
                  <h3 className="text-sm font-bold text-[var(--gold)] font-['Epilogue'] flex items-center gap-2">
                    <Gift className="w-4 h-4" />
                    Pilar 4: Catálogo de Premios, Stock y Vouchers
                  </h3>
                  <p className="text-xs text-[#958da1] mt-0.5">
                    Configura las recompensas comerciales entregadas al cliente, su valor percibido y el formato de ticket para canjear en mostrador o caja.
                  </p>
                </div>

                {/* Premio Principal */}
                <div className="bg-[#141317] border border-[#363439] rounded-xl p-4 space-y-3">
                  <span className="text-xs font-bold text-[var(--gold)] block uppercase tracking-wider">
                    🏆 Premio Principal de Campaña:
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-semibold text-[#ccc3d8] block mb-1">
                        Nombre del Premio Comercial:
                      </label>
                      <input
                        type="text"
                        value={currentProfile.prizes.mainPrizeName}
                        onChange={(e) =>
                          handleUpdate("prizes", { mainPrizeName: e.target.value })
                        }
                        className="w-full bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-3 py-2 text-xs font-bold"
                        placeholder="Ej: 2 Billetes de Avión / Escapada VIP"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-[#ccc3d8] block mb-1">
                        Valor Percibido:
                      </label>
                      <input
                        type="text"
                        value={currentProfile.prizes.mainPrizeValue}
                        onChange={(e) =>
                          handleUpdate("prizes", { mainPrizeValue: e.target.value })
                        }
                        className="w-full bg-[#201f23] border border-[#363439] text-[var(--gold)] font-mono rounded-xl px-3 py-2 text-xs font-bold"
                        placeholder="Ej: $150.000 COP"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-[#ccc3d8] block mb-1">
                        Categoría / Badge del Premio:
                      </label>
                      <input
                        type="text"
                        value={currentProfile.prizes.mainPrizeCategory}
                        onChange={(e) =>
                          handleUpdate("prizes", { mainPrizeCategory: e.target.value })
                        }
                        className="w-full bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-3 py-2 text-xs"
                        placeholder="Ej: GRAN PREMIO"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-[#ccc3d8] block mb-1">
                        Stock Máximo Diario (Control Presupuestario):
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="500"
                        value={currentProfile.prizes.dailyStockLimit}
                        onChange={(e) =>
                          handleUpdate("prizes", { dailyStockLimit: parseInt(e.target.value) || 10 })
                        }
                        className="w-full bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-3 py-2 text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Formato de Voucher */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-[#ccc3d8] block mb-1">
                      Formato de Voucher Canjeable:
                    </label>
                    <select
                      value={currentProfile.prizes.voucherType}
                      onChange={(e) =>
                        handleUpdate("prizes", { voucherType: e.target.value as any })
                      }
                      className="w-full bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-3 py-2.5 text-xs font-medium"
                    >
                      <option value="boarding_pass">✈️ Boarding Pass VIP con Cupón Desprendible</option>
                      <option value="scratch_foil">🧤 Tarjeta de Regalo con Lámina Rascable</option>
                      <option value="digital_ticket">🎫 Ticket Digital de Mesa con Código</option>
                      <option value="pin_table">🔒 Validación de PIN de Seguridad en Mesa</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#ccc3d8] block mb-1">
                      Premio de Consolación Alternativo:
                    </label>
                    <input
                      type="text"
                      value={currentProfile.prizes.consolationPrizeName}
                      onChange={(e) =>
                        handleUpdate("prizes", { consolationPrizeName: e.target.value })
                      }
                      className="w-full bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-3 py-2.5 text-xs"
                      placeholder="Ej: Café de Cortesía o 2ª Oportunidad"
                    />
                  </div>
                </div>

                {/* Términos y Condiciones */}
                <div>
                  <label className="text-xs font-semibold text-[#ccc3d8] block mb-1">
                    Condiciones del Canje (Mostrado al Pie del Voucher):
                  </label>
                  <input
                    type="text"
                    value={currentProfile.prizes.termsAndConditionsText}
                    onChange={(e) =>
                      handleUpdate("prizes", { termsAndConditionsText: e.target.value })
                    }
                    className="w-full bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-4 py-2.5 text-xs"
                    placeholder="Ej: Válido hoy en caja presentando la pantalla de tu mesa. 1 premio por mesa."
                  />
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* PILAR 5: DURACIÓN & URGENCIA COMERCIAL                           */}
            {/* ============================================================== */}
            {activeTab === "timing" && (
              <div className="space-y-4 animate-fadeIn">
                <div className="border-b border-[#2b292e] pb-3">
                  <h3 className="text-sm font-bold text-[var(--gold)] font-['Epilogue'] flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Pilar 5: Duración de los Retos, Fechas de Campaña y Urgencia
                  </h3>
                  <p className="text-xs text-[#958da1] mt-0.5">
                    Establece el tiempo de partida, las fechas de vigencia comercial y el cronómetro de caducidad del cupón para acelerar el canje en sala.
                  </p>
                </div>

                {/* Cronómetro por Partida */}
                <div>
                  <label className="text-xs font-semibold text-[#ccc3d8] block mb-1 flex items-center justify-between">
                    <span>Límite de Tiempo por Partida (Cronómetro en Vivo):</span>
                    <span className="font-mono text-xs text-[var(--gold)] font-bold">
                      {currentProfile.timing.timeLimitSeconds === 0
                        ? "Sin límite de tiempo"
                        : `${currentProfile.timing.timeLimitSeconds} Segundos`}
                    </span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="90"
                    step="5"
                    value={currentProfile.timing.timeLimitSeconds}
                    onChange={(e) =>
                      handleUpdate("timing", { timeLimitSeconds: parseInt(e.target.value) || 0 })
                    }
                    className="w-full accent-[var(--gold)] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[#958da1] mt-1">
                    <span>0s (Sin límite / Pausado)</span>
                    <span>30s (Desafío Dinámico)</span>
                    <span>60s - 90s (Partida Relajada)</span>
                  </div>
                </div>

                {/* Fechas de Campaña Comercial */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-[#ccc3d8] block mb-1 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[var(--gold)]" /> Fecha de Inicio de Campaña:
                    </label>
                    <input
                      type="date"
                      value={currentProfile.timing.campaignStartDate}
                      onChange={(e) =>
                        handleUpdate("timing", { campaignStartDate: e.target.value })
                      }
                      className="w-full bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-3 py-2 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#ccc3d8] block mb-1 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-red-400" /> Fecha de Finalización:
                    </label>
                    <input
                      type="date"
                      value={currentProfile.timing.campaignEndDate}
                      onChange={(e) =>
                        handleUpdate("timing", { campaignEndDate: e.target.value })
                      }
                      className="w-full bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-3 py-2 text-xs font-mono"
                    />
                  </div>
                </div>

                {/* Caducidad del Voucher y Urgencia */}
                <div className="bg-[#141317] border border-[#363439] rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-[#e6e1e7] block">
                        Temporizador de Urgencia en Voucher de Mesa
                      </span>
                      <span className="text-[11px] text-[#958da1]">
                        Muestra una cuenta regresiva para incentivar el canje inmediato antes de que el comensal pida la cuenta.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={currentProfile.timing.urgencyTimerVisible}
                      onChange={(e) =>
                        handleUpdate("timing", { urgencyTimerVisible: e.target.checked })
                      }
                      className="w-4 h-4 accent-[var(--gold)] cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-[#ccc3d8] block mb-1">
                      Minutos para Redimir en Caja tras Ganar:
                    </label>
                    <select
                      value={currentProfile.timing.redemptionCountdownMinutes}
                      onChange={(e) =>
                        handleUpdate("timing", {
                          redemptionCountdownMinutes: parseInt(e.target.value) || 30,
                        })
                      }
                      className="w-full bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-3 py-2 text-xs"
                    >
                      <option value="15">15 Minutos (Máxima Urgencia)</option>
                      <option value="30">30 Minutos (Estándar de Comensal)</option>
                      <option value="60">60 Minutos (Tiempo Amplio)</option>
                      <option value="1440">Válido Durante Todo el Día (24 Horas)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA: SIMULADOR MÓVIL TÁCTIL EN VIVO DE DOBLE CARA (5 COLUMNAS) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3 border-b border-[#2b292e] pb-2.5">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-[var(--gold)]" />
                <span className="text-xs font-bold text-[#e6e1e7]">Simulador Móvil en Vivo</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                Vista Previa Táctil
              </span>
            </div>

            {/* Selector de las dos caras para demostración comercial */}
            <div className="flex items-center gap-1.5 mb-3 bg-[#0f0e12] p-1 rounded-xl border border-[#2b292e]">
              <button
                type="button"
                onClick={() => setSimulatorFace("face1")}
                className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  simulatorFace === "face1"
                    ? "bg-[var(--gold)] text-[#121115] shadow-xs"
                    : "text-[#ccc3d8] hover:text-white"
                }`}
              >
                <span>Cara 1: Portada</span>
              </button>
              <button
                type="button"
                onClick={() => setSimulatorFace("face2")}
                className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  simulatorFace === "face2"
                    ? "bg-[var(--gold)] text-[#121115] shadow-xs"
                    : "text-[#ccc3d8] hover:text-white"
                }`}
              >
                <span>Cara 2: Tablero/Canje</span>
              </button>
            </div>

            {/* MARCO DEL SMARTPHONE REALISTA (390 x 844 px escalado limpiamente) */}
            <div className="mx-auto w-[340px] h-[670px] rounded-[42px] border-[10px] border-[#0c0b0e] bg-black shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col relative">
              {/* Isla Dinámica / Altavoz superior del móvil */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-4 bg-black rounded-full z-50 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-white/10" />
              </div>

              {/* Área interna scrolleable del teléfono con el juego real */}
              <div
                key={`${selectedGameId}-${simulatorFace}-${simulatorKey}`}
                className="w-full h-full overflow-y-auto pt-7 pb-4 px-2"
                style={{ backgroundColor: currentProfile.aesthetics.backgroundColor }}
              >
                {selectedGameId === "jackpot" && (
                  <StepJackpotGame
                    initialFace={simulatorFace}
                    onWinPrize={(name, val) => alert(`¡Premio Ganado!\n${name} (${val})`)}
                  />
                )}

                {selectedGameId === "pick-win" && (
                  <StepPickAndWin
                    initialFace={simulatorFace}
                    onWinPrize={(name, val) => alert(`¡Premio Ganado!\n${name} (${val})`)}
                  />
                )}

                {selectedGameId === "memory" && (
                  <StepMemoryGame
                    initialFace={simulatorFace}
                    onWinPrize={(name, val) => alert(`¡Premio Ganado!\n${name} (${val})`)}
                  />
                )}

                {selectedGameId === "scratch" && (
                  <StepScratchGame
                    initialFace={simulatorFace}
                    onWinPrize={(name, val) => alert(`¡Premio Ganado!\n${name} (${val})`)}
                  />
                )}

                {selectedGameId === "plinko" && (
                  <StepPlinkoGame
                    initialFace={simulatorFace}
                    onWinPrize={(name, val) => alert(`¡Premio Ganado!\n${name} (${val})`)}
                  />
                )}
              </div>
            </div>

            <div className="text-center pt-2 text-[10px] text-[#958da1]">
              Simulación de pantalla de mesa interactiva con soporte de doble cara.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
