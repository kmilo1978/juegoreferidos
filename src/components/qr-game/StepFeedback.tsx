import { useState, useEffect } from "react";
import { FeedbackData, SecondChanceConfig, WonPrize } from "./gameTypes";
import { useLanguage } from "@/context/LanguageContext";
import { Reveal } from "@/components/shared/Reveal";
import {
  ExternalLink,
  MessageCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Star,
  ShieldCheck,
  Send,
} from "lucide-react";
import { waLink } from "@/data/site";
import emblemaDorado from "@/assets/emblema-dorado.png";
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
  const [rating, setRating] = useState<number>(initialFeedback?.rating || 0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [name, setName] = useState<string>(customerName);
  const [comment, setComment] = useState<string>(initialFeedback?.comment || "");
  const [hasSentWhatsApp, setHasSentWhatsApp] = useState(false);
  const [googleReviewUrl, setGoogleReviewUrl] = useState<string>(
    clientConfig.channels.googleMapsReviewUrl || "https://g.page/r/CfPSfNSGX8u1EBM/review"
  );
  const [whatsappPrivate, setWhatsappPrivate] = useState<string>(
    clientConfig.channels.whatsappNumber || "573000000000"
  );

  // Sincronizar configuración del Embudo de Reputación desde el Backend
  useEffect(() => {
    fetch("/api/reputation")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success && data.config) {
          if (data.config.googleBusinessUrl) {
            setGoogleReviewUrl(data.config.googleBusinessUrl);
          }
          if (data.config.whatsappPrivateNumber) {
            setWhatsappPrivate(data.config.whatsappPrivateNumber);
          }
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (customerName && !name) {
      setName(customerName);
    }
  }, [customerName]);

  const ratingLabels: Record<number, string> = {
    1: t("1 DE 5 · EXPERIENCIA DEFICIENTE", "1 OUT OF 5 · POOR EXPERIENCE"),
    2: t("2 DE 5 · POR DEBAJO DE LO ESPERADO", "2 OUT OF 5 · BELOW EXPECTATIONS"),
    3: t("3 DE 5 · ACEPTABLE · HAY ASPECTOS POR MEJORAR", "3 OUT OF 5 · FAIR · ROOM TO IMPROVE"),
    4: t("4 DE 5 · MUY BUENA EXPERIENCIA", "4 OUT OF 5 · VERY GOOD EXPERIENCE"),
    5: t("5 DE 5 · ¡EXTRAORDINARIA! · INOLVIDABLE", "5 OUT OF 5 · EXTRAORDINARY · UNFORGETTABLE"),
  };

  const [hasClickedGoogle, setHasClickedGoogle] = useState(false);
  const [hasReturnedToTab, setHasReturnedToTab] = useState(false);

  // Detectar cuándo el comensal vuelve de la app de Google Maps / pestaña de Google
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible" && hasClickedGoogle) {
        setHasReturnedToTab(true);
      }
    };
    const onFocus = () => {
      if (hasClickedGoogle) {
        setHasReturnedToTab(true);
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("focus", onFocus);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("focus", onFocus);
    };
  }, [hasClickedGoogle]);

  const handleSelectRating = (val: number) => {
    setRating(val);
    if (onComplete) {
      onComplete({ rating: val, comment });
    }

    // Registrar en el backend
    fetch("/api/reputation/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: name || customerName || "Comensal",
        rating: val,
        actionTaken: val >= 4 ? "google" : "whatsapp",
      }),
    }).catch(() => {});

    // Si es 4 o 5 estrellas, abrimos Google My Business automáticamente
    if (val >= 4) {
      setHasClickedGoogle(true);
      window.open(googleReviewUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleSendWhatsAppSuggestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    // Registrar feedback completo en el backend
    fetch("/api/reputation/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: name.trim() || customerName || "Comensal",
        rating: rating || 3,
        comment: comment.trim(),
        actionTaken: "whatsapp",
      }),
    }).catch(() => {});

    const stars = "★".repeat(rating || 3);
    const clientSignature = name.trim() ? `\nDe: ${name.trim()}` : "";
    const msg = `Hola Administración de Bliss Soul Bakery,\nEstuve de visita y califiqué mi experiencia con ${rating}/5 (${stars}).${clientSignature}\n\nSugerencia privada para mejorar:\n"${comment.trim()}"`;

    window.open(waLink(msg, whatsappPrivate), "_blank", "noopener,noreferrer");
    setHasSentWhatsApp(true);

    if (onComplete) {
      onComplete({ rating, comment });
    }
  };

  const handleOpenGoogleDirectly = () => {
    setHasClickedGoogle(true);
    window.open(googleReviewUrl, "_blank", "noopener,noreferrer");
    fetch("/api/reputation/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: name || customerName || "Comensal",
        rating: rating || 5,
        actionTaken: "google",
      }),
    }).catch(() => {});
  };

  return (
    <div className="max-w-2xl mx-auto py-6 text-left">
      <Reveal>
        <div>
          {/* LÍNEA Y SECCIÓN: — TU EXPERIENCIA */}
          <div className="flex items-center gap-2 mb-2.5">
            <span className="h-0.5 w-6 bg-gold" />
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-gold font-bold">
              {t("Tu Experiencia", "Your Experience")}
            </span>
          </div>

          {/* TÍTULO PRINCIPAL SERIF */}
          <h2 className="font-serif text-2xl sm:text-4xl text-neutral-900 font-normal tracking-tight leading-snug">
            {t(
              "Tu opinión es esencial y nos ayuda a mejorar.",
              "Your opinion is essential and helps us improve."
            )}
          </h2>

          {/* SUBTÍTULO DESCRIPTIVO */}
          <p className="mt-3 text-xs sm:text-sm text-neutral-600 font-light leading-relaxed max-w-xl">
            {t(
              "En Bliss Soul Bakery cada visita busca ser una pausa serena e inolvidable. ¿Cómo fue tu experiencia hoy? Califica con nuestros emblemas:",
              "At Bliss Soul Bakery every visit seeks to be a serene and unforgettable pause. How was your experience today? Rate with our emblems:"
            )}
          </p>
        </div>
      </Reveal>

      {/* TARJETA DEL PREMIO GANADO EN EL CARRUSEL */}
      {wonPrize && (
        <Reveal delay={40}>
          <div className="mt-6 max-w-xl mx-auto p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-gold/15 to-amber-500/10 border border-gold/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-gold text-white flex items-center justify-center text-xl shrink-0 shadow-xs">
                🏆
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-amber-800 font-bold">
                  {t("¡Beneficio del Carrusel Reservado!", "Carousel Benefit Secured!")}
                </p>
                <h4 className="text-sm sm:text-base font-serif font-bold text-neutral-900">
                  {wonPrize.prizeName}
                </h4>
                <p className="text-[11px] font-mono text-amber-900/80">
                  {t("Código:", "Code:")} {wonPrize.uniqueCode}
                </p>
              </div>
            </div>
            <div className="text-[11px] text-amber-900 bg-white/90 px-3.5 py-1.5 rounded-full border border-gold/40 font-semibold shadow-2xs shrink-0">
              ⭐ {t("Califícanos en Google y activa la 2ª Opción", "Rate on Google & activate 2nd Chance")}
            </div>
          </div>
        </Reveal>
      )}

      {/* SELECTOR INTERACTIVO DE 5 EMBLEMAS */}
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
                  className="group flex flex-col items-center p-1.5 sm:p-2 focus:outline-hidden cursor-pointer bg-transparent transition-transform hover:scale-110 active:scale-95"
                  aria-label={`${val} de 5 puntos`}
                >
                  <img
                    src={emblemaDorado}
                    alt=""
                    aria-hidden="true"
                    className={`h-10 sm:h-12 w-auto object-contain transition-all duration-300 pointer-events-none ${
                      isHighlighted
                        ? "brightness-100 drop-shadow-[0_2px_12px_rgba(162,126,44,0.45)] scale-110"
                        : "brightness-0 opacity-25 group-hover:opacity-60"
                    }`}
                  />
                  <span
                    className={`mt-2 text-xs tracking-wider transition-colors font-mono ${
                      isHighlighted ? "text-gold font-bold" : "text-neutral-400"
                    }`}
                  >
                    {val}
                  </span>
                </button>
              );
            })}
          </div>

          {/* LEYENDA INFORMATIVA BAJO LOS EMBLEMAS */}
          <p className="mt-4 h-6 text-[11px] sm:text-xs uppercase tracking-widest transition-all text-center">
            {hoveredRating || rating ? (
              <span className="text-gold font-bold">
                {ratingLabels[hoveredRating || rating]}
              </span>
            ) : (
              <span className="text-neutral-400 font-medium tracking-[0.2em]">
                {t("HAZ CLIC EN UN EMBLEMA PARA CALIFICAR", "CLICK AN EMBLEM TO RATE")}
              </span>
            )}
          </p>
        </div>
      </Reveal>

      {/* CASO 1: 1 A 3 ESTRELLAS -> FILTRO DE CONTENCIÓN A WHATSAPP PRIVADO */}
      {rating > 0 && rating <= 3 && (
        <Reveal delay={120}>
          <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8 text-left shadow-xs animate-fade-in">
            {/* Encabezado con icono circular de mensaje */}
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-gold border border-gold/30 text-lg shadow-2xs">
                💬
              </div>
              <div>
                <h3 className="font-serif text-base sm:text-lg text-neutral-900 font-medium">
                  {t("Queremos escucharte y aprender de ti", "We want to listen and learn from you")}
                </h3>
                <p className="text-xs text-neutral-500 font-light mt-0.5">
                  {t(
                    "Tu mensaje llegará directamente a la administración para atenderlo",
                    "Your message will reach administration directly to take care of it"
                  )}
                </p>
              </div>
            </div>

            {/* Línea divisoria sutil */}
            <div className="border-b border-neutral-100 my-4" />

            <p className="text-xs sm:text-sm text-neutral-600 font-light leading-relaxed mb-5">
              {t(
                "Lamentamos profundamente que tu visita no haya sido del todo perfecta. Tu opinión sincera nos ayuda a corregir detalles y seguir mejorando cada día:",
                "We deeply regret that your visit wasn't completely perfect. Your honest feedback helps us correct details and improve every day:"
              )}
            </p>

            <form onSubmit={handleSendWhatsAppSuggestion} className="space-y-4">
              <div>
                <label className="block text-[10px] sm:text-[11px] uppercase tracking-wider text-neutral-500 font-semibold mb-1.5">
                  {t("TU NOMBRE (OPCIONAL)", "YOUR NAME (OPTIONAL)")}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. María Gómez"
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-white text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-gold/50 transition-all placeholder:text-neutral-400"
                />
              </div>

              <div>
                <label className="block text-[10px] sm:text-[11px] uppercase tracking-wider text-neutral-500 font-semibold mb-1.5">
                  {t("¿QUÉ PODEMOS MEJORAR? *", "WHAT CAN WE IMPROVE? *")}
                </label>
                <textarea
                  required
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Cuéntanos qué sucedió con total confianza (atención, producto, tiempo de espera)..."
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-white text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-gold/50 transition-all resize-none placeholder:text-neutral-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-5 rounded-xl border border-gold/70 bg-white hover:bg-amber-500/5 text-neutral-900 text-xs sm:text-[13px] uppercase tracking-[0.14em] font-medium flex items-center justify-between shadow-2xs hover:shadow-sm transition-all cursor-pointer group active:scale-[0.99]"
              >
                <span className="flex items-center gap-2">
                  <span className="text-base">💬</span>
                  <span className="text-left font-serif font-medium">
                    {t(
                      "ENVIAR SUGERENCIA A NUESTRO WHATSAPP PRIVADO",
                      "SEND FEEDBACK TO OUR PRIVATE WHATSAPP"
                    )}
                  </span>
                </span>
                <ArrowRight className="h-4 w-4 text-gold group-hover:translate-x-1 transition-transform shrink-0" />
              </button>

              {hasSentWhatsApp && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2 animate-fade-in">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>
                    {t(
                      "✓ ¡Gracias por tu sugerencia! Ha sido enviada a la administración para atender tu caso personalmente.",
                      "✓ Thank you! Your feedback has been sent to administration to personally assist you."
                    )}
                  </span>
                </div>
              )}
            </form>
          </div>
        </Reveal>
      )}

      {/* CASO 2: 4 A 5 ESTRELLAS -> REDIRECCIÓN A GOOGLE MY BUSINESS & 2ª OPORTUNIDAD */}
      {rating >= 4 && (
        <Reveal delay={120}>
          <div className="mt-8 rounded-2xl border border-gold/40 bg-white p-6 sm:p-8 text-left shadow-sm animate-fade-in space-y-6">
            {/* Encabezado con estrella dorada */}
            <div>
              <div className="flex items-center gap-3.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold border border-gold/30 shadow-2xs">
                  <Star className="h-5 w-5 fill-gold text-gold" />
                </div>
                <div>
                  <h3 className="font-serif text-base sm:text-lg text-neutral-900 font-medium">
                    {t("¡Nos alegra profundamente saberlo!", "We are truly delighted to hear that!")}
                  </h3>
                  <p className="text-xs text-neutral-500 font-light mt-0.5">
                    {t(
                      "Tu reseña en Google My Business nos ayuda a seguir creciendo",
                      "Your Google My Business review helps us continue to grow"
                    )}
                  </p>
                </div>
              </div>

              {/* Línea divisoria */}
              <div className="border-b border-neutral-100 my-4" />

              <p className="text-xs sm:text-sm text-neutral-600 font-light leading-relaxed mb-5">
                {t(
                  "Tu recomendación es el mayor impulso para todo nuestro equipo. Tu reseña en Google ayuda a que más amantes del buen café y la repostería artesanal nos conozcan:",
                  "Your recommendation is the greatest boost for our team. Your Google review helps more lovers of good coffee and artisan pastry discover us:"
                )}
              </p>

              {/* Botón directo a Google My Business */}
              <button
                type="button"
                onClick={handleOpenGoogleDirectly}
                className="w-full py-3.5 px-5 rounded-xl bg-gold hover:bg-gold/90 active:scale-[0.99] text-white text-xs sm:text-[13px] uppercase tracking-[0.14em] font-semibold flex items-center justify-between shadow-md hover:shadow-lg transition-all cursor-pointer group"
              >
                <span className="flex items-center gap-2">
                  <Star className="h-4 w-4 fill-white text-white shrink-0" />
                  <span className="text-left font-serif">
                    {t("ESCRIBIR RESEÑA EN GOOGLE MY BUSINESS", "WRITE REVIEW ON GOOGLE MY BUSINESS")}
                  </span>
                </span>
                <ExternalLink className="h-4 w-4 shrink-0 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* ESTADO INTELIGENTE DE RETORNO TRAS CALIFICAR EN GOOGLE */}
            {onUnlockSecondChance && secondChanceConfig?.enabled !== false && (
              <div className="pt-6 border-t-2 border-dashed border-amber-500/30 text-center space-y-4">
                {hasReturnedToTab ? (
                  /* ESTADO 1: EL CLIENTE YA REGRESÓ DE GOOGLE MAPS */
                  <div className="bg-gradient-to-br from-amber-500/15 via-gold/10 to-amber-500/5 p-6 sm:p-7 rounded-3xl border-2 border-gold shadow-lg animate-fade-in space-y-3.5">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-800 text-xs font-bold animate-bounce">
                      <span>🎉</span>
                      <span>{t("¡Bienvenido de vuelta a tu mesa!", "Welcome back to your table!")}</span>
                    </div>

                    <h4 className="text-lg sm:text-xl font-serif font-bold text-neutral-900">
                      {t("¡Tu 2ª Oportunidad está 100% Desbloqueada!", "Your 2nd Chance is 100% Unlocked!")}
                    </h4>

                    <p className="text-xs sm:text-sm text-neutral-600 font-light max-w-md mx-auto leading-relaxed">
                      {t(
                        "Muchísimas gracias por tu reseña en Google. Tu turno en el Reto del Cronómetro de 10s está listo para que te lleves la:",
                        "Thank you so much for your Google review. Your turn in the 10s Precision Challenge is ready to win the:"
                      )}
                      <strong className="text-amber-800 font-bold block mt-1 text-sm font-serif">
                        {secondChanceConfig?.prizeName || "Tarta Vasca de Pistacho y Queso"}
                      </strong>
                    </p>

                    <div className="pt-2 flex justify-center">
                      <button
                        type="button"
                        onClick={onUnlockSecondChance}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 py-4 px-10 rounded-2xl bg-gradient-to-r from-amber-600 via-orange-500 to-amber-700 hover:from-amber-700 hover:to-orange-600 text-white text-xs sm:text-sm uppercase tracking-wider font-bold shadow-xl hover:shadow-2xl transition-all cursor-pointer animate-pulse active:scale-[0.98]"
                      >
                        <span>{t("🎯 JUGAR SEGUNDA OPCIÓN AHORA (PASO 6) ➔", "🎯 PLAY 2ND CHANCE NOW (STEP 6) ➔")}</span>
                      </button>
                    </div>
                  </div>
                ) : hasClickedGoogle ? (
                  /* ESTADO 2: EL CLIENTE ACABA DE TOCAR GOOGLE (ESPERANDO REGRESO) */
                  <div className="bg-amber-50/90 p-5 sm:p-6 rounded-2xl border-2 border-dashed border-amber-400 shadow-sm space-y-3">
                    <div className="flex items-center justify-center gap-2 text-amber-900 text-xs font-bold uppercase tracking-wider">
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-ping" />
                      <span>{t("🌟 Abriendo Google Maps... Te esperamos en mesa", "🌟 Opening Google Maps... Waiting for you")}</span>
                    </div>

                    <p className="text-xs text-neutral-600 max-w-md mx-auto leading-relaxed">
                      {t(
                        "Publica tu reseña y vuelve a esta pantalla. Si la app no te detectó automáticamente, presiona el botón abajo:",
                        "Publish your review and return to this screen. If the app didn't auto-detect, tap below:"
                      )}
                    </p>

                    <div className="pt-1 flex justify-center">
                      <button
                        type="button"
                        onClick={onUnlockSecondChance}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-8 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs uppercase tracking-wider font-bold shadow-md transition-all cursor-pointer"
                      >
                        <span>{t("✅ ¡Listo, ya califiqué! ➔ Ir al Paso 6", "✅ Done, I reviewed! ➔ Go to Step 6")}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ESTADO 3: INCENTIVO INICIAL PARA CALIFICAR */
                  <div className="bg-gradient-to-br from-amber-50/70 via-white to-amber-50/50 p-5 sm:p-6 rounded-2xl border border-amber-200/80 space-y-2.5">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-800 text-xs font-bold">
                      <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                      <span>{t("Incentivo Exclusivo en Mesa", "Exclusive Table Incentive")}</span>
                    </div>

                    <h4 className="text-sm sm:text-base font-serif font-bold text-neutral-900">
                      {t("¡Tu reseña en Google desbloquea tu 2ª Oportunidad!", "Your Google review unlocks your 2nd Chance!")}
                    </h4>

                    <p className="text-xs text-neutral-600 font-light max-w-md mx-auto leading-relaxed">
                      {t(
                        "Al calificar tu visita en Google, el sistema te habilitará de inmediato el Reto del Cronómetro de 10s para ganarte una porción de:",
                        "By reviewing your visit on Google, you immediately unlock the 10s Timer Challenge to win a portion of:"
                      )}
                      <strong className="text-amber-800 font-bold block mt-0.5 text-xs font-serif">
                        {secondChanceConfig?.prizeName || "Tarta Vasca de Pistacho y Queso"}
                      </strong>
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </Reveal>
      )}
    </div>
  );
}
