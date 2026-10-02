import { useState, useRef, useEffect } from "react";
import confetti from "canvas-confetti";
import {
  Gift,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Trophy,
  CheckCircle2,
  Volume2,
  VolumeX,
} from "lucide-react";
import {
  ScratchGameSettings,
  ScratchGameConfigService,
  ScratchPrize,
  SCRATCH_THEMES,
  scratchAudio,
} from "@/lib/scratchGameData";

interface StepScratchGameProps {
  participantName?: string;
  tableNumber?: string;
  onWinPrize?: (prizeName: string, prizeValue: string) => void;
  onExit?: () => void;
  customSettings?: ScratchGameSettings;
  initialFace?: "face1" | "face2";
}

export function StepScratchGame({
  participantName = "Invitado Especial",
  tableNumber = "Mesa VIP",
  onWinPrize,
  onExit,
  customSettings,
  initialFace = "face1",
}: StepScratchGameProps) {
  // Cargar configuración (desde props o de localStorage)
  const [settings, setSettings] = useState<ScratchGameSettings>(() => {
    return customSettings || ScratchGameConfigService.getSettings();
  });

  useEffect(() => {
    if (customSettings) {
      setSettings(customSettings);
    }
  }, [customSettings]);

  const theme = SCRATCH_THEMES[settings.themeId] || SCRATCH_THEMES.navidad;

  // Cara activa: "face1" (Portada navideña) o "face2" (Tarjeta de raspado)
  const [activeFace, setActiveFace] = useState<"face1" | "face2">(initialFace);
  const [selectedPrize, setSelectedPrize] = useState<ScratchPrize>(() => {
    // Selección por probabilidad ponderada
    const prizes = settings.prizes.length ? settings.prizes : [settings.prizes[0]];
    const totalProb = prizes.reduce((acc, p) => acc + (p.probability || 10), 0);
    let rand = Math.random() * (totalProb || 100);
    for (const p of prizes) {
      if (rand < (p.probability || 10)) return p;
      rand -= (p.probability || 10);
    }
    return prizes[0];
  });

  const isConsolation = Boolean(selectedPrize?.isConsolation);

  // Canvas para el raspado
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isScratching, setIsScratching] = useState(false);
  const [scratchedPercent, setScratchedPercent] = useState(0);
  const [isFullyRevealed, setIsFullyRevealed] = useState(false);
  const [soundMuted, setSoundMuted] = useState(!settings.soundEnabled);

  // Inicializar el canvas de la lámina rascable
  const initFoilCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Redimensionar según tamaño real
    const width = canvas.width;
    const height = canvas.height;

    ctx.globalCompositeOperation = "source-over";

    // Textura de lámina rascable plateada / escarchada como la foto
    const grad = ctx.createLinearGradient(0, 0, width, height);
    if (theme.foilType === "silver") {
      grad.addColorStop(0, "#cbd5e1");
      grad.addColorStop(0.2, "#f1f5f9");
      grad.addColorStop(0.5, "#94a3b8");
      grad.addColorStop(0.8, "#f8fafc");
      grad.addColorStop(1, "#cbd5e1");
    } else if (theme.foilType === "gold") {
      grad.addColorStop(0, "#d4af37");
      grad.addColorStop(0.3, "#fff2b2");
      grad.addColorStop(0.7, "#d4af37");
      grad.addColorStop(1, "#b38f2a");
    } else {
      grad.addColorStop(0, "#9333ea");
      grad.addColorStop(0.5, "#f43f5e");
      grad.addColorStop(1, "#4c1d95");
    }

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Efecto de escarcha o pinceladas plateadas decorativas
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    for (let i = 0; i < 40; i++) {
      const rx = Math.random() * width;
      const ry = Math.random() * height;
      const rw = 20 + Math.random() * 40;
      const rh = 1 + Math.random() * 3;
      ctx.fillRect(rx, ry, rw, rh);
    }

    // Marco interior sutil sobre la lámina
    ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, width - 20, height - 20);

    // Texto instructivo central sobre la lámina
    ctx.fillStyle = "#1e293b";
    ctx.font = "bold 13px 'Epilogue', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("✨ RASCA CON TU DEDO ✨", width / 2, height / 2 - 8);

    ctx.fillStyle = "#475569";
    ctx.font = "bold 10px sans-serif";
    ctx.fillText("Desliza para descubrir tu sorpresa", width / 2, height / 2 + 12);

    setScratchedPercent(0);
    setIsFullyRevealed(false);
  };

  useEffect(() => {
    if (activeFace === "face2") {
      // Pequeño retardo para asegurar que el canvas esté en el DOM
      const timer = setTimeout(initFoilCanvas, 80);
      return () => clearTimeout(timer);
    }
  }, [activeFace, selectedPrize, theme]);

  // Manejador del trazo de raspado
  const handleScratch = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isScratching && e.type !== "mousedown" && e.type !== "touchstart") return;
    const canvas = canvasRef.current;
    if (!canvas || isFullyRevealed) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;

    // Modo borrador con borde difuminado
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, settings.brushSize / 2, 0, Math.PI * 2);
    ctx.fill();

    // Sonido táctil de raspado (no spammear)
    if (!soundMuted && Math.random() > 0.4) {
      scratchAudio.playScratch();
    }

    // Progreso aproximado
    setScratchedPercent((prev) => {
      const next = Math.min(100, prev + 2.5);
      if (next >= settings.revealThresholdPercent && !isFullyRevealed) {
        setIsFullyRevealed(true);
        if (!soundMuted) scratchAudio.playWin();
        confetti({
          particleCount: 60,
          spread: 80,
          origin: { y: 0.55 },
          colors: ["#f59e0b", "#ef4444", "#10b981", "#ffffff"],
        });
      }
      return next;
    });
  };

  const handleClaim = () => {
    if (onWinPrize) {
      onWinPrize(selectedPrize.name, selectedPrize.value);
    } else {
      alert(`¡Voucher activado con éxito!\n${selectedPrize.name} (${selectedPrize.value})`);
    }
  };

  return (
    <div className="w-full max-w-[390px] mx-auto select-none">
      {/* SELECTOR DISCRETO DE LAS DOS CARAS (Cara 1: Portada Navideña / Cara 2: Tarjeta de Raspado) */}
      <div className="flex items-center justify-between bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl p-1 mb-2">
        <button
          type="button"
          onClick={() => setActiveFace("face1")}
          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeFace === "face1"
              ? "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md"
              : "text-white/70 hover:text-white"
          }`}
        >
          <span>🎁 Cara 1: Portada</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFace("face2")}
          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeFace === "face2"
              ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-md"
              : "text-white/70 hover:text-white"
          }`}
        >
          <span>🧤 Cara 2: Tarjeta Rasca</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* CARA 1: PORTADA NAVIDEÑA (FOTO IZQUIERDA)                      */}
      {/* ============================================================== */}
      {activeFace === "face1" && (
        <div className="relative w-full max-w-[390px] mx-auto min-h-[640px] rounded-[32px] overflow-hidden shadow-2xl flex flex-col justify-between text-white border-4 border-[#2b292e]">
          {/* Fondo fotográfico navideño cálido */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#5c0b11] via-[#2d0508] to-[#120204] z-0" />

          {/* Guirnalda superior de pino con luces y bolas navideñas */}
          <div className="relative z-10 w-full pt-4 px-3 flex flex-col items-center">
            {/* Luces y guirnalda */}
            <div className="w-full flex items-center justify-between px-2 text-xl opacity-90 filter drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]">
              <span>✨</span>
              <span className="text-amber-300">🟡</span>
              <span className="text-red-500">🔴</span>
              <span className="text-amber-300">🟡</span>
              <span className="text-red-500">🔴</span>
              <span>✨</span>
            </div>

            <div className="w-full h-8 bg-gradient-to-b from-[#14532d]/40 to-transparent flex items-center justify-center -mt-2">
              <div className="flex gap-4 text-xs text-amber-200/80 font-mono tracking-widest uppercase">
                <span>🌲 🎄 🌲 🎄 🌲</span>
              </div>
            </div>
          </div>

          {/* Bloque central de textos de impacto (idéntico a la imagen) */}
          <div className="relative z-10 px-6 text-center space-y-4 my-auto">
            {/* Bolas colgantes decorativas */}
            <div className="flex justify-center gap-6 mb-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 shadow-[0_0_15px_rgba(245,158,11,0.6)] border border-amber-200 flex items-center justify-center text-xs">
                ⭐
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-800 shadow-[0_0_15px_rgba(239,68,68,0.7)] border border-red-300 flex items-center justify-center text-sm -mt-2">
                🎁
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 shadow-[0_0_15px_rgba(245,158,11,0.6)] border border-amber-200 flex items-center justify-center text-xs">
                ✨
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-amber-100 font-['Epilogue'] tracking-tight leading-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
              {settings.welcomeTitle}
            </h2>

            <p className="text-xs sm:text-sm text-amber-200/90 max-w-[280px] mx-auto leading-relaxed font-medium">
              {settings.welcomeSubtitle}
            </p>

            {/* Icono de regalo dorado */}
            <div className="pt-2 flex justify-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(245,158,11,0.4)] animate-pulse">
                🎁
              </div>
            </div>

            {/* Botón principal verde con relieve y flecha como en la foto */}
            <div className="pt-3">
              <button
                type="button"
                onClick={() => setActiveFace("face2")}
                className="w-full py-4 px-8 rounded-full bg-gradient-to-r from-[#15803d] via-[#16a34a] to-[#15803d] hover:brightness-110 active:scale-95 text-white font-black text-sm tracking-wider uppercase border-2 border-amber-300 shadow-[0_4px_20px_rgba(22,163,74,0.5)] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{settings.welcomeButtonText}</span>
              </button>
            </div>
          </div>

          {/* Paisaje nevado inferior con farol y regalos como en la foto */}
          <div className="relative z-10 w-full p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end justify-between border-t border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏮</span>
              <div className="text-left text-[11px] text-amber-200/80 leading-tight">
                <p className="font-bold text-white">{tableNumber}</p>
                <p>{participantName}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xl">
              <span>🎁</span>
              <span>🍪</span>
              <span>❄️</span>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* CARA 2: JUEGO DE RASPADO / TARJETA KIT NAVIDEÑO (FOTO DERECHA) */}
      {/* ============================================================== */}
      {activeFace === "face2" && (
        <div className="relative w-full max-w-[390px] mx-auto min-h-[640px] rounded-[32px] overflow-hidden shadow-2xl flex flex-col justify-between select-none border-4 border-[#2b292e] bg-gradient-to-b from-[#fffbeb] via-[#fef3c7] to-[#fde68a] text-slate-800">
      {/* Guirnalda superior navideña con luces y piñas */}
      <div className="w-full pt-3 px-4 flex items-center justify-between border-b border-amber-300/40 pb-2">
        <div className="flex items-center gap-1.5 text-xs text-amber-900 font-bold font-['Epilogue']">
          <Gift className="w-4 h-4 text-red-600" />
          <span>PROMO NAVIDEÑA EN MESA</span>
        </div>

        <button
          type="button"
          onClick={() => setSoundMuted(!soundMuted)}
          className="w-7 h-7 rounded-full bg-amber-200/80 hover:bg-amber-300 text-amber-900 flex items-center justify-center transition-all cursor-pointer"
          title="Activar/Silenciar sonido"
        >
          {soundMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Cabecera festiva: "¡Enhorabuena! Te ha tocado un premio navideño." */}
      <div className="px-5 text-center pt-2 space-y-1">
        <div className="flex justify-center mb-1">
          <span className="text-2xl animate-bounce">🎁</span>
        </div>
        <h3 className="text-2xl font-black text-red-700 font-['Epilogue'] tracking-tight drop-shadow-sm">
          {isConsolation ? settings.consolationTitle : settings.winTitle}
        </h3>
        <p className="text-xs text-amber-900/80 font-medium">
          {isConsolation ? settings.consolationSubtitle : settings.winSubtitle}
        </p>
      </div>

      {/* TARJETA ROJA CON BORDE DORADO Y LÁMINA RASCABLE (IDÉNTICA A LA FOTO) */}
      <div className="px-4 py-2 my-auto">
        <div className="relative w-full max-w-[320px] mx-auto rounded-3xl p-3 border-4 border-amber-400 bg-gradient-to-b from-[#991b1b] via-[#7f1d1d] to-[#450a0a] shadow-[0_8px_30px_rgba(153,27,27,0.4)] text-white overflow-hidden">
          {/* Copos de nieve sutiles en las esquinas */}
          <div className="absolute top-2 left-2 text-white/20 text-xs pointer-events-none">❄️</div>
          <div className="absolute top-2 right-2 text-white/20 text-xs pointer-events-none">❄️</div>
          <div className="absolute bottom-2 left-2 text-white/20 text-xs pointer-events-none">❄️</div>
          <div className="absolute bottom-2 right-2 text-white/20 text-xs pointer-events-none">❄️</div>

          {/* Encabezado interior de la tarjeta */}
          <div className="text-center pb-2">
            <h4 className="text-xl font-black tracking-wider text-amber-300 font-['Epilogue'] drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">
              {selectedPrize.badge || "¡PREMIO!"}
            </h4>
            <p className="text-xs font-bold text-white tracking-widest uppercase -mt-0.5">
              {selectedPrize.category || "KIT NAVIDEÑO"}
            </p>
          </div>

          {/* Contenedor del área de raspado (Debajo: Premio | Encima: Canvas rascable) */}
          <div className="relative w-full h-[220px] rounded-2xl overflow-hidden bg-gradient-to-b from-[#f8fafc] to-[#e2e8f0] border-2 border-amber-300/80 shadow-inner">
            {/* CAPA DE PREMIO REVELADO (Ilustración idéntica a la imagen de referencia) */}
            <div className="absolute inset-0 p-3 flex flex-col items-center justify-center text-center space-y-2 z-0 bg-radial from-amber-50 to-amber-100">
              {/* Composición gráfica del Kit Navideño */}
              <div className="relative flex items-center justify-center gap-2 py-1">
                {/* Caja de regalo */}
                <div className="text-4xl filter drop-shadow-md animate-pulse">🎁</div>
                {/* Taza y bastón */}
                <div className="flex flex-col items-center text-2xl">
                  <span>☕</span>
                  <span className="-mt-2 text-lg">🦯</span>
                </div>
                {/* Guantes y galleta */}
                <div className="flex flex-col items-center text-2xl">
                  <span>🧤</span>
                  <span className="-mt-2 text-lg">⭐</span>
                </div>
              </div>

              {/* Título y descripción del premio */}
              <div className="space-y-0.5">
                <span className="text-sm font-black text-red-800 leading-snug block font-['Epilogue']">
                  {selectedPrize.name}
                </span>
                <span className="font-mono text-xs font-bold text-amber-800 bg-amber-200/60 px-2.5 py-0.5 rounded-full border border-amber-400">
                  VALOR: {selectedPrize.value}
                </span>
              </div>

              <p className="text-[10px] text-slate-600 max-w-[220px] leading-tight">
                {selectedPrize.description}
              </p>
            </div>

            {/* CAPA RASCABLE CANVAS (Interacción táctil / ratón) */}
            <canvas
              ref={canvasRef}
              width={310}
              height={220}
              onMouseDown={(e) => {
                setIsScratching(true);
                handleScratch(e);
              }}
              onMouseUp={() => setIsScratching(false)}
              onMouseLeave={() => setIsScratching(false)}
              onMouseMove={handleScratch}
              onTouchStart={(e) => {
                setIsScratching(true);
                handleScratch(e);
              }}
              onTouchEnd={() => setIsScratching(false)}
              onTouchMove={handleScratch}
              className={`absolute inset-0 w-full h-full z-10 cursor-pointer transition-opacity duration-700 ${
                isFullyRevealed ? "opacity-0 pointer-events-none" : "opacity-100"
              }`}
            />
          </div>

          {/* Barra de progreso de raspado */}
          <div className="pt-2 px-1">
            <div className="flex items-center justify-between text-[11px] font-semibold text-amber-200 mb-1">
              <span>Rascado:</span>
              <span>{Math.round(scratchedPercent)}%</span>
            </div>
            <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden border border-amber-300/40">
              <div
                className="bg-gradient-to-r from-amber-400 to-amber-200 h-full transition-all duration-150"
                style={{ width: `${Math.min(100, (scratchedPercent / settings.revealThresholdPercent) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Botones inferiores según estado del raspado */}
      <div className="p-4 pt-1 space-y-2">
        {isFullyRevealed ? (
          <button
            type="button"
            onClick={handleClaim}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#dc2626] via-[#ef4444] to-[#dc2626] hover:brightness-110 active:scale-98 text-white font-black text-xs tracking-wider uppercase border-2 border-amber-300 shadow-[0_4px_20px_rgba(220,38,38,0.5)] transition-all flex items-center justify-center gap-2 cursor-pointer animate-pulse"
          >
            <Trophy className="w-4 h-4 text-amber-300" />
            <span>OBTENER MI VOUCHER OFICIAL</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={initFoilCanvas}
              className="flex-1 py-2.5 rounded-xl bg-amber-200/90 hover:bg-amber-300 text-amber-950 font-bold text-xs border border-amber-400 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpiar y Volver a Raspar</span>
            </button>

            <button
              type="button"
              onClick={() => setIsFullyRevealed(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold text-xs border border-amber-300 transition-all cursor-pointer"
            >
              Revelar Todo
            </button>
          </div>
        )}

        <div className="flex items-center justify-center gap-1 text-[11px] text-amber-900/70 text-center">
          <CheckCircle2 className="w-3 h-3 text-green-700 shrink-0" />
          <span>Válido hoy en caja presentando la pantalla de tu mesa.</span>
        </div>
      </div>
    </div>
      )}
    </div>
  );
}
