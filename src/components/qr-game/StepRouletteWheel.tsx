import { useState, useRef, useEffect } from "react";
import { GamePrize, DEFAULT_PRIZES } from "./gameTypes";
import { useLanguage } from "@/context/LanguageContext";
import { Reveal } from "@/components/shared/Reveal";
import confetti from "canvas-confetti";
import { Sparkles, ArrowRight, Trophy } from "lucide-react";
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

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const activePrizes = prizes.filter((p) => p.active);
  const numSegments = activePrizes.length;
  const segmentAngle = 360 / numSegments;

  // Dibujar la ruleta con colores Obsidian y Dorado Luxor de Stitch
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = 480;
    canvas.width = size;
    canvas.height = size;
    const center = size / 2;
    const radius = size / 2 - 20;

    ctx.clearRect(0, 0, size, size);

    // Fondo base del plato
    ctx.beginPath();
    ctx.arc(center, center, radius + 10, 0, 2 * Math.PI);
    ctx.fillStyle = "#0f0e12";
    ctx.fill();

    // Dibujar sectores
    activePrizes.forEach((prize, index) => {
      const startAngle = ((index * segmentAngle - 90) * Math.PI) / 180;
      const endAngle = (((index + 1) * segmentAngle - 90) * Math.PI) / 180;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, startAngle, endAngle);
      ctx.closePath();

      // Paleta alterna Obsidian y Dorado Luxor
      if (index % 2 === 0) {
        const goldGrad = ctx.createLinearGradient(0, 0, size, size);
        goldGrad.addColorStop(0, "#f2be71");
        goldGrad.addColorStop(1, "#b88330");
        ctx.fillStyle = goldGrad;
      } else {
        const darkGrad = ctx.createLinearGradient(0, 0, size, size);
        darkGrad.addColorStop(0, "#24202a");
        darkGrad.addColorStop(1, "#141317");
        ctx.fillStyle = darkGrad;
      }
      ctx.fill();

      // Línea divisoria
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "rgba(255, 221, 177, 0.35)";
      ctx.stroke();
      ctx.restore();

      // Texto de premio
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(((index * segmentAngle + segmentAngle / 2 - 90) * Math.PI) / 180);
      ctx.textAlign = "right";
      ctx.fillStyle = index % 2 === 0 ? "#291800" : "#ffdcb1";
      ctx.font = "bold 12px 'Manrope', sans-serif";

      const label = lang === "en" ? prize.nameEn : prize.name;
      const words = label.split(" ");
      if (words.length > 2) {
        ctx.fillText(words.slice(0, 2).join(" "), radius - 26, -4);
        ctx.font = "10px 'Manrope', sans-serif";
        ctx.fillText(words.slice(2).join(" "), radius - 26, 10);
      } else {
        ctx.fillText(label, radius - 26, 4);
      }
      ctx.restore();
    });

    // Clavijas perimetrales
    for (let i = 0; i < numSegments * 2; i++) {
      const angle = (i * (360 / (numSegments * 2)) * Math.PI) / 180;
      const pinX = center + (radius + 4) * Math.cos(angle);
      const pinY = center + (radius + 4) * Math.sin(angle);

      ctx.beginPath();
      ctx.arc(pinX, pinY, 2.5, 0, 2 * Math.PI);
      ctx.fillStyle = "#ffddb1";
      ctx.fill();
    }
  }, [activePrizes, numSegments, segmentAngle, lang]);

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

  const fireConfetti = () => {
    const duration = 2.5 * 1000;
    const end = Date.now() + duration;
    const colors = ["#f2be71", "#ffdcb1", "#ffffff", "#8a4fff", "#d1bcff"];

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0.1, y: 0.7 },
        colors,
      });
      confetti({
        particleCount: 5,
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

  const handleSpin = () => {
    if (isSpinning || hasSpun) return;

    setIsSpinning(true);

    const tickInterval = setInterval(() => {
      playRouletteTickSound();
    }, 120);

    const { prize, index } = chooseWeightedPrize();
    const targetCenterAngle = index * segmentAngle + segmentAngle / 2;
    const extraSpins = 360 * 7;
    const finalAngle = extraSpins + (360 - targetCenterAngle);

    setRotationAngle(finalAngle);

    setTimeout(() => {
      clearInterval(tickInterval);
      setIsSpinning(false);
      setHasSpun(true);
      setWonPrize(prize);
      playVictoryFanfareSound();
      fireConfetti();
    }, 5000);
  };

  return (
    <div className="w-full flex flex-col gap-6">

      {/* Título de la Ruleta */}
      <Reveal delay={50}>
        <section className="text-center flex flex-col gap-1">
          <h1 className="font-headline-xl-mobile text-2xl sm:text-3xl text-[#e6e1e7] tracking-tight">
            {t("¡Gira la Ruleta,", "Spin the Wheel,")}{" "}
            <span className="text-[var(--gold)] italic font-serif">{participantName}</span>!
          </h1>
          <p className="font-body-md text-sm text-[#ccc3d8] leading-relaxed max-w-md mx-auto">
            {t(
              "Toca el botón central dorado para descubrir tu beneficio de cortesía para tu mesa.",
              "Tap the center gold button to reveal your complimentary dining treat."
            )}
          </p>
        </section>
      </Reveal>

      {/* Ruleta Gamificada de Lujo estilo Stitch */}
      <Reveal delay={100}>
        <div className="flex flex-col items-center">
          <div className="relative w-[310px] h-[310px] sm:w-[360px] sm:h-[360px] flex items-center justify-center select-none">
            {/* Puntero Indicador Superior Dorado con flapper */}
            <div className="absolute -top-3 z-30 flex flex-col items-center drop-shadow-[0_4px_8px_rgba(0,0,0,0.7)]">
              <div
                className="w-5 h-7 bg-gradient-to-b from-[var(--gold-light)] via-[var(--gold)] to-[#684400] rounded-t-sm shadow-md clip-pointer"
                style={{ clipPath: "polygon(50% 100%, 0% 0%, 100% 0%)" }}
              />
              <div className="w-2.5 h-2.5 rounded-full bg-[var(--gold-light)] -mt-6 shadow-[0_0_6px_rgba(255,221,177,0.9)]" />
            </div>

            {/* Anillo exterior biselado con gradiente Stitch */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[var(--gold-light)] via-[#684400] to-[var(--gold)] shadow-[0_12px_36px_rgba(0,0,0,0.8)] p-2">
              <div className="relative w-full h-full rounded-full bg-[#0f0e12] p-1 shadow-inner flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#684400]/60 via-[var(--gold-light)]/40 to-[var(--gold)]/80 p-1 flex items-center justify-center shadow-lg">
                  {/* Canvas giratorio */}
                  <div
                    style={{
                      transform: `rotate(${rotationAngle}deg)`,
                      transition: isSpinning
                        ? "transform 5.0s cubic-bezier(0.15, 0.98, 0.25, 1.0)"
                        : "none",
                      willChange: "transform",
                    }}
                    className="w-full h-full rounded-full relative flex items-center justify-center"
                  >
                    <canvas ref={canvasRef} className="w-full h-full rounded-full block" />
                  </div>

                  {/* Botón Central Dorado Metálico */}
                  <button
                    type="button"
                    onClick={handleSpin}
                    disabled={isSpinning || hasSpun}
                    className="absolute z-20 w-24 h-24 rounded-full bg-gradient-to-tr from-[#684400] via-[var(--gold-light)] to-[var(--gold)] p-1 shadow-[0_8px_20px_rgba(0,0,0,0.7),0_0_16px_rgba(242,190,113,0.5)] active:scale-95 transition-transform flex items-center justify-center cursor-pointer group disabled:cursor-not-allowed"
                  >
                    <div className="w-full h-full rounded-full bg-[#0f0e12] flex flex-col items-center justify-center p-1 relative overflow-hidden shadow-inner">
                      <div className="absolute inset-0 bg-gradient-to-b from-[var(--gold)]/20 to-transparent pointer-events-none" />
                      <Sparkles className="h-4 w-4 text-[var(--gold)] animate-pulse" />
                      <span className="font-headline-sm text-[11px] leading-tight text-center font-bold tracking-wider text-[var(--gold)] uppercase mt-0.5">
                        {isSpinning ? t("GIRANDO...", "SPINNING...") : hasSpun ? t("LISTO", "DONE") : t("GIRAR\nAHORA", "SPIN\nNOW")}
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Banner de Ganador Reciente en Vivo */}
          <div className="w-full max-w-sm mt-4 p-2.5 rounded-full bg-[#1c1b1f] border border-[#2b292e] flex items-center gap-2.5 shadow-sm">
            <div className="w-7 h-7 rounded-full bg-[#684400]/60 flex items-center justify-center shrink-0 text-[var(--gold)]">
              <Trophy className="h-3.5 w-3.5" />
            </div>
            <div className="flex items-center gap-1.5 text-xs truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] animate-ping" />
              <span className="font-bold text-[var(--gold)] uppercase text-[10px]">Mesa 2:</span>
              <span className="text-[#e6e1e7] truncate">Ganó Postre de Autor 🍰</span>
            </div>
          </div>

          {/* Tarjeta de Victoria al terminar el giro */}
          {wonPrize && (
            <div className="w-full mt-5 rounded-2xl bg-gradient-to-b from-[#2a2215] to-[#1c1b1f] border border-[var(--gold)]/40 p-5 shadow-2xl text-center flex flex-col items-center gap-3 animate-in zoom-in-95">
              <div className="w-12 h-12 rounded-full badge-gold flex items-center justify-center shadow-[0_0_16px_rgba(242,190,113,0.6)]">
                <Trophy className="h-6 w-6" />
              </div>
              <span className="font-label-sm text-[11px] uppercase tracking-wider text-[var(--gold)] font-bold">
                {t("¡PREMIO DESBLOQUEADO!", "PRIZE UNLOCKED!")}
              </span>
              <h3 className="font-headline-lg text-xl sm:text-2xl text-[var(--gold-light)] font-bold">
                {lang === "en" ? wonPrize.nameEn : wonPrize.name}
              </h3>
              <p className="font-body-sm text-xs text-[#ccc3d8] max-w-xs">
                {t(
                  "Tu beneficio ha sido asignado a tu mesa. Avanza para reclamar tu voucher digital y tu código único.",
                  "Your treat has been assigned. Continue to get your voucher and unique code."
                )}
              </p>
              <button
                type="button"
                onClick={() => onPrizeWon(wonPrize)}
                className="w-full h-12 rounded-full btn-gold text-sm flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(242,190,113,0.35)] active:scale-98 transition-all cursor-pointer hover:brightness-105"
              >
                <span>{t("Ver mi Voucher de Premio", "View My Prize Voucher")}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </Reveal>
    </div>
  );
}
