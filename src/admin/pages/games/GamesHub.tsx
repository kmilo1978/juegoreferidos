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
} from "lucide-react";

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
      id: "precision",
      name: "Reto Cronómetro 10.000s",
      category: "Destreza & Habilidad",
      icon: Timer,
      route: "/games/precision",
      description: "El cliente debe frenar el temporizador exactamente en 10.000s. Despierta adrenalina y sana competencia entre los comensales.",
      status: activeGameMode === "precision" ? "activo" : "disponible",
      accentColor: "#10b981",
      badge: "Alta Adrenalina",
    },
    {
      id: "scratch",
      name: "Raspa y Gana Digital (Scratch)",
      category: "Misterio & Sorpresa Táctil",
      icon: Flame,
      route: "/games/scratch",
      description: "El comensal raspa con su dedo una lámina dorada sobre la pantalla táctil para descubrir su regalo o descuento sorpresa.",
      status: activeGameMode === "scratch" ? "activo" : "disponible",
      accentColor: "#ec4899",
      badge: "Nueva Dinámica",
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
      id: "second-chance",
      name: "2ª Oportunidad Viral",
      category: "Revancha & Viralidad",
      icon: Share2,
      route: "/games/second-chance",
      description: "Si el cliente no ganó en su primer intento, desbloquea una segunda oportunidad compartiendo una foto o estado en WhatsApp.",
      status: "activo",
      accentColor: "#8b5cf6",
      badge: "Generador de Referidos",
    },
  ];

  useEffect(() => {
    fetch("/api/game-config")
      .then((res) => res.json())
      .then((data) => {
        if (data.gameConfig?.gameMode) {
          setActiveGameMode(data.gameConfig.gameMode);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSelectGameMode = async (mode: string) => {
    setActiveGameMode(mode);
    setSaving(true);
    try {
      const res = await fetch("/api/game-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameMode: mode }),
      });
      if (res.ok) {
        setSuccess(`✓ Juego activo en mesas actualizado a: ${mode === "roulette" ? "Ruleta de Premios" : mode === "precision" ? "Cronómetro 10s" : mode === "scratch" ? "Raspa y Gana" : "Juego de Memoria (Halloween)"}`);
        setTimeout(() => setSuccess(null), 3500);
      }
    } catch {
      // ignore
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
            <Gamepad2 className="w-6 h-6 text-[#f2be71]" />
            <span>Catálogo Modular de Juegos & Dinámicas</span>
          </h2>
          <p className="text-xs text-[#ccc3d8]">
            Administra los juegos disponibles en sala. Puedes cambiar el juego activo en 1 clic o configurar las reglas individuales de cada dinámica.
          </p>
        </div>

        <Link
          to="/demo"
          className="bg-[#201f23] hover:bg-[#2b292e] border border-[#f2be71]/40 text-[#f2be71] px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <Smartphone className="w-4 h-4" />
          <span>Probar en Simulador Móvil</span>
        </Link>
      </div>

      {success && (
        <div className="bg-[#0d2e1f] border border-[#10b981]/50 text-[#10b981] px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* 2. SELECTOR DE JUEGO ACTIVO EN MESA */}
      <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between border-b border-[#2b292e] pb-3">
          <div>
            <h3 className="text-sm font-bold text-[#e6e1e7] flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#f2be71]" />
              <span>Juego Principal Activo en las Mesas</span>
            </h3>
            <p className="text-[11px] text-[#ccc3d8]">
              Define qué juego se abre automáticamente cuando el cliente escanea el QR o acerca su teléfono al chip NFC en la mesa.
            </p>
          </div>
          <span className="text-[10px] font-mono font-bold text-[#121115] bg-[#f2be71] px-2.5 py-1 rounded-full uppercase">
            {activeGameMode === "roulette" ? "Ruleta Activa" : activeGameMode === "precision" ? "Precisión Activa" : activeGameMode === "scratch" ? "Raspa Activo" : "Memoria Activa"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { id: "roulette", name: "Ruleta de Premios", icon: RotateCw, desc: "Girar y ganar por azar" },
            { id: "precision", name: "Cronómetro 10.000s", icon: Timer, desc: "Frenar el tiempo con destreza" },
            { id: "scratch", name: "Raspa y Gana", icon: Flame, desc: "Descubrir rascando la pantalla" },
            { id: "memory", name: "Juego de Memoria", icon: Brain, desc: "Parejas Halloween contra reloj" },
          ].map((mode) => {
            const isSelected = activeGameMode === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => handleSelectGameMode(mode.id)}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                  isSelected
                    ? "bg-[#252220] border-[#f2be71] ring-1 ring-[#f2be71]/40 shadow-md"
                    : "bg-[#201f23] border-[#363439] hover:border-[#f2be71]/40"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <mode.icon className={`w-5 h-5 ${isSelected ? "text-[#f2be71]" : "text-[#ccc3d8]"}`} />
                  {isSelected && (
                    <span className="text-[10px] font-bold text-[#f2be71] bg-[#f2be71]/15 px-2 py-0.5 rounded-full border border-[#f2be71]/30">
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
          <Sliders className="w-4 h-4 text-[#f2be71]" />
          <span>Módulos de Juego Disponibles ({games.length})</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {games.map((game) => {
            const Icon = game.icon;
            return (
              <div
                key={game.id}
                className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-5 hover:border-[#f2be71]/50 transition-all shadow-md flex flex-col justify-between gap-4"
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
                    className="text-xs font-bold text-[#f2be71] hover:text-[#ffddb1] flex items-center gap-1.5 transition-colors cursor-pointer"
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
    </div>
  );
}
