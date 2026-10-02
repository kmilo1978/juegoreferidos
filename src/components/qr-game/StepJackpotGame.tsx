import { useState, useEffect, useRef } from "react";
import {
  JackpotSettings,
  DEFAULT_JACKPOT_SETTINGS,
  JACKPOT_THEMES,
  JackpotSymbol,
  jackpotAudio,
} from "@/lib/jackpotData";
import { Sparkles, Trophy, RotateCcw, Volume2, VolumeX, ArrowRight, Plane } from "lucide-react";
import confetti from "canvas-confetti";

interface StepJackpotGameProps {
  participantName?: string;
  tableNumber?: string;
  onWinPrize: (prizeName: string, prizeValue: string) => void;
  customSettings?: Partial<JackpotSettings>;
  isStandAlone?: boolean;
}

export function StepJackpotGame({
  participantName = "Invitado",
  tableNumber = "Mesa 1",
  onWinPrize,
  customSettings,
  isStandAlone = false,
}: StepJackpotGameProps) {
  const [settings] = useState<JackpotSettings>(() => ({
    ...DEFAULT_JACKPOT_SETTINGS,
    ...customSettings,
  }));

  const theme = JACKPOT_THEMES[settings.themeId] || JACKPOT_THEMES.travel_vip;

  // Estados: "idle" | "spinning" | "won" | "gameover"
  const [gameState, setGameState] = useState<"idle" | "spinning" | "won" | "gameover">("idle");
  const [attemptsLeft, setAttemptsLeft] = useState<number>(settings.maxAttempts);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(settings.soundEnabled);

  // Rodillos: cada uno muestra 3 posiciones [arriba, centro, abajo]
  const jackpotSymbol = theme.symbols.find((s) => s.isJackpot) || theme.symbols[0];
  const otherSymbols = theme.symbols.filter((s) => !s.isJackpot);

  const [reels, setReels] = useState<JackpotSymbol[][]>([
    [otherSymbols[0] || jackpotSymbol, jackpotSymbol, otherSymbols[1] || jackpotSymbol],
    [otherSymbols[1] || jackpotSymbol, jackpotSymbol, otherSymbols[2] || jackpotSymbol],
    [otherSymbols[2] || jackpotSymbol, jackpotSymbol, otherSymbols[0] || jackpotSymbol],
  ]);

  const [spinningReels, setSpinningReels] = useState<boolean[]>([false, false, false]);
  const spinIntervalRef = useRef<any>(null);

  const handleSpin = () => {
    if (gameState === "spinning" || attemptsLeft <= 0) return;

    const newAttempts = attemptsLeft - 1;
    setAttemptsLeft(newAttempts);
    setGameState("spinning");
    setSpinningReels([true, true, true]);

    // Decidir si esta tirada es ganadora (según winProbability o si es el último intento)
    const isWin = Math.random() * 100 < settings.winProbability || (newAttempts === 0 && Math.random() > 0.3);

    // Sonido de giro de rodillos
    let spinAudioInterval = setInterval(() => {
      if (soundEnabled) jackpotAudio.playReelSpinClick();
    }, 90);

    // Animación de rotación rápida de símbolos
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

    // Secuencia de parada progresiva de los 3 rodillos (Reel 1 a los 1.2s, Reel 2 a los 1.9s, Reel 3 a los 2.7s)
    setTimeout(() => {
      setSpinningReels([false, true, true]);
      if (soundEnabled) jackpotAudio.playReelStop(0);
    }, 1200);

    setTimeout(() => {
      setSpinningReels([false, false, true]);
      if (soundEnabled) jackpotAudio.playReelStop(1);
    }, 1900);

    setTimeout(() => {
      clearInterval(spinIntervalRef.current);
      clearInterval(spinAudioInterval);
      setSpinningReels([false, false, false]);
      if (soundEnabled) jackpotAudio.playReelStop(2);

      if (isWin) {
        // Fijar exactamente 3 símbolos de Jackpot en la línea central
        setReels([
          [otherSymbols[0] || jackpotSymbol, jackpotSymbol, otherSymbols[1] || jackpotSymbol],
          [otherSymbols[1] || jackpotSymbol, jackpotSymbol, otherSymbols[2] || jackpotSymbol],
          [otherSymbols[2] || jackpotSymbol, jackpotSymbol, otherSymbols[0] || jackpotSymbol],
        ]);

        setTimeout(() => {
          setGameState("won");
          if (soundEnabled) jackpotAudio.playJackpotWin();
          confetti({
            particleCount: 100,
            spread: 90,
            origin: { y: 0.6 },
            colors: ["#f59e0b", "#fbbf24", "#38bdf8", "#ffffff"],
          });
        }, 500);
      } else {
        // Combinación no ganadora
        const nonWinReel3 = otherSymbols[Math.floor(Math.random() * otherSymbols.length)] || theme.symbols[1];
        setReels([
          [otherSymbols[0], jackpotSymbol, otherSymbols[1]],
          [otherSymbols[1], jackpotSymbol, otherSymbols[2]],
          [jackpotSymbol, nonWinReel3, otherSymbols[0]], // Rompe la línea central
        ]);

        if (newAttempts <= 0) {
          setTimeout(() => {
            setGameState("gameover");
            if (soundEnabled) jackpotAudio.playMiss();
          }, 600);
        } else {
          setGameState("idle");
          if (soundEnabled) jackpotAudio.playMiss();
        }
      }
    }, 2700);
  };

  useEffect(() => {
    return () => {
      if (spinIntervalRef.current) clearInterval(spinIntervalRef.current);
    };
  }, []);

  return (
    <div className="w-full max-w-md mx-auto">
      {/* ============================================================ */}
      {/* 1. PANTALLA PRINCIPAL: MÁQUINA DE JACKPOT                    */}
      {/* ============================================================ */}
      {(gameState === "idle" || gameState === "spinning") && (
        <div className="relative rounded-3xl overflow-hidden border border-[#363439] shadow-2xl bg-gradient-to-b from-[#0a0f1d] via-[#091322] to-[#040810] text-center p-4 sm:p-5 flex flex-col items-center justify-between min-h-[640px]">
          {/* Top Bar: Aeropuerto / Cartel de Salidas */}
          <div className="w-full bg-[#1e293b]/90 border border-[#334155] rounded-xl px-3 py-1.5 flex items-center justify-between shadow-md mb-2">
            <span className="text-[11px] font-mono font-black text-[#fbbf24] tracking-wider uppercase flex items-center gap-1.5">
              <span>{theme.topHeader}</span>
            </span>
            {/* Audio Toggle */}
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="text-[#94a3b8] hover:text-white p-1 cursor-pointer"
              title={soundEnabled ? "Silenciar" : "Activar sonido"}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-[#38bdf8]" /> : <VolumeX className="w-4 h-4 opacity-50" />}
            </button>
          </div>

          {/* Marquesina LED Digital: ✖ JACKPOT ✖ */}
          <div className="w-full py-2.5 px-4 bg-[#020617] border-2 border-[#1e293b] rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.25)] flex items-center justify-center gap-3">
            <span className="text-[#f59e0b] animate-pulse">✖</span>
            <h2 className="text-2xl sm:text-3xl font-black font-mono tracking-[0.2em] text-[#fbbf24] filter drop-shadow-[0_0_12px_rgba(251,191,36,0.9)]">
              {theme.marqueeText}
            </h2>
            <span className="text-[#f59e0b] animate-pulse">✖</span>
          </div>

          {/* MÁQUINA TRAGAPERRAS DORADA CON BOMBILLAS ILUMINADAS */}
          <div className="relative my-3 w-full p-3 sm:p-4 rounded-3xl bg-gradient-to-b from-[#fef08a] via-[#f59e0b] to-[#78350f] shadow-[0_0_35px_rgba(245,158,11,0.45)] border-2 border-[#fef08a]">
            {/* Fila de Bombillas Animadas (Marco Superior) */}
            <div className="flex justify-between px-2 pb-2">
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2.5 h-2.5 rounded-full border border-yellow-200 shadow-md ${
                    i % 2 === 0 ? "bg-[#fffbeb] shadow-[0_0_6px_#fff]" : "bg-[#f59e0b] animate-ping"
                  }`}
                />
              ))}
            </div>

            {/* CONTENEDOR DE LOS 3 RODILLOS GIRATORIOS */}
            <div className="relative bg-[#090d16] rounded-2xl p-2 border-2 border-[#451a03] shadow-inner overflow-hidden">
              {/* Flechas indicadoras de la línea central de pago */}
              <div className="absolute left-1 top-1/2 -translate-y-1/2 text-lg text-[#fbbf24] z-20 filter drop-shadow animate-pulse">
                ▶
              </div>
              <div className="absolute right-1 top-1/2 -translate-y-1/2 text-lg text-[#fbbf24] z-20 filter drop-shadow animate-pulse">
                ◀
              </div>

              {/* Línea horizontal tenue que marca el premio central */}
              <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-[2px] bg-gradient-to-r from-transparent via-[#fbbf24]/50 to-transparent pointer-events-none z-10" />

              <div className="grid grid-cols-3 gap-2">
                {[0, 1, 2].map((reelIdx) => {
                  const isSpinning = spinningReels[reelIdx];
                  const reelItems = reels[reelIdx] || [jackpotSymbol, jackpotSymbol, jackpotSymbol];

                  return (
                    <div
                      key={reelIdx}
                      className="bg-gradient-to-b from-[#1e293b] via-[#0f172a] to-[#1e293b] rounded-xl border border-[#334155] p-1 flex flex-col items-center justify-between h-44 sm:h-48 shadow-inner overflow-hidden"
                    >
                      {/* Símbolo Superior */}
                      <div className="opacity-35 scale-80 filter blur-[0.3px] transition-all">
                        <span className="text-3xl filter drop-shadow">{reelItems[0]?.emoji}</span>
                      </div>

                      {/* SÍMBOLO CENTRAL (LÍNEA DE PREMIO GANADOR) */}
                      <div
                        className={`w-full py-2.5 rounded-lg bg-gradient-to-b from-[#fef08a]/20 via-[#f59e0b]/25 to-[#fef08a]/20 border border-[#fbbf24]/40 flex items-center justify-center transition-all ${
                          isSpinning ? "animate-pulse scale-95 opacity-80" : "scale-105 shadow-[0_0_15px_rgba(251,191,36,0.3)]"
                        }`}
                      >
                        <span className="text-4xl filter drop-shadow-md">{reelItems[1]?.emoji}</span>
                      </div>

                      {/* Símbolo Inferior */}
                      <div className="opacity-35 scale-80 filter blur-[0.3px] transition-all">
                        <span className="text-3xl filter drop-shadow">{reelItems[2]?.emoji}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Fila de Bombillas (Marco Inferior) */}
            <div className="flex justify-between px-2 pt-2">
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2.5 h-2.5 rounded-full border border-yellow-200 shadow-md ${
                    i % 2 !== 0 ? "bg-[#fffbeb] shadow-[0_0_6px_#fff]" : "bg-[#f59e0b] animate-ping"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Instrucción del Reto */}
          <div className="space-y-1 mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#fbbf24] block">
              {theme.targetInstruction}
            </span>
          </div>

          {/* BOTÓN LUMINOSO JUGAR */}
          <div className="w-full space-y-3">
            <button
              type="button"
              onClick={handleSpin}
              disabled={gameState === "spinning" || attemptsLeft <= 0}
              className={`w-full py-4 px-6 rounded-full font-black text-base uppercase tracking-widest transition-all duration-200 transform shadow-xl cursor-pointer flex items-center justify-center gap-2 border-2 ${
                gameState === "spinning"
                  ? "bg-[#334155] text-[#94a3b8] border-[#475569] cursor-not-allowed scale-98"
                  : "bg-gradient-to-r from-[#f59e0b] via-[#fbbf24] to-[#f59e0b] text-[#121115] border-[#fef08a] hover:scale-102 active:scale-98 shadow-[0_8px_30px_rgba(245,158,11,0.5)]"
              }`}
            >
              <Sparkles className="w-5 h-5" />
              <span>{gameState === "spinning" ? "GIRANDO RODILLOS..." : "JUGAR"}</span>
            </button>

            {/* INDICADOR DE VIDAS / INTENTOS RESTANTES (Estilo 5 aviones de la foto) */}
            <div className="flex items-center justify-center gap-3 pt-1">
              {Array.from({ length: settings.maxAttempts }).map((_, idx) => {
                const isAvailable = idx < attemptsLeft;
                return (
                  <span
                    key={idx}
                    className={`text-xl transition-all ${
                      isAvailable
                        ? "text-[#fbbf24] filter drop-shadow-[0_0_8px_rgba(251,191,36,0.8)] scale-110"
                        : "text-[#334155] opacity-30"
                    }`}
                  >
                    ✈️
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. PANTALLA DE VICTORIA: BOARDING PASS / BILLETE DE PREMIO    */}
      {/* ============================================================ */}
      {gameState === "won" && (
        <div className="rounded-3xl border border-[#38bdf8]/50 bg-gradient-to-b from-[#0c2445] via-[#091a32] to-[#040e1c] p-6 text-center shadow-2xl space-y-5 animate-scale-up">
          {/* Avión en Vuelo */}
          <div className="flex flex-col items-center">
            <span className="text-6xl animate-bounce filter drop-shadow-[0_8px_20px_rgba(56,189,248,0.5)]">
              ✈️
            </span>
            <h3 className="text-2xl font-black text-white font-['Epilogue'] tracking-tight mt-2">
              ¡Enhorabuena, {participantName}!
            </h3>
            <p className="text-xs text-[#94a3b8]">Este es tu premio ganado en la máquina de Jackpot:</p>
          </div>

          {/* BILLETE / BOARDING PASS VIP DORADO Y AZUL (Fiel a la foto) */}
          <div className="relative rounded-2xl bg-gradient-to-r from-[#0284c7] via-[#0369a1] to-[#075985] p-1 border-2 border-[#38bdf8] shadow-2xl overflow-hidden text-left">
            <div className="bg-[#0f172a] rounded-[14px] p-4 text-white space-y-3 relative">
              {/* Cabecera del Billete */}
              <div className="flex items-center justify-between border-b border-[#334155] pb-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#38bdf8] font-bold">
                  BOARDING PASS · VOUCHER VIP
                </span>
                <span className="text-xs font-mono font-bold text-[#fbbf24] bg-[#fbbf24]/15 px-2 py-0.5 rounded">
                  {tableNumber}
                </span>
              </div>

              {/* Nombre del Premio Destacado */}
              <div className="space-y-1">
                <span className="text-[11px] text-[#94a3b8] font-bold uppercase block">✈ PREMIO:</span>
                <h4 className="text-xl font-black text-[#fbbf24] tracking-tight">
                  {settings.rewardPrizeName}
                </h4>
                <p className="text-xs text-[#38bdf8] font-mono font-bold">
                  Valoración: {settings.rewardPrizeValue}
                </p>
              </div>

              <div className="pt-2 border-t border-[#334155] flex items-center justify-between text-[11px] text-[#94a3b8]">
                <span>Válido para canjear en caja</span>
                <span className="text-[#fbbf24] font-bold font-mono">100% CONFIRMADO</span>
              </div>
            </div>
          </div>

          {/* Botón Reclamar */}
          <button
            type="button"
            onClick={() => onWinPrize(settings.rewardPrizeName, settings.rewardPrizeValue)}
            className="w-full py-4 px-6 rounded-full text-[#121115] bg-[#fbbf24] font-black text-sm uppercase tracking-wider hover:brightness-105 active:scale-98 shadow-xl cursor-pointer flex items-center justify-center gap-2"
          >
            <Trophy className="w-5 h-5" />
            <span>Emitir mi Voucher Oficial</span>
          </button>
        </div>
      )}

      {/* ============================================================ */}
      {/* 3. PANTALLA DE REINTENTO / INTENTOS AGOTADOS                  */}
      {/* ============================================================ */}
      {gameState === "gameover" && (
        <div className="rounded-3xl border border-[#363439] bg-[#0d131f] p-6 text-center shadow-2xl space-y-5 animate-scale-up">
          <div className="text-5xl">🎰</div>

          <div className="space-y-2">
            <h3 className="text-xl font-black text-white font-['Epilogue']">
              ¡Casi logras la combinación!
            </h3>
            <p className="text-xs text-[#94a3b8] max-w-xs mx-auto">
              Se han agotado los {settings.maxAttempts} intentos en la máquina de Jackpot. ¡Puedes recargar y probar de nuevo!
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setAttemptsLeft(settings.maxAttempts);
              setGameState("idle");
            }}
            className="w-full py-3.5 px-6 rounded-full text-[#121115] bg-[#fbbf24] font-black text-xs uppercase tracking-wider hover:brightness-105 active:scale-98 cursor-pointer flex items-center justify-center gap-2 shadow-lg"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Volver a Intentar</span>
          </button>
        </div>
      )}
    </div>
  );
}
