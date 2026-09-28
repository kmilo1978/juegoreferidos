import { useState, useRef, useEffect } from "react";
import confetti from "canvas-confetti";
import { SecondChanceConfig, WonPrize, GamePrize } from "./gameTypes";
import { useLanguage } from "@/context/LanguageContext";
import { Reveal } from "@/components/shared/Reveal";
import { Sparkles, Trophy, RotateCcw, CheckCircle2, ArrowRight } from "lucide-react";
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
  tableNumber = "Mesa 1",
  participantWhatsapp = "",
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
  const [differenceMs, setDifferenceMs] = useState<number | null>(null);

  const startTimeRef = useRef<number>(0);
  const timerRafRef = useRef<number | null>(null);

  // Obtener imagen del premio
  const prizeImage = secondChanceConfig.prizeImageUrl?.includes("tarta-vasca")
    ? tartaVascaImg
    : secondChanceConfig.prizeImageUrl || tartaVascaImg;

  // Altura de la foto según tamaño configurado en backend
  const imageHeightClass =
    secondChanceConfig.prizeImageSize === "small"
      ? "h-28 sm:h-32"
      : secondChanceConfig.prizeImageSize === "large"
      ? "h-60 sm:h-72"
      : "h-40 sm:h-48";

  // Limpiar timer si el componente se desmonta
  useEffect(() => {
    return () => {
      if (timerRafRef.current) cancelAnimationFrame(timerRafRef.current);
    };
  }, []);

  const handleStartTimer = () => {
    playTactileClickSound();
    setElapsedTime(0);
    setDifferenceMs(null);
    setGameState("running");
    setIsRunning(true);
    startTimeRef.current = performance.now();

    const loop = (currentTime: number) => {
      const elapsedSec = (currentTime - startTimeRef.current) / 1000;
      setElapsedTime(elapsedSec);

      // Límite de seguridad: 14 segundos
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

    const diffSeconds = Math.abs(finalElapsed - targetTime);
    const diffMs = Math.round(diffSeconds * 1000);
    setDifferenceMs(diffMs);

    const newAttempts = attemptsUsed + 1;
    setAttemptsUsed(newAttempts);

    // ¿Ganó el reto de precisión?
    if (diffMs <= toleranceMs) {
      // ¡VICTORIA!
      setGameState("won");
      playVictoryFanfareSound();

      // Confeti doble de celebración
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      setTimeout(() => {
        confetti({ particleCount: 100, spread: 100, origin: { y: 0.5 } });
      }, 300);

      // Notificar al padre para registrar premio de 2ª oportunidad
      const prizeObj: GamePrize = {
        id: `sc-${Date.now()}`,
        name: `🎁 2ª Oportunidad: ${secondChanceConfig.prizeName}`,
        nameEn: `🎁 2nd Chance: ${secondChanceConfig.prizeName}`,
        type: "free_item",
        value: secondChanceConfig.prizeName,
        probability: 100,
        color: "#10b981",
        textColor: "#ffffff",
        active: true,
        terms: "Válido con la captura de Estado de WhatsApp enviada. Canjeable en mesa o caja.",
        termsEn: "Valid with WhatsApp Status screenshot sent. Redeemable at table or cashier.",
      };

      onPrizeWon(prizeObj);
    } else {
      // Intento fallido
      playDefeatSound();
      if (newAttempts < maxAttempts) {
        setGameState("attempt_failed");
      } else {
        setGameState("finished");
      }
    }
  };

  const remainingAttempts = Math.max(0, maxAttempts - attemptsUsed);

  return (
    <div className="max-w-xl mx-auto py-4 sm:py-6">
      <Reveal>
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-800 text-xs font-bold tracking-wide">
            <Sparkles className="h-3.5 w-3.5 text-amber-600" />
            <span>{t("Reto de Precisión · 2ª Oportunidad", "Precision Challenge · 2nd Chance")}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-neutral-900 tracking-tight">
            {t("Frena exactamente en 10.000s", "Stop at exactly 10.000s")}
          </h2>

          <p className="text-xs sm:text-sm text-neutral-600 max-w-md mx-auto">
            {t(
              "¡Hola " + participantName + "! Presiona Iniciar y luego Frena cuando el cronómetro marque exactamente 10 segundos.",
              "Hello " + participantName + "! Press Start and Stop when the timer marks exactly 10 seconds."
            )}
          </p>
        </div>
      </Reveal>

      {/* TARJETA DEL PREMIO LIMPIA Y DESTACADA */}
      <Reveal delay={80}>
        <div className="rounded-3xl border-2 border-amber-500/30 bg-white shadow-lg overflow-hidden mb-6">
          {/* Foto del Premio con Altura Dinámica */}
          <div className={`w-full ${imageHeightClass} relative bg-neutral-900 overflow-hidden`}>
            <img
              src={prizeImage}
              alt={secondChanceConfig.prizeName}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = tartaVascaImg;
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-black/20" />

            {/* Badge de Intentos Flotante */}
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-neutral-900 text-[11px] font-bold px-3 py-1 rounded-full shadow-sm">
              <span>{t("Oportunidades:", "Attempts:")} </span>
              <strong className="text-amber-700">{remainingAttempts} {t("restantes", "left")}</strong>
            </div>

            {/* Título sobre la imagen */}
            <div className="absolute bottom-3 left-4 right-4 text-white">
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-300">
                {t("🏆 Tu Premio Si Ganas", "🏆 Your Prize If You Win")}
              </span>
              <h3 className="text-lg sm:text-xl font-serif font-bold drop-shadow-md">
                {secondChanceConfig.prizeName}
              </h3>
            </div>
          </div>

          <div className="p-4 sm:p-5 bg-neutral-50/50 flex items-center justify-between gap-3 text-xs border-t border-neutral-100">
            <p className="text-neutral-600 line-clamp-1">
              {secondChanceConfig.prizeDescription}
            </p>
            <span className="shrink-0 text-[10px] font-mono text-neutral-400">
              Margen: ±{toleranceMs}ms
            </span>
          </div>
        </div>
      </Reveal>

      {/* VISOR DEL CRONÓMETRO DIGITAL */}
      <Reveal delay={120}>
        <div className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-sm text-center space-y-6">
          {/* Display Digital con Glow Dorado */}
          <div className="relative py-6 px-4 rounded-3xl bg-neutral-950 border border-neutral-800 shadow-inner">
            <div className="text-[10px] font-mono uppercase tracking-widest text-amber-400/80 mb-1">
              OBJETIVO: 10.000s
            </div>

            <div className="font-mono text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-wider text-amber-400 drop-shadow-[0_0_20px_rgba(245,158,11,0.4)]">
              {elapsedTime.toFixed(3)}
              <span className="text-xl sm:text-2xl text-amber-400/60 ml-1">s</span>
            </div>

            {/* Barra de progreso visual hacia 10s */}
            <div className="w-full h-1.5 bg-neutral-800 rounded-full mt-4 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-75"
                style={{ width: `${Math.min(100, (elapsedTime / targetTime) * 100)}%` }}
              />
            </div>
          </div>

          {/* Mensajes de Feedback por Intento */}
          {gameState === "attempt_failed" && differenceMs !== null && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 text-center animate-fade-in space-y-1">
              <p className="text-xs font-bold text-amber-900">
                {t(
                  `¡Muy cerca! Estuviste a solo ${differenceMs} milisegundos.`,
                  `So close! You were just ${differenceMs} milliseconds away.`
                )}
              </p>
              <p className="text-[11px] text-amber-700">
                {t(
                  `Te quedan ${remainingAttempts} intento(s). ¡Concéntrate y prueba de nuevo!`,
                  `You have ${remainingAttempts} attempt(s) left. Focus and try again!`
                )}
              </p>
            </div>
          )}

          {/* Estado VICTORIA */}
          {gameState === "won" && (
            <div className="p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-500/40 text-center animate-fade-in space-y-2">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white shadow-md mx-auto">
                <Trophy className="h-6 w-6" />
              </div>
              <h4 className="text-lg font-serif font-bold text-emerald-950">
                {t("¡FELICITACIONES, GANASTE!", "CONGRATULATIONS, YOU WON!")}
              </h4>
              <p className="text-xs text-emerald-800">
                {t(
                  `Frenaste en ${elapsedTime.toFixed(3)}s (diferencia de solo ${differenceMs}ms). ¡El ${secondChanceConfig.prizeName} es tuyo!`,
                  `You stopped at ${elapsedTime.toFixed(3)}s (only ${differenceMs}ms diff). The ${secondChanceConfig.prizeName} is yours!`
                )}
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onExit}
                  className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer"
                >
                  <span>{t("Ver Mi Cupón Ganador ➔", "View My Winning Voucher ➔")}</span>
                </button>
              </div>
            </div>
          )}

          {/* Estado DERROTA (agotó todos los intentos) */}
          {gameState === "finished" && (
            <div className="p-5 rounded-2xl bg-neutral-100 border border-neutral-200 text-center animate-fade-in space-y-2">
              <p className="text-sm font-bold text-neutral-800">
                {t("¡Gran esfuerzo!", "Great effort!")}
              </p>
              <p className="text-xs text-neutral-600 leading-relaxed max-w-sm mx-auto">
                {t(
                  `Estuviste muy cerca de los 10.000s exactos. En tu próxima visita en ${clientConfig.brand.name} tendrás una nueva oportunidad de ganar.`,
                  `You were very close to 10.000s. On your next visit to ${clientConfig.brand.name} you'll have a new chance to win.`
                )}
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onExit}
                  className="w-full py-3 px-6 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  <span>{t("Finalizar y Volver ➔", "Finish and Return ➔")}</span>
                </button>
              </div>
            </div>
          )}

          {/* Botón Principal de Acción */}
          {gameState !== "won" && gameState !== "finished" && (
            <div className="pt-2">
              {!isRunning ? (
                <button
                  type="button"
                  onClick={handleStartTimer}
                  className="w-full py-5 px-8 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-serif font-bold text-lg tracking-wide shadow-xl hover:shadow-2xl transition-all cursor-pointer active:scale-[0.98]"
                >
                  <span>{attemptsUsed === 0 ? t("▶ INICIAR RETO", "▶ START CHALLENGE") : t("🔄 REINTENTAR RETO", "🔄 RETRY CHALLENGE")}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleStopTimer()}
                  className="w-full py-6 px-8 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-serif font-bold text-xl tracking-wider shadow-2xl transition-all cursor-pointer animate-pulse active:scale-95"
                >
                  <span>⏹ ¡FRENAR AHORA!</span>
                </button>
              )}
            </div>
          )}
        </div>
      </Reveal>
    </div>
  );
}
