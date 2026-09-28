import { useState, useEffect } from "react";
import { WonPrize } from "./gameTypes";
import { useLanguage } from "@/context/LanguageContext";
import { Reveal } from "@/components/shared/Reveal";
import { GoldenQRCode } from "./GoldenQRCode";
import { CheckCircle2, Share2, Sparkles, Bell, Flame, Zap, Lock } from "lucide-react";
import { waLink } from "@/data/site";
import logoHeader from "@/assets/logo-header.png";
import { StepFeedback } from "./StepFeedback";
import { clientConfig } from "@/config/clientConfig";
import { OneSignalService } from "@/lib/oneSignalService";
import { DigitalStampCard } from "./DigitalStampCard";
import { StampService } from "@/lib/stampService";
import { PinAuthModal } from "./PinAuthModal";
import { SupabaseService } from "@/lib/supabaseService";

interface StepPrizeClaimProps {
  prize: WonPrize;
  onValidateAtCashier: () => void;
}

export function StepPrizeClaim({ prize, onValidateAtCashier }: StepPrizeClaimProps) {
  const { lang, t } = useLanguage();
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

  const isUsed = prize.status === "UTILIZADO";

  const prizeDisplayName = lang === "en" ? prize.prizeNameEn : prize.prizeName;
  const whatsappMessage = `🎉 ¡Hola, ${prize.participantName}!
Gracias por dejarnos tu feedback y participar en nuestro juego de mesa.

*¡Ganaste ${prizeDisplayName} en tu cuenta de hoy! 🍽️*

Presenta este código único al momento de pagar:
👉 *${prize.uniqueCode}*

Mesa: ${prize.tableNumber}
Fecha: ${prize.wonAt}
Restaurante: ${clientConfig.brand.name}

¡Gracias por visitarnos y endulzar tu día con nosotros! ❤️`;

  const handleOpenWhatsApp = () => {
    window.open(waLink(whatsappMessage), "_blank", "noopener,noreferrer");
  };

  const handleReferFriend = () => {
    const brandName = clientConfig.brand.name;
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const inviteMessage = `¡Hola! Te recomiendo mucho visitar *${brandName}* 🍽️✨\n\nEl ambiente y la comida son espectaculares. Además, cuando vayas a visitarlos y te sientes en tu mesa, puedes escanear el QR y participar en su Ruleta de Premios:\n👉 ${origin}?ref=${encodeURIComponent(prize.participantName)}\n\n¡Vamos juntos o visítalos hoy, te va a encantar!`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(inviteMessage)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const [stampCard, setStampCard] = useState(() =>
    StampService.getCustomerStampCard(prize.participantWhatsapp)
  );

  const createdAtMs = prize.createdAt || Date.now();
  const expiryMs = createdAtMs + 7 * 24 * 60 * 60 * 1000;
  const expiryDate = new Date(expiryMs).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const isHappyHourNow = StampService.isHappyHour();

  // GEMA 2: Temporizador en vivo segundo a segundo
  const [timeLeft, setTimeLeft] = useState(() => {
    const diff = Math.max(0, expiryMs - Date.now());
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    return { days, hours, minutes, seconds, totalMs: diff };
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = Math.max(0, expiryMs - Date.now());
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setTimeLeft({ days, hours, minutes, seconds, totalMs: diff });
    }, 1000);

    return () => clearInterval(interval);
  }, [expiryMs]);

  const totalPeriodMs = 7 * 24 * 60 * 60 * 1000;
  const progressPercent = Math.min(100, Math.max(2, (timeLeft.totalMs / totalPeriodMs) * 100));

  const [isPushSubscribed, setIsPushSubscribed] = useState(() => OneSignalService.isSubscribed());

  const handleEnablePush = async () => {
    const granted = await OneSignalService.requestPermission({
      name: prize.participantName,
      prize: prize.prizeName,
      code: prize.uniqueCode,
      table: prize.tableNumber,
    });
    if (granted) {
      setIsPushSubscribed(true);
      OneSignalService.showLocalTestNotification(
        "¡Recordatorio activado! 🎁",
        `Tu beneficio "${prize.prizeName}" está listo para redimir en mesa o caja.`
      );
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Reveal>
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="h-px w-6 bg-gold" />
            <span className="text-xs uppercase tracking-[0.24em] text-gold font-medium">
              {t("Paso 5 · Tu Premio", "Step 5 · Your Prize")}
            </span>
            <span className="h-px w-6 bg-gold" />
          </div>

          <h2 className="font-display text-2xl sm:text-3xl text-foreground font-normal tracking-tight">
            {t("¡Felicitaciones,", "Congratulations,")}{" "}
            <span className="text-gold italic">{prize.participantName}</span>!
          </h2>

          <p className="mt-2 text-sm text-muted-foreground font-light max-w-md mx-auto">
            {t(
              "Tu participación ha sido registrada. Presenta el siguiente código QR o comprobante al momento de pagar en caja.",
              "Your participation has been recorded. Present this QR voucher at the checkout counter.",
            )}
          </p>
        </div>
      </Reveal>

      {/* Tarjeta de Voucher de Lujo */}
      <Reveal delay={100}>
        <div className="mt-8 rounded-3xl border-2 border-gold/40 bg-card overflow-hidden shadow-[0_12px_40px_rgba(162,126,44,0.12)]">
          {/* Cabecera del Voucher */}
          <div className="bg-gradient-to-r from-ink via-neutral-900 to-ink p-6 text-white text-center relative overflow-hidden border-b border-gold/30">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#d1b374_1px,transparent_1px)] [background-size:16px_16px]" />
            <div className="relative z-10 space-y-2">
              <img
                src={clientConfig.brand.logoUrl || logoHeader}
                alt={`${clientConfig.brand.name} | Voucher oficial de beneficio en mesa`}
                className="h-10 w-auto mx-auto object-contain brightness-0 invert"
              />
              <p className="text-[10px] uppercase tracking-[0.24em] text-gold font-semibold">
                VOUCHER OFICIAL DE BENEFICIO EN MESA
              </p>
            </div>
          </div>

          {/* Cuerpo del Voucher */}
          <div className="p-6 sm:p-9 text-center space-y-6">
            {/* Estado del premio */}
            <div className="flex justify-center">
              <div
                className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-colors ${
                  isUsed
                    ? "bg-muted text-muted-foreground border border-border line-through"
                    : "bg-emerald-50 text-emerald-700 border border-emerald-300"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    isUsed ? "bg-muted-foreground" : "bg-emerald-500 animate-pulse"
                  }`}
                />
                <span>
                  {isUsed
                    ? t("UTILIZADO · YA CANJEADO EN CAJA", "USED · REDEEMED AT REGISTER")
                    : t("DISPONIBLE PARA APLICAR", "AVAILABLE FOR REDEMPTION")}
                </span>
              </div>
            </div>

            {/* Nombre del premio ganado */}
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {t("Beneficio asignado", "Assigned benefit")}
              </p>
              <h3 className="font-display text-2xl sm:text-3xl text-foreground font-semibold">
                {prizeDisplayName}
              </h3>
            </div>

            {/* Código QR Dorado de Alta Tolerancia e interactivo para validación del personal */}
            <div className="flex flex-col items-center justify-center py-2">
              <div
                onClick={!isUsed ? () => setIsPinModalOpen(true) : undefined}
                className={`relative group p-3.5 rounded-3xl transition-all ${
                  !isUsed
                    ? "cursor-pointer bg-gold/5 hover:bg-gold/10 border-2 border-dashed border-gold/40 hover:border-gold/80 hover:shadow-md"
                    : "opacity-80 border-2 border-border bg-muted/20"
                }`}
                title={!isUsed ? t("Personal: Toca aquí para validar con PIN", "Staff: Tap here to validate with PIN") : undefined}
              >
                <GoldenQRCode
                  value={typeof window !== "undefined" ? `${window.location.origin}?val=${prize.uniqueCode}` : `https://beneficio.com?val=${prize.uniqueCode}`}
                  size={200}
                />

                {!isUsed && (
                  <div className="absolute inset-0 bg-ink/75 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl flex flex-col items-center justify-center text-white p-4 backdrop-blur-[2px]">
                    <div className="p-2.5 rounded-full bg-gold/20 border border-gold/50 mb-2">
                      <Lock className="h-6 w-6 text-gold" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-gold">
                      {t("Validar en Caja", "Validate at Cashier")}
                    </span>
                    <span className="text-[11px] text-neutral-300 mt-0.5">
                      {t("Uso del personal (PIN)", "Staff use only (PIN)")}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-3.5 text-center space-y-1">
                <span className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground block font-medium">
                  {t("Código Único de Canje", "Unique Voucher Code")}
                </span>
                <div className="font-mono text-2xl sm:text-3xl font-extrabold tracking-widest text-gold selection:bg-gold selection:text-white">
                  {prize.uniqueCode}
                </div>

                {/* Micro-trigger elegante integrado para el personal (evita botón tosco abajo) */}
                {!isUsed ? (
                  <div className="pt-1 flex justify-center">
                    <button
                      type="button"
                      onClick={() => setIsPinModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gold/10 hover:bg-gold/20 border border-gold/30 text-gold hover:text-amber-800 text-[11px] font-medium tracking-wide transition-all shadow-2xs cursor-pointer active:scale-95"
                    >
                      <Lock className="h-3 w-3 text-gold shrink-0" />
                      <span>{t("Personal de mesa / caja: Validar con PIN", "Staff only: Validate with PIN")}</span>
                    </button>
                  </div>
                ) : (
                  <div className="pt-1 flex justify-center">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-[11px] font-medium">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span>{t("✓ Canjeado con éxito en caja", "✓ Successfully redeemed at register")}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Metadatos del comprobante */}
            <div className="grid grid-cols-2 gap-3 text-left rounded-xl bg-muted/40 p-4 text-xs border border-border/60">
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase tracking-wider">
                  {t("Mesa / Cuenta", "Table / Bill")}
                </span>
                <span className="font-medium text-foreground">{prize.tableNumber}</span>
              </div>

              <div>
                <span className="text-muted-foreground block text-[10px] uppercase tracking-wider">
                  {t("Titular", "Holder")}
                </span>
                <span className="font-medium text-foreground truncate block">
                  {prize.participantName}
                </span>
              </div>

              <div>
                <span className="text-muted-foreground block text-[10px] uppercase tracking-wider">
                  {t("Fecha de emisión", "Issued on")}
                </span>
                <span className="font-medium text-foreground">{prize.wonAt}</span>
              </div>

              <div>
                <span className="text-muted-foreground block text-[10px] uppercase tracking-wider">
                  {t("WhatsApp registrado", "Registered WhatsApp")}
                </span>
                <span className="font-mono text-foreground">+{prize.participantWhatsapp}</span>
              </div>

              <div className="col-span-2 flex items-center justify-between pt-1 border-t border-border/40">
                <span className="text-muted-foreground text-[10px] uppercase tracking-wider">
                  ⏳ {t("Válido hasta:", "Valid until:")}
                </span>
                <span className="font-semibold text-amber-700 font-mono text-[11px]">
                  {expiryDate} (7 días)
                </span>
              </div>
            </div>

            {/* GEMA 2: TEMPORIZADOR DE CUENTA REGRESIVA VIVA EN EL CUPÓN (FOMO) */}
            {!isUsed && (
              <div className="rounded-2xl border-2 border-amber-400/50 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-background p-4 text-center space-y-2.5 shadow-xs">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                    <Flame className="h-4 w-4 text-orange-600 animate-bounce" />
                    {t("Cuenta Regresiva de Vencimiento", "Countdown to Expiration")}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-[10px] font-bold">
                    {t("FOMO · Válido por 7 días", "FOMO · Valid for 7 days")}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center py-1">
                  <div className="p-2 rounded-xl bg-background border border-amber-300 shadow-2xs">
                    <span className="font-mono text-xl sm:text-2xl font-black text-foreground block">
                      {String(timeLeft.days).padStart(2, "0")}
                    </span>
                    <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Días</span>
                  </div>
                  <div className="p-2 rounded-xl bg-background border border-amber-300 shadow-2xs">
                    <span className="font-mono text-xl sm:text-2xl font-black text-foreground block">
                      {String(timeLeft.hours).padStart(2, "0")}
                    </span>
                    <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Horas</span>
                  </div>
                  <div className="p-2 rounded-xl bg-background border border-amber-300 shadow-2xs">
                    <span className="font-mono text-xl sm:text-2xl font-black text-foreground block">
                      {String(timeLeft.minutes).padStart(2, "0")}
                    </span>
                    <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Min</span>
                  </div>
                  <div className="p-2 rounded-xl bg-background border border-amber-300 shadow-2xs">
                    <span className="font-mono text-xl sm:text-2xl font-black text-orange-600 block">
                      {String(timeLeft.seconds).padStart(2, "0")}
                    </span>
                    <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Seg</span>
                  </div>
                </div>

                {/* Barra decreciente de urgencia */}
                <div className="w-full bg-muted/60 h-2 rounded-full overflow-hidden border border-border">
                  <div
                    className="bg-gradient-to-r from-orange-500 via-amber-500 to-gold h-full rounded-full transition-all duration-1000"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <p className="text-[11px] text-muted-foreground">
                  {t(
                    "¡Presenta este comprobante en mesa o caja antes de que finalice el contador!",
                    "Present this voucher to staff before the countdown timer expires!"
                  )}
                </p>
              </div>
            )}

            {/* Acciones principales del cliente: Limpio, enfocado y sin botones redundantes */}
            <div className="space-y-2.5 pt-2">
              {/* Acción Hero Principal del Cliente: Guardar en WhatsApp */}
              <button
                type="button"
                onClick={handleOpenWhatsApp}
                className="w-full inline-flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white text-xs uppercase tracking-[0.18em] font-semibold shadow-md transition-all"
              >
                <Share2 className="h-4 w-4" />
                <span>{t("Enviar comprobante a WhatsApp", "Send voucher to WhatsApp")}</span>
              </button>

              {/* Botón sutil de Notificaciones Push (Recordatorio de urgencia) */}
              {!isPushSubscribed ? (
                <button
                  type="button"
                  onClick={handleEnablePush}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-sky-300 bg-sky-50/70 hover:bg-sky-100 text-sky-800 text-xs font-medium transition-all"
                >
                  <Bell className="h-3.5 w-3.5 text-sky-600" />
                  <span>{t("🔔 Recordarme en mi celular antes de que venza (Push)", "🔔 Remind me on phone before expiry (Push)")}</span>
                </button>
              ) : (
                <div className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-sky-500/10 border border-sky-400/30 text-sky-800 text-[11px] font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5 text-sky-600" />
                  <span>{t("✓ Recordatorios push activados en este dispositivo", "✓ Push reminders active on this device")}</span>
                </div>
              )}

              {/* Banner informativo de Hora Feliz (al canjear suma sellos dobles) */}
              {!isUsed && isHappyHourNow && (
                <div className="p-3 rounded-2xl bg-amber-500/15 border-2 border-gold text-amber-950 text-xs font-semibold flex items-center justify-center gap-2 shadow-xs animate-pulse">
                  <Zap className="h-4 w-4 text-amber-600 fill-amber-500 shrink-0" />
                  <span>
                    ⚡ {t("¡HORA FELIZ ACTIVA (3 PM - 6 PM)! Al validar en caja recibirás +2 SELLOS en tu tarjeta.", "⚡ HAPPY HOUR ACTIVE (3 PM - 6 PM)! Validation awards +2 STAMPS.")}
                  </span>
                </div>
              )}

              {/* Estado cuando ya fue canjeado */}
              {isUsed && (
                <div className="p-3.5 rounded-xl bg-muted text-center text-xs text-muted-foreground border border-border">
                  <p>
                    {t(
                      "✓ Este premio ya fue redimido en caja. No puede volver a utilizarse.",
                      "✓ This prize has already been redeemed at checkout. It cannot be reused.",
                    )}
                  </p>
                </div>
              )}
            </div>

            {/* Modal de PIN para el personal de mesa / cajero (se abre desde el QR o micro-trigger) */}
            <PinAuthModal
              isOpen={isPinModalOpen}
              onClose={() => setIsPinModalOpen(false)}
              onSuccess={() => {
                onValidateAtCashier();
                const updated = StampService.addStamp(prize.participantWhatsapp);
                setStampCard(updated);
                // Sincronizar en Supabase
                SupabaseService.validateCashierPin(prize.uniqueCode, updated.currentStamps).catch(() => {});
              }}
            />
          </div>

          {/* Ganadores semanales */}
          <div className="bg-muted/30 border-t border-border/70 p-5 text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs text-gold font-medium mb-1">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{t("Ganadores Semanales", "Weekly Winners")}</span>
            </div>
            <p className="text-xs text-muted-foreground font-light leading-relaxed max-w-lg mx-auto italic">
              “
              {t(
                "Cada domingo publicaremos en nuestros Estados de WhatsApp los ganadores de los premios especiales. Puedes volver a participar cada semana.",
                "Every Sunday we announce the weekly special prize winners on our WhatsApp Stories. You can participate again every week.",
              )}
              ”
            </p>
          </div>
        </div>
      </Reveal>

      {/* JOYA 1: TARJETA DE SELLOS DIGITALES (DIGITAL STAMP CARD) */}
      <Reveal delay={120}>
        <div className="mt-8">
          <DigitalStampCard stampCard={stampCard} customerName={prize.participantName} />
        </div>
      </Reveal>

      {/* SECCIÓN DE GRATITUD Y FEEDBACK: Google Maps (4-5 estrellas) o WhatsApp (1-3 estrellas) */}
      <div className="mt-12 pt-8 border-t border-gold/30">
        <div className="text-center mb-2">
          <p className="text-[11px] uppercase tracking-[0.24em] text-gold font-semibold">
            {t("Tu Opinión Nos Importa", "Your Opinion Matters")}
          </p>
          <h3 className="font-display text-xl sm:text-2xl text-foreground mt-1">
            {t(`¿Cómo estuvo tu experiencia en ${clientConfig.brand.name}?`, `How was your ${clientConfig.brand.name} experience?`)}
          </h3>
          <p className="text-xs text-muted-foreground font-light mt-1">
            {t(
              "Ahora que tienes tu premio, déjanos tu valoración. Si fue excelente, nos encantaría tu reseña en Google Maps.",
              "Now that you have your prize, share your rating. If it was extraordinary, we would love your Google Maps review.",
            )}
          </p>
        </div>

        <StepFeedback customerName={prize.participantName} isStandAlone={false} />
      </div>

      {/* MOTOR VIRAL DE REFERIDOS: INVITAR AMIGOS A VISITAR EL LOCAL */}
      <Reveal delay={150}>
        <div className="mt-12 rounded-3xl border border-amber-200/80 bg-gradient-to-br from-amber-50/80 via-white to-orange-50/50 p-6 sm:p-8 text-center shadow-sm">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100/90 text-amber-900 text-xs font-semibold uppercase tracking-wider mb-3">
            <Share2 className="h-3.5 w-3.5 text-amber-800" />
            <span>{t("Multiplica tus Oportunidades", "Multiply Your Chances")}</span>
          </div>

          <h3 className="font-display text-xl sm:text-2xl text-foreground font-medium">
            {t("¡Invita a tus amigos a visitar el local!", "Invite your friends to visit our place!")}
          </h3>

          <p className="mt-2 text-xs sm:text-sm text-muted-foreground font-light max-w-md mx-auto leading-relaxed">
            {t(
              "Comparte esta experiencia con tus amigos para que vengan a visitarnos. Cuando tus amigos vengan al local, se sienten a su mesa y prueben la ruleta con tu invitación, desbloqueas participaciones extra y beneficios exclusivos para tu próxima visita.",
              "Share this experience so your friends visit us. When they visit our venue, sit at their table and play the roulette, you unlock extra entries and exclusive perks for your next visit."
            )}
          </p>

          <div className="mt-5">
            <button
              type="button"
              onClick={handleReferFriend}
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs sm:text-sm tracking-wider uppercase shadow-md hover:shadow-lg transition-all"
            >
              <Share2 className="h-4 w-4" />
              <span>{t("Invitar Amigos a Visitar el Local", "Invite Friends to Visit")}</span>
            </button>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
