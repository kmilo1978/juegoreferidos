import { useState, useEffect } from "react";
import { FeedbackData, SecondChanceConfig, WonPrize } from "./gameTypes";
import { useLanguage } from "@/context/LanguageContext";
import { Reveal } from "@/components/shared/Reveal";
import {
  ExternalLink,
  MessageCircle,
  Sparkles,
  ArrowRight,
  Star,
  ShieldCheck,
  Send,
  Trophy,
} from "lucide-react";
import { waLink } from "@/data/site";
import { clientConfig } from "@/config/clientConfig";

interface StepFeedbackProps {
  initialFeedback?: FeedbackData | undefined;
  customerName?: string | undefined;
  isStandAlone?: boolean | undefined;
  secondChanceConfig?: SecondChanceConfig | undefined;
  wonPrize?: WonPrize | null | undefined;
  onUnlockSecondChance?: (() => void) | undefined;
  onComplete?: ((data: FeedbackData) => void) | undefined;
  onSwitchToGame?: (() => void) | undefined;
}

export function StepFeedback({
  initialFeedback,
  customerName = "",
  secondChanceConfig,
  wonPrize,
  onUnlockSecondChance,
  onComplete,
}: StepFeedbackProps) {
  const { t } = useLanguage();
  const [rating, setRating] = useState<number>(initialFeedback?.rating || 5);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [comment, setComment] = useState<string>(initialFeedback?.comment || "");
  const [hasSentPrivate, setHasSentPrivate] = useState(false);
  const [hasClickedGoogle, setHasClickedGoogle] = useState(false);

  const [googleReviewUrl, setGoogleReviewUrl] = useState<string>(
    clientConfig.channels.googleMapsReviewUrl || "https://maps.google.com"
  );
  const [whatsappPrivate, setWhatsappPrivate] = useState<string>(
    clientConfig.channels.whatsappNumber || "573000000000"
  );

  useEffect(() => {
    fetch("/api/reputation")
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && data?.config) {
          if (data.config.googleBusinessUrl) setGoogleReviewUrl(data.config.googleBusinessUrl);
          if (data.config.whatsappPrivateNumber) setWhatsappPrivate(data.config.whatsappPrivateNumber);
        }
      })
      .catch(() => {});
  }, []);

  const ratingLabels: Record<number, string> = {
    1: t("1 DE 5 • EXPERIENCIA DEFICIENTE", "1 OUT OF 5 • POOR EXPERIENCE"),
    2: t("2 DE 5 • POR DEBAJO DE LO ESPERADO", "2 OUT OF 5 • BELOW EXPECTATIONS"),
    3: t("3 DE 5 • ACEPTABLE • ASPECTOS POR MEJORAR", "3 OUT OF 5 • FAIR • ROOM TO IMPROVE"),
    4: t("4 DE 5 • MUY BUENA EXPERIENCIA", "4 OUT OF 5 • VERY GOOD EXPERIENCE"),
    5: t("5 DE 5 • ¡EXTRAORDINARIA! • INOLVIDABLE", "5 OUT OF 5 • EXTRAORDINARY • UNFORGETTABLE"),
  };

  const isPositive = (rating || 5) >= 4;

  const handleSendPrivateFeedback = () => {
    const brandName = clientConfig.brand.name;
    const msg = `⚠️ *Feedback Confidencial en Mesa*\nCliente: ${customerName || "Comensal"}\nCalificación: ${rating} / 5 ⭐\nComentario: "${comment || "Sin comentarios adicionales"}"\n\nPor favor atender directamente al cliente en sala.`;
    const cleanPhone = whatsappPrivate.replace(/\D/g, "");
    if (cleanPhone) {
      window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, "_blank", "noopener,noreferrer");
    } else {
      window.open(waLink(msg), "_blank", "noopener,noreferrer");
    }
    setHasSentPrivate(true);
    if (onComplete) {
      onComplete({
        rating,
        comment,
        createdAt: Date.now(),
        customerName,
      });
    }
  };

  const handleGoogleClick = () => {
    setHasClickedGoogle(true);
    window.open(googleReviewUrl, "_blank", "noopener,noreferrer");
    if (onComplete) {
      onComplete({
        rating,
        comment,
        createdAt: Date.now(),
        customerName,
      });
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">

      {/* Selector de 5 Estrellas Interactivo estilo Stitch */}
      <Reveal delay={50}>
        <div className="w-full rounded-2xl bg-[#1c1b1f] border border-[#2b292e] p-5 shadow-xl flex flex-col items-center text-center gap-3">
          <span className="font-label-sm text-[10px] uppercase tracking-wider text-[#f2be71] font-bold">
            {t("¿Cómo calificarías tu experiencia hoy?", "How was your experience today?")}
          </span>

          {/* 5 Botones de Estrellas con Brillo Dorado */}
          <div className="flex items-center justify-center gap-2 py-1">
            {[1, 2, 3, 4, 5].map((starVal) => {
              const activeVal = hoveredRating || rating;
              const isFilled = starVal <= activeVal;
              return (
                <button
                  key={starVal}
                  type="button"
                  onClick={() => setRating(starVal)}
                  onMouseEnter={() => setHoveredRating(starVal)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="w-11 h-11 flex items-center justify-center rounded-full text-[#f2be71] hover:scale-115 active:scale-95 transition-all cursor-pointer"
                >
                  <Star
                    className={`h-8 w-8 transition-transform ${
                      isFilled
                        ? "fill-[#f2be71] text-[#f2be71] drop-shadow-[0_0_8px_rgba(242,190,113,0.6)]"
                        : "text-[#4a4455] fill-transparent"
                    }`}
                  />
                </button>
              );
            })}
          </div>

          <span className="font-label-md text-xs text-[#ffddb1] font-bold tracking-wide">
            {ratingLabels[rating] || ratingLabels[5]}
          </span>
        </div>
      </Reveal>

      {/* RAMA A: CALIFICACIÓN POSITIVA (4 O 5 ESTRELLAS) -> GOOGLE MAPS */}
      {isPositive && (
        <Reveal delay={100}>
          <div className="w-full rounded-2xl bg-gradient-to-b from-[#201f23] to-[#1c1b1f] border border-[#f2be71]/30 p-5 shadow-xl flex flex-col gap-4 relative overflow-hidden">
            <div className="absolute -top-16 -right-16 w-36 h-36 bg-[#f2be71]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-0.5">
                <div className="inline-flex items-center gap-1 text-[#f2be71] font-label-sm text-[10px] uppercase font-bold tracking-wider">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{t("Experiencia Superior", "Top Tier Experience")}</span>
                </div>
                <h2 className="font-headline-sm text-lg text-[#e6e1e7] font-bold">
                  {t("¡Nos alegra que hayas disfrutado!", "We're thrilled you enjoyed it!")}
                </h2>
              </div>
              <span className="w-9 h-9 rounded-full bg-[#684400]/50 border border-[#f2be71]/30 flex items-center justify-center text-[#f2be71] text-base shrink-0">
                🎉
              </span>
            </div>

            <p className="font-body-sm text-xs text-[#ccc3d8] leading-relaxed">
              {t(
                "Tu respaldo en Google Maps ayuda a otros amantes del buen comer a descubrir nuestra propuesta gastronómica.",
                "Your review on Google Maps helps other food lovers discover our dining experience."
              )}
            </p>

            {/* Tarjeta Oficial Google Maps */}
            <div className="bg-[#2b292e]/80 border border-[#363439] rounded-xl p-3.5 flex items-center gap-3 shadow-md">
              <div className="w-9 h-9 rounded-full bg-[#0f0e12] flex items-center justify-center shrink-0 shadow-inner">
                {/* Logo G oficial */}
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                </svg>
              </div>
              <div className="flex flex-col text-left">
                <span className="font-label-md text-xs font-bold text-[#e6e1e7]">
                  {t("Reseña Verificada Google Maps", "Verified Google Maps Review")}
                </span>
                <span className="font-label-sm text-[11px] text-[#f2be71] font-semibold">
                  ★★★★★ <span className="text-[#ccc3d8] font-normal">{t("Recomendado", "Recommended")}</span>
                </span>
              </div>
            </div>

            {/* Botón Principal para Abrir Google Maps */}
            <button
              type="button"
              onClick={handleGoogleClick}
              className="w-full h-13 py-3 px-6 rounded-full btn-purple text-sm font-bold flex items-center justify-center gap-2 shadow-[0_4px_24px_rgba(138,79,255,0.4)] active:scale-98 transition-all cursor-pointer hover:brightness-105"
            >
              <span>{t("Publicar Reseña en Google Maps", "Publish Review on Google Maps")}</span>
              <ExternalLink className="h-4 w-4" />
            </button>

            {hasClickedGoogle && (
              <div className="p-3 rounded-xl bg-[#2b292e] border border-[#f2be71]/30 flex items-center gap-2.5 text-xs text-[#ffddb1]">
                <Sparkles className="h-4 w-4 text-[#f2be71] shrink-0" />
                <span>{t("¡Gracias por tu reseña! Tu 2ª Oportunidad ha sido desbloqueada.", "Thanks for your review! Your 2nd Chance is unlocked.")}</span>
              </div>
            )}
          </div>
        </Reveal>
      )}

      {/* RAMA B: FEEDBACK PRIVADO (1 A 3 ESTRELLAS) -> ESCALACIÓN WHATSAPP */}
      {!isPositive && (
        <Reveal delay={100}>
          <div className="w-full rounded-2xl bg-[#1c1b1f] border border-[#ffb4ab]/40 p-5 shadow-xl flex flex-col gap-4 relative overflow-hidden">
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-0.5">
                <div className="inline-flex items-center gap-1 text-[#ffb4a3] font-label-sm text-[10px] uppercase font-bold tracking-wider">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>{t("Canal Directo de Calidad", "Direct Quality Channel")}</span>
                </div>
                <h2 className="font-headline-sm text-lg text-[#e6e1e7] font-bold">
                  {t("Lamentamos no haber alcanzado la perfección", "We're sorry we didn't meet perfection")}
                </h2>
              </div>
              <span className="w-9 h-9 rounded-full bg-[#2b292e] flex items-center justify-center text-[#ffb4a3] text-base shrink-0">
                🛡️
              </span>
            </div>

            <p className="font-body-sm text-xs text-[#ccc3d8] leading-relaxed">
              {t(
                "Deseamos escuchar tu opinión honesta para compensar tu experiencia y corregirlo inmediatamente en sala.",
                "We want to hear your feedback directly to compensate you and resolve this right away."
              )}
            </p>

            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t("Cuéntanos qué podemos mejorar en tu mesa...", "Tell us what we can improve...")}
              className="w-full rounded-xl bg-[#0f0e12] border border-[#363439] text-[#e6e1e7] text-xs p-3.5 focus:border-[#f2be71] focus:outline-none transition-all placeholder:text-[#958da1]"
            />

            <button
              type="button"
              onClick={handleSendPrivateFeedback}
              className="w-full h-12 rounded-full bg-[#c1553d] hover:bg-[#d8654c] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all cursor-pointer"
            >
              <Send className="h-4 w-4" />
              <span>{t("Enviar Feedback Confidencial a Gerencia", "Send Confidential Feedback to Manager")}</span>
            </button>

            {hasSentPrivate && (
              <p className="text-xs text-[#10b981] text-center font-medium">
                {t("✓ Mensaje enviado confidencialmente.", "✓ Message sent confidentially.")}
              </p>
            )}
          </div>
        </Reveal>
      )}

      {/* Botón para pasar a la 2ª Oportunidad (Reto 10.00s) */}
      <Reveal delay={150}>
        <div className="pt-2 flex flex-col gap-2">
          {onUnlockSecondChance && (
            <button
              type="button"
              onClick={onUnlockSecondChance}
              className="w-full h-13 py-3 px-6 rounded-full btn-gold text-sm font-bold flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(242,190,113,0.35)] active:scale-98 transition-all cursor-pointer hover:brightness-105"
            >
              <Trophy className="h-4 w-4" />
              <span>{t("Continuar a la 2ª Oportunidad (Reto 10.00s)", "Continue to 2nd Chance (10.00s Challenge)")}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </Reveal>
    </div>
  );
}
