import { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import {
  Volume2,
  VolumeX,
  CheckCircle2,
  Trophy,
  ArrowRight,
  Menu,
} from "lucide-react";
import {
  PlinkoConfigService,
  PlinkoGameSettings,
  plinkoAudio,
  PlinkoSlot,
} from "../../lib/plinkoData";
import { brandConfettiColors } from "../../lib/brandService";

interface StepPlinkoGameProps {
  participantName?: string;
  tableNumber?: string;
  onWinPrize?: (prizeName: string, prizeValue: string) => void;
  onExit?: () => void;
  initialFace?: "face1" | "face2";
}

// 7 casillas fijas del diseño original navideño
const CHRISTMAS_SLOTS: PlinkoSlot[] = [
  { id: "slot-1", name: "Caja de Regalo Sorpresa", nameEn: "Surprise Gift Box", icon: "🎁", value: "$30.000 COP", color: "#dc2626", probability: 15 },
  { id: "slot-2", name: "Bastón Navideño Artesanal", nameEn: "Artisan Candy Cane", icon: "🦯", value: "Cortesía", color: "#16a34a", probability: 15 },
  { id: "slot-3", name: "Galleta de Jengibre", nameEn: "Gingerbread Cookie", icon: "🍪", value: "$8.500 COP", color: "#b45309", probability: 20 },
  { id: "slot-4", name: "Postre Árbol Nevado", nameEn: "Snowy Tree Dessert", icon: "🎄", value: "$18.000 COP", color: "#15803d", probability: 15 },
  { id: "slot-5", name: "Degustación Dulce", nameEn: "Sweet Tasting", icon: "🎄", value: "$18.000 COP", color: "#0e7490", probability: 15 },
  { id: "slot-6", name: "Bota Navideña de Autor", nameEn: "Signature Holiday Stocking", icon: "🧦", value: "$25.000 COP", color: "#be123c", probability: 10 },
  { id: "slot-7", name: "Gran Estrella de Oro", nameEn: "Golden Star Jackpot", icon: "⭐", value: "$50.000 COP", color: "#fbbf24", probability: 10, isGrandPrize: true },
];

export function StepPlinkoGame({
  participantName = "Invitado",
  tableNumber = "Mesa 1",
  onWinPrize,
  initialFace = "face1",
}: StepPlinkoGameProps) {
  const [settings] = useState<PlinkoGameSettings>(() =>
    PlinkoConfigService.getSettings()
  );

  // Cara activa: "face1" (Portada Cabaña de Nieve) o "face2" (Tablero de Clavijas)
  const [activeFace, setActiveFace] = useState<"face1" | "face2">(initialFace);
  const [screenState, setScreenState] = useState<"welcome" | "playing" | "won">("welcome");
  const [soundOn, setSoundOn] = useState<boolean>(true);
  const [isDropping, setIsDropping] = useState<boolean>(false);
  const [wonSlot, setWonSlot] = useState<PlinkoSlot | null>(null);
  const [activeSlotIndex, setActiveSlotIndex] = useState<number | null>(null);

  // Posición continua de la bolita en porcentaje (%)
  const [ballPos, setBallPos] = useState<{ x: number; y: number }>({ x: 50, y: 7 });
  // Clavija activa momentáneamente iluminada
  const [activePegKey, setActivePegKey] = useState<string | null>(null);

  // Referencias para el bucle continuo de animación fluida a 60 FPS
  const animFrameRef = useRef<number | null>(null);
  // setTimeout de destello de clavija y transición final, para limpiar al desmontar
  const dropTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Estructura densa escalonada idéntica a la imagen original (11 filas alternadas de 6 y 5 clavijas)
  const pegGrid = [
    [14, 28, 42, 56, 70, 84],
    [21, 35, 49, 63, 77],
    [14, 28, 42, 56, 70, 84],
    [21, 35, 49, 63, 77],
    [14, 28, 42, 56, 70, 84],
    [21, 35, 49, 63, 77],
    [14, 28, 42, 56, 70, 84],
    [21, 35, 49, 63, 77],
    [14, 28, 42, 56, 70, 84],
    [21, 35, 49, 63, 77],
    [14, 28, 42, 56, 70, 84],
  ];

  const slots = settings.slots?.length === 7 ? settings.slots : CHRISTMAS_SLOTS;

  // Limpiar requestAnimationFrame y timeouts pendientes al desmontar
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      dropTimeoutsRef.current.forEach(clearTimeout);
      dropTimeoutsRef.current = [];
    };
  }, []);

  const handleStartGame = () => {
    setScreenState("playing");
    setActiveFace("face2");
    setBallPos({ x: 50, y: 7 });
    setActiveSlotIndex(null);
    setWonSlot(null);
  };

  // Lanzar la bola con física continua ultra-fluida a 60 FPS
  const handleDropBall = () => {
    if (isDropping) return;
    setIsDropping(true);
    setActiveSlotIndex(null);
    setWonSlot(null);

    if (soundOn) plinkoAudio.playRelease();

    // 1. Determinar el slot ganador por probabilidad ponderada
    const totalWeight = slots.reduce((acc, s) => acc + (s.probability || 10), 0);
    let rnd = Math.random() * totalWeight;
    let chosenIdx = 3; // Centro por defecto
    for (let i = 0; i < slots.length; i++) {
      if (rnd < (slots[i].probability || 10)) {
        chosenIdx = i;
        break;
      }
      rnd -= (slots[i].probability || 10);
    }

    // Coordenada objetivo X del slot (0 a 6 => 7 casillas)
    const targetSlotX = ((chosenIdx + 0.5) / 7) * 100;

    const keyframes: { x: number; y: number; pegId?: string }[] = [{ x: 50, y: 3 }];
    let curX = 50;

    pegGrid.forEach((row, rIdx) => {
      const rowY = 6 + (rIdx * 7.8); // De 6% a 84%
      const progress = (rIdx + 1) / pegGrid.length;

      // Desviación natural atrayéndose hacia targetSlotX con fluctuación
      const guidedX = 50 + (targetSlotX - 50) * progress;
      const noise = (Math.random() - 0.5) * 8 * (1 - progress);
      curX = Math.max(14, Math.min(86, guidedX + noise));

      // Buscar la clavija más cercana en esta fila para rebotar en ella
      let closestPeg = row[0];
      let minDist = Math.abs(curX - row[0]);
      row.forEach((px) => {
        const dist = Math.abs(curX - px);
        if (dist < minDist) {
          minDist = dist;
          closestPeg = px;
        }
      });

      keyframes.push({
        x: closestPeg + (Math.random() > 0.5 ? 2 : -2),
        y: rowY,
        pegId: `peg-${rIdx}-${closestPeg}`,
      });
    });

    // Entrada a la casilla final
    keyframes.push({ x: targetSlotX, y: 88 });
    keyframes.push({ x: targetSlotX, y: 94 });

    // 3. Animación continua mediante interpolación fluida a 60 FPS
    const startTime = performance.now();
    const duration = 2800; // 2.8 segundos de trayecto fluido

    let lastPegSoundIdx = -1;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const tTotal = Math.min(1, elapsed / duration);

      // Calcular el segmento actual de keyframes
      const segmentCount = keyframes.length - 1;
      const rawIndex = tTotal * segmentCount;
      const currentSegment = Math.min(segmentCount - 1, Math.floor(rawIndex));
      const segmentProgress = rawIndex - currentSegment;

      // Suavizado suave (ease-in-out)
      const ease = segmentProgress < 0.5
        ? 2 * segmentProgress * segmentProgress
        : 1 - Math.pow(-2 * segmentProgress + 2, 2) / 2;

      const p0 = keyframes[currentSegment];
      const p1 = keyframes[currentSegment + 1];

      const currentX = p0.x + (p1.x - p0.x) * ease;
      const currentY = p0.y + (p1.y - p0.y) * ease;

      setBallPos({ x: currentX, y: currentY });

      // Detectar impacto sonoro y destello de clavija
      if (p0.pegId && currentSegment !== lastPegSoundIdx && segmentProgress > 0.4) {
        lastPegSoundIdx = currentSegment;
        setActivePegKey(p0.pegId);
        dropTimeoutsRef.current.push(setTimeout(() => setActivePegKey(null), 140));
        if (soundOn) {
          const pitch = 0.8 + (currentSegment / segmentCount) * 0.5;
          plinkoAudio.playPegBounce(pitch);
        }
      }

      if (tTotal < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Fin del trayecto: aterrizaje en la casilla
        setIsDropping(false);
        setActiveSlotIndex(chosenIdx);
        const prize = slots[chosenIdx];
        setWonSlot(prize);

        if (soundOn) plinkoAudio.playSlotWin();

        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.65 },
          colors: brandConfettiColors(["#dc2626", "#16a34a", "#ffffff"]),
        });

        dropTimeoutsRef.current.push(setTimeout(() => {
          setScreenState("won");
        }, 1200));
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
  };

  const handleClaim = () => {
    // En producción onWinPrize siempre está presente (lo pasa App.tsx).
    if (wonSlot && onWinPrize) {
      onWinPrize(wonSlot.name, wonSlot.value);
    }
  };

  return (
    <div className="w-full max-w-[390px] mx-auto select-none">
      {/* SELECTOR DISCRETO DE LAS DOS CARAS (Cara 1: Portada Cabaña / Cara 2: Tablero Clavijas) */}
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
          <span>🌲 Cara 1: Portada Cabaña</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFace("face2")}
          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeFace === "face2"
              ? "bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-md"
              : "text-white/70 hover:text-white"
          }`}
        >
          <span>🔴 Cara 2: Tablero Clavijas</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* CARA 1: PORTADA DE CABAÑA Y NIEVE (FOTO IZQUIERDA)             */}
      {/* ============================================================== */}
      {activeFace === "face1" && (
        <div className="relative w-full max-w-[390px] mx-auto min-h-[640px] rounded-[32px] overflow-hidden shadow-2xl flex flex-col justify-between text-white select-none border-4 border-[#2b292e]">
          {/* Fondo fotográfico nocturno de cabaña invernal */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#40080f] via-[#1a0508] to-[#0a0204] z-0" />

          {/* Guirnaldas y luces con botón de menú hamburguesa superior izquierdo */}
          <div className="relative z-10 w-full pt-4 px-4 flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-black/40 border border-white/20 flex items-center justify-center text-white/90 shadow-md">
              <Menu className="w-5 h-5" />
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.9)]">⭐</span>
              <span className="text-red-400">🔴</span>
              <span className="text-amber-200">🟡</span>
              <span className="text-red-400">🔴</span>
              <span className="text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.9)]">⭐</span>
            </div>

            <div className="w-9" />
          </div>

          {/* Cartel rústico de madera cubierto de nieve: "SUELTA LA BOLA Y GANA" */}
          <div className="relative z-10 my-auto px-5 text-center space-y-4">
            <div className="relative inline-block mx-auto max-w-[320px]">
              {/* Capa de nieve realista acumulada en el tejado */}
              <div className="absolute -top-3 left-3 right-3 h-4 bg-white rounded-full shadow-[0_2px_10px_rgba(255,255,255,0.9)] z-20 flex justify-around">
                <span className="w-4 h-4 bg-white rounded-full inline-block -mt-1" />
                <span className="w-5 h-5 bg-white rounded-full inline-block -mt-1.5" />
                <span className="w-4 h-4 bg-white rounded-full inline-block -mt-1" />
              </div>

              {/* Rótulo de madera tallada elegante */}
              <div className="bg-gradient-to-b from-[#6b2c15] via-[#4a1c0d] to-[#2c0e05] border-2 border-amber-500/80 rounded-2xl px-6 py-4 shadow-[0_10px_30px_rgba(0,0,0,0.85)] relative z-10">
                <h1 className="text-xl sm:text-2xl font-bold tracking-wide text-amber-100 font-['Epilogue'] leading-tight drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] uppercase">
                  SUELTA LA BOLA
                </h1>
                <div className="text-2xl sm:text-3xl font-extrabold tracking-wider text-amber-400 font-['Epilogue'] drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                  Y GANA
                </div>
                <div className="flex justify-center items-center gap-1 text-xs mt-1">
                  <span>🌿</span>
                  <span className="text-red-500">🍒</span>
                  <span>🌿</span>
                </div>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-amber-100/90 font-medium px-4 leading-relaxed drop-shadow-md">
              ¡Juega y descubre qué premio navideño te espera!
            </p>

            {/* Guía en 2 pasos ilustrada (idéntica a la imagen) */}
            <div className="bg-black/40 backdrop-blur-md border border-white/15 rounded-2xl p-4 flex items-center justify-around gap-2 text-xs max-w-[320px] mx-auto">
              <div className="flex flex-col items-center gap-1.5 flex-1">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-red-500 to-red-800 border-2 border-amber-300 shadow-[0_0_12px_rgba(239,68,68,0.8)] flex items-center justify-center text-sm">
                  🔴
                </div>
                <span className="text-[11px] font-semibold text-white leading-tight">
                  1) Suelta la bola
                </span>
              </div>

              <span className="text-amber-300 text-sm font-bold">➔</span>

              <div className="flex flex-col items-center gap-1.5 flex-1">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-600 to-emerald-900 border-2 border-amber-300 shadow-[0_0_12px_rgba(16,185,129,0.8)] flex items-center justify-center text-sm">
                  ✨
                </div>
                <span className="text-[11px] font-semibold text-white leading-tight">
                  2) Sigue el recorrido
                </span>
              </div>
            </div>

            {/* Botón JUGAR rojo navideño con nieve superior */}
            <div className="pt-2 max-w-[280px] mx-auto relative">
              <div className="absolute -top-2 left-6 right-6 h-3 bg-white/90 rounded-full shadow-sm z-20" />
              <button
                type="button"
                onClick={handleStartGame}
                className="w-full py-4 px-8 rounded-full bg-gradient-to-r from-[#dc2626] via-[#ef4444] to-[#dc2626] hover:brightness-110 active:scale-95 text-white font-bold text-sm tracking-wider uppercase border-2 border-amber-300 shadow-[0_4px_25px_rgba(220,38,38,0.6)] transition-all flex items-center justify-center gap-2 cursor-pointer relative z-10"
              >
                <span>JUGAR</span>
              </button>
            </div>
          </div>

          {/* Paisaje nevado inferior con farol y regalos */}
          <div className="relative z-10 w-full p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-end justify-between border-t border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-2xl drop-shadow-[0_0_10px_rgba(251,191,36,0.9)]">🏮</span>
              <div className="text-left text-[11px] text-amber-200/90 leading-tight">
                <p className="font-semibold text-white">{tableNumber}</p>
                <p>{participantName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xl">
              <span>🎁</span>
              <span>🦯</span>
              <span>🍪</span>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* CARA 2: TABLERO DE CLAVIJAS (FOTO DERECHA)                     */}
      {/* ============================================================== */}
      {activeFace === "face2" && (
        <div className="relative w-full max-w-[390px] mx-auto min-h-[640px] rounded-[32px] overflow-hidden shadow-2xl flex flex-col justify-between text-white select-none border-4 border-[#2b292e] bg-[#05140b]">
          {/* Marco perimetral de madera con guirnaldas, luces y dos faroles laterales */}
          <div className="relative z-10 w-full pt-2 px-3 flex items-center justify-between border-b border-red-900/50 pb-1.5">
            {/* Farol izquierdo iluminado */}
            <div className="flex items-center gap-1.5 text-xs text-amber-300">
              <span className="text-lg drop-shadow-[0_0_8px_rgba(251,191,36,1)]">🏮</span>
              <span className="font-semibold text-white">{tableNumber}</span>
            </div>

            {/* Campana central dorada con lazo */}
            <div className="flex items-center gap-1 text-sm">
              <span>🦯</span>
              <span className="text-base drop-shadow-[0_0_8px_rgba(251,191,36,0.9)]">🔔</span>
              <span>🦯</span>
            </div>

            {/* Farol derecho iluminado */}
            <div className="flex items-center gap-1.5">
              <span className="text-lg drop-shadow-[0_0_8px_rgba(251,191,36,1)]">🏮</span>
              <button
                type="button"
                onClick={() => setSoundOn(!soundOn)}
                className="w-7 h-7 rounded-full bg-red-950/60 border border-amber-400/40 text-amber-300 flex items-center justify-center transition-all cursor-pointer"
                title={soundOn ? "Silenciar sonido" : "Activar sonido"}
                aria-label={soundOn ? "Silenciar sonido" : "Activar sonido"}
              >
                {soundOn ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 opacity-50" />}
              </button>
            </div>
          </div>

          {/* Triángulo dorado apuntando hacia la esfera de salida */}
          <div className="relative z-10 flex justify-center pt-0.5 pb-0.5">
            <div className="flex flex-col items-center">
              <span className="text-amber-400 text-[10px] animate-bounce drop-shadow-[0_0_6px_rgba(251,191,36,1)]">▼</span>
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-red-500 to-red-800 border-2 border-amber-300 shadow-[0_0_10px_rgba(239,68,68,0.9)] flex items-center justify-center text-[10px]">
                ❄️
              </div>
            </div>
          </div>

          {/* ÁREA DEL TABLERO: FONDO VERDE OSCURO + BORDE DE NEÓN ROJO + CLAVIJAS DORADAS */}
          <div className="relative mx-3 flex-1 min-h-[390px] rounded-3xl bg-gradient-to-b from-[#061d10] via-[#04160c] to-[#020d07] border-2 border-[#ef4444] shadow-[0_0_20px_rgba(239,68,68,0.4)] overflow-hidden flex flex-col justify-between p-1.5">
            {/* Campo de clavijas doradas 3D */}
            <div className="relative w-full h-[295px]">
              {pegGrid.map((row, rIdx) =>
                row.map((x) => {
                  const pegKey = `peg-${rIdx}-${x}`;
                  const isHit = activePegKey === pegKey;
                  return (
                    <div
                      key={pegKey}
                      style={{
                        left: `${x}%`,
                        top: `${6 + rIdx * 7.8}%`,
                      }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full transition-transform duration-100 ${
                        isHit
                          ? "w-3.5 h-3.5 bg-white shadow-[0_0_16px_rgba(255,255,255,1)] scale-125 z-20"
                          : "w-2.5 h-2.5 bg-gradient-to-br from-amber-200 via-amber-400 to-yellow-600 border border-amber-100 shadow-[0_0_6px_rgba(251,191,36,0.7)]"
                      }`}
                    />
                  );
                })
              )}

              {/* BOLA ROJA EN MOVIMIENTO CONTINUO FLUIDO (60 FPS) */}
              {isDropping && (
                <div
                  style={{
                    left: `${ballPos.x}%`,
                    top: `${ballPos.y}%`,
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gradient-to-br from-red-400 via-red-600 to-red-900 border-2 border-amber-200 shadow-[0_0_18px_rgba(239,68,68,1)] flex items-center justify-center text-[9px] z-30 pointer-events-none"
                >
                  ❄️
                </div>
              )}

              {/* BOTÓN CENTRAL CIRCULAR DORADO: "SOLTAR LA BOLA" (IDÉNTICO A LA FOTO) */}
              {!isDropping && (
                <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-auto">
                  <button
                    type="button"
                    onClick={handleDropBall}
                    className="group relative w-24 h-24 sm:w-26 sm:h-26 rounded-full bg-gradient-to-b from-[#fef08a] via-[#f59e0b] to-[#b45309] hover:brightness-110 active:scale-95 border-3 border-amber-200 shadow-[0_0_30px_rgba(245,158,11,0.85)] text-[#2d1503] font-bold cursor-pointer flex flex-col items-center justify-center p-2 text-center transition-all animate-pulse"
                  >
                    <span className="text-[11px] sm:text-xs font-bold tracking-wide uppercase font-['Epilogue'] leading-tight">
                      SOLTAR<br />LA BOLA
                    </span>
                    <span className="text-xs mt-0.5">🌿🍒</span>
                  </button>
                </div>
              )}
            </div>

            {/* 7 CASILLAS INFERIORES CON SEPARADORES ROJOS DE NEÓN E ICONOS DE LA FOTO */}
            <div className="grid grid-cols-7 gap-0.5 pt-1 pb-1 border-t-2 border-red-500/80 bg-black/60 rounded-b-2xl">
              {slots.map((slot, idx) => {
                const isWinner = activeSlotIndex === idx;
                return (
                  <div
                    key={slot.id || `slot-${idx}`}
                    className={`flex flex-col items-center justify-center py-1.5 px-0.5 rounded-lg border-x border-red-600/50 text-center transition-all ${
                      isWinner
                        ? "bg-amber-400 text-black border-white shadow-[0_0_20px_rgba(251,191,36,1)] scale-110 -translate-y-1 z-20"
                        : "bg-[#091f12]/60 text-white"
                    }`}
                  >
                    <span className="text-lg drop-shadow-sm">{slot.icon}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Base con botón de altavoz rojo centrado y botón de voucher si ganó */}
          <div className="relative z-10 w-full p-2 pt-1 flex flex-col items-center gap-1.5">
            {screenState === "won" && wonSlot ? (
              <button
                type="button"
                onClick={handleClaim}
                className="w-full max-w-[320px] py-3 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:brightness-110 active:scale-98 text-white font-bold text-xs tracking-wider uppercase border-2 border-amber-300 shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all flex items-center justify-center gap-2 cursor-pointer animate-pulse"
              >
                <Trophy className="w-4 h-4 text-amber-300" />
                <span>RECLAMAR {wonSlot.name.toUpperCase()}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setSoundOn(!soundOn)}
                className="w-7 h-7 rounded-full bg-red-600 hover:bg-red-700 border border-white text-white flex items-center justify-center shadow-lg cursor-pointer transition-all"
                title={soundOn ? "Silenciar sonido" : "Activar sonido"}
                aria-label={soundOn ? "Silenciar sonido" : "Activar sonido"}
              >
                {soundOn ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>
            )}

            <div className="flex items-center gap-1.5 text-[10px] text-amber-200/80">
              <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
              <span>Válido hoy en caja para {tableNumber}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
