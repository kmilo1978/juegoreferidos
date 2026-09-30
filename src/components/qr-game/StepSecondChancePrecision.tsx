import { useState, useRef, useEffect } from "react";
import confetti from "canvas-confetti";
import { SecondChanceConfig, GamePrize } from "./gameTypes";
import { useLanguage } from "@/context/LanguageContext";
import { Reveal } from "@/components/shared/Reveal";
import { Sparkles, Trophy, RotateCcw, ArrowRight, Play, Square, History } from "lucide-react";
import { playVictoryFanfareSound, playDefeatSound, playTactileClickSound } from "@/lib/soundEffects";
import tartaVascaImg from "@/assets/tarta-vasca.jpg";
import { clientConfig } from "@/config/clientConfig";

interface StepSecondChancePrecisionProps {
  secondChanceConfig: SecondChanceConfig;
  participantName?: string;
  tableNumber?: string;
  participantWhatsapp?: string;
  onPrizeWon: (prize: GamePrize) => void;
  onExit: () => void;
}

export function StepSecondChancePrecision({
  secondChanceConfig,
  participantName = "Invitado",
  onPrizeWon,
  onExit,
}: StepSecondChancePrecisionProps) {
  const { t } = useLanguage();

  const maxAttempts = secondChanceConfig.maxAttempts || 3;
  const toleranceMs = secondChanceConfig.toleranceMs || 40;
  const targetTime = 10.0;

  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [attemptsUsed, setAttemptsUsed] = useState(0);
  const [gameState, setGameState] = useState<"idle" | "running" | "attempt_failed" | "won" | "finished">("idle");
  const [attemptsHistory, setAttemptsHistory] = useState<number[]>([]);

  const startTimeRef = useRef<number>(0);
  const timerRafRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRafRef.current) cancelAnimationFrame(timerRafRef.current);
    };
  }, []);

  const handleStartTimer = () => {
    playTactileClickSound();
    setElapsedTime(0);
    setGameState("running");
    setIsRunning(true);
    startTimeRef.current = performance.now();

    const loop = (currentTime: number) => {
      const elapsedSec = (currentTime - startTimeRef.current) / 1000;
      setElapsedTime(elapsedSec);

      if (elapsedSec >= 14.0) {
        handleStopTimer(14.0);
        return;
      }
      timerRafRef.current = requestAnimationFrame(loop);
    };

    timerRafRef.current = requestAnimationFrame(loop);
  };

  const handleStopTimer = (forcedElapsed?: number) => {
    if (!isRunning && !forcedElapsed) return;
    playTactileClickSound();

    if (timerRafRef.current) {
      cancelAnimationFrame(timerRafRef.current);
      timerRafRef.current = null;
    }
    setIsRunning(false);

    const finalElapsed = forcedElapsed ?? (performance.now() - startTimeRef.current) / 1000;
    setElapsedTime(finalElapsed);

    const currentAttempts = attemptsUsed + 1;
    setAttemptsUsed(currentAttempts);
    setAttemptsHistory((prev) => [finalElapsed, ...prev]);

    const diffSeconds = Math.abs(finalElapsed - targetTime);
    const diffMs = Math.round(diffSeconds * 1000);

    if (diffMs <= toleranceMs) {
      setGameState("won");
      playVictoryFanfareSound();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#f2be71", "#ffdcb1", "#10b981", "#ffffff"],
      });
      onPrizeWon({
        id: "second-chance-precision-reward",
        name: secondChanceConfig.prizeName || "Postre de Autor Especial",
        nameEn: "Chef Signature Dessert",
        value: 18000,
        probability: 1,
        color: "#f2be71",
        textColor: "#141317",
        active: true,
      });
    } else {
      if (currentAttempts >= maxAttempts) {
        setGameState("finished");
        playDefeatSound();
      } else {
        setGameState("attempt_failed");
        playDefeatSound();
      }
    }
  };

  const formatSecondsMain = (sec: number) => {
    const s = Math.floor(sec);
    return s.toString().padStart(2, "0");
  };

  const formatMs = (sec: number) => {
    const ms = Math.floor((sec % 1) * 100);
    return "." + ms.toString().padStart(2, "0");
  };

  return (
    <div className="w-full flex flex-col gap-6">

      {/* Tarjeta de Premio en Juego */}
      <Reveal delay={50}>
        <div className="relative w-full rounded-2xl bg-[#1c1b1f] border border-[#2b292e] p-3.5 flex gap-3.5 items-center shadow-xl overflow-hidden">
          <div className="relative w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-[#0f0e12] border border-[#363439]">
            <img
              src={tartaVascaImg}
              alt="Premio en Juego"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1 mb-0.5">
              <span className="font-label-sm text-[10px] text-[#f2be71] uppercase font-bold tracking-wider">
                {t("Premio en juego", "Prize in play")}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#684400]/60 text-[#ffddb1] font-label-sm text-[10px] font-bold">
                {t("Cortesía de la Casa", "Complimentary")}
              </span>
            </div>
            <h2 className="font-headline-sm text-sm text-[#e6e1e7] font-bold truncate">
              {secondChanceConfig.prizeName || "Postre de Autor o Cóctel"}
            </h2>
            <p className="font-body-sm text-xs text-[#ccc3d8] truncate">
              {t("Válido de inmediato si clavas 10.00s", "Valid instantly if you hit 10.00s")}
            </p>
          </div>
        </div>
      </Reveal>

      {/* Consola Digital OLED de Milisegundos estilo Stitch */}
      <Reveal delay={100}>
        <div className="flex flex-col items-center gap-4">
          {/* Badge de Objetivo Exacto e Intentos */}
          <div className="w-full rounded-2xl bg-[#1c1b1f] border border-[#2b292e] px-4 py-2.5 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#684400]/40 flex items-center justify-center text-[#f2be71]">
                🎯
              </div>
              <div className="flex flex-col">
                <span className="font-label-sm text-[10px] text-[#f2be71] font-bold uppercase tracking-wider">
                  {t("Objetivo Exacto: 10.00s", "Exact Target: 10.00s")}
                </span>
                <span className="font-body-sm text-[11px] text-[#ccc3d8]">
                  {t(`Margen ganador: ±${toleranceMs}ms`, `Win margin: ±${toleranceMs}ms`)}
                </span>
              </div>
            </div>

            {/* Contador de orbes de intentos */}
            <div className="flex flex-col items-end">
              <span className="font-label-sm text-[10px] text-[#ccc3d8] uppercase font-semibold">
                {t("Intentos", "Attempts")}
              </span>
              <div className="flex items-center gap-1.5 mt-1">
                {[1, 2, 3].map((idx) => (
                  <span
                    key={idx}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      idx <= maxAttempts - attemptsUsed
                        ? "bg-[#f2be71] shadow-[0_0_8px_rgba(242,190,113,0.8)]"
                        : "bg-[#2b292e]"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Consola Digital OLED */}
          <div className="w-full rounded-2xl bg-[#0f0e12] border border-[#2b292e] p-6 flex flex-col items-center justify-center shadow-inner relative overflow-hidden">
            <div className="flex items-center gap-1.5 mb-2 z-10">
              <span className={`w-2 h-2 rounded-full ${isRunning ? "bg-[#10b981] animate-ping" : "bg-[#f2be71]"}`} />
              <span className="font-label-sm text-[10px] text-[#f2be71] tracking-widest uppercase font-bold">
                {isRunning ? t("CRONÓMETRO CORRIENDO...", "RUNNING...") : t("LISTO PARA EL TOQUE", "READY TO TAP")}
              </span>
            </div>

            {/* Dígitos Gigantes Monospace LCD */}
            <div className="relative z-10 flex items-baseline font-mono tracking-tight my-1">
              <span className="text-5xl sm:text-6xl font-black text-white font-mono drop-shadow-[0_0_12px_rgba(255,255,255,0.2)]">
                {formatSecondsMain(elapsedTime)}
              </span>
              <span className="text-3xl sm:text-4xl font-black text-[#d1bcff] font-mono ml-0.5 drop-shadow-[0_0_12px_rgba(209,188,255,0.4)]">
                {formatMs(elapsedTime)}
              </span>
            </div>

            <p className="text-xs text-[#ccc3d8] mt-1 z-10">
              {t("Toca para iniciar • Vuelve a tocar para frenar en 10.00s", "Tap to start • Tap again to stop at 10.00s")}
            </p>
          </div>

          {/* Gran Botón Táctil de Empuje con Radar Circular estilo Stitch */}
          <div className="relative my-4 flex items-center justify-center">
            {isRunning && (
              <div className="absolute w-44 h-44 rounded-full bg-[#10b981]/20 animate-ping pointer-events-none opacity-40" />
            )}

            <button
              type="button"
              onClick={isRunning ? () => handleStopTimer() : handleStartTimer}
              disabled={gameState === "won" || gameState === "finished"}
              className={`relative z-20 w-36 h-36 rounded-full flex flex-col items-center justify-center p-3 active:scale-95 transition-all cursor-pointer shadow-2xl ${
                isRunning
                  ? "bg-gradient-to-b from-[#e11d48] to-[#9f1239] text-white shadow-[0_12px_32px_rgba(225,29,72,0.45)]"
                  : "bg-gradient-to-b from-[#10b981] to-[#047857] text-white shadow-[0_12px_32px_rgba(16,185,129,0.45)]"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isRunning ? (
                <>
                  <Square className="h-8 w-8 mb-1 fill-white" />
                  <span className="font-label-lg text-xs font-bold uppercase tracking-wider">
                    {t("DETENER", "STOP")}
                  </span>
                </>
              ) : (
                <>
                  <Play className="h-8 w-8 mb-1 fill-white ml-1" />
                  <span className="font-label-lg text-xs font-bold uppercase tracking-wider text-center leading-tight">
                    {gameState === "attempt_failed" ? t("OTRO INTENTO", "TRY AGAIN") : t("INICIAR RETO", "START CHALLENGE")}
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Mensajes de Resultado */}
          {gameState === "won" && (
            <div className="w-full rounded-2xl bg-[#684400]/40 border border-[#f2be71] p-4 flex items-start gap-3 shadow-md animate-in zoom-in-95">
              <Trophy className="h-6 w-6 text-[#f2be71] shrink-0 mt-0.5" />
              <div className="flex flex-col text-left">
                <span className="font-headline-sm text-sm font-bold text-[#ffddb1]">
                  {t("¡PREMIO CONSEGUIDO!", "PRIZE WON!")}
                </span>
                <p className="font-body-sm text-xs text-[#e6e1e7] mt-0.5">
                  {t(
                    `¡Marcaste ${elapsedTime.toFixed(2)}s! Distancia menor a ${toleranceMs}ms. El mesero aplicará tu premio.`,
                    `You hit ${elapsedTime.toFixed(2)}s! Winner range achieved.`
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Historial de Intentos */}
          {attemptsHistory.length > 0 && (
            <div className="w-full rounded-xl bg-[#1c1b1f] border border-[#2b292e] px-4 py-2 flex items-center justify-between text-xs text-[#ccc3d8]">
              <div className="flex items-center gap-1.5">
                <History className="h-3.5 w-3.5 text-[#f2be71]" />
                <span>
                  {t("Última marca:", "Last mark:")}{" "}
                  <strong className="text-[#e6e1e7] font-mono">{attemptsHistory[0]?.toFixed(2)}s</strong>
                </span>
              </div>
              <span className="text-[#f2be71] font-semibold">
                {t(`Quedan ${Math.max(0, maxAttempts - attemptsUsed)} intentos`, `${Math.max(0, maxAttempts - attemptsUsed)} attempts left`)}
              </span>
            </div>
          )}

          {/* Botón hacia Misiones VIP (Paso 7) */}
          <div className="w-full pt-2">
            <button
              type="button"
              onClick={onExit}
              className="w-full h-13 py-3 px-6 rounded-full btn-gold text-sm flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(242,190,113,0.35)] active:scale-98 transition-all cursor-pointer hover:brightness-105"
            >
              <span>{t("Continuar a Fidelización & Sellos (Paso 7)", "Continue to Loyalty & Stamps (Step 7)")}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
