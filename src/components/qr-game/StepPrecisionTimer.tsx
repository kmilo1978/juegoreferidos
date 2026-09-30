import { useState, useRef, useEffect } from "react";
import { GamePrize } from "./gameTypes";
import { useLanguage } from "@/context/LanguageContext";
import { Reveal } from "@/components/shared/Reveal";
import confetti from "canvas-confetti";
import {
  Timer,
  Trophy,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Target,
  Zap,
  Star,
  LogOut,
  MessageSquare,
  AlertCircle,
  Clock,
  HeartHandshake,
} from "lucide-react";
import { playVictoryFanfareSound, playDefeatSound, playTactileClickSound } from "@/lib/soundEffects";
import { GameConfigService, DIFFICULTY_SETTINGS } from "@/lib/gameConfigService";
import tartaVascaImg from "@/assets/tarta-vasca.jpg";
import emblemaDorado from "@/assets/emblema-dorado.png";

interface StepPrecisionTimerProps {
  prizes: GamePrize[];
  participantName: string;
  onPrizeWon: (prize: GamePrize) => void;
  onSwitchToRoulette?: () => void;
  onExit?: () => void;
}

export function StepPrecisionTimer({
  prizes,
  participantName,
  onPrizeWon,
  onSwitchToRoulette,
  onExit,
}: StepPrecisionTimerProps) {
  const { t } = useLanguage();
  const config = GameConfigService.getGameConfig();
  const maxAttempts = config.maxAttempts || 3;
  const toleranceMs = config.toleranceMs || 40;
  const targetTimeMs = 10000; // 10.000 segundos

  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [bestAttemptDiffMs, setBestAttemptDiffMs] = useState<number | null>(null);
  const [lastResult, setLastResult] = useState<{
    timeMs: number;
    diffMs: number;
    isWinner: boolean;
    isClose: boolean;
  } | null>(null);

  // Estados finales: Victoria vs Derrota con salida
  const [isWinnerState, setIsWinnerState] = useState(false);
  const [isDefeatState, setIsDefeatState] = useState(false);
  const [exitCountdown, setExitCountdown] = useState(10);

  const requestRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const exitTimerRef = useRef<any>(null);

  // Premios activos (el primero es el premio mayor de precisión)
  const activePrizes = prizes.filter((p) => p.active);
  const topPrize = activePrizes[0] || prizes[0];

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

  const triggerVictoryCelebration = () => {
    try {
      // Disparo doble de confeti dorado
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.5, x: 0.3 },
        colors: ["#a27e2c", "#d1b374", "#ffffff", "#fbbf24"],
      });
      setTimeout(() => {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.5, x: 0.7 },
          colors: ["#a27e2c", "#d1b374", "#ffffff", "#fbbf24"],
        });
      }, 250);
      playVictoryFanfareSound();
    } catch {
      // Silent fallback
    }
  };

  const handleStartStop = () => {
    playTactileClickSound();

    if (!isRunning) {
      // INICIAR
      startTimeRef.current = 0;
      setTimer(0);
      setIsRunning(true);
      setLastResult(null);
      requestRef.current = requestAnimationFrame(updateTimer);
    } else {
      // DETENER
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      setIsRunning(false);

      const finalMs = timer;
      const diffMs = finalMs - targetTimeMs;
      const absDiff = Math.abs(diffMs);
      const isWinner = absDiff <= toleranceMs;
      const isClose = !isWinner && absDiff <= toleranceMs * 2.5;

      const currentAttempt = attemptCount + 1;
      setAttemptCount(currentAttempt);

      // Guardar mejor intento histórico del comensal
      if (bestAttemptDiffMs === null || absDiff < Math.abs(bestAttemptDiffMs)) {
        setBestAttemptDiffMs(diffMs);
      }

      const result = {
        timeMs: finalMs,
        diffMs,
        isWinner,
        isClose,
      };
      setLastResult(result);

      if (isWinner) {
        // 🎉 CASO 1: ¡GANÓ!
        setIsWinnerState(true);
        triggerVictoryCelebration();
      } else if (currentAttempt >= maxAttempts) {
        // ❌ CASO 2: ¡PERDIÓ! (Agotó intentos sin ganar)
        setIsDefeatState(true);
        playDefeatSound();

        // Iniciar cuenta regresiva para sacarlo automáticamente de forma elegante
        setExitCountdown(10);
        exitTimerRef.current = setInterval(() => {
          setExitCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(exitTimerRef.current);
              if (onExit) onExit();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    }
  };

  const handleClaimWin = () => {
    onPrizeWon(topPrize);
  };

  const handleManualExit = () => {
    if (exitTimerRef.current) clearInterval(exitTimerRef.current);
    if (onExit) {
      onExit();
    } else {
      window.location.href = "/?modo=feedback";
    }
  };

  useEffect(() => {
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (exitTimerRef.current) clearInterval(exitTimerRef.current);
    };
  }, []);

  const timeParts = formatTime(timer);
  const diffInSeconds = lastResult ? (lastResult.diffMs / 1000).toFixed(3) : "0.000";
  const diffSign = lastResult && lastResult.diffMs > 0 ? "+" : "";

  return (
    <Reveal>
      <div className="flex flex-col items-center max-w-xl mx-auto pb-8">
        
        {/* ============================================================== */}
        {/* CARD PRINCIPAL DE LUJO CON FOTO GOURMET */}
        {/* ============================================================== */}
        <div className="w-full bg-white rounded-[2.5rem] shadow-2xl border border-neutral-100 overflow-hidden flex flex-col relative">
          
          {/* BANNER SUPERIOR CON IMAGEN GASTRONÓMICA & MARCA */}
          <div className="relative w-full h-48 sm:h-56 overflow-hidden">
            <img
              src={tartaVascaImg}
              alt={clientConfig.brand.name}
              className="w-full h-full object-cover brightness-95 scale-105 transition-transform duration-1000"
            />
            {/* Gradientes de superposición de lujo */}
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/60 via-transparent to-neutral-950/60" />

            {/* Badge de Marca con Glassmorphism */}
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
              <div className="bg-black/40 backdrop-blur-md border border-white/20 px-3.5 py-1.5 rounded-full flex items-center gap-2 shadow-lg">
                <img src={emblemaDorado} alt="Bliss Emblema" className="w-4 h-4 object-contain" />
                <span className="text-[10px] font-mono tracking-[0.25em] text-white font-bold uppercase">
                  @BLISSSOULBAKERY
                </span>
              </div>
            </div>

            {/* Badge Flotante del Objetivo */}
            <div className="absolute top-4 right-4 z-10">
              <div className="bg-amber-500/90 text-neutral-950 px-3 py-1 rounded-full shadow-lg text-[10px] font-mono font-black uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" />
                <span>Meta: 10.000s</span>
              </div>
            </div>

            {/* Texto de Bienvenida sobre la Imagen */}
            <div className="absolute bottom-3 left-0 right-0 px-6 text-center z-10">
              <p className="text-[10px] uppercase font-mono tracking-[0.3em] text-amber-300 font-bold mb-0.5">
                {t("Boutique Challenge · Mesa en Vivo", "Boutique Challenge · Live Table")}
              </p>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-tight leading-tight">
                {t("Reto de Precisión 10 Segundos", "10-Second Precision Challenge")}
              </h2>
            </div>
          </div>

          {/* CONTENIDO DEL JUEGO / CUERPO */}
          <div className="p-6 sm:p-8 flex flex-col items-center relative z-20 -mt-2 bg-white rounded-t-[2rem]">
            
            {/* ------------------------------------------------------------ */}
            {/* ESCENARIO A: PANTALLA DE JUEGO ACTIVO (AÚN NO GANA NI PIERDE) */}
            {/* ------------------------------------------------------------ */}
            {!isWinnerState && !isDefeatState && (
              <div className="w-full flex flex-col items-center space-y-6">
                
                {/* Barra de Intentos y Tolerancia */}
                <div className="w-full flex items-center justify-between pb-3 border-b border-neutral-100 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold">
                      {t("Intentos:", "Attempts:")}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {Array.from({ length: maxAttempts }).map((_, i) => (
                        <span
                          key={i}
                          className={`w-3.5 h-3.5 rounded-full transition-all duration-300 flex items-center justify-center text-[8px] font-bold ${
                            i < attemptCount
                              ? "bg-neutral-200 text-neutral-400"
                              : "bg-amber-500 text-neutral-950 ring-2 ring-amber-300 shadow-sm animate-pulse"
                          }`}
                        >
                          {i < attemptCount ? "✕" : i + 1}
                        </span>
                      ))}
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 font-bold">
                    Margen: ±{(toleranceMs / 1000).toFixed(3)}s
                  </span>
                </div>

                {/* VISOR PRINCIPAL DEL CRONÓMETRO DE LUJO */}
                <div className="relative py-2 flex flex-col items-center justify-center">
                  <div className="text-6xl sm:text-7xl font-serif font-black tracking-tight text-neutral-900 drop-shadow-sm select-none">
                    <span>{timeParts.sec}</span>
                    <span className="text-amber-600 font-sans">.</span>
                    <span className="text-amber-700 font-mono italic">{timeParts.ms}</span>
                    <span className="text-2xl text-neutral-400 ml-1 font-serif font-light">s</span>
                  </div>

                  <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-neutral-400 mt-2 font-bold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>
                      {isRunning
                        ? t("¡MIDE EL MOMENTO Y TOCA PARA DETENER!", "TIME IT AND TAP TO STOP!")
                        : t("DETÉN EL CONTADOR EN 10.000s", "STOP AT 10.000s")}
                    </span>
                  </div>
                </div>

                {/* GRAN BOTÓN TÁCTIL DORADO CON AURA */}
                <div className="relative my-2">
                  <div
                    className={`absolute -inset-4 rounded-full blur-2xl transition-all duration-300 pointer-events-none ${
                      isRunning
                        ? "bg-red-500/40 animate-pulse scale-125"
                        : "bg-amber-500/25 group-hover:scale-110"
                    }`}
                  />

                  <button
                    type="button"
                    onClick={handleStartStop}
                    className={`relative w-44 h-44 sm:w-48 sm:h-48 rounded-full flex flex-col items-center justify-center transition-all duration-100 shadow-2xl active:scale-90 cursor-pointer border-4 border-white ${
                      isRunning
                        ? "bg-gradient-to-br from-red-600 via-rose-600 to-amber-700 text-white shadow-red-500/40"
                        : "bg-gradient-to-br from-[#d1b374] via-[#a27e2c] to-[#8c6b22] text-white shadow-amber-900/30 hover:scale-105"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-xl sm:text-2xl font-bold tracking-widest uppercase font-mono">
                        {isRunning ? t("DETENER", "STOP") : t("PULSAR", "START")}
                      </span>
                      <span className="text-[11px] opacity-90 uppercase tracking-widest font-mono">
                        {isRunning ? "10.000s" : "Iniciar Reto"}
                      </span>
                      {isRunning ? (
                        <Zap className="h-6 w-6 mt-1 animate-bounce" />
                      ) : (
                        <Timer className="h-6 w-6 mt-1 opacity-90" />
                      )}
                    </div>
                  </button>
                </div>

                {/* TARJETA DE RESULTADO INTERMEDIO */}
                {lastResult && (
                  <div
                    className={`w-full p-4 rounded-2xl border text-center transition-all animate-in fade-in duration-300 ${
                      lastResult.isClose
                        ? "bg-amber-500/10 border-amber-300 text-amber-900"
                        : "bg-neutral-50 border-neutral-200 text-neutral-800"
                    }`}
                  >
                    <div className="text-xs font-bold flex items-center justify-center gap-1.5 mb-1">
                      {lastResult.isClose ? (
                        <>
                          <Sparkles className="h-4 w-4 text-amber-600" />
                          <span>{t("¡Uyyy! ¡A milímetros del objetivo!", "So close!")}</span>
                        </>
                      ) : (
                        <>
                          <RotateCcw className="h-4 w-4 text-neutral-500" />
                          <span>{t("Intento registrado", "Attempt recorded")}</span>
                        </>
                      )}
                    </div>
                    <p className="text-xs">
                      {t("Detuviste en ", "Stopped at ")}
                      <strong className="font-mono text-sm">{(lastResult.timeMs / 1000).toFixed(3)}s</strong> (
                      <span className="font-mono text-amber-700 font-bold">
                        {diffSign}
                        {diffInSeconds}s
                      </span>{" "}
                      {t("del 10.000s", "from target")}).
                    </p>
                    {attemptCount < maxAttempts && (
                      <p className="text-xs font-bold text-amber-800 mt-2">
                        {t(
                          `¡Te queda(n) ${maxAttempts - attemptCount} intento(s)! Vuelve a presionar PULSAR.`,
                          `${maxAttempts - attemptCount} attempt(s) left! Tap START again.`
                        )}
                      </p>
                    )}
                  </div>
                )}

                {/* ALTERNATIVA PARA CAMBIAR A RULETA */}
                {onSwitchToRoulette && !isRunning && (
                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={onSwitchToRoulette}
                      className="text-xs text-neutral-500 hover:text-amber-700 transition-colors inline-flex items-center gap-1.5"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>
                        {t(
                          "¿Prefieres girar la Ruleta de la Fortuna en vez del cronómetro? Toca aquí",
                          "Prefer to spin the Roulette Wheel instead? Click here"
                        )}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ------------------------------------------------------------ */}
            {/* ESCENARIO B: ¡GANÓ! (VICTORIA PERFECTA)                      */}
            {/* ------------------------------------------------------------ */}
            {isWinnerState && (
              <div className="w-full text-center space-y-5 animate-in zoom-in-95 duration-500 py-4">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-neutral-950 flex items-center justify-center text-4xl shadow-xl shadow-amber-500/30 animate-bounce">
                  🏆
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-600 font-bold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
                    ¡PRECISIÓN QUIRÚRGICA LOGRADA!
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-serif font-black text-neutral-900 mt-2">
                    ¡Hazaña en Mesa, {participantName}!
                  </h3>
                  <p className="text-xs text-neutral-600 max-w-sm mx-auto">
                    Detuviste el contador en{" "}
                    <strong className="font-mono text-amber-700 font-bold text-sm">
                      {(lastResult?.timeMs ? lastResult.timeMs / 1000 : 10).toFixed(3)}s
                    </strong>
                    . ¡Has desbloqueado el premio mayor de la casa!
                  </p>
                </div>

                {/* TARJETA DEL PREMIO GANADO */}
                <div className="p-5 rounded-2xl border-2 border-amber-500 bg-gradient-to-br from-amber-50 via-white to-amber-100/60 shadow-lg max-w-md mx-auto space-y-2">
                  <div className="flex items-center justify-center gap-1.5 text-amber-600">
                    <Star className="w-4 h-4 fill-amber-500" />
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Premio de Autor</span>
                    <Star className="w-4 h-4 fill-amber-500" />
                  </div>
                  <div className="text-xl sm:text-2xl font-serif font-black text-neutral-900">
                    {topPrize.name}
                  </div>
                  <p className="text-xs text-neutral-600">
                    {topPrize.terms || "Válido para la cuenta o visita actual en mesa."}
                  </p>
                </div>

                {/* BOTÓN DORADO DE RECLAMO */}
                <button
                  type="button"
                  onClick={handleClaimWin}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-amber-600 via-amber-700 to-amber-900 text-white font-bold text-sm shadow-xl hover:from-amber-700 hover:to-amber-950 flex items-center justify-center gap-2 mx-auto transition-transform active:scale-95 cursor-pointer"
                >
                  <Trophy className="h-4 w-4" />
                  <span>{t("🏆 Reclamar Cupón Dorado & Ver en Mesa", "Claim Golden Voucher & View on Table")}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* ------------------------------------------------------------ */}
            {/* ESCENARIO C: ¡PERDIÓ! (MENSAJE ELEGANTE Y SALIDA AUTOMÁTICA) */}
            {/* ------------------------------------------------------------ */}
            {isDefeatState && (
              <div className="w-full text-center space-y-5 animate-in fade-in duration-500 py-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-neutral-100 border border-neutral-300 text-neutral-500 flex items-center justify-center text-3xl shadow-sm">
                  ⏳
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-neutral-500 font-bold bg-neutral-100 px-3 py-1 rounded-full border border-neutral-200">
                    Desafío No Superado
                  </span>
                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-neutral-900 mt-2">
                    ¡Buen intento, {participantName}!
                  </h3>
                  <p className="text-xs text-neutral-600 max-w-sm mx-auto leading-relaxed">
                    Agotaste tus {maxAttempts} intentos. Tu marca más cercana fue a{" "}
                    <strong className="font-mono text-neutral-900 font-bold">
                      {bestAttemptDiffMs !== null ? (Math.abs(bestAttemptDiffMs) / 1000).toFixed(3) : "0.000"}s
                    </strong>{" "}
                    del 10.000s.
                  </p>
                </div>

                {/* MENSAJE DE POLÍTICA Y SALIDA */}
                <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 max-w-md mx-auto text-left space-y-2">
                  <div className="flex items-center gap-2 text-neutral-800 font-bold text-xs">
                    <HeartHandshake className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Agradecemos tu visita a {clientConfig.brand.name}</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 leading-relaxed font-light">
                    Para mantener la exclusividad de nuestros premios, se permite un único turno de juego por mesa/visita. ¡Te esperamos pronto para volver a intentarlo!
                  </p>
                </div>

                {/* AVISO DE SALIDA AUTOMÁTICA */}
                <div className="text-[11px] font-mono text-neutral-400">
                  Volviendo a la experiencia en <strong className="text-amber-600 font-bold">{exitCountdown}s</strong>...
                </div>

                {/* BOTÓN PARA SALIR DE INMEDIATO */}
                <div className="flex flex-col sm:flex-row gap-2 justify-center max-w-sm mx-auto pt-2">
                  <button
                    type="button"
                    onClick={handleManualExit}
                    className="w-full px-5 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md"
                  >
                    <MessageSquare className="h-4 w-4 text-amber-400" />
                    <span>{t("Calificar Visita y Salir", "Rate Visit & Exit")}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (exitTimerRef.current) clearInterval(exitTimerRef.current);
                      window.location.href = "/?mesa=1&reset=1";
                    }}
                    className="w-full px-5 py-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>{t("Volver al Inicio", "Back to Home")}</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </Reveal>
  );
}
