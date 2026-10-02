import { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import {
  Sparkles,
  Volume2,
  VolumeX,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  Gift,
  Trophy,
} from "lucide-react";
import {
  PlinkoConfigService,
  PlinkoGameSettings,
  PLINKO_THEMES,
  plinkoAudio,
  PlinkoSlot,
} from "../../lib/plinkoData";

interface StepPlinkoGameProps {
  participantName?: string;
  tableNumber?: string;
  onWinPrize?: (prizeName: string, prizeValue: string) => void;
}

export function StepPlinkoGame({
  participantName = "Comensal",
  tableNumber = "Mesa 1",
  onWinPrize,
}: StepPlinkoGameProps) {
  const [settings, setSettings] = useState<PlinkoGameSettings>(() =>
    PlinkoConfigService.getSettings()
  );
  const theme = PLINKO_THEMES[settings.themeId] || PLINKO_THEMES.christmas;

  // Pantallas: "welcome" (Portada) | "playing" (Tablero activo) | "won" (Premio conseguido)
  const [screenState, setScreenState] = useState<"welcome" | "playing" | "won">("welcome");
  const [soundOn, setSoundOn] = useState<boolean>(settings.soundEnabled);
  const [isDropping, setIsDropping] = useState<boolean>(false);
  const [wonSlot, setWonSlot] = useState<PlinkoSlot | null>(null);
  const [ballPos, setBallPos] = useState<{ x: number; y: number }>({ x: 50, y: 5 }); // en porcentaje %
  const [activeSlotIndex, setActiveSlotIndex] = useState<number | null>(null);

  // Parámetros del tablero de clavijas
  // 8 filas de clavijas escalonadas
  const pegRows = [
    [50], // Fila 1: 1 clavija central
    [40, 60], // Fila 2: 2 clavijas
    [30, 50, 70], // Fila 3: 3 clavijas
    [22, 41, 59, 78], // Fila 4: 4 clavijas
    [15, 32, 50, 68, 85], // Fila 5: 5 clavijas
    [22, 41, 59, 78], // Fila 6: 4 clavijas
    [15, 32, 50, 68, 85], // Fila 7: 5 clavijas
    [10, 26, 42, 58, 74, 90], // Fila 8: 6 clavijas
  ];

  // Iniciar la partida desde la portada
  const handleStartGame = () => {
    setScreenState("playing");
    setBallPos({ x: 50, y: 5 });
    setActiveSlotIndex(null);
    setWonSlot(null);
  };

  // Lanzar la bola por el tablero con física simulada y rebotes sonoros
  const handleDropBall = () => {
    if (isDropping) return;
    setIsDropping(true);
    setActiveSlotIndex(null);
    setWonSlot(null);

    if (soundOn) {
      plinkoAudio.playRelease();
    }

    // Determinar de antemano el slot ganador según ponderaciones configuradas
    const slots = settings.slots && settings.slots.length > 0 ? settings.slots : theme.slots;
    const totalWeight = slots.reduce((acc, s) => acc + (s.probability || 10), 0);
    let rnd = Math.random() * totalWeight;
    let chosenIdx = 0;
    for (let i = 0; i < slots.length; i++) {
      if (rnd < (slots[i].probability || 10)) {
        chosenIdx = i;
        break;
      }
      rnd -= slots[i].probability || 10;
    }

    // Coordenadas objetivo en la base según el slot ganador
    const slotCount = slots.length;
    const targetX = ((chosenIdx + 0.5) / slotCount) * 100;

    // Generar camino de rebotes escalonados por fila
    const path: { x: number; y: number }[] = [{ x: 50, y: 5 }];
    let currentX = 50;
    const totalRows = pegRows.length;

    for (let row = 0; row < totalRows; row++) {
      const rowY = 14 + (row * 8); // Entre 14% y 78%
      // El camino se desvía suavemente hacia la izquierda o derecha tendiendo hacia targetX
      const progress = (row + 1) / totalRows;
      const idealX = 50 + (targetX - 50) * progress;
      const noise = (Math.random() - 0.5) * 12 * (1 - progress);
      currentX = idealX + noise;
      // Clampear dentro del tablero
      currentX = Math.max(12, Math.min(88, currentX));
      path.push({ x: currentX, y: rowY });
    }

    // Aterrizaje final en la casilla
    path.push({ x: targetX, y: 88 });

    // Animar paso a paso con temporizadores
    let step = 0;
    const intervalTime = 300; // ms por rebote

    const stepInterval = setInterval(() => {
      step++;
      if (step < path.length) {
        setBallPos(path[step]);
        if (soundOn) {
          plinkoAudio.playPegBounce(1 - (step / path.length) * 0.3);
        }
      } else {
        // Fin de la trayectoria
        clearInterval(stepInterval);
        setIsDropping(false);
        setActiveSlotIndex(chosenIdx);
        const prize = slots[chosenIdx];
        setWonSlot(prize);

        if (soundOn) {
          plinkoAudio.playSlotWin();
        }

        // Lanza confeti de celebración
        confetti({
          particleCount: 55,
          spread: 70,
          origin: { y: 0.65 },
          colors: ["#ef4444", "#10b981", "#fbbf24", "#ffffff"],
        });

        // Pasar a la pantalla de victoria tras breve pausa
        setTimeout(() => {
          setScreenState("won");
        }, 1200);
      }
    }, intervalTime);
  };

  // Reclamar premio oficial
  const handleClaimPrize = () => {
    if (wonSlot && onWinPrize) {
      onWinPrize(wonSlot.name, wonSlot.value);
    }
  };

  const slots = settings.slots && settings.slots.length > 0 ? settings.slots : theme.slots;

  return (
    <div className="w-full max-w-sm mx-auto font-sans select-none overflow-hidden rounded-3xl border border-[#363439] bg-[#0a080d] text-[#e6e1e7] shadow-2xl relative min-h-[660px] flex flex-col justify-between">
      {/* ============================================================== */}
      {/* 1. PANTALLA DE PORTADA / BIENVENIDA (IDÉNTICA A LA IMAGEN)      */}
      {/* ============================================================== */}
      {screenState === "welcome" && (
        <div className="relative flex-1 flex flex-col items-center justify-between p-6 text-center overflow-hidden">
          {/* Fondo festivo invernal con cabaña y nieve */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#1c0d18] via-[#0b1a15] to-[#120812] pointer-events-none" />
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Guirnalda superior decorativa */}
          <div className="relative z-10 w-full flex items-center justify-between pt-1">
            <span className="text-xl">🎄</span>
            <div className="flex gap-1.5 text-xs text-amber-300">
              <span>🔔</span>
              <span>⭐</span>
              <span>🍬</span>
            </div>
            <span className="text-xl">🎄</span>
          </div>

          {/* Cartel Nevado Central: "SUELTA LA BOLA Y GANA" */}
          <div className="relative z-10 my-auto w-full py-4 space-y-4">
            <div className="relative inline-block mx-auto">
              {/* Capa de nieve sobre el cartel */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-[92%] h-4 bg-white rounded-full shadow-[0_2px_8px_rgba(255,255,255,0.8)] z-20 flex justify-around">
                <span className="w-3 h-3 bg-white rounded-full inline-block -mt-0.5" />
                <span className="w-4 h-4 bg-white rounded-full inline-block -mt-1" />
                <span className="w-3 h-3 bg-white rounded-full inline-block -mt-0.5" />
              </div>

              {/* Rótulo de madera rústica */}
              <div className="bg-gradient-to-b from-[#5c2411] via-[#3d160a] to-[#250d06] border-2 border-[#b45309] rounded-2xl px-6 py-4 shadow-[0_8px_24px_rgba(0,0,0,0.8)] relative z-10">
                <h1 className="text-2xl sm:text-3xl font-black tracking-wider text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] font-['Epilogue'] leading-tight uppercase">
                  {settings.bannerTitle || "SUELTA LA BOLA"}
                </h1>
                <div className="text-3xl sm:text-4xl font-black tracking-widest text-[#f59e0b] drop-shadow-[0_3px_6px_rgba(0,0,0,0.9)] font-['Epilogue'] -mt-1">
                  Y GANA
                </div>
              </div>
            </div>

            {/* Subtítulo dinámico */}
            <p className="text-sm font-semibold text-[#fef08a] drop-shadow-md px-4 leading-relaxed">
              {settings.bannerSubtitle || "¡Juega y descubre qué premio navideño te espera!"}
            </p>

            {/* Guía en 2 Pasos con iconos */}
            <div className="bg-[#141317]/80 backdrop-blur-md border border-[#363439] rounded-2xl p-4 flex items-center justify-around gap-2 text-xs">
              <div className="flex flex-col items-center gap-1.5 flex-1">
                <div className="w-10 h-10 rounded-full bg-red-600/30 border border-red-500/50 flex items-center justify-center text-lg animate-pulse">
                  🔴
                </div>
                <span className="text-[11px] font-bold text-white leading-tight">
                  1) Suelta la bola
                </span>
              </div>

              <span className="text-amber-400 font-bold">➔</span>

              <div className="flex flex-col items-center gap-1.5 flex-1">
                <div className="w-10 h-10 rounded-full bg-emerald-600/30 border border-emerald-500/50 flex items-center justify-center text-lg">
                  📍
                </div>
                <span className="text-[11px] font-bold text-white leading-tight">
                  2) Sigue el recorrido
                </span>
              </div>
            </div>
          </div>

          {/* Botón JUGAR con nieve superior y brillo rojo */}
          <div className="relative z-10 w-full pt-2">
            <button
              type="button"
              onClick={handleStartGame}
              className="w-full relative group overflow-hidden bg-gradient-to-b from-[#dc2626] to-[#991b1b] hover:from-[#ef4444] hover:to-[#b91c1c] active:scale-95 text-white font-black text-lg py-4 px-6 rounded-2xl shadow-[0_0_24px_rgba(239,68,68,0.5)] border-2 border-[#fca5a5] cursor-pointer transition-all flex items-center justify-center gap-2"
            >
              {/* Nieve superior en el botón */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-white/70 rounded-t-xl" />
              <span>JUGAR</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-[10px] text-[#958da1] mt-2">
              Válido para {tableNumber} • 1 intento por comensal
            </p>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. PANTALLA DEL TABLERO DE JUEGO (PLINKO CON CLAVIJAS & SLOTS)   */}
      {/* ============================================================== */}
      {screenState === "playing" && (
        <div className="relative flex-1 flex flex-col justify-between p-3.5 overflow-hidden">
          {/* Fondo y Guirnalda perimetral navideña */}
          <div className="absolute inset-0 bg-[#0c1410] pointer-events-none" />

          {/* Marco decorativo perimetral */}
          <div className="relative z-10 border-2 border-red-600/80 rounded-2xl p-2.5 bg-gradient-to-b from-[#141b17] via-[#0c120f] to-[#12080a] shadow-[0_0_30px_rgba(239,68,68,0.25)] flex-1 flex flex-col justify-between">
            {/* Cabecera superior: Guirnalda & Campana */}
            <div className="flex items-center justify-between px-2 pt-1 border-b border-red-900/40 pb-2">
              <span className="text-xs text-amber-400 font-bold flex items-center gap-1">
                <span>🎄</span>
                <span>{tableNumber}</span>
              </span>
              <div className="flex items-center gap-1 text-sm">
                <span>⭐</span>
                <span>🔔</span>
                <span>⭐</span>
              </div>
              <button
                type="button"
                onClick={() => setSoundOn(!soundOn)}
                className="text-[#f2be71] hover:text-white p-1 rounded-lg bg-[#201f23]/60 cursor-pointer"
                title="Activar/Silenciar sonido"
              >
                {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 opacity-50" />}
              </button>
            </div>

            {/* Indicador de entrada superior con flecha */}
            <div className="relative flex justify-center py-1">
              <div className="flex flex-col items-center">
                <span className="text-amber-400 text-xs animate-bounce">▼</span>
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-500 to-red-700 border-2 border-amber-300 shadow-[0_0_12px_rgba(239,68,68,0.8)] flex items-center justify-center text-xs">
                  {theme.ballEmoji || "🔴"}
                </div>
              </div>
            </div>

            {/* TABLERO DE CLAVIJAS (PEG FIELD) INTERACTIVO */}
            <div className="relative w-full h-[320px] rounded-xl bg-[#080d0a]/90 border border-red-900/50 overflow-hidden my-1">
              {/* Clavijas / Obstáculos metálicos dorados */}
              {pegRows.map((row, rIdx) =>
                row.map((x, cIdx) => (
                  <div
                    key={`peg-${rIdx}-${cIdx}`}
                    style={{
                      left: `${x}%`,
                      top: `${14 + rIdx * 9}%`,
                    }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-gradient-to-br from-amber-200 via-amber-400 to-yellow-600 shadow-[0_0_8px_rgba(251,191,36,0.8)] border border-amber-100"
                  />
                ))
              )}

              {/* BOLA EN MOVIMIENTO CON FÍSICA Y REBOTES */}
              {isDropping && (
                <div
                  style={{
                    left: `${ballPos.x}%`,
                    top: `${ballPos.y}%`,
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gradient-to-br from-red-400 via-red-600 to-red-800 border-2 border-white shadow-[0_0_16px_rgba(239,68,68,1)] flex items-center justify-center text-[10px] z-30 transition-all duration-300 ease-out"
                >
                  {theme.ballEmoji || "🔴"}
                </div>
              )}

              {/* BOTÓN FLOTANTE CENTRAL: "SOLTAR LA BOLA" */}
              {!isDropping && (
                <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-auto">
                  <button
                    type="button"
                    onClick={handleDropBall}
                    className="group relative w-32 h-32 rounded-full bg-gradient-to-b from-[#f59e0b] via-[#d97706] to-[#b45309] hover:from-[#fbbf24] hover:to-[#d97706] active:scale-95 border-4 border-amber-200 shadow-[0_0_30px_rgba(245,158,11,0.7)] text-[#121115] font-black cursor-pointer flex flex-col items-center justify-center p-2 text-center transition-all animate-pulse"
                  >
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#3a1d04]">
                      Toca para
                    </span>
                    <span className="text-sm font-black leading-tight">
                      {settings.customButtonText || "SOLTAR LA BOLA"}
                    </span>
                    <span className="text-base mt-0.5">🌿🍒</span>
                  </button>
                </div>
              )}
            </div>

            {/* CASILLAS DE PREMIOS INFERIORES (SLOTS) */}
            <div className="grid grid-cols-7 gap-1 pt-1 border-t-2 border-red-500/70">
              {slots.map((slot, idx) => {
                const isSelected = activeSlotIndex === idx;
                return (
                  <div
                    key={slot.id || `slot-${idx}`}
                    className={`flex flex-col items-center justify-between p-1 rounded-lg border text-center transition-all ${
                      isSelected
                        ? "bg-amber-400 text-black border-white shadow-[0_0_15px_rgba(251,191,36,1)] scale-105 animate-bounce"
                        : "bg-[#141a15] border-red-800/60 text-[#e6e1e7]"
                    }`}
                  >
                    <span className="text-base sm:text-lg">{slot.icon}</span>
                    <span className="text-[8px] font-bold leading-tight mt-0.5 line-clamp-1">
                      {slot.name.split(" ")[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Barra inferior informativa */}
          <div className="flex items-center justify-between pt-2 px-1 text-[11px] text-[#ccc3d8]">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Sigue la bola hasta que aterrice</span>
            </span>
            <button
              type="button"
              onClick={() => setScreenState("welcome")}
              className="text-[#958da1] hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Volver</span>
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. PANTALLA DE VICTORIA CON VOUCHER EMITIDO                     */}
      {/* ============================================================== */}
      {screenState === "won" && wonSlot && (
        <div className="relative flex-1 flex flex-col justify-between p-6 text-center overflow-hidden animate-fade-in">
          <div className="absolute inset-0 bg-gradient-to-b from-[#1a0f1c] via-[#0d1f18] to-[#120810] pointer-events-none" />

          {/* Icono triunfal superior */}
          <div className="relative z-10 pt-2">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-amber-300 via-amber-500 to-yellow-600 border-4 border-white shadow-[0_0_30px_rgba(245,158,11,0.8)] flex items-center justify-center text-4xl mb-3 animate-bounce">
              {wonSlot.icon}
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-bold uppercase mb-2">
              <Trophy className="w-3.5 h-3.5" />
              <span>¡Combinación Ganadora!</span>
            </div>

            <h2 className="text-2xl font-black text-white font-['Epilogue']">
              ¡Enhorabuena, {participantName}!
            </h2>
            <p className="text-xs text-[#ccc3d8] mt-1">
              La bola aterrizó exactamente en tu premio especial:
            </p>
          </div>

          {/* Tarjeta Troquelada del Premio Ganado */}
          <div className="relative z-10 my-auto bg-gradient-to-b from-[#1c1b1f] to-[#141317] border-2 border-amber-400/70 rounded-2xl p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-[#363439] pb-2 text-xs">
              <span className="font-mono text-amber-400 font-bold">SUELTA Y GANA • {tableNumber}</span>
              <span className="text-[#10b981] font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>CONFIRMADO</span>
              </span>
            </div>

            <div className="text-left space-y-1">
              <span className="text-[10px] text-[#958da1] uppercase font-bold tracking-wider block">
                Premio Otorgado:
              </span>
              <div className="text-xl font-black text-amber-300 font-['Epilogue'] leading-tight">
                {wonSlot.name}
              </div>
              <div className="text-sm font-bold text-white">
                Valoración Comercial: {wonSlot.value}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#0f0e12] border border-[#2b292e] text-[11px] text-[#ccc3d8] text-left">
              🎟️ Presenta tu pantalla al camarero o en caja con el código PIN de 4 dígitos para reclamarlo en tu mesa.
            </div>
          </div>

          {/* Botón de emisión hacia el Paso 4 (Voucher) */}
          <div className="relative z-10 pt-2 space-y-2">
            <button
              type="button"
              onClick={handleClaimPrize}
              className="w-full bg-gradient-to-r from-[#f59e0b] via-[#fbbf24] to-[#f59e0b] hover:brightness-110 active:scale-98 text-[#121115] font-black text-sm py-4 px-6 rounded-2xl shadow-[0_0_24px_rgba(245,158,11,0.5)] cursor-pointer transition-all flex items-center justify-center gap-2"
            >
              <Gift className="w-5 h-5" />
              <span>EMITIR MI VOUCHER OFICIAL</span>
            </button>
            <button
              type="button"
              onClick={() => setScreenState("playing")}
              className="text-xs text-[#958da1] hover:text-white cursor-pointer underline"
            >
              Volver a tirar (Modo Demo)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
