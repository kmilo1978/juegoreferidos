import { useState, useEffect, useRef } from "react";
import {
  JackpotSettings,
  DEFAULT_JACKPOT_SETTINGS,
  JACKPOT_THEMES,
  JackpotSymbol,
  jackpotAudio,
} from "@/lib/jackpotData";
import { Trophy, Volume2, VolumeX } from "lucide-react";
import confetti from "canvas-confetti";

interface StepJackpotGameProps {
  participantName?: string;
  tableNumber?: string;
  onWinPrize: (prizeName: string, prizeValue: string) => void;
  customSettings?: Partial<JackpotSettings>;
  isStandAlone?: boolean;
  initialFace?: "face1" | "face2";
}

export function StepJackpotGame({
  participantName = "Invitado VIP",
  tableNumber = "Mesa 1",
  onWinPrize,
  customSettings,
  initialFace = "face1",
}: StepJackpotGameProps) {
  const [settings] = useState<JackpotSettings>(() => ({
    ...DEFAULT_JACKPOT_SETTINGS,
    ...customSettings,
  }));

  const theme = JACKPOT_THEMES[settings.themeId] || JACKPOT_THEMES.travel_vip;

  // Cara activa: "face1" (Tragaperras en sala de salidas) o "face2" (Boarding Pass / Resultado de premio)
  const [activeFace, setActiveFace] = useState<"face1" | "face2">(initialFace);

  // Estados de juego dentro de la máquina: "idle" | "spinning" | "gameover"
  const [isSpinning, setIsSpinning] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState<number>(settings.maxAttempts);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(settings.soundEnabled);

  // Símbolos
  const jackpotSymbol = theme.symbols.find((s) => s.isJackpot) || theme.symbols[0];
  const otherSymbols = theme.symbols.filter((s) => !s.isJackpot);

  // Configuración de los 3 rodillos idéntica a la imagen de referencia:
  // Reel 1: Tren, Avión, Coche
  // Reel 2: Maleta, Avión, Bici
  // Reel 3: Bici, Avión, Tren
  const [reels, setReels] = useState<JackpotSymbol[][]>([
    [otherSymbols[1] || jackpotSymbol, jackpotSymbol, otherSymbols[2] || jackpotSymbol], // Tren, Avión, Coche
    [otherSymbols[0] || jackpotSymbol, jackpotSymbol, otherSymbols[3] || jackpotSymbol], // Maleta, Avión, Bici
    [otherSymbols[3] || jackpotSymbol, jackpotSymbol, otherSymbols[1] || jackpotSymbol], // Bici, Avión, Tren
  ]);

  const [spinningReels, setSpinningReels] = useState<boolean[]>([false, false, false]);
  const spinIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const spinAudioIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Todos los setTimeout de la secuencia de parada, para poder cancelarlos al desmontar
  const spinTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const handleSpin = () => {
    if (isSpinning || attemptsLeft <= 0) return;

    const newAttempts = attemptsLeft - 1;
    setAttemptsLeft(newAttempts);
    setIsSpinning(true);
    setSpinningReels([true, true, true]);

    // Sonido de giro
    spinAudioIntervalRef.current = setInterval(() => {
      if (soundEnabled) jackpotAudio.playReelSpinClick();
    }, 90);

    // Animación de rodillos girando
    spinIntervalRef.current = setInterval(() => {
      setReels(() => [
        [
          theme.symbols[Math.floor(Math.random() * theme.symbols.length)],
          theme.symbols[Math.floor(Math.random() * theme.symbols.length)],
          theme.symbols[Math.floor(Math.random() * theme.symbols.length)],
        ],
        [
          theme.symbols[Math.floor(Math.random() * theme.symbols.length)],
          theme.symbols[Math.floor(Math.random() * theme.symbols.length)],
          theme.symbols[Math.floor(Math.random() * theme.symbols.length)],
        ],
        [
          theme.symbols[Math.floor(Math.random() * theme.symbols.length)],
          theme.symbols[Math.floor(Math.random() * theme.symbols.length)],
          theme.symbols[Math.floor(Math.random() * theme.symbols.length)],
        ],
      ]);
    }, 60);

    // Secuencia de parada progresiva de los 3 rodillos
    spinTimeoutsRef.current.push(setTimeout(() => {
      setSpinningReels([false, true, true]);
      if (soundEnabled) jackpotAudio.playReelStop(0);
    }, 1100));

    spinTimeoutsRef.current.push(setTimeout(() => {
      setSpinningReels([false, false, true]);
      if (soundEnabled) jackpotAudio.playReelStop(1);
    }, 1700));

    spinTimeoutsRef.current.push(setTimeout(() => {
      if (spinIntervalRef.current) clearInterval(spinIntervalRef.current);
      if (spinAudioIntervalRef.current) clearInterval(spinAudioIntervalRef.current);
      setSpinningReels([false, false, false]);
      if (soundEnabled) jackpotAudio.playReelStop(2);

      // Decidir si esta tirada es ganadora
      const isWin = Math.random() * 100 < settings.winProbability || newAttempts === 0;

      if (isWin) {
        // Fijar exactamente 3 aviones alineados al centro (Idéntico a la foto derecha)
        setReels([
          [otherSymbols[1] || jackpotSymbol, jackpotSymbol, otherSymbols[2] || jackpotSymbol],
          [otherSymbols[0] || jackpotSymbol, jackpotSymbol, otherSymbols[3] || jackpotSymbol],
          [otherSymbols[3] || jackpotSymbol, jackpotSymbol, otherSymbols[1] || jackpotSymbol],
        ]);

        if (soundEnabled) jackpotAudio.playJackpotWin();
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#38bdf8", "#f59e0b", "#fbbf24", "#ffffff"],
        });

        // Transición fluida a la CARA 2 (Boarding Pass) tras festejar la combinación
        spinTimeoutsRef.current.push(setTimeout(() => {
          setIsSpinning(false);
          setActiveFace("face2");
        }, 1200));
      } else {
        setIsSpinning(false);
        if (soundEnabled) jackpotAudio.playMiss();
      }
    }, 2400));
  };

  // Limpieza de TODOS los timers al desmontar: intervalos de animación/audio y
  // los setTimeout de la secuencia de parada. Evita audio huérfano y setState
  // tras desmontaje si el comensal sale a mitad del giro.
  useEffect(() => {
    return () => {
      if (spinIntervalRef.current) clearInterval(spinIntervalRef.current);
      if (spinAudioIntervalRef.current) clearInterval(spinAudioIntervalRef.current);
      spinTimeoutsRef.current.forEach(clearTimeout);
      spinTimeoutsRef.current = [];
    };
  }, []);

  return (
    <div className="w-full max-w-[390px] mx-auto select-none">
      {/* SELECTOR DISCRETO DE LAS DOS CARAS (Cara 1: Tragaperras / Cara 2: Boarding Pass) */}
      <div className="flex items-center justify-between bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl p-1 mb-2">
        <button
          type="button"
          onClick={() => setActiveFace("face1")}
          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeFace === "face1"
              ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-md"
              : "text-white/70 hover:text-white"
          }`}
        >
          <span>🎰 Cara 1: Tragaperras</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFace("face2")}
          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeFace === "face2"
              ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md"
              : "text-white/70 hover:text-white"
          }`}
        >
          <span>✈️ Cara 2: Boarding Pass</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* CARA 1: MÁQUINA DE JACKPOT EN SALIDAS INTERNACIONALES (FOTO DERECHA) */}
      {/* ============================================================== */}
      {activeFace === "face1" && (
        <div className="relative rounded-[32px] overflow-hidden border-4 border-[#2b292e] shadow-2xl bg-gradient-to-b from-[#09152b] via-[#050c1b] to-[#02050b] text-white p-4 flex flex-col justify-between min-h-[640px]">
          {/* Fondo de terminal nocturna con silueta de avión despegando */}
          <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/30 via-transparent to-black pointer-events-none" />

          {/* Barra superior con avión volando en el cielo y botón menú hamburguesa azul */}
          <div className="relative z-10 w-full flex items-center justify-between pb-1">
            <div className="flex items-center gap-2">
              <span className="text-xl filter drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]">✈️</span>
              <span className="text-[11px] font-mono font-bold text-sky-300 tracking-wider">
                {tableNumber} · {participantName}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="w-7 h-7 rounded-full bg-black/40 border border-sky-400/30 text-sky-300 flex items-center justify-center transition-all cursor-pointer"
                title={soundEnabled ? "Silenciar sonido" : "Activar sonido"}
                aria-label={soundEnabled ? "Silenciar sonido" : "Activar sonido"}
              >
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 opacity-50" />}
              </button>

              <div
                className="w-8 h-8 rounded-xl bg-blue-600/80 border border-sky-300/40 flex items-center justify-center text-white shadow-md"
                aria-hidden="true"
              >
                <span className="text-sm font-bold">☰</span>
              </div>
            </div>
          </div>

          {/* Cartel de señalética de aeropuerto: Icono amarillo + SALIDAS INTERNACIONALES */}
          <div className="relative z-10 mx-auto my-1.5 bg-[#f59e0b] text-neutral-950 font-black px-3.5 py-1 rounded-xl shadow-lg border border-amber-200 flex items-center gap-2 max-w-[280px]">
            <div className="w-6 h-6 rounded-lg bg-black/90 flex items-center justify-center text-amber-400 text-xs">
              ✈️
            </div>
            <span className="text-[11px] sm:text-xs font-mono tracking-wider font-extrabold uppercase">
              SALIDAS INTERNACIONALES
            </span>
          </div>

          {/* Marquesina LED atornillada: ✖ JACKPOT ✖ con tipografía de matriz punteada */}
          <div className="relative z-10 my-1 py-1.5 px-4 bg-[#0a0f1d] border-2 border-slate-700 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.3)] flex items-center justify-center gap-3">
            <span className="text-sky-400 font-bold text-xs">✖</span>
            <h2 className="text-2xl sm:text-3xl font-mono font-black tracking-[0.25em] text-[#fbbf24] filter drop-shadow-[0_0_12px_rgba(251,191,36,0.9)]">
              JACKPOT
            </h2>
            <span className="text-sky-400 font-bold text-xs">✖</span>
          </div>

          {/* MÁQUINA TRAGAPERRAS DORADA CON 10 BOMBILLAS INCANDESCENTES PERIMETRALES */}
          <div className="relative z-10 my-2 p-2 sm:p-2.5 rounded-3xl bg-gradient-to-b from-[#fef08a] via-[#f59e0b] to-[#78350f] border-3 border-amber-200 shadow-[0_0_35px_rgba(245,158,11,0.5)]">
            {/* Fila superior de bombillas iluminadas */}
            <div className="flex justify-around pb-1.5 px-2">
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={`top-bulb-${i}`}
                  className="w-2.5 h-2.5 rounded-full bg-amber-100 border border-amber-300 shadow-[0_0_8px_rgba(254,240,138,1)] animate-pulse"
                />
              ))}
            </div>

            {/* CONTENEDOR DE LOS 3 RODILLOS DE CASINO */}
            <div className="relative bg-[#020617] rounded-2xl p-1.5 border-2 border-[#451a03] shadow-inner overflow-hidden">
              {/* Flechas indicadoras doradas de la línea central ganadora */}
              <div className="absolute left-0.5 top-1/2 -translate-y-1/2 text-sm text-[#fbbf24] z-20 animate-pulse">
                ▶
              </div>
              <div className="absolute right-0.5 top-1/2 -translate-y-1/2 text-sm text-[#fbbf24] z-20 animate-pulse">
                ◀
              </div>

              {/* Los 3 Rodillos */}
              <div className="grid grid-cols-3 gap-1.5">
                {[0, 1, 2].map((rIdx) => {
                  const items = reels[rIdx] || [jackpotSymbol, jackpotSymbol, jackpotSymbol];
                  const spinning = spinningReels[rIdx];

                  return (
                    <div
                      key={rIdx}
                      className="bg-gradient-to-b from-[#0f2347] via-[#071329] to-[#0f2347] rounded-xl border border-sky-800/60 p-1 flex flex-col items-center justify-between h-40 sm:h-44 shadow-inner"
                    >
                      {/* Símbolo Superior */}
                      <div className="opacity-40 scale-85 transition-all">
                        <span className="text-2xl filter drop-shadow">{items[0]?.emoji}</span>
                      </div>

                      {/* SÍMBOLO CENTRAL: PREMIO DE LÍNEA (FONDO DORADO PARA EL AVIÓN) */}
                      <div
                        className={`w-full py-2 rounded-lg flex items-center justify-center transition-all ${
                          spinning
                            ? "animate-pulse opacity-75"
                            : "bg-gradient-to-b from-[#fef08a] via-[#f59e0b] to-[#d97706] shadow-[0_0_15px_rgba(245,158,11,0.6)] border border-amber-100 scale-105"
                        }`}
                      >
                        <span className="text-3xl filter drop-shadow-md">
                          {items[1]?.isJackpot ? "✈️" : items[1]?.emoji}
                        </span>
                      </div>

                      {/* Símbolo Inferior */}
                      <div className="opacity-40 scale-85 transition-all">
                        <span className="text-2xl filter drop-shadow">{items[2]?.emoji}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Fila inferior de bombillas iluminadas */}
            <div className="flex justify-around pt-1.5 px-2">
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={`bot-bulb-${i}`}
                  className="w-2.5 h-2.5 rounded-full bg-amber-100 border border-amber-300 shadow-[0_0_8px_rgba(254,240,138,1)] animate-pulse"
                />
              ))}
            </div>
          </div>

          {/* Instrucción con avión dorado: CONSIGUE TRES AVIONES EN LÍNEA */}
          <div className="relative z-10 flex items-center justify-center gap-2 my-1 text-xs">
            <span className="w-8 h-[1px] bg-amber-400/50" />
            <span className="font-bold uppercase tracking-wider text-amber-300 font-['Epilogue'] text-[11px]">
              CONSIGUE TRES AVIONES EN LÍNEA
            </span>
            <span className="w-8 h-[1px] bg-amber-400/50" />
          </div>

          {/* BOTÓN CÁPSULA NEGRO CON BORDE DORADO: JUGAR */}
          <div className="relative z-10 my-1">
            <button
              type="button"
              onClick={handleSpin}
              disabled={isSpinning || attemptsLeft <= 0}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-b from-[#1e293b] via-[#0f172a] to-[#020617] hover:brightness-110 active:scale-98 border-2 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.4)] text-white font-extrabold text-sm uppercase tracking-widest cursor-pointer transition-all flex items-center justify-center gap-2"
            >
              <span>{isSpinning ? "GIRANDO..." : "JUGAR"}</span>
            </button>
          </div>

          {/* BASE: 5 AVIONCITOS DORADOS INDICADORES (IDÉNTICO A LA FOTO DERECHA) */}
          <div className="relative z-10 flex items-center justify-center gap-3 pt-1">
            {Array.from({ length: 5 }).map((_, idx) => (
              <span
                key={idx}
                className="text-base text-amber-400 filter drop-shadow-[0_0_6px_rgba(251,191,36,0.8)]"
              >
                ✈️
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* CARA 2: BOARDING PASS / BILLETE DE AVIÓN (FOTO IZQUIERDA)       */}
      {/* ============================================================== */}
      {activeFace === "face2" && (
        <div className="relative rounded-[32px] overflow-hidden border-4 border-[#2b292e] shadow-2xl bg-gradient-to-b from-[#0284c7] via-[#0369a1] to-[#082f49] text-white p-4 flex flex-col justify-between min-h-[640px]">
          {/* Cabecera: Gran avión blanco despegando majestuosamente hacia el cielo soleado */}
          <div className="relative z-10 pt-2 text-center space-y-1">
            <div className="relative inline-block mx-auto">
              <span className="text-6xl filter drop-shadow-[0_8px_20px_rgba(255,255,255,0.7)] animate-bounce inline-block">
                🛫
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white font-['Epilogue'] tracking-tight drop-shadow-md">
              ¡Enhorabuena!
            </h2>
            <div className="w-12 h-1 bg-amber-400 mx-auto rounded-full shadow-sm" />
            <p className="text-xs text-sky-100 font-medium">Este es tu premio:</p>
          </div>

          {/* TARJETA BOARDING PASS AZUL Y AMARILLA (IDÉNTICA A LA IMAGEN) */}
          <div className="relative z-10 my-auto rounded-3xl overflow-hidden shadow-2xl border-2 border-white/20 bg-gradient-to-b from-[#0284c7] to-[#0369a1]">
            {/* Pestaña superior amarilla: ✈ PREMIO */}
            <div className="bg-[#fbbf24] px-4 py-2 flex items-center gap-2 text-neutral-950 font-black">
              <span className="text-sm">✈</span>
              <span className="text-xs font-mono tracking-wider uppercase">PREMIO</span>
            </div>

            {/* Sección azul con Mapamundi y 2 Billetes de avión */}
            <div className="p-5 text-white relative space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-[#fef08a] font-['Epilogue'] drop-shadow-md">
                  2
                </span>
                <div className="text-left font-extrabold text-lg leading-tight uppercase tracking-tight text-white">
                  billetes<br />de avión
                </div>
              </div>

              {/* Silueta de avión volando con estela punteada */}
              <div className="flex items-center gap-2 text-xs text-sky-200/90 pt-1">
                <span>✈️</span>
                <span className="font-mono text-[11px] font-bold">Ruta Directa · Vuelo Especial</span>
              </div>
            </div>

            {/* LÍNEA DIVISORIA CON PERFORACIONES DE TICKET (CUPÓN DESPRENDIBLE) */}
            <div className="relative flex items-center justify-between px-2 bg-white text-slate-800">
              <div className="w-4 h-4 rounded-full bg-[#0369a1] -ml-4" />
              <div className="flex-1 border-t-2 border-dashed border-slate-300 mx-2" />
              <div className="w-4 h-4 rounded-full bg-[#0369a1] -mr-4" />
            </div>

            {/* Cupón inferior blanco con icono de ticket azul recortado */}
            <div className="bg-white p-4 text-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-md">
                🎫
              </div>
              <div className="text-left leading-tight">
                <p className="text-xs font-bold text-slate-900 font-['Epilogue']">
                  {settings.rewardPrizeName || "Dos billetes en clase turista para el destino que tú elijas."}
                </p>
                <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                  Válido para canjear en mostrador o caja · {tableNumber}
                </p>
              </div>
            </div>
          </div>

          {/* Botón Reclamar Voucher Oficial */}
          <div className="relative z-10 pt-2 space-y-2">
            <button
              type="button"
              onClick={() => onWinPrize(settings.rewardPrizeName, settings.rewardPrizeValue)}
              className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:brightness-110 active:scale-98 text-neutral-950 font-black text-xs uppercase tracking-wider shadow-[0_4px_20px_rgba(245,158,11,0.5)] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Trophy className="w-4 h-4 text-neutral-950" />
              <span>RECLAMAR MI BILLETE VIP</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFace("face1")}
              className="w-full py-2 text-center text-xs text-sky-200 hover:text-white font-medium cursor-pointer"
            >
              Volver a la máquina de juego ➔
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
