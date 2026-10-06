import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Gamepad2,
  Sparkles,
  Timer,
  RotateCw,
  Gift,
  CheckCircle2,
  Sliders,
  ExternalLink,
  Smartphone,
  Flame,
  Award,
  Share2,
  Zap,
  Brain,
  ListOrdered,
  CircleDot,
  Coins,
} from "lucide-react";
import { GameSequenceManager } from "./GameSequenceManager";
import { GameExclusiveCustomizer } from "./GameExclusiveCustomizer";
import { apiGet, apiPost } from "../../../lib/apiClient";

interface GameInfo {
  id: string;
  name: string;
  category: string;
  icon: any;
  route: string;
  description: string;
  status: "activo" | "disponible" | "proximamente";
  accentColor: string;
  badge: string;
}

export function GamesHub() {
  const [activeTab, setActiveTab] = useState<"catalog" | "exclusive" | "sequence">(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search || window.location.hash.split("?")[1] || "");
      if (params.get("tab") === "exclusive") return "exclusive";
      if (params.get("tab") === "sequence") return "sequence";
    }
    return "catalog";
  });
  const [activeGameMode, setActiveGameMode] = useState<string>("roulette");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const games: GameInfo[] = [
    {
      id: "roulette",
      name: "Ruleta de Premios",
      category: "Azar & Atracción Inmediata",
      icon: RotateCw,
      route: "/games/roulette",
      description: "La dinámica clásica de mesa: el cliente toca para girar y la aguja determina el postre, café o descuento ganado.",
      status: activeGameMode === "roulette" ? "activo" : "disponible",
      accentColor: "#f2be71",
      badge: "Más Popular en Mesas",
    },

    {
      id: "scratch",
      name: "Raspa y Gana Digital (Scratch & Win)",
      category: "Misterio & Sorpresa Táctil",
      icon: Flame,
      route: "/games/scratch",
      description: "El comensal raspa con su dedo una lámina sobre la pantalla táctil para descubrir su regalo o mensaje de consolación. Edición Especial Navidad y personalizable.",
      status: activeGameMode === "scratch" ? "activo" : "disponible",
      accentColor: "#ef4444",
      badge: "Especial Navidad & Campañas",
    },
    {
      id: "memory",
      name: "Juego de Memoria (Halloween & Temático)",
      category: "Retención, Memoria & Reconocimiento",
      icon: Brain,
      route: "/games/memory",
      description: "Los comensales destapan cartas y encuentran parejas antes de que acabe el tiempo. Personalizable para Halloween, temporadas o menú del local.",
      status: activeGameMode === "memory" ? "activo" : "disponible",
      accentColor: "#ff007f",
      badge: "Especial Halloween",
    },
    {
      id: "pick-win",
      name: "Descubre y Gana (Día de Muertos / Triplete)",
      category: "Azar, Intuición & Búsqueda",
      icon: Sparkles,
      route: "/games/pick-win",
      description: "Tablero 3x3 festivo donde el jugador destapa casillas para encontrar 3 figuras iguales antes de agotar sus intentos. Especial Día de Muertos o personalizable.",
      status: activeGameMode === "pick-win" ? "activo" : "disponible",
      accentColor: "#ea580c",
      badge: "Especial Día de Muertos",
    },
    {
      id: "jackpot",
      name: "Máquina de Jackpot (Tragaperras)",
      category: "Gran Premio & Expectación",
      icon: Coins,
      route: "/games/jackpot",
      description: "El clásico juego de 3 rodillos giratorios de casino de lujo. Consigue 3 aviones o 3 símbolos de la casa en línea para ganar el gran premio.",
      status: activeGameMode === "jackpot" ? "activo" : "disponible",
      accentColor: "#f59e0b",
      badge: "Especial Viajes / VIP",
    },
    {
      id: "plinko",
      name: "Suelta y Gana (Plinko / Pachinko)",
      category: "Física, Caída & Expectación",
      icon: CircleDot,
      route: "/games/plinko",
      description: "La bola desciende sorteando clavijas y obstáculos hasta caer en casillas de premios. Configurable con temática Navideña, Gourmet o Neon.",
      status: activeGameMode === "plinko" ? "activo" : "disponible",
      accentColor: "#ef4444",
      badge: "Especial Navidad & Temporadas",
    },
    {
      id: "second-chance",
      name: "2ª Oportunidad & Reto Precisión VIP",
      category: "Revancha, Viralidad & Precisión",
      icon: Share2,
      route: "/games/second-chance",
      description: "Si el comensal no ganó en la primera dinámica, desbloquea una segunda oportunidad con el elegante cronómetro de 10s al compartir en WhatsApp.",
      status: "activo",
      accentColor: "#8b5cf6",
      badge: "Viral & Mayor Conversión",
    },
  ];

  const [error, setError] = useState<string | null>(null);

  const gameModeLabel = (mode: string): string =>
    mode === "roulette"
      ? "Ruleta de Premios"
      : mode === "precision"
      ? "Cronómetro 10s"
      : mode === "scratch"
      ? "Raspa y Gana"
      : mode === "memory"
      ? "Juego de Memoria"
      : mode === "jackpot"
      ? "Máquina de Jackpot"
      : mode === "plinko"
      ? "Suelta y Gana (Plinko)"
      : "Descubre y Gana (Día de Muertos)";

  useEffect(() => {
    apiGet("/game-config")
      .then((data) => {
        if (data?.gameConfig?.gameMode) {
          setActiveGameMode(data.gameConfig.gameMode);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSelectGameMode = async (mode: string) => {
    const previous = activeGameMode;
    setActiveGameMode(mode); // feedback optimista
    setSaving(true);
    setError(null);
    try {
      // apiPost adjunta el token admin y lanza si el backend rechaza (401, etc.)
      await apiPost("/game-config", { gameMode: mode });
      setSuccess(`✓ Juego activo en mesas actualizado a: ${gameModeLabel(mode)}`);
      setTimeout(() => setSuccess(null), 3500);
    } catch (err) {
      // Revertir la selección si el guardado falló (p. ej. sesión caducada)
      setActiveGameMode(previous);
      setError(
        err instanceof Error && /401/.test(err.message)
          ? "Tu sesión caducó. Vuelve a ingresar el PIN para cambiar el juego activo."
          : "No se pudo guardar el juego activo. Inténtalo de nuevo."
      );
      setTimeout(() => setError(null), 4000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. ENCABEZADO MODULAR */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#363439] pb-4">
        <div>
          <h2 className="text-xl font-bold text-[#e6e1e7] font-['Epilogue'] flex items-center gap-2">
            <Gamepad2 className="w-6 h-6 text-[var(--gold)]" />
            <span>Catálogo Modular de Juegos & Dinámicas</span>
          </h2>
          <p className="text-xs text-[#ccc3d8]">
            Administra los juegos disponibles en sala. Puedes cambiar el juego activo en 1 clic o configurar las reglas individuales de cada dinámica.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Pestañas: Catálogo vs Secuencia */}
          <div className="flex bg-[#201f23] p-1 rounded-xl border border-[#363439] gap-1">
            <button
              type="button"
              onClick={() => setActiveTab("catalog")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "catalog"
                  ? "bg-[var(--gold)] text-[#121115]"
                  : "text-[#ccc3d8] hover:text-white"
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>Catálogo de Juegos</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("exclusive")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "exclusive"
                  ? "bg-[var(--gold)] text-[#121115]"
                  : "text-[#ccc3d8] hover:text-white"
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Personalización Exclusiva</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("sequence")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "sequence"
                  ? "bg-[var(--gold)] text-[#121115]"
                  : "text-[#ccc3d8] hover:text-white"
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5" />
              <span>Secuencia del Embudo</span>
            </button>
          </div>

          <Link
            to="/demo"
            className="bg-[#201f23] hover:bg-[#2b292e] border border-[var(--gold)]/40 text-[var(--gold)] px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Smartphone className="w-4 h-4" />
            <span>Simulador Móvil</span>
          </Link>
        </div>
      </div>

      {success && (
        <div className="bg-[#0d2e1f] border border-[#10b981]/50 text-[#10b981] px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-950/40 border border-red-500/50 text-red-300 px-4 py-3 rounded-xl text-xs font-semibold animate-fade-in">
          {error}
        </div>
      )}

      {/* RENDERIZADO SEGÚN PESTAÑA */}
      {activeTab === "exclusive" ? (
        <GameExclusiveCustomizer />
      ) : activeTab === "sequence" ? (
        <GameSequenceManager />
      ) : (
        <>
          {/* 2. SELECTOR DE JUEGO ACTIVO EN MESA */}
          <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-[#2b292e] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#e6e1e7] flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[var(--gold)]" />
                  <span>Juego Principal Activo en las Mesas</span>
                </h3>
                <p className="text-[11px] text-[#ccc3d8]">
                  Define qué juego se abre automáticamente cuando el cliente escanea el QR o acerca su teléfono al chip NFC en la mesa.
                </p>
              </div>
              <span className="text-[10px] font-mono font-bold text-[#121115] bg-[var(--gold)] px-2.5 py-1 rounded-full uppercase">
                {gameModeLabel(activeGameMode)} Activo
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
              {[
                { id: "roulette", name: "Ruleta", icon: RotateCw, desc: "Girar y ganar azar" },
                { id: "scratch", name: "Raspa y Gana", icon: Flame, desc: "Rasca con el dedo" },
                { id: "memory", name: "Memoria", icon: Brain, desc: "Parejas Halloween" },
                { id: "pick-win", name: "Descubre y Gana", icon: Sparkles, desc: "3 iguales Día Muertos" },
                { id: "jackpot", name: "Jackpot", icon: Coins, desc: "3 rodillos en línea" },
                { id: "plinko", name: "Suelta y Gana", icon: CircleDot, desc: "Caída de bola y clavijas" },
                { id: "precision", name: "Cronómetro 10s", icon: Timer, desc: "Detén el reloj en 10.00s" },
              ].map((mode) => {
            const isSelected = activeGameMode === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => handleSelectGameMode(mode.id)}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                  isSelected
                    ? "bg-[#252220] border-[var(--gold)] ring-1 ring-[var(--gold)]/40 shadow-md"
                    : "bg-[#201f23] border-[#363439] hover:border-[var(--gold)]/40"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <mode.icon className={`w-5 h-5 ${isSelected ? "text-[var(--gold)]" : "text-[#ccc3d8]"}`} />
                  {isSelected && (
                    <span className="text-[10px] font-bold text-[var(--gold)] bg-[var(--gold)]/15 px-2 py-0.5 rounded-full border border-[var(--gold)]/30">
                      ✓ En Mesas
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#e6e1e7]">{mode.name}</h4>
                  <p className="text-[10px] text-[#ccc3d8]">{mode.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. CATÁLOGO DE TARJETAS MODULARES DE JUEGOS */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-[#e6e1e7] flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[var(--gold)]" />
          <span>Módulos de Juego Disponibles ({games.length})</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {games.map((game) => {
            const Icon = game.icon;
            return (
              <div
                key={game.id}
                className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-5 hover:border-[var(--gold)]/50 transition-all shadow-md flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
                        style={{
                          backgroundColor: `${game.accentColor}18`,
                          borderColor: `${game.accentColor}40`,
                          color: game.accentColor,
                        }}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#e6e1e7]">{game.name}</h4>
                        <span className="text-[10px] text-[#ccc3d8] block">{game.category}</span>
                      </div>
                    </div>

                    <span
                      className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border"
                      style={{
                        backgroundColor: `${game.accentColor}15`,
                        color: game.accentColor,
                        borderColor: `${game.accentColor}30`,
                      }}
                    >
                      {game.badge}
                    </span>
                  </div>

                  <p className="text-xs text-[#ccc3d8] leading-relaxed">
                    {game.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#2b292e]">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${game.status === "activo" ? "bg-[#10b981] animate-pulse" : "bg-[#f59e0b]"}`} />
                    <span className="text-[11px] text-[#ccc3d8] capitalize">
                      {game.status === "activo" ? "Operativo" : "En Espera"}
                    </span>
                  </div>

                  <Link
                    to={game.route}
                    className="text-xs font-bold text-[var(--gold)] hover:text-[var(--gold-light)] flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Configurar Módulo</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
        </>
      )}
    </div>
  );
}
