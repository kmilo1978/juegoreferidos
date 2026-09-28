import { useState, useRef, useEffect } from "react";
import { GamePrize } from "./gameTypes";
import { useLanguage } from "@/context/LanguageContext";
import { Reveal } from "@/components/shared/Reveal";
import confetti from "canvas-confetti";
import { Timer, Trophy, ArrowRight, RotateCcw, Sparkles, Target, Zap } from "lucide-react";
import { playVictoryFanfareSound } from "@/lib/soundEffects";
import { GameConfigService, DIFFICULTY_SETTINGS } from "@/lib/gameConfigService";
import emblemaDorado from "@/assets/emblema-dorado.png";

interface StepPrecisionTimerProps {
  prizes: GamePrize[];
  participantName: string;
  onPrizeWon: (prize: GamePrize) => void;
  onSwitchToRoulette?: () => void;
}

export function StepPrecisionTimer({
  prizes,
  participantName,
  onPrizeWon,
  onSwitchToRoulette,
}: StepPrecisionTimerProps) {
  const { t } = useLanguage();
  const config = GameConfigService.getGameConfig();
  const maxAttempts = config.maxAttempts || 3;
  const toleranceMs = config.toleranceMs || 40;
  const targetTimeMs = 10000; // 10.000 segundos

  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [lastResult, setLastResult] = useState<{
    timeMs: number;
    diffMs: number;
    isWinner: boolean;
    isClose: boolean;
  } | null>(null);
  const [awardedPrize, setAwardedPrize] = useState<GamePrize | null>(null);
  const [gameFinished, setGameFinished] = useState(false);

  const requestRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // Active prizes sorted from best to standard
  const activePrizes = prizes.filter((p) => p.active);
  const topPrize = activePrizes[0] || prizes[0];
  const secondPrize = activePrizes[1] || activePrizes[0] || prizes[0];
  const consolationPrize = activePrizes[2] || activePrizes[0] || prizes[0];

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const milliseconds = Math.floor(ms % 1000);
    return {
      sec: totalSeconds.toString().padStart(2, "0"),
      ms: milliseconds.toString().padStart(3, "0"),
    };
  };

  const updateTimer = (time: number) => {
    if (!startTimeRef.current) startTimeRef.current = time;
    const progress = time - startTimeRef.current;
    setTimer(progress);
    requestRef.current = requestAnimationFrame(updateTimer);
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#a27e2c", "#d1b374", "#ffffff", "#1e1b18"],
      });
      playVictoryFanfareSound();
    } catch {
      // Audio or canvas silent fallback
    }
  };

  const handleStartStop = () => {
    if (!isRunning) {
      // INICIAR CRONÓMETRO
      startTimeRef.current = 0;
      setTimer(0);
      setIsRunning(true);
      setLastResult(null);
      requestRef.current = requestAnimationFrame(updateTimer);
    } else {
      // DETENER CRONÓMETRO
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      setIsRunning(false);

      const finalMs = timer;
      const diffMs = finalMs - targetTimeMs; // negativo si se detuvo antes, positivo si después
      const absDiff = Math.abs(diffMs);
      const isWinner = absDiff <= toleranceMs;
      const isClose = !isWinner && absDiff <= toleranceMs * 2.5;

      const currentAttempt = attemptCount + 1;
      setAttemptCount(currentAttempt);

      const result = {
        timeMs: finalMs,
        diffMs,
        isWinner,
        isClose,
      };
      setLastResult(result);

      if (isWinner) {
        // GANADOR TOTAL
        setAwardedPrize(topPrize);
        setGameFinished(true);
        triggerConfetti();
      } else if (currentAttempt >= maxAttempts) {
        // SE AGOTARON LOS INTENTOS: Entregar premio de consolación/cortesía
        const chosen = isClose ? secondPrize : consolationPrize;
        setAwardedPrize(chosen);
        setGameFinished(true);
        triggerConfetti();
      }
    }
  };

  const handleClaim = () => {
    if (awardedPrize) {
      onPrizeWon(awardedPrize);
    }
  };

  useEffect(() => {
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  const timeParts = formatTime(timer);
  const diffInSeconds = lastResult ? (lastResult.diffMs / 1000).toFixed(3) : "0.000";
  const diffSign = lastResult && lastResult.diffMs > 0 ? "+" : "";

  return (
    <Reveal>
      <div className="flex flex-col items-center max-w-xl mx-auto">
        {/* Cabecera del desafío */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 text-xs font-semibold mb-2">
            <Timer className="h-3.5 w-3.5" />
            <span>{t("Desafío Gourmet en Mesa", "Table Gourmet Challenge")}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-neutral-900 tracking-tight">
            {t("Reto de Precisión 10 Segundos", "10-Second Precision Challenge")}
          </h2>
          <p className="text-sm text-neutral-600 mt-1 max-w-md mx-auto">
            {t(
              "¡Hola, " + participantName + "! Pulsa el botón y detenlo exactamente en ",
              "Hello, " + participantName + "! Tap the button and stop it exactly at "
            )}
            <strong className="text-amber-800 font-mono">10.000s</strong>
            {t(" para ganar el premio mayor de la casa.", " to win the grand prize.")}
          </p>

          <div className="flex items-center justify-center gap-2 mt-2 text-xs font-mono text-neutral-500">
            <Target className="h-3.5 w-3.5 text-amber-600" />
            <span>
              {t("Tolerancia", "Tolerance")}: ±{(toleranceMs / 1000).toFixed(3)}s ({((targetTimeMs - toleranceMs) / 1000).toFixed(3)}s a {((targetTimeMs + toleranceMs) / 1000).toFixed(3)}s)
            </span>
          </div>
        </div>

        {/* Display Central del Cronómetro */}
        <div className="w-full bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-neutral-100 flex flex-col items-center relative overflow-hidden">
          {/* Fondo sutil */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Intentos restantes */}
          <div className="flex items-center justify-between w-full mb-6 pb-4 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-mono tracking-wider text-neutral-500 font-semibold">
                {t("Intentos:", "Attempts:")}
              </span>
              <div className="flex items-center gap-1.5">
                {Array.from({ length: maxAttempts }).map((_, i) => (
                  <span
                    key={i}
                    className={`h-3 w-3 rounded-full transition-all duration-300 ${
                      i < attemptCount
                        ? "bg-neutral-300 ring-2 ring-neutral-200"
                        : "bg-amber-500 ring-2 ring-amber-300 animate-pulse"
                    }`}
                  />
                ))}
              </div>
            </div>

            <span className="text-xs font-mono font-medium text-neutral-600">
              {maxAttempts - attemptCount} {t("disponibles", "left")}
            </span>
          </div>

          {/* Números del Cronómetro de Alta Precisión */}
          <div className="my-4 text-center">
            <div className="text-6xl sm:text-7xl font-mono font-bold tracking-tight text-neutral-900 drop-shadow-sm select-none">
              <span>{timeParts.sec}</span>
              <span className="text-amber-600">.</span>
              <span className="text-amber-700">{timeParts.ms}</span>
              <span className="text-2xl text-neutral-400 ml-1 font-light">s</span>
            </div>
            <div className="text-xs uppercase font-mono tracking-widest text-neutral-400 mt-2 font-semibold">
              {isRunning
                ? t("¡MIDE EL MOMENTO Y TOCA PARA DETENER!", "TIME IT AND TAP TO STOP!")
                : t("CRONÓMETRO DE PRECISIÓN MILIMÉTRICA", "HIGH PRECISION STOPWATCH")}
            </div>
          </div>

          {/* Gran Botón Táctil de Lujo */}
          {!gameFinished && (
            <div className="my-6 relative group">
              <div
                className={`absolute -inset-4 rounded-full blur-xl transition-all duration-300 ${
                  isRunning
                    ? "bg-amber-500/40 animate-pulse scale-110"
                    : "bg-amber-400/20 group-hover:bg-amber-500/30"
                }`}
              />

              <button
                type="button"
                onClick={handleStartStop}
                className={`relative w-44 h-44 sm:w-48 sm:h-48 rounded-full flex flex-col items-center justify-center transition-all duration-100 shadow-2xl active:scale-95 border-4 border-white ${
                  isRunning
                    ? "bg-gradient-to-br from-red-600 to-amber-700 text-white shadow-red-500/40"
                    : "bg-gradient-to-br from-[#d1b374] via-[#a27e2c] to-[#8c6b22] text-white shadow-amber-900/30 hover:scale-105"
                }`}
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="text-lg sm:text-xl font-bold tracking-widest uppercase font-mono">
                    {isRunning ? t("DETENER", "STOP") : t("PULSAR", "START")}
                  </span>
                  <span className="text-[11px] opacity-80 uppercase tracking-widest font-mono">
                    {isRunning ? "10.000s" : "Iniciar"}
                  </span>
                  {isRunning ? (
                    <Zap className="h-6 w-6 mt-1 animate-bounce" />
                  ) : (
                    <Timer className="h-6 w-6 mt-1 opacity-90" />
                  )}
                </div>
              </button>
            </div>
          )}

          {/* Tarjeta de Resultado tras el Intento */}
          {lastResult && !gameFinished && (
            <div
              className={`w-full p-4 rounded-2xl border text-center transition-all animate-in fade-in-50 duration-300 ${
                lastResult.isClose
                  ? "bg-amber-50 border-amber-200 text-amber-900"
                  : "bg-neutral-50 border-neutral-200 text-neutral-800"
              }`}
            >
              <div className="text-sm font-semibold flex items-center justify-center gap-1.5 mb-1">
                {lastResult.isClose ? (
                  <>
                    <Sparkles className="h-4 w-4 text-amber-600" />
                    <span>{t("¡Uyyy! ¡Casi lo logras!", "So close!")}</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="h-4 w-4 text-neutral-500" />
                    <span>{t("Resultado del intento", "Attempt result")}</span>
                  </>
                )}
              </div>
              <p className="text-xs">
                {t("Detuviste en ", "Stopped at ")}
                <strong className="font-mono">{(lastResult.timeMs / 1000).toFixed(3)}s</strong> (
                <span className="font-mono text-amber-700 font-bold">
                  {diffSign}
                  {diffInSeconds}s
                </span>{" "}
                {t("del objetivo", "from target")}).
              </p>
              {attemptCount < maxAttempts && (
                <p className="text-xs font-medium text-amber-800 mt-2">
                  {t(
                    `¡Tienes ${maxAttempts - attemptCount} intento(s) más! Vuelve a pulsar para superar tu marca.`,
                    `You have ${maxAttempts - attemptCount} attempt(s) left! Tap again.`
                  )}
                </p>
              )}
            </div>
          )}

          {/* Celebración y Recompensa Final */}
          {gameFinished && awardedPrize && (
            <div className="w-full bg-gradient-to-br from-amber-50 via-white to-amber-100/60 border border-amber-300/80 rounded-2xl p-6 text-center animate-in zoom-in-95 duration-500 shadow-lg">
              <div className="inline-flex p-3 rounded-full bg-amber-500/20 text-amber-800 mb-3">
                <Trophy className="h-8 w-8" />
              </div>

              <div className="text-xs uppercase font-mono tracking-widest text-amber-700 font-bold mb-1">
                {lastResult?.isWinner
                  ? t("¡VICTORIA PERFECTA!", "PERFECT PRECISION!")
                  : t("¡GRAN PARTICIPACIÓN EN MESA!", "GREAT ATTEMPT!")}
              </div>

              <h3 className="text-xl sm:text-2xl font-serif font-bold text-neutral-900 mb-2">
                {awardedPrize.name}
              </h3>

              <p className="text-xs text-neutral-600 max-w-sm mx-auto mb-4">
                {lastResult?.isWinner
                  ? t(
                      "¡Lograste la hazaña de detener el cronómetro en el rango exacto! Aquí tienes tu premio exclusivo.",
                      "You nailed the exact tolerance range! Here is your exclusive reward."
                    )
                  : t(
                      "Por tu entusiasmo y precisión en la mesa, la casa te entrega este beneficio de cortesía.",
                      "For your great spirit and effort, the house awards you this complimentary treat."
                    )}
              </p>

              <button
                type="button"
                onClick={handleClaim}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-800 text-white font-semibold text-sm shadow-md hover:from-amber-700 hover:to-amber-900 flex items-center justify-center gap-2 mx-auto transition-transform active:scale-95"
              >
                <span>{t("Ver mi Cupón Dorado y Canjear", "View Golden Voucher & Redeem")}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Alternativa para cambiar a Ruleta si el modo es Híbrido */}
          {onSwitchToRoulette && !isRunning && !gameFinished && (
            <div className="mt-6 pt-4 border-t border-neutral-100 text-center w-full">
              <button
                type="button"
                onClick={onSwitchToRoulette}
                className="text-xs text-neutral-500 hover:text-amber-700 transition-colors inline-flex items-center gap-1.5"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>
                  {t(
                    "¿Prefieres girar la Ruleta de la Fortuna en vez de medir tu tiempo? Toca aquí",
                    "Prefer to spin the Roulette Wheel instead? Click here"
                  )}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </Reveal>
  );
}
