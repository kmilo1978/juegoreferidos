import { useState, useRef, useEffect } from "react";
import { GamePrize, DEFAULT_PRIZES } from "./gameTypes";
import { useLanguage } from "@/context/LanguageContext";
import { Reveal } from "@/components/shared/Reveal";
import confetti from "canvas-confetti";
import { Sparkles, Trophy, ArrowRight } from "lucide-react";
import emblemaDorado from "@/assets/emblema-dorado.png";
import { playRouletteTickSound, playVictoryFanfareSound } from "../../lib/soundEffects";
import { clientConfig } from "@/config/clientConfig";

interface StepRouletteWheelProps {
  prizes: GamePrize[];
  participantName: string;
  onPrizeWon: (prize: GamePrize) => void;
}

export function StepRouletteWheel({ prizes, participantName, onPrizeWon }: StepRouletteWheelProps) {
  const { lang, t } = useLanguage();

  const [isSpinning, setIsSpinning] = useState(false);
  const [hasSpun, setHasSpun] = useState(false);
  const [wonPrize, setWonPrize] = useState<GamePrize | null>(null);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [countdown, setCountdown] = useState(10);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Solo consideramos premios activos
  const activePrizes = prizes.filter((p) => p.active);
  const numSegments = activePrizes.length;
  const segmentAngle = 360 / numSegments;

  // Dibujar la ruleta visual en Canvas de alta resolución
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = 520;
    canvas.width = size;
    canvas.height = size;

    const center = size / 2;
    const radius = size / 2 - 24;

    ctx.clearRect(0, 0, size, size);

    // 1. Sombra exterior
    ctx.save();
    ctx.shadowColor = "rgba(162, 126, 44, 0.25)";
    ctx.shadowBlur = 25;
    ctx.shadowOffsetY = 8;
    ctx.beginPath();
    ctx.arc(center, center, radius + 12, 0, 2 * Math.PI);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.restore();

    // 2. Anillo exterior dorado Luxor con textura biselada
    const goldGrad = ctx.createLinearGradient(0, 0, size, size);
    goldGrad.addColorStop(0, "#d1b374");
    goldGrad.addColorStop(0.25, "#a27e2c");
    goldGrad.addColorStop(0.5, "#f7edd0");
    goldGrad.addColorStop(0.75, "#8c6b22");
    goldGrad.addColorStop(1, "#c49f48");

    ctx.beginPath();
    ctx.arc(center, center, radius + 12, 0, 2 * Math.PI);
    ctx.fillStyle = goldGrad;
    ctx.fill();

    // Aro interior de contraste
    ctx.beginPath();
    ctx.arc(center, center, radius + 2, 0, 2 * Math.PI);
    ctx.fillStyle = "#1e1b18";
    ctx.fill();

    // 3. Dibujar los segmentos de cada premio
    activePrizes.forEach((prize, index) => {
      const startAngle = ((index * segmentAngle - 90) * Math.PI) / 180;
      const endAngle = (((index + 1) * segmentAngle - 90) * Math.PI) / 180;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = prize.color;
      ctx.fill();

      // Separador dorado fino entre sectores
      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgba(209, 179, 116, 0.4)";
      ctx.stroke();
      ctx.restore();

      // Dibujar texto del premio orientado radialmente
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(((index * segmentAngle + segmentAngle / 2 - 90) * Math.PI) / 180);
      ctx.textAlign = "right";
      ctx.fillStyle = prize.textColor;
      ctx.font = "bold 13px sans-serif";

      // Texto en dos líneas para nombres largos
      const label = lang === "en" ? prize.nameEn : prize.name;
      const words = label.split(" ");
      if (words.length > 2) {
        ctx.fillText(words.slice(0, 2).join(" "), radius - 30, -5);
        ctx.font = "11px sans-serif";
        ctx.fillText(words.slice(2).join(" "), radius - 30, 12);
      } else {
        ctx.fillText(label, radius - 30, 4);
      }

      ctx.restore();
    });

    // 4. Clavijas doradas decorativas en el perímetro
    for (let i = 0; i < numSegments * 2; i++) {
      const angle = (i * (360 / (numSegments * 2)) * Math.PI) / 180;
      const pinX = center + (radius + 7) * Math.cos(angle);
      const pinY = center + (radius + 7) * Math.sin(angle);

      ctx.beginPath();
      ctx.arc(pinX, pinY, 3.5, 0, 2 * Math.PI);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "#a27e2c";
      ctx.stroke();
    }

    // 5. Medallón central dorado
    ctx.save();
    ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(center, center, 44, 0, 2 * Math.PI);
    ctx.fillStyle = goldGrad;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#ffffff";
    ctx.stroke();
    ctx.restore();

    // 6. Isotipo o emblema en el centro del medallón
    const img = new Image();
    img.src = clientConfig.brand.emblemUrl || emblemaDorado;
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const emblemSize = 42;
      ctx.drawImage(img, center - emblemSize / 2, center - emblemSize / 2, emblemSize, emblemSize);
    };
  }, [activePrizes, numSegments, segmentAngle, lang]);

  // Selección ponderada de premio según probabilidad configurada
  const chooseWeightedPrize = (): { prize: GamePrize; index: number } => {
    const totalProb = activePrizes.reduce((sum, p) => sum + p.probability, 0);
    const rand = Math.random() * totalProb;

    let cumulative = 0;
    for (let i = 0; i < activePrizes.length; i++) {
      const p = activePrizes[i];
      if (p) {
        cumulative += p.probability;
        if (rand <= cumulative) {
          return { prize: p, index: i };
        }
      }
    }
    const fallback = activePrizes[0] ?? DEFAULT_PRIZES[0]!;
    return { prize: fallback, index: 0 };
  };

  // Disparo de confeti dorado de celebración
  const fireConfetti = () => {
    const duration = 2.5 * 1000;
    const end = Date.now() + duration;

    const colors = ["#a27e2c", "#d1b374", "#ffffff", "#f5e6c8", "#594314"];

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0.1, y: 0.7 },
        colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 0.9, y: 0.7 },
        colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  };

  // Girar la ruleta
  const handleSpin = () => {
    if (isSpinning || hasSpun) return;

    setIsSpinning(true);
    setCountdown(5);

    // Tics de sonido mecánicos durante el giro
    const tickInterval = setInterval(() => {
      playRouletteTickSound();
    }, 120);

    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const { prize, index } = chooseWeightedPrize();

    const targetCenterAngle = index * segmentAngle + segmentAngle / 2;
    const extraSpins = 360 * 7; // 7 vueltas completas
    const finalAngle = extraSpins + (360 - targetCenterAngle);

    setRotationAngle(finalAngle);

    // Esperar al fin de la animación exactamente 5.2 segundos
    setTimeout(() => {
      clearInterval(tickInterval);
      clearInterval(countdownInterval);
      setIsSpinning(false);
      setHasSpun(true);
      setWonPrize(prize);
      playVictoryFanfareSound();
      fireConfetti();
    }, 5200);
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Reveal>
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="h-px w-6 bg-gold" />
            <span className="text-xs uppercase tracking-[0.24em] text-gold font-medium">
              {t("Paso 3 · La Ruleta", "Step 3 · The Roulette")}
            </span>
            <span className="h-px w-6 bg-gold" />
          </div>

          <h2 className="font-display text-2xl sm:text-3xl text-foreground font-normal tracking-tight">
            {t("¡Es hora de jugar!", "It's time to play!")}
          </h2>

          <p className="mt-2 text-sm text-muted-foreground font-light max-w-md mx-auto">
            {t(
              `Gira la ruleta exclusiva de ${clientConfig.brand.name} para descubrir tu premio especial, ${participantName}.`,
              `Spin the exclusive ${clientConfig.brand.name} roulette to unveil your special prize, ${participantName}.`,
            )}
          </p>
        </div>
      </Reveal>

      {/* Contenedor de la Ruleta */}
      <Reveal delay={100}>
        <div className="mt-8 flex flex-col items-center">
          <div className="relative w-[320px] h-[320px] sm:w-[420px] sm:h-[420px] flex items-center justify-center select-none">
            {/* Puntero Indicador Dorado Fijo en el borde superior en aguja triangular limpia */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.35)]">
              <svg width="28" height="36" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 36L1.00962 4.5L26.9904 4.5L14 36Z" fill="url(#goldNeedleGrad)" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="14" cy="9" r="4" fill="#ffffff" stroke="#a27e2c" strokeWidth="1.5" />
                <defs>
                  <linearGradient id="goldNeedleGrad" x1="14" y1="0" x2="14" y2="36" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#f7edd0" />
                    <stop offset="0.4" stopColor="#a27e2c" />
                    <stop offset="1" stopColor="#594314" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Canvas giratorio con aceleración por hardware GPU */}
            <div
              style={{
                transform: `translate3d(0, 0, 0) rotate(${rotationAngle}deg)`,
                transition: isSpinning
                  ? "transform 5.2s cubic-bezier(0.12, 0.98, 0.22, 1.0)"
                  : "none",
                willChange: "transform",
              }}
              className="w-full h-full flex items-center justify-center"
            >
              <canvas ref={canvasRef} className="w-full h-full object-contain rounded-full shadow-2xl" />
            </div>
          </div>

          {/* Botón de Giro o Resultado */}
          <div className="mt-8 w-full max-w-sm text-center">
            {!hasSpun ? (
              <button
                type="button"
                onClick={handleSpin}
                disabled={isSpinning}
                className="btn-solid w-full inline-flex items-center justify-center gap-2.5 py-3.5 px-8 text-xs uppercase tracking-[0.24em] font-semibold text-white transition-all shadow-md disabled:opacity-60 disabled:cursor-wait"
              >
                <Sparkles className="h-4 w-4" />
                <span>
                  {isSpinning
                    ? `${t("Girando con emoción...", "Spinning with excitement...")} (${countdown}s)`
                    : t("¡Girar Ruleta de la Suerte!", "Spin Lucky Roulette!")}
                </span>
              </button>
            ) : (
              /* Tarjeta de Anuncio Inmediato y Avance al Voucher */
              <div className="rounded-2xl border border-gold/50 bg-gold/10 p-6 text-center shadow-md animate-fade-in space-y-4">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gold text-white shadow-sm">
                  <Trophy className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-gold font-semibold">
                    {t("¡Felicitaciones!", "Congratulations!")}
                  </p>
                  <h3 className="font-display text-xl sm:text-2xl text-foreground mt-1">
                    {lang === "en" ? wonPrize?.nameEn : wonPrize?.name}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground font-light">
                    {lang === "en" ? wonPrize?.termsEn : wonPrize?.terms}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => wonPrize && onPrizeWon(wonPrize)}
                  className="btn-solid w-full inline-flex items-center justify-center gap-2 py-3 px-6 text-xs uppercase tracking-[0.2em] font-medium transition-all shadow-xs"
                >
                  <span>{t("Ver mi Código QR & Voucher", "View My QR Code & Voucher")}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </Reveal>
    </div>
  );
}
