import { useState } from "react";
import { SecondChanceConfig } from "./gameTypes";
import { useLanguage } from "@/context/LanguageContext";
import { Reveal } from "@/components/shared/Reveal";
import { Camera, MessageCircle, CheckCircle2, ArrowRight, ShieldCheck, ArrowLeft } from "lucide-react";
import { clientConfig } from "@/config/clientConfig";
import { waLink } from "@/data/site";

interface StepSecondChanceVerifyProps {
  secondChanceConfig: SecondChanceConfig;
  participantName?: string;
  participantWhatsapp?: string;
  tableNumber?: string;
  onProceedToChallenge: () => void;
  onBack: () => void;
}

export function StepSecondChanceVerify({
  secondChanceConfig,
  participantName = "Invitado",
  participantWhatsapp = "",
  tableNumber = "Mesa 1",
  onProceedToChallenge,
  onBack,
}: StepSecondChanceVerifyProps) {
  const { t } = useLanguage();
  const [hasSentScreenshot, setHasSentScreenshot] = useState(false);

  // Mensaje prellenado para enviar la captura al WhatsApp del restaurante
  const defaultMsg =
    secondChanceConfig.whatsappVerificationMessage ||
    `¡Hola ${clientConfig.brand.name}! 📸 Aquí les comparto la captura de pantalla de mi Estado de WhatsApp para validar mi 2ª oportunidad en el Reto del Cronómetro.\n\nMesa: ${tableNumber}\nCliente: ${participantName}\nTeléfono: ${participantWhatsapp}`;

  const handleOpenRestaurantChat = () => {
    window.open(waLink(defaultMsg), "_blank", "noopener,noreferrer");
    setHasSentScreenshot(true);
  };

  return (
    <div className="max-w-xl mx-auto py-4 sm:py-6">
      <Reveal>
        <div className="text-center space-y-3 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-800 text-xs font-bold tracking-wide">
            <Camera className="h-3.5 w-3.5 text-emerald-600" />
            <span>{t("Paso 2 de 2: Verificación", "Step 2 of 2: Verification")}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-neutral-900 tracking-tight">
            {t("Envía tu Captura por WhatsApp", "Send your Screenshot via WhatsApp")}
          </h2>

          <p className="text-xs sm:text-sm text-neutral-600 max-w-md mx-auto leading-relaxed">
            {t(
              "Toma una captura de pantalla a tu Estado de WhatsApp publicado y compártela a nuestro chat para validar tu participación.",
              "Take a screenshot of your published WhatsApp Status and share it to our chat to validate your entry."
            )}
          </p>
        </div>
      </Reveal>

      {/* Pasos Visuales Simples */}
      <Reveal delay={80}>
        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm space-y-6">
          {/* Instrucción 1 */}
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold text-base shrink-0">
              📸
            </div>
            <div>
              <h4 className="text-sm font-bold text-neutral-900 mb-1">
                {t("1. Toma captura de tu Estado", "1. Take a screenshot of your Status")}
              </h4>
              <p className="text-xs text-neutral-500 leading-relaxed">
                {t(
                  "Ve a tus Estados en WhatsApp y haz una captura de pantalla donde se vea tu publicación de recomendación.",
                  "Go to your WhatsApp Statuses and take a screenshot showing your recommendation post."
                )}
              </p>
            </div>
          </div>

          {/* Instrucción 2: Botón de WhatsApp */}
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center font-bold text-base shrink-0">
              💬
            </div>
            <div className="flex-1 space-y-2">
              <h4 className="text-sm font-bold text-neutral-900 mb-1">
                {t("2. Envíala a nuestro WhatsApp oficial", "2. Send it to our official WhatsApp")}
              </h4>
              <p className="text-xs text-neutral-500 leading-relaxed mb-3">
                {t(
                  "Pulsa el botón verde para abrir el chat del restaurante con tu mesa y nombre ya identificados:",
                  "Click the green button to open the restaurant's chat with your table and name pre-filled:"
                )}
              </p>

              <button
                type="button"
                onClick={handleOpenRestaurantChat}
                className="w-full py-3.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                <MessageCircle className="h-4 w-4" />
                <span>{t("Enviar Captura al WhatsApp del Restaurante", "Send Screenshot to Restaurant WhatsApp")}</span>
              </button>
            </div>
          </div>

          {/* Nota de Tranquilidad para el Comensal */}
          <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/80 flex items-start gap-2.5 text-xs text-neutral-600">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <strong>{t("Sin esperas:", "No waiting:")}</strong>{" "}
              {t(
                "Puedes entrar al reto de inmediato. El mesero verificará la captura en el chat al momento de redimir tu premio en la mesa o en caja.",
                "You can enter the challenge right away. The server will check the screenshot in chat when you redeem your prize at the table or cashier."
              )}
            </p>
          </div>

          {/* Botón de Entrada Inmediata al Reto */}
          <div className="pt-2 border-t border-neutral-100 space-y-3">
            <button
              type="button"
              onClick={onProceedToChallenge}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-sm tracking-wide shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 cursor-pointer active:scale-[0.98]"
            >
              <span>{t("¡Listo, captura enviada! Entrar al Reto ➔", "Done, screenshot sent! Enter Challenge ➔")}</span>
              <ArrowRight className="h-5 w-5" />
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-700 font-medium cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>{t("Volver al paso anterior", "Back to previous step")}</span>
              </button>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
