import { useState, useRef } from "react";
import { InstagramEvidence } from "./gameTypes";
import { useLanguage } from "@/context/LanguageContext";
import { Reveal } from "@/components/shared/Reveal";
import {
  Camera,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Copy,
  Check,
  ShieldCheck,
  MapPin,
  ExternalLink,
  MessageCircle,
} from "lucide-react";
import heroImg from "@/assets/hero-pistacho-cafe.jpg";
import { clientConfig } from "@/config/clientConfig";
import { getBrandConfig } from "@/lib/brandService";
import { waLink } from "@/data/site";

interface StepInstagramStoryProps {
  participantName: string;
  tableNumber: string;
  initialEvidence?: InstagramEvidence | undefined;
  onBack: () => void;
  onComplete: (evidence: InstagramEvidence) => void;
}

export function StepInstagramStory({
  participantName,
  tableNumber,
  initialEvidence,
  onBack,
  onComplete,
}: StepInstagramStoryProps) {
  const { t } = useLanguage();
  const brand = getBrandConfig();
  const instaHandle = brand.instagramHandle || clientConfig.channels.instagramHandle || "@tuexperiencia";

  const [previewUrl, setPreviewUrl] = useState<string | undefined>(
    initialEvidence?.screenshotFileUrl || heroImg
  );
  const [copiedMention, setCopiedMention] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleCopyMention = () => {
    navigator.clipboard?.writeText(instaHandle);
    setCopiedMention(true);
    setTimeout(() => setCopiedMention(false), 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError(t("Sube una imagen válida (PNG, JPG o WebP).", "Upload a valid image."));
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreviewUrl(ev.target?.result as string);
      setUploadError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleShareWhatsApp = () => {
    const phone = (brand.whatsappNumber || clientConfig.channels.whatsappNumber || "").replace(/\D/g, "");
    const msg = `¡Hola! 📸 Les comparto la foto de mi pedido en la ${tableNumber} (Cliente: ${participantName}) para validar mi visita y girar la Ruleta.`;
    if (phone) {
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank", "noopener,noreferrer");
    } else {
      window.open(waLink(msg), "_blank", "noopener,noreferrer");
    }
  };

  const handleProceedToRoulette = () => {
    onComplete({
      storyGenerated: true,
      screenshotFileUrl: previewUrl,
      sharedVia: "instagram",
      instagramHandle: instaHandle,
    });
  };

  return (
    <div className="w-full flex flex-col gap-5">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Barra de progreso de etapa estilo Stitch */}
      <Reveal>
        <section className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#201f23] text-[#f2be71] border border-[#f2be71]/30">
              <Sparkles className="h-3.5 w-3.5 text-[#f2be71]" />
              <span className="font-label-sm text-[10px] uppercase tracking-wider font-bold">
                {t("PASO 2 DE 7 • SOCIAL PROOF & REDES", "STEP 2 OF 7 • SOCIAL PROOF")}
              </span>
            </div>
            <span className="font-label-sm text-[11px] text-[#ccc3d8] font-medium">28% Completado</span>
          </div>

          <div className="w-full h-1.5 rounded-full bg-[#2b292e] overflow-hidden mt-1">
            <div className="h-full rounded-full bg-[#f2be71] shadow-[0_0_10px_rgba(242,190,113,0.7)] w-[28%] transition-all duration-500" />
          </div>
        </section>
      </Reveal>

      {/* Título de la Etapa */}
      <Reveal delay={50}>
        <section className="flex flex-col gap-1.5">
          <h1 className="font-headline-xl-mobile text-2xl sm:text-3xl text-[#e6e1e7] tracking-tight">
            {t("Comparte tu Foto en", "Share Your Photo on")}{" "}
            <span className="text-[#f2be71] italic font-serif">Instagram Stories</span>
          </h1>
          <p className="font-body-md text-sm text-[#ccc3d8] leading-relaxed">
            {t(
              "Sube una foto de tu mesa a Instagram Stories con nuestra mención para desbloquear tu giro garantizado en la ruleta de premios.",
              "Post a photo on Instagram Stories tagging us to unlock your spin on the prize wheel."
            )}
          </p>
        </section>
      </Reveal>

      {/* Story Mockup Frame Interactivo estilo Stitch */}
      <Reveal delay={100}>
        <div className="relative w-full rounded-2xl bg-[#0f0e12] border border-[#2b292e] p-3 shadow-2xl overflow-hidden flex flex-col items-center">
          {/* Ambient Glow */}
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-[#f2be71]/10 rounded-full blur-3xl pointer-events-none" />

          {/* Marco visual de Instagram Story */}
          <div className="relative w-full max-w-xs h-[360px] rounded-xl overflow-hidden shadow-inner bg-[#141317]">
            <img
              src={previewUrl || heroImg}
              alt="Mesa de Autor"
              className="w-full h-full object-cover brightness-90"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />

            {/* Cabecera del Story Mockup */}
            <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#f2be71] to-[#ffddb1] p-0.5">
                  <div className="w-full h-full rounded-full bg-[#141317] flex items-center justify-center font-bold text-xs text-[#f2be71]">
                    {clientConfig.brand.name.charAt(0)}
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-white font-bold leading-none flex items-center gap-1">
                    {clientConfig.brand.name}
                    <span className="text-[#d1bcff]">✓</span>
                  </span>
                  <span className="text-[10px] text-white/70">Ahora • Mesa En Vivo</span>
                </div>
              </div>
              <div className="px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-md text-[10px] text-white/90">
                {tableNumber}
              </div>
            </div>

            {/* Stickers Flotantes Interactivos */}
            <div className="absolute inset-x-3 top-16 flex flex-col gap-2 z-10">
              {/* Sticker de Mención con Toque para Copiar */}
              <button
                type="button"
                onClick={handleCopyMention}
                className="self-start cursor-pointer transition-transform active:scale-95 flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0f0e12]/85 backdrop-blur-xl border border-[#f2be71]/40 shadow-lg text-left"
              >
                <span className="w-2 h-2 rounded-full bg-[#d1bcff] animate-pulse" />
                <span className="text-xs font-bold text-white tracking-wide">{instaHandle}</span>
                {copiedMention ? (
                  <Check className="h-3.5 w-3.5 text-[#10b981]" />
                ) : (
                  <Copy className="h-3.5 w-3.5 text-[#f2be71]" />
                )}
              </button>

              {/* Sticker de Ubicación */}
              <div className="self-start flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#201f23]/80 backdrop-blur-md border border-[#363439]">
                <MapPin className="h-3 w-3 text-[#f2be71]" />
                <span className="text-[10px] text-[#e6e1e7]">{tableNumber} • Comedor Principal</span>
              </div>

              {/* Gastronomía Hashtag */}
              <div className="self-start px-2.5 py-0.5 rounded-full bg-[#684400]/80 border border-[#f2be71]/40 text-[10px] text-[#ffddb1] font-semibold">
                ✨ #ExperienciaGourmet
              </div>
            </div>

            {/* Botón inferior para tomar o cambiar foto */}
            <div className="absolute bottom-3 inset-x-3 z-10">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2 px-3 rounded-full bg-[#0f0e12]/80 backdrop-blur-lg border border-[#363439] flex items-center justify-center gap-2 text-white hover:bg-[#1c1b1f] transition-all shadow-md active:scale-95 cursor-pointer text-xs font-semibold"
              >
                <Camera className="h-3.5 w-3.5 text-[#f2be71]" />
                <span>{t("Tocar para tomar o cambiar foto", "Tap to take or change photo")}</span>
              </button>
            </div>
          </div>

          {/* Toast de confirmación de copiado */}
          {copiedMention && (
            <div className="mt-2 py-1.5 px-4 rounded-full bg-[#201f23] border border-[#10b981]/50 text-xs text-[#10b981] flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{t(`Mención ${instaHandle} copiada al portapapeles`, `Tagged handle copied to clipboard`)}</span>
            </div>
          )}
          {uploadError && <p className="text-xs text-red-400 mt-2">{uploadError}</p>}
        </div>
      </Reveal>

      {/* Botones de Acción */}
      <Reveal delay={150}>
        <div className="flex flex-col gap-2.5">
          {/* Botón Principal: Subir a Instagram Stories */}
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleCopyMention}
            className="relative overflow-hidden w-full h-14 rounded-full shadow-[0_8px_24px_rgba(253,29,29,0.3)] active:scale-98 transition-all flex items-center justify-between px-6 text-white cursor-pointer hover:brightness-110"
            style={{
              background: "linear-gradient(135deg, #833AB4 0%, #FD1D1D 50%, #FCB045 100%)",
            }}
          >
            <div className="flex items-center gap-3">
              <Camera className="h-5 w-5" />
              <div className="flex flex-col text-left">
                <span className="font-label-lg text-sm font-bold leading-tight">
                  {t("Abrir Instagram Stories", "Open Instagram Stories")}
                </span>
                <span className="text-[10px] text-white/90">
                  {t(`Copia mención ${instaHandle} automáticamente`, `Copies ${instaHandle} tag automatically`)}
                </span>
              </div>
            </div>
            <ExternalLink className="h-4 w-4" />
          </a>

          {/* Botón Secundario: WhatsApp Fallback */}
          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="w-full h-12 rounded-full bg-[#1c1b1f] hover:bg-[#201f23] border border-[#2b292e] px-4 flex items-center justify-between text-[#e6e1e7] shadow-sm active:scale-98 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#047857]/30 border border-[#10b981]/30 flex items-center justify-center text-[#10b981]">
                <MessageCircle className="h-4 w-4" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-semibold text-[#e6e1e7]">
                  {t("¿No usas Instagram? Enviar por WhatsApp", "Don't use Instagram? Send via WhatsApp")}
                </span>
                <span className="text-[10px] text-[#ccc3d8]">
                  {t("Atención directa en mesa", "Direct attention at table")}
                </span>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-[#f2be71]" />
          </button>

          {/* Pastilla de Validación en Sala */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#1c1b1f] border border-[#2b292e] shadow-sm mt-1">
            <ShieldCheck className="h-4 w-4 text-[#f2be71] shrink-0" />
            <p className="font-body-sm text-xs text-[#ccc3d8] leading-snug">
              <strong className="text-[#e6e1e7] font-semibold">
                {t("Validación en sala:", "Table validation:")}
              </strong>{" "}
              {t(
                "Tu mesero o el sistema validarán tu historia para entregarte tu premio.",
                "Your waiter or system will validate your story to redeem your prize."
              )}
            </p>
          </div>

          {/* Botón de destino para continuar a la ruleta */}
          <div className="pt-2 flex flex-col gap-2">
            <button
              type="button"
              onClick={handleProceedToRoulette}
              className="w-full h-13 py-3 px-6 rounded-full btn-gold text-sm flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(242,190,113,0.35)] active:scale-98 transition-all cursor-pointer hover:brightness-105"
            >
              <span>{t("¡Listo, ir a Girar la Ruleta!", "Ready, go spin the wheel!")}</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <div className="flex items-center justify-center gap-1.5 text-center text-[#ccc3d8]">
              <span className="text-xs">🔓</span>
              <span className="font-label-sm text-[11px]">
                {t(
                  "Desbloquea tu giro asegurado en la Etapa 3 • 1 giro garantizado",
                  "Unlocks your guaranteed spin in Step 3 • 1 spin per table"
                )}
              </span>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
