import { useState } from "react";
import { SecondChanceConfig } from "./gameTypes";
import { useLanguage } from "@/context/LanguageContext";
import { Reveal } from "@/components/shared/Reveal";
import { Sparkles, MessageCircle, ArrowRight, CheckCircle2, ShieldCheck, Share2 } from "lucide-react";
import { clientConfig } from "@/config/clientConfig";
import { waShareLink } from "@/data/site";
import tartaVascaImg from "@/assets/tarta-vasca.jpg";

interface StepSecondChanceShareProps {
  secondChanceConfig: SecondChanceConfig;
  participantName?: string;
  tableNumber?: string;
  onProceedToVerify: () => void;
  onSkip?: () => void;
}

export function StepSecondChanceShare({
  secondChanceConfig,
  participantName = "Invitado",
  tableNumber = "Mesa",
  onProceedToVerify,
  onSkip,
}: StepSecondChanceShareProps) {
  const { t } = useLanguage();
  const [hasClickedShare, setHasClickedShare] = useState(false);

  // Obtener la imagen del premio (catálogo o URL externa)
  const prizeImage = secondChanceConfig.prizeImageUrl?.includes("tarta-vasca")
    ? tartaVascaImg
    : secondChanceConfig.prizeImageUrl || tartaVascaImg;

  // Texto sugerido para compartir en Estados de WhatsApp
  const shareText =
    secondChanceConfig.whatsappStatusText ||
    `¡Disfrutando de una tarde increíble en ${clientConfig.brand.name}! ☕🍰 Los mejores postres y café de autor. ¡Recomendadísimo! ✨`;

  const handleOpenWhatsAppStatus = () => {
    // Abre WhatsApp con el texto listo para publicar en Estado o enviar a amigos
    window.open(waShareLink(shareText), "_blank", "noopener,noreferrer");
    setHasClickedShare(true);
  };

  return (
    <div className="max-w-xl mx-auto py-4 sm:py-6">
      <Reveal>
        <div className="text-center space-y-3 mb-6">
          {/* Badge superior */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-800 text-xs font-bold tracking-wide">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            <span>{t("Segunda Oportunidad Exclusiva", "Exclusive Second Chance")}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-neutral-900 tracking-tight">
            {t("¡Gana una Segunda Oportunidad!", "Win a Second Chance!")}
          </h2>

          <p className="text-xs sm:text-sm text-neutral-600 max-w-md mx-auto leading-relaxed">
            {t(
              "Por dejarnos tu valiosa opinión, desbloqueaste una oportunidad especial. Comparte tu experiencia en tus ",
              "For sharing your valuable review, you unlocked a special chance. Share your experience on your "
            )}
            <strong className="text-emerald-700 font-semibold">
              {t("Estados de WhatsApp", "WhatsApp Statuses")}
            </strong>
            {t(
              " para jugar en el Reto del Cronómetro de Precisión.",
              " to play in the Precision Timer Challenge."
            )}
          </p>
        </div>
      </Reveal>

      {/* Tarjeta del Premio a Desbloquear */}
      <Reveal delay={80}>
        <div className="rounded-3xl border-2 border-amber-500/30 bg-white p-5 sm:p-6 shadow-lg mb-6 overflow-hidden relative">
          <div className="absolute top-0 right-0 bg-amber-500 text-neutral-900 text-[10px] font-extrabold uppercase px-3 py-1 rounded-bl-xl tracking-wider">
            {t("Premio en Juego", "Prize at Stake")}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl overflow-hidden shrink-0 shadow-md border border-neutral-200">
              <img
                src={prizeImage}
                alt={secondChanceConfig.prizeName}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = tartaVascaImg;
                }}
              />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold text-amber-700 uppercase tracking-widest">
                {t("Reto de Precisión 10s", "10s Precision Challenge")}
              </span>
              <h3 className="text-lg sm:text-xl font-serif font-bold text-neutral-900">
                {secondChanceConfig.prizeName}
              </h3>
              <p className="text-xs text-neutral-500 line-clamp-2">
                {secondChanceConfig.prizeDescription}
              </p>
              <div className="pt-1 flex items-center justify-center sm:justify-start gap-2 text-[11px] font-semibold text-emerald-700">
                <span>⏱️ {secondChanceConfig.maxAttempts} {t("intentos para frenar en 10.000s", "attempts to stop at 10.000s")}</span>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Paso a Paso para el Comensal */}
      <Reveal delay={120}>
        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
            <span className="h-6 w-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
              1
            </span>
            <h4 className="text-sm font-bold text-neutral-900">
              {t("Publica en tus Estados de WhatsApp", "Post on your WhatsApp Statuses")}
            </h4>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/60 space-y-2">
            <p className="text-xs font-medium text-emerald-950">
              {t("Texto que se publicará:", "Text that will be shared:")}
            </p>
            <p className="text-xs text-emerald-900/80 italic bg-white/80 p-3 rounded-xl border border-emerald-100 font-mono">
              "{shareText}"
            </p>
            <p className="text-[11px] text-emerald-700 font-light">
              💡 {t("Al pulsar el botón se abrirá WhatsApp. Selecciona 'Mi estado' y publica.", "Clicking will open WhatsApp. Select 'My status' and post.")}
            </p>
          </div>

          {/* Botón Principal para compartir en Estados */}
          <button
            type="button"
            onClick={handleOpenWhatsAppStatus}
            className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm tracking-wide shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-3 cursor-pointer active:scale-[0.98]"
          >
            <Share2 className="h-5 w-5" />
            <span>{t("📲 Compartir en mis Estados de WhatsApp", "📲 Share on my WhatsApp Statuses")}</span>
          </button>

          {/* Confirmación y avance al paso 6 */}
          <div className="pt-2 text-center space-y-3">
            {hasClickedShare ? (
              <div className="space-y-3 animate-fade-in">
                <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-100/60 px-3 py-1.5 rounded-full">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>{t("¡WhatsApp abierto! Ahora continuemos.", "WhatsApp opened! Now let's continue.")}</span>
                </div>
                <button
                  type="button"
                  onClick={onProceedToVerify}
                  className="w-full py-3.5 px-6 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-amber-400 font-bold text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{t("Continuar al Envío de Captura", "Continue to Send Screenshot")}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onProceedToVerify}
                className="text-xs text-neutral-500 hover:text-neutral-900 font-medium underline underline-offset-4 cursor-pointer"
              >
                {t("Ya lo compartí, continuar al siguiente paso →", "I already shared, continue to next step →")}
              </button>
            )}

            {onSkip && (
              <div>
                <button
                  type="button"
                  onClick={onSkip}
                  className="text-[11px] text-neutral-400 hover:text-neutral-600 cursor-pointer"
                >
                  {t("No deseo participar en la 2ª oportunidad", "I don't wish to participate in the 2nd chance")}
                </button>
              </div>
            )}
          </div>
        </div>
      </Reveal>
    </div>
  );
}
