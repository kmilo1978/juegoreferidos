import { useState, useRef, useEffect } from "react";
import confetti from "canvas-confetti";
import { SecondChanceConfig, GamePrize } from "./gameTypes";
import { useLanguage } from "@/context/LanguageContext";
import { Reveal } from "@/components/shared/Reveal";
import { Sparkles, Trophy, RotateCcw, ArrowRight, Play, Square, History, Lock, CheckCircle2 } from "lucide-react";
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

  const isGameCompleted = gameState === "won" || gameState === "finished" || attemptsUsed >= maxAttempts;

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
        type: "special_experience",
        value: "18000",
        probability: 1,
        color: "#f2be71",
        textColor: "#141317",
        active: true,
        terms: "Válido solo hoy",
        termsEn: "Valid only today",
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

      {/* 1. HERO CARD DEL PREMIO CON MÁXIMO PROTAGONISMO */}
      <Reveal delay={30}>
        <div className="relative w-full rounded-3xl overflow-hidden bg-[#1c1b1f] border border-[var(--gold)]/35 shadow-2xl">
          {/* Fotografía Gastronómica Principal - Altura e Impacto */}
          <div className="relative w-full h-52 sm:h-64 overflow-hidden bg-[#0a090c]">
            <img
              src={tartaVascaImg}
              alt={secondChanceConfig.prizeName || "Postre de Autor"}
              className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
            />
            {/* Gradiente oscuro sutil para garantizar contraste y elegancia gastronómica */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#1c1b1f] via-[#1c1b1f]/30 to-black/25" />

            {/* Badge Flotante Superior: Cortesía de la Casa */}
            <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#141317]/90 backdrop-blur-md border border-[var(--gold)]/50 text-[var(--gold)] shadow-xl">
              <Sparkles className="h-4 w-4 text-[var(--gold)]" />
              <span className="font-label-sm text-[11px] sm:text-xs font-black uppercase tracking-wider">
                {t("Premio en Juego · Cortesía", "Prize in Play · Compliments")}
              </span>
            </div>

            {/* Badge de Hito / Reto */}
            <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-[#684400]/90 backdrop-blur-md border border-[var(--gold)]/50 text-[#ffdcb1] font-mono text-xs font-bold shadow-lg">
              🎯 10.00s
            </div>
          </div>

          {/* Información del Premio - Espaciosa y Limpia */}
          <div className="p-5 sm:p-6 flex flex-col gap-2">
            <h2 className="font-headline-sm text-xl sm:text-2xl font-bold text-[#fcfaf7] tracking-tight">
              {secondChanceConfig.prizeName || "Postre Artesanal de Autor Gratis"}
            </h2>
            <p className="font-body-sm text-xs sm:text-sm text-[#ccc3d8] leading-relaxed">
              {t(
                "¡Tu segunda oportunidad en sala! Si clavas el cronómetro exactamente en 10.00 segundos, nuestro equipo te sirve este postre de inmediato para disfrutar en tu mesa.",
                "Your second chance at the table! Stop the timer at exactly 10.00 seconds and this signature dessert is served directly to your table."
              )}
            </p>
          </div>
        </div>
      </Reveal>

      {/* 2. CONSOLA DE PRECISIÓN Y RETO TÁCTIL */}
      <Reveal delay={80}>
        <div className="flex flex-col items-center gap-5">
          {/* Badge de Objetivo Exacto e Intentos */}
          <div className="w-full rounded-2xl bg-[#1c1b1f] border border-[#363439] p-4 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#684400]/50 border border-[var(--gold)]/30 flex items-center justify-center text-lg text-[var(--gold)] shadow-xs">
                🎯
              </div>
              <div className="flex flex-col">
                <span className="font-label-sm text-xs text-[var(--gold)] font-bold uppercase tracking-wider">
                  {t("Objetivo Exacto: 10.00s", "Exact Target: 10.00s")}
                </span>
                <span className="font-body-sm text-[11px] text-[#ccc3d8]">
                  {t(`Margen ganador: ±${toleranceMs}ms`, `Win margin: ±${toleranceMs}ms`)}
                </span>
              </div>
            </div>

            {/* Contador de orbes de intentos en Dorado */}
            <div className="flex flex-col items-end">
              <span className="font-label-sm text-[10px] text-[#ccc3d8] uppercase font-bold tracking-wider">
                {t("Intentos", "Attempts")}
              </span>
              <div className="flex items-center gap-2 mt-1.5">
                {[1, 2, 3].map((idx) => (
                  <span
                    key={idx}
                    className={`w-3 h-3 rounded-full transition-all ${
                      idx <= maxAttempts - attemptsUsed
                        ? "bg-[var(--gold)] shadow-[0_0_10px_rgba(242,190,113,0.85)] scale-110"
                        : "bg-[#2b292e] border border-[#363439]"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Consola Digital OLED estilo Alta Relojería */}
          <div className="w-full rounded-3xl bg-[#0a090c] border border-[var(--gold)]/30 p-6 sm:p-7 flex flex-col items-center justify-center shadow-[inset_0_2px_12px_rgba(0,0,0,0.8)] relative overflow-hidden">
            <div className="flex items-center gap-2 mb-2 z-10">
              <span className={`w-2.5 h-2.5 rounded-full ${isRunning ? "bg-[var(--gold)] animate-ping" : "bg-[var(--gold)]"}`} />
              <span className="font-label-sm text-xs text-[#ffdcb1] tracking-widest uppercase font-bold">
                {isRunning ? t("CRONÓMETRO CORRIENDO...", "RUNNING...") : t("LISTO PARA EL TOQUE", "READY TO TAP")}
              </span>
            </div>

            {/* Dígitos Gigantes: Segundos en Blanco Luminoso y Centésimas en Oro Puro */}
            <div className="relative z-10 flex items-baseline font-mono tracking-tight my-2">
              <span className="text-6xl sm:text-7xl font-black text-white font-mono drop-shadow-[0_0_20px_rgba(255,255,255,0.35)]">
                {formatSecondsMain(elapsedTime)}
              </span>
              <span className="text-4xl sm:text-5xl font-black text-[var(--gold)] font-mono ml-0.5 drop-shadow-[0_0_20px_rgba(242,190,113,0.6)]">
                {formatMs(elapsedTime)}
              </span>
            </div>

            <p className="text-xs text-[#ccc3d8] mt-1 z-10 text-center">
              {t("Toca el botón para iniciar • Toca de nuevo para frenar en 10.00s", "Tap to start • Tap again to stop at 10.00s")}
            </p>
          </div>

          {/* Botón Táctil de Empuje en Oro Radiante de la Casa */}
          <div className="relative my-4 flex items-center justify-center">
            {isRunning && (
              <div className="absolute w-48 h-48 rounded-full bg-[var(--gold)]/25 animate-ping pointer-events-none opacity-50" />
            )}

            <button
              type="button"
              onClick={isRunning ? () => handleStopTimer() : handleStartTimer}
              disabled={gameState === "won" || gameState === "finished"}
              className={`relative z-20 w-40 h-40 rounded-full flex flex-col items-center justify-center p-3 active:scale-95 transition-all cursor-pointer shadow-2xl ${
                isRunning
                  ? "bg-gradient-to-b from-[#ff8c42] via-[#e65100] to-[#991b1b] text-white shadow-[0_12px_40px_rgba(230,81,0,0.55)] border-2 border-[#ffedd5]/50 animate-pulse"
                  : "bg-gradient-to-b from-[#ffe5b4] via-[var(--gold)] to-[#b87e24] text-[#121115] shadow-[0_12px_40px_rgba(242,190,113,0.5)] border-2 border-[#fff2df]/60 hover:brightness-105"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isRunning ? (
                <>
                  <Square className="h-9 w-9 mb-1.5 fill-white text-white" />
                  <span className="font-label-lg text-xs font-black uppercase tracking-wider">
                    {t("¡DETENER YA!", "STOP NOW!")}
                  </span>
                </>
              ) : gameState === "won" ? (
                <>
                  <Trophy className="h-9 w-9 mb-1.5 fill-[#121115] text-[#121115]" />
                  <span className="font-label-lg text-xs font-black uppercase tracking-wider text-center leading-tight text-[#121115]">
                    {t("¡GANASTE!", "YOU WON!")}
                  </span>
                </>
              ) : gameState === "finished" ? (
                <>
                  <CheckCircle2 className="h-9 w-9 mb-1.5 text-[#121115]" />
                  <span className="font-label-lg text-xs font-black uppercase tracking-wider text-center leading-tight text-[#121115]">
                    {t("RETO FINALIZADO", "COMPLETED")}
                  </span>
                </>
              ) : (
                <>
                  <Play className="h-9 w-9 mb-1.5 fill-[#121115] text-[#121115] ml-1" />
                  <span className="font-label-lg text-xs font-black uppercase tracking-wider text-center leading-tight text-[#121115]">
                    {gameState === "attempt_failed" ? t("OTRO INTENTO", "TRY AGAIN") : t("INICIAR RETO", "START CHALLENGE")}
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Mensajes de Resultado si Gana */}
          {gameState === "won" && (
            <div className="w-full rounded-2xl bg-[#684400]/40 border-2 border-[var(--gold)] p-4 flex items-start gap-3 shadow-xl animate-in zoom-in-95">
              <Trophy className="h-7 w-7 text-[var(--gold)] shrink-0 mt-0.5" />
              <div className="flex flex-col text-left">
                <span className="font-headline-sm text-base font-bold text-[#ffdcb1]">
                  {t("¡PREMIO CONSEGUIDO!", "PRIZE WON!")}
                </span>
                <p className="font-body-sm text-xs text-[#e6e1e7] mt-0.5 leading-relaxed">
                  {t(
                    `¡Marcaste ${elapsedTime.toFixed(2)}s! Distancia menor a ${toleranceMs}ms. El mesero aplicará tu cortesía de inmediato en mesa.`,
                    `You hit ${elapsedTime.toFixed(2)}s! Winner range achieved. Your server will apply it now.`
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Mensaje de Resultado si Agota Intentos */}
          {gameState === "finished" && (
            <div className="w-full rounded-2xl bg-[#1c1b1f] border border-[var(--gold)]/40 p-4 flex items-start gap-3 shadow-md animate-in zoom-in-95">
              <Sparkles className="h-6 w-6 text-[var(--gold)] shrink-0 mt-0.5" />
              <div className="flex flex-col text-left">
                <span className="font-headline-sm text-sm font-bold text-[#ffdcb1]">
                  {t("¡Completaste tus 3 intentos!", "You completed your 3 attempts!")}
                </span>
                <p className="font-body-sm text-xs text-[#ccc3d8] mt-0.5 leading-relaxed">
                  {t(
                    "¡Estuviste muy cerca! Ahora continúa al Paso 7 para descubrir tu Tarjeta de 15 Sellos VIP.",
                    "Great effort! Now continue to Step 7 to discover your 15 VIP Stamps Card."
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Historial de Intentos */}
          {attemptsHistory.length > 0 && (
            <div className="w-full rounded-2xl bg-[#1c1b1f] border border-[#363439] px-4 py-3 flex items-center justify-between text-xs text-[#ccc3d8] shadow-sm">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-[var(--gold)]" />
                <span>
                  {t("Última marca:", "Last mark:")}{" "}
                  <strong className="text-[#fcfaf7] font-mono text-sm">{attemptsHistory[0]?.toFixed(2)}s</strong>
                </span>
              </div>
              <span className="text-[var(--gold)] font-bold text-xs">
                {t(`Quedan ${Math.max(0, maxAttempts - attemptsUsed)} intentos`, `${Math.max(0, maxAttempts - attemptsUsed)} attempts left`)}
              </span>
            </div>
          )}

          {/* Botón de Salida hacia Tarjeta de 15 Sellos (Paso 7) */}
          <div className="w-full pt-4 pb-2">
            {(() => {
              const hasPlayed = attemptsUsed > 0 || gameState === "won" || gameState === "finished";
              const canProceed = hasPlayed && !isRunning;

              return (
                <button
                  type="button"
                  onClick={canProceed ? onExit : undefined}
                  disabled={!canProceed}
                  className={`w-full h-14 py-3 px-6 rounded-2xl text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                    !canProceed
                      ? "bg-[#1c1b1f] border border-[#363439] text-[#737373] opacity-60 cursor-not-allowed"
                      : "btn-gold shadow-[0_6px_24px_rgba(242,190,113,0.35)] cursor-pointer active:scale-98 hover:brightness-105"
                  }`}
                >
                  {isRunning ? (
                    <>
                      <Lock className="h-4 w-4 text-[#737373]" />
                      <span>{t("Cronómetro en marcha...", "Timer running...")}</span>
                    </>
                  ) : !hasPlayed ? (
                    <>
                      <Lock className="h-4 w-4 text-[#737373]" />
                      <span>{t("Juega 1 intento para Desbloquear Paso 7", "Play 1 attempt to Unlock Step 7")}</span>
                    </>
                  ) : gameState === "won" ? (
                    <>
                      <Trophy className="h-4 w-4 text-[#121115]" />
                      <span>{t("¡Premio Conseguido! Continuar al Paso 7", "Prize Won! Continue to Step 7")}</span>
                      <ArrowRight className="h-4 w-4 text-[#121115]" />
                    </>
                  ) : (
                    <>
                      <span>{t("Continuar a Tarjeta de 15 Sellos (Paso 7)", "Continue to 15 Stamps Card (Step 7)")}</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              );
            })()}
          </div>
        </div>
      </Reveal>
    </div>
  );
}
