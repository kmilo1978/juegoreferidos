import { useState } from "react";
import { FeedbackData } from "./gameTypes";
import { useLanguage } from "@/context/LanguageContext";
import { Reveal } from "@/components/shared/Reveal";
import { ExternalLink, MessageCircle, CheckCircle2, Sparkles, ArrowRight } from "lucide-react";
import { waLink } from "@/data/site";
import emblemaDorado from "@/assets/emblema-dorado.png";

interface StepFeedbackProps {
  initialFeedback?: FeedbackData | undefined;
  customerName?: string | undefined;
  isStandAlone?: boolean | undefined;
  onComplete?: ((data: FeedbackData) => void) | undefined;
  onSwitchToGame?: (() => void) | undefined;
}

export function StepFeedback({
  initialFeedback,
  customerName = "",
  isStandAlone = false,
  onComplete,
  onSwitchToGame,
}: StepFeedbackProps) {
  const { t } = useLanguage();
  const [rating, setRating] = useState<number>(initialFeedback?.rating || 0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [name, setName] = useState<string>(customerName);
  const [comment, setComment] = useState<string>(initialFeedback?.comment || "");
  const [hasSentWhatsApp, setHasSentWhatsApp] = useState(false);

  const ratingLabels: Record<number, string> = {
    1: t("1 de 5 · Experiencia deficiente", "1 out of 5 · Poor experience"),
    2: t("2 de 5 · Por debajo de lo esperado", "2 out of 5 · Below expectations"),
    3: t("3 de 5 · Aceptable · Hay aspectos por mejorar", "3 out of 5 · Fair · Room to improve"),
    4: t("4 de 5 · Muy buena experiencia", "4 out of 5 · Very good experience"),
    5: t("5 de 5 · ¡Extraordinaria! · Inolvidable", "5 out of 5 · Extraordinary · Unforgettable"),
  };

  const handleSelectRating = (val: number) => {
    setRating(val);
    if (onComplete) {
      onComplete({ rating: val, comment });
    }
    // Si es 4 o 5 estrellas, abrimos Google Maps automáticamente
    if (val >= 4) {
      window.open("https://g.page/r/CfPSfNSGX8u1EBM/review", "_blank", "noopener,noreferrer");
    }
  };

  const handleSendWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    const stars = "★".repeat(rating || 1);
    const nameLine = name.trim() ? `De: ${name.trim()}\n` : "";
    const msg = `Hola Bliss Soul Bakery, estuve de visita y califiqué mi experiencia con ${rating}/5 (${stars}).\n${nameLine}Comentario / sugerencia para mejorar:\n"${comment.trim()}"`;

    window.open(waLink(msg), "_blank", "noopener,noreferrer");
    setHasSentWhatsApp(true);

    if (onComplete) {
      onComplete({ rating, comment });
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6">
      <Reveal>
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="h-px w-6 bg-gold" />
            <span className="text-xs uppercase tracking-[0.24em] text-gold font-medium">
              {t("Tu Opinión", "Your Feedback")}
            </span>
            <span className="h-px w-6 bg-gold" />
          </div>

          <h2 className="font-display text-2xl sm:text-3xl text-foreground font-normal tracking-tight">
            {t(
              "Tu opinión es esencial y nos ayuda a mejorar.",
              "Your opinion is essential and helps us improve.",
            )}
          </h2>

          <p className="mt-3 text-sm text-muted-foreground font-light leading-relaxed max-w-lg mx-auto">
            {t(
              "En Bliss Soul Bakery cada visita busca ser una pausa serena e inolvidable. ¿Cómo fue tu experiencia hoy? Califica con nuestros emblemas:",
              "At Bliss Soul Bakery, every visit strives to be a serene, unforgettable pause. How was your experience today? Rate with our emblems:",
            )}
          </p>
        </div>
      </Reveal>

      {/* Selector interactivo de 5 emblemas oficiales */}
      <Reveal delay={80}>
        <div className="mt-8 flex flex-col items-center">
          <div
            className="flex items-center justify-center gap-3 sm:gap-6"
            role="radiogroup"
            aria-label={t("Califica tu experiencia", "Rate your experience")}
          >
            {[1, 2, 3, 4, 5].map((val) => {
              const isHighlighted = val <= (hoveredRating || rating);
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleSelectRating(val)}
                  onMouseEnter={() => setHoveredRating(val)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="group flex flex-col items-center p-2 focus:outline-none cursor-pointer bg-transparent transition-transform hover:scale-110 active:scale-95"
                  aria-label={`${val} ${t("de 5 puntos", "out of 5 points")}`}
                >
                  <img
                    src={emblemaDorado}
                    alt=""
                    aria-hidden="true"
                    className={`h-9 sm:h-11 w-auto object-contain transition-all duration-300 pointer-events-none ${
                      isHighlighted
                        ? "brightness-100 drop-shadow-[0_2px_12px_rgba(162,126,44,0.45)] scale-110"
                        : "brightness-0 opacity-30 group-hover:opacity-60"
                    }`}
                  />
                  <span
                    className={`mt-2 text-xs tracking-wider transition-colors font-mono ${
                      isHighlighted ? "text-gold font-semibold" : "text-muted-foreground/60"
                    }`}
                  >
                    {val}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Etiqueta dinámica de la calificación */}
          <p className="mt-4 h-6 text-xs uppercase tracking-widest text-muted-foreground transition-all">
            {hoveredRating || rating ? (
              <span className="text-gold font-medium">{ratingLabels[hoveredRating || rating]}</span>
            ) : (
              <span className="text-muted-foreground/70">
                {t("Toca un emblema para calificar", "Click an emblem to rate")}
              </span>
            )}
          </p>
        </div>
      </Reveal>

      {/* CASO 1: 4 a 5 estrellas -> Google Reviews directo */}
      {rating >= 4 && (
        <Reveal delay={120}>
          <div className="mt-8 rounded-2xl border border-gold/40 bg-card p-6 sm:p-8 shadow-md text-center animate-fade-in">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gold/15 text-gold mb-3">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="font-display text-xl sm:text-2xl text-foreground font-normal">
              {t("¡Nos alegra profundamente saberlo!", "We are truly delighted to hear that!")}
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground font-light leading-relaxed max-w-lg mx-auto">
              {t(
                "Tu recomendación es el mayor impulso para todo nuestro equipo. Tu reseña en Google ayuda a que más amantes del buen café y la repostería artesanal nos conozcan.",
                "Your recommendation is the greatest boost for our team. Your Google review helps more lovers of good coffee and artisan pastry discover us.",
              )}
            </p>

            <div className="mt-6 flex items-center justify-center">
              <a
                href="https://g.page/r/CfPSfNSGX8u1EBM/review"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-solid inline-flex items-center gap-2 py-3 px-6 text-xs uppercase tracking-[0.18em] font-medium shadow-xs"
              >
                <span>{t("Escribir reseña en Google Maps", "Write review on Google Maps")}</span>
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        </Reveal>
      )}

      {/* CASO 2: 1 a 3 estrellas -> Comentario constructivo directo a WhatsApp */}
      {rating > 0 && rating <= 3 && (
        <Reveal delay={120}>
          <div className="mt-8 rounded-2xl border border-border/80 bg-card p-6 sm:p-8 text-left shadow-xs animate-fade-in">
            <div className="flex items-center gap-3 border-b border-border/70 pb-4 mb-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold/10 text-gold">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-base sm:text-lg text-foreground font-normal">
                  {t(
                    "Queremos escucharte y aprender de ti",
                    "We want to listen and learn from you",
                  )}
                </h3>
                <p className="text-xs text-muted-foreground font-light">
                  {t(
                    "Tu mensaje llegará directamente a la administración para atenderlo.",
                    "Your message will go directly to administration for attention.",
                  )}
                </p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground font-light leading-relaxed mb-4">
              {t(
                "Lamentamos profundamente que tu visita no haya sido del todo perfecta. Tu opinión sincera nos ayuda a corregir detalles y seguir mejorando cada día:",
                "We deeply regret that your visit wasn't completely perfect. Your honest feedback helps us correct details and improve every day:",
              )}
            </p>

            <form onSubmit={handleSendWhatsApp} className="space-y-4">
              <div>
                <label
                  htmlFor="feedback-name"
                  className="block text-xs uppercase tracking-[0.16em] text-foreground font-medium mb-1.5"
                >
                  {t("Tu nombre (Opcional)", "Your name (Optional)")}
                </label>
                <input
                  id="feedback-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("Ej. María Gómez", "E.g. Maria Gomez")}
                  className="w-full rounded-xl border border-border/80 bg-background px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                />
              </div>

              <div>
                <label
                  htmlFor="feedback-comment"
                  className="block text-xs uppercase tracking-[0.16em] text-foreground font-medium mb-1.5"
                >
                  {t("¿Qué podemos mejorar? *", "What can we improve? *")}
                </label>
                <textarea
                  id="feedback-comment"
                  required
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={t(
                    "Cuéntanos qué sucedió con total confianza (atención, producto, tiempo de espera)...",
                    "Tell us what happened in full confidence (service, product, wait time)...",
                  )}
                  className="w-full rounded-xl border border-border/80 bg-background px-4 py-3 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                />
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-start gap-3">
                <button
                  type="submit"
                  className="btn-outline w-full sm:w-auto inline-flex items-center justify-center gap-2 border-gold text-gold hover:bg-gold hover:text-white py-3 px-6 text-xs uppercase tracking-[0.18em] font-medium transition-all shadow-xs"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>
                    {hasSentWhatsApp
                      ? t("Sugerencia enviada a WhatsApp", "Suggestion sent to WhatsApp")
                      : t(
                          "Enviar sugerencia a nuestro WhatsApp privado",
                          "Send suggestion to our private WhatsApp",
                        )}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>
        </Reveal>
      )}

      {/* Único botón oficial para alternar a jugar por premios */}
      {onSwitchToGame && (
        <div className="mt-10 text-center pt-6 border-t border-border/60">
          <p className="text-xs text-muted-foreground font-light mb-2.5">
            {t(
              "¿Prefieres jugar primero para obtener un premio o descuento en tu cuenta?",
              "Would you prefer to play first to earn a prize or discount on your bill?",
            )}
          </p>
          <button
            type="button"
            onClick={onSwitchToGame}
            className="inline-flex items-center gap-2 py-2.5 px-5 rounded-full border border-gold/40 bg-gold/5 text-gold hover:bg-gold/15 text-xs uppercase tracking-[0.18em] font-medium transition-all"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>
              {t("Jugar por premios con la ruleta →", "Play for prizes with the roulette →")}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
