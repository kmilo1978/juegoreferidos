import { useState } from "react";
import { WonPrize } from "./gameTypes";
import { useLanguage } from "@/context/LanguageContext";
import { Reveal } from "@/components/shared/Reveal";
import { GoldenQRCode } from "./GoldenQRCode";
import { CheckCircle2, Share2, Sparkles } from "lucide-react";
import { waLink } from "@/data/site";
import logoHeader from "@/assets/logo-header.png";
import { StepFeedback } from "./StepFeedback";

interface StepPrizeClaimProps {
  prize: WonPrize;
  onValidateAtCashier: () => void;
}

export function StepPrizeClaim({ prize, onValidateAtCashier }: StepPrizeClaimProps) {
  const { lang, t } = useLanguage();
  const [showValidationConfirm, setShowValidationConfirm] = useState(false);

  const isUsed = prize.status === "UTILIZADO";

  const prizeDisplayName = lang === "en" ? prize.prizeNameEn : prize.prizeName;
  const whatsappMessage = `🎉 ¡Hola, ${prize.participantName}!
Gracias por dejarnos tu feedback y participar en nuestro juego de mesa.

*¡Ganaste ${prizeDisplayName} en tu cuenta de hoy! 🍽️*

Presenta este código único al momento de pagar:
👉 *${prize.uniqueCode}*

Mesa: ${prize.tableNumber}
Fecha: ${prize.wonAt}
Restaurante: Bliss Soul Bakery

¡Gracias por visitarnos y endulzar tu día con nosotros! ❤️`;

  const handleOpenWhatsApp = () => {
    window.open(waLink(whatsappMessage), "_blank", "noopener,noreferrer");
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
                src={logoHeader}
                alt="Bliss Soul Bakery | Voucher oficial de beneficio en mesa"
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

            {/* Código QR Dorado de Alta Tolerancia */}
            <div className="flex flex-col items-center justify-center py-2">
              <GoldenQRCode
                value={`https://blisssoulbakery.com/juego-qr?val=${prize.uniqueCode}`}
                size={210}
              />
              <div className="mt-3">
                <span className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground block">
                  {t("Código Único de Canje", "Unique Voucher Code")}
                </span>
                <span className="font-mono text-xl sm:text-2xl font-bold tracking-widest text-gold selection:bg-gold selection:text-white">
                  {prize.uniqueCode}
                </span>
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
            </div>

            {/* Acciones principales: WhatsApp y Validación en Caja */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={handleOpenWhatsApp}
                className="w-full inline-flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs uppercase tracking-[0.18em] font-medium shadow-sm transition-all"
              >
                <Share2 className="h-4 w-4" />
                <span>{t("Enviar comprobante a WhatsApp", "Send voucher to WhatsApp")}</span>
              </button>

              {/* Botón de Validación en Caja */}
              {!isUsed ? (
                <div>
                  {!showValidationConfirm ? (
                    <button
                      type="button"
                      onClick={() => setShowValidationConfirm(true)}
                      className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl border border-gold text-gold hover:bg-gold hover:text-white text-xs uppercase tracking-[0.18em] font-medium transition-all"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>
                        {t(
                          "Validar en caja (Uso por el personal)",
                          "Redeem at register (Staff use)",
                        )}
                      </span>
                    </button>
                  ) : (
                    <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-center space-y-3">
                      <p className="text-xs text-amber-900 font-medium">
                        {t(
                          "¿Confirmar aplicación del descuento en la cuenta de hoy? Esta acción es irreversible.",
                          "Confirm applying discount to today's bill? This action is irreversible.",
                        )}
                      </p>
                      <div className="flex items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            onValidateAtCashier();
                            setShowValidationConfirm(false);
                          }}
                          className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold uppercase tracking-wider hover:bg-emerald-700 transition-colors"
                        >
                          {t("Sí, aplicar descuento", "Yes, apply discount")}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowValidationConfirm(false)}
                          className="px-4 py-2 border border-border bg-white text-muted-foreground rounded-lg text-xs hover:text-foreground transition-colors"
                        >
                          {t("Cancelar", "Cancel")}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-muted text-center text-xs text-muted-foreground">
                  <p>
                    {t(
                      "✓ Este premio ya fue redimido en caja. No puede volver a utilizarse.",
                      "✓ This prize has already been redeemed at checkout. It cannot be reused.",
                    )}
                  </p>
                </div>
              )}
            </div>
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

      {/* SECCIÓN FINAL DE GRATITUD: Feedback con Google Maps (4-5 estrellas) o WhatsApp (1-3 estrellas) */}
      <div className="mt-14 pt-10 border-t border-gold/30">
        <div className="text-center mb-2">
          <p className="text-[11px] uppercase tracking-[0.24em] text-gold font-semibold">
            {t("Broche de Oro", "Final Touch")}
          </p>
          <h3 className="font-display text-xl sm:text-2xl text-foreground mt-1">
            {t("¿Cómo estuvo tu experiencia en Bliss Soul?", "How was your Bliss Soul experience?")}
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
    </div>
  );
}
