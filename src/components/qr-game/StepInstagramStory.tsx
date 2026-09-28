import { useState, useRef } from "react";
import { InstagramEvidence } from "./gameTypes";
import { useLanguage } from "@/context/LanguageContext";
import { Reveal } from "@/components/shared/Reveal";
import {
  Camera,
  Instagram,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  FileImage,
  ExternalLink,
  Coffee,
  Store,
  Users,
  Download,
  MessageCircle,
  Share2,
} from "lucide-react";
import logoHeader from "@/assets/logo-header.png";
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

  const [activeChannel, setActiveChannel] = useState<"instagram" | "whatsapp">("instagram");
  const [hasSharedWhatsApp, setHasSharedWhatsApp] = useState<boolean>(false);
  const [downloaded, setDownloaded] = useState<boolean>(initialEvidence?.storyGenerated || false);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(
    initialEvidence?.screenshotFileUrl,
  );
  const [handle, setHandle] = useState<string>(initialEvidence?.instagramHandle || "");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const hiddenCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Descarga opcional de la plantilla prediseñada para quien prefiera no tomar foto
  const handleDownloadStory = () => {
    const canvas = hiddenCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = 1080;
    const height = 1920;
    canvas.width = width;
    canvas.height = height;

    const bg = new Image();
    bg.src = heroImg;
    bg.crossOrigin = "anonymous";
    bg.onload = () => {
      ctx.drawImage(bg, 0, 0, width, height);

      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, "rgba(17, 17, 17, 0.75)");
      gradient.addColorStop(0.5, "rgba(17, 17, 17, 0.35)");
      gradient.addColorStop(1, "rgba(17, 17, 17, 0.88)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = "rgba(209, 179, 116, 0.5)";
      ctx.lineWidth = 14;
      ctx.strokeRect(60, 60, width - 120, height - 120);

      const logo = new Image();
      logo.src = logoHeader;
      logo.crossOrigin = "anonymous";
      logo.onload = () => {
        const logoW = 440;
        const logoH = 140;
        ctx.drawImage(logo, (width - logoW) / 2, 220, logoW, logoH);

        ctx.textAlign = "center";
        ctx.fillStyle = "#d1b374";
        ctx.font = "bold 26px sans-serif";
        ctx.letterSpacing = "6px";
        ctx.fillText("SABANETA · ANTIOQUIA", width / 2, 430);

        ctx.fillStyle = "#ffffff";
        ctx.font = "italic 44px Georgia, serif";
        ctx.fillText("“Una pausa serena hecha sabor y calma.”", width / 2, 1340);

        ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
        ctx.font = "30px sans-serif";
        ctx.fillText(`Momento compartido por ${participantName} · ${tableNumber}`, width / 2, 1420);

        ctx.fillStyle = "rgba(162, 126, 44, 0.95)";
        ctx.beginPath();
        ctx.roundRect((width - 560) / 2, 1540, 560, 110, 55);
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 38px sans-serif";
        ctx.fillText(clientConfig.channels.instagramHandle, width / 2, 1610);

        const dataUrl = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        const safeBrand = clientConfig.brand.name.replace(/[^a-zA-Z0-9]/g, "-");
        link.download = `Story-${safeBrand}-${participantName.replace(/\s+/g, "-")}.png`;
        link.href = dataUrl;
        link.click();

        setDownloaded(true);
      };
    };
  };

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setUploadError(
        t(
          "Por favor sube un archivo de imagen válido (PNG, JPG o WebP).",
          "Please upload a valid image file (PNG, JPG, or WebP).",
        ),
      );
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      setPreviewUrl(url);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleUseDemoScreenshot = () => {
    setPreviewUrl(heroImg);
    setUploadError(null);
  };

  const brand = getBrandConfig();
  const enableWhatsApp = brand.enableWhatsAppPhotoSubmission ?? true;

  const handleSharePhotoWhatsApp = () => {
    const phone = (brand.whatsappNumber || clientConfig.channels.whatsappNumber || "").replace(/\D/g, "");
    const template =
      brand.whatsappPhotoMessage ||
      "¡Hola {brandName}! 📸\nAquí les comparto la foto de mi pedido en la mesa {tableNumber} (Cliente: {participantName}) para validar mi visita y jugar en la Ruleta de Premios.";
    const msg = template
      .replace(/\{brandName\}/g, brand.name || clientConfig.brand.name)
      .replace(/\{tableNumber\}/g, tableNumber)
      .replace(/\{participantName\}/g, participantName);

    if (phone) {
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank", "noopener,noreferrer");
    } else {
      window.open(waLink(msg), "_blank", "noopener,noreferrer");
    }
    setHasSharedWhatsApp(true);
  };

  const handleNextWhatsApp = () => {
    onComplete({
      storyGenerated: true,
      screenshotFileUrl: previewUrl,
      sharedVia: "whatsapp",
      instagramHandle: "Foto enviada por WhatsApp",
    });
  };

  const handleNext = () => {
    if (enableWhatsApp && activeChannel === "whatsapp") {
      handleNextWhatsApp();
      return;
    }

    if (!previewUrl) {
      setUploadError(
        t(
          "Por favor adjunta la captura de pantalla de tu Story para continuar al juego.",
          "Please attach your Story screenshot to continue to the game.",
        ),
      );
      return;
    }

    onComplete({
      storyGenerated: downloaded,
      screenshotFileUrl: previewUrl,
      sharedVia: "instagram",
      instagramHandle: handle.trim() || undefined,
    });
  };

  return (
    <div className="max-w-2xl mx-auto py-6">
      <canvas ref={hiddenCanvasRef} className="hidden" />

      <Reveal>
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="h-px w-6 bg-gold" />
            <span className="text-xs uppercase tracking-[0.24em] text-gold font-medium">
              {t("Paso 2 · Comparte tu Foto y Juega", "Step 2 · Share Photo & Play")}
            </span>
            <span className="h-px w-6 bg-gold" />
          </div>

          <h2 className="font-display text-2xl sm:text-3xl text-foreground font-normal tracking-tight">
            {t("Comparte tu Foto de la Visita", "Share Your Visit Photo")}
          </h2>

          <p className="mt-2.5 text-sm text-muted-foreground font-light leading-relaxed max-w-lg mx-auto">
            {enableWhatsApp
              ? t(
                  `Publica una foto de tu mesa o pedido en Instagram Stories mencionando a ${brand.instagramHandle || clientConfig.channels.instagramHandle}, o si prefieres la sencillez de WhatsApp, envíala directamente a nuestro chat oficial.`,
                  `Post a photo of your table or order on Instagram Stories tagging ${brand.instagramHandle || clientConfig.channels.instagramHandle}, or if you prefer WhatsApp, send it directly to our official chat.`
                )
              : t(
                  `Publica una foto de tu mesa o pedido en Instagram Stories mencionando a ${brand.instagramHandle || clientConfig.channels.instagramHandle} para validar tu visita y girar la Ruleta de Premios.`,
                  `Post a photo of your table or order on Instagram Stories tagging ${brand.instagramHandle || clientConfig.channels.instagramHandle} to validate your visit and spin the Prize Roulette.`
                )}
          </p>

          {/* SELECTOR DUAL: Si WhatsApp está activo en el backend, permite alternar manteniendo Instagram como principal */}
          {enableWhatsApp && (
            <div className="flex justify-center mt-5">
              <div className="inline-flex p-1 rounded-2xl bg-muted/80 border border-border">
                <button
                  type="button"
                  onClick={() => setActiveChannel("instagram")}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeChannel === "instagram"
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Instagram className="h-4 w-4" />
                  <span>{t("📸 Instagram Story (Principal)", "📸 Instagram Story (Primary)")}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveChannel("whatsapp")}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeChannel === "whatsapp"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>{t("💬 Enviar Foto por WhatsApp", "💬 Send Photo via WhatsApp")}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </Reveal>

      {/* ========================================================================= */}
      {/* CANAL 2: WHATSAPP (ALTERNATIVA PARA ADULTOS QUE NO TIENEN O NO USAN IG)   */}
      {/* ========================================================================= */}
      {enableWhatsApp && activeChannel === "whatsapp" && (
        <Reveal delay={100}>
          <div className="mt-6 rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-xs space-y-5 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-center gap-3.5 p-4 rounded-xl bg-emerald-50/80 border border-emerald-300 text-emerald-950 text-center sm:text-left">
              <div className="h-11 w-11 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <MessageCircle className="h-6 w-6" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs uppercase tracking-wider font-bold">
                  {t("¿No usas Instagram? Envía tu foto por WhatsApp", "Don't use Instagram? Send photo via WhatsApp")}
                </p>
                <p className="text-[11px] text-emerald-800 font-light">
                  {t(
                    "Toma o sube una foto de tu café, postre o mesa y envíala a nuestro WhatsApp oficial para registrar tu visita y desbloquear tu ruleta.",
                    "Take or upload a photo of your coffee, dessert or table and send it to our official WhatsApp to record your visit and unlock your spin."
                  )}
                </p>
              </div>
            </div>

            {/* Subir o tomar foto para WhatsApp */}
            <div className="space-y-2">
              <label className="text-[11px] uppercase font-bold text-muted-foreground block tracking-wider text-left">
                {t("Foto de tu pedido o mesa:", "Photo of your order or table:")}
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
              />

              {!previewUrl ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-emerald-400/60 hover:border-emerald-600 bg-emerald-50/30 hover:bg-emerald-50/50 rounded-2xl p-6 text-center cursor-pointer transition-all"
                >
                  <Camera className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-emerald-950 uppercase tracking-wider">
                    {isUploading ? t("Cargando foto...", "Loading photo...") : t("Toca aquí para tomar o subir tu foto", "Tap here to take or upload your photo")}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {t("Foto de tu café, plato, postre o momento en mesa", "Photo of your coffee, plate or table moment")}
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl border border-emerald-300 bg-emerald-50/70 p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img src={previewUrl} alt="Foto de mesa" className="h-14 w-14 rounded-xl object-cover border border-emerald-300 shadow-xs" />
                    <div className="text-left">
                      <div className="inline-flex items-center gap-1.5 text-xs text-emerald-800 font-bold">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        <span>{t("Foto seleccionada", "Photo selected")}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        {t("Lista para enviar al WhatsApp de la casa.", "Ready to send to venue WhatsApp.")}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-emerald-700 underline hover:text-emerald-900 font-medium"
                  >
                    {t("Cambiar foto", "Change photo")}
                  </button>
                </div>
              )}
            </div>

            {/* Botón de envío directo al WhatsApp del restaurante */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleSharePhotoWhatsApp}
                className="w-full inline-flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white text-xs uppercase tracking-[0.18em] font-semibold shadow-md transition-all cursor-pointer"
              >
                <Share2 className="h-4 w-4" />
                <span>{t("📲 Enviar Foto a WhatsApp del Restaurante", "📲 Send Photo to Restaurant WhatsApp")}</span>
              </button>
            </div>

            {hasSharedWhatsApp && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center justify-center gap-2 animate-fade-in">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>{t("✓ ¡Foto enviada por WhatsApp! Ya puedes girar la ruleta.", "✓ Photo sent via WhatsApp! You can now spin the wheel.")}</span>
              </div>
            )}

            {/* Navegación WhatsApp */}
            <div className="pt-4 flex flex-col-reverse sm:flex-row items-center justify-between gap-4 border-t border-border/50">
              <button
                type="button"
                onClick={onBack}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-5 text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>{t("Volver a tus datos", "Back to your info")}</span>
              </button>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() =>
                    onComplete({
                      storyGenerated: false,
                      sharedVia: "skipped",
                    })
                  }
                  className="text-xs text-muted-foreground hover:text-gold transition-colors underline underline-offset-4 py-2 order-2 sm:order-1"
                >
                  {t("Omitir y pasar directo a la ruleta ›", "Skip & go directly to roulette ›")}
                </button>

                <button
                  type="button"
                  onClick={handleNextWhatsApp}
                  className="btn-solid w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-8 text-xs uppercase tracking-[0.2em] font-medium transition-all shadow-xs order-1 sm:order-2"
                >
                  <Sparkles className="h-4 w-4 text-white" />
                  <span>{t("¡Ir a la Ruleta de Premios!", "Go to Prize Roulette!")}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </Reveal>
      )}

      {/* ========================================================================= */}
      {/* CANAL 2: INSTAGRAM STORY (PARA JÓVENES Y AMANTES DE REDES SOCIALES)       */}
      {/* ========================================================================= */}
      {activeChannel === "instagram" && (
        <>
          {/* Ideas de fotos libres que puede compartir */}
          <Reveal delay={80}>
            <div className="mt-6 grid grid-cols-3 gap-2.5 sm:gap-3 text-center">
              <div className="rounded-xl border border-gold/30 bg-gold/5 p-3 sm:p-4">
                <Coffee className="h-4 w-4 sm:h-5 sm:w-5 text-gold mx-auto mb-1.5" />
                <p className="text-[11px] font-medium text-foreground uppercase tracking-wider">
                  {t("Tu Alimento", "Your Food")}
                </p>
                <p className="text-[10px] text-muted-foreground font-light hidden sm:block mt-0.5">
                  Café, postre o salado
                </p>
              </div>

              <div className="rounded-xl border border-gold/30 bg-gold/5 p-3 sm:p-4">
                <Store className="h-4 w-4 sm:h-5 sm:w-5 text-gold mx-auto mb-1.5" />
                <p className="text-[11px] font-medium text-foreground uppercase tracking-wider">
                  {t("El Espacio", "The Space")}
                </p>
                <p className="text-[10px] text-muted-foreground font-light hidden sm:block mt-0.5">
                  La calma de nuestra casa
                </p>
              </div>

              <div className="rounded-xl border border-gold/30 bg-gold/5 p-3 sm:p-4">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-gold mx-auto mb-1.5" />
                <p className="text-[11px] font-medium text-foreground uppercase tracking-wider">
                  {t("En la Mesa", "At the Table")}
                </p>
                <p className="text-[10px] text-muted-foreground font-light hidden sm:block mt-0.5">
                  Compartiendo hoy
                </p>
              </div>
            </div>
          </Reveal>

          {/* Tarjeta de Instrucciones y Mención Oficial de Instagram */}
          <Reveal delay={120}>
            <div className="mt-6 rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-xs space-y-6">
              {/* Recordatorio de mención a Instagram */}
              <div className="rounded-xl border border-gold/40 bg-gold/10 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gold text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Instagram className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] font-semibold text-foreground">
                      {t("Mención sugerida:", "Suggested tag:")}{" "}
                      <span className="text-gold font-mono">{clientConfig.channels.instagramHandle}</span>
                    </p>
                    <p className="text-[11px] text-muted-foreground font-light mt-0.5">
                      {t(
                        "Etiqueta nuestra cuenta en tu historia para que podamos repostearte.",
                        "Tag our account on your story so we can repost you.",
                      )}
                    </p>
                  </div>
                </div>

                <a
                  href={clientConfig.channels.instagramProfileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-gold/50 text-gold text-xs hover:bg-gold hover:text-white transition-colors shrink-0 shadow-2xs font-medium"
                >
                  <span>Abrir Instagram</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              {/* Subida de la captura de pantalla de evidencia */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs uppercase tracking-[0.16em] text-foreground font-semibold">
                      {t("Sube la captura de tu Story", "Upload your Story screenshot")}{" "}
                      <span className="text-gold">*</span>
                    </h3>
                    <p className="text-[11px] text-muted-foreground font-light">
                      {t(
                        "Toma un pantallazo a la historia que publicaste y adjúntalo aquí:",
                        "Take a screenshot of your posted story and upload it here:",
                      )}
                    </p>
                  </div>

                  {/* Opción adicional para descargar plantilla si no quieren tomar foto */}
                  <button
                    type="button"
                    onClick={handleDownloadStory}
                    className="hidden sm:inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-gold transition-colors"
                    title={t(
                      "Descargar plantilla si prefieres no tomar foto",
                      "Download template if you prefer not taking a photo",
                    )}
                  >
                    <Download className="h-3 w-3" />
                    <span>{t("Descargar plantilla prediseñada", "Download pre-made template")}</span>
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                />

                {!previewUrl ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files?.[0];
                      if (file) handleFileUpload(file);
                    }}
                    className={`border-2 border-dashed rounded-2xl p-7 text-center cursor-pointer transition-all ${
                      uploadError
                        ? "border-red-400 bg-red-50/20"
                        : "border-border/80 hover:border-gold hover:bg-gold/5 bg-background"
                    }`}
                  >
                    <div className="mx-auto mb-2.5 flex h-11 w-11 items-center justify-center rounded-full bg-gold/15 text-gold">
                      <Camera className="h-5 w-5" />
                    </div>
                    <p className="text-xs uppercase tracking-[0.18em] font-medium text-foreground">
                      {isUploading
                        ? t("Cargando imagen...", "Loading image...")
                        : t(
                            "Toca aquí para seleccionar tu captura",
                            "Tap here to select your screenshot",
                          )}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground font-light">
                      {t("Formatos admitidos: PNG, JPG o WebP", "Supported formats: PNG, JPG, or WebP")}
                    </p>

                    {/* Botón rápido para modo demo */}
                    <div className="mt-4 pt-3 border-t border-border/50">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUseDemoScreenshot();
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-mono bg-muted/70 text-foreground/80 hover:bg-gold/20 hover:text-gold transition-colors"
                      >
                        <Sparkles className="h-3 w-3 text-gold" />
                        <span>
                          {t("Usar captura de prueba (Modo Demo)", "Use test screenshot (Demo Mode)")}
                        </span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Vista previa de la captura subida */
                  <div className="rounded-2xl border border-gold/40 bg-gold/5 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in">
                    <div className="flex items-center gap-3.5">
                      <img
                        src={previewUrl}
                        alt="Evidencia"
                        className="h-14 w-14 rounded-xl object-cover border border-gold/40 shadow-xs"
                      />
                      <div>
                        <div className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>
                            {t("Captura registrada con éxito", "Screenshot successfully uploaded")}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground font-light">
                          {t("Evidencia lista para verificación.", "Evidence ready for verification.")}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1 text-xs text-gold underline underline-offset-2 hover:text-gold/80"
                    >
                      <FileImage className="h-3.5 w-3.5" />
                      <span>{t("Cambiar imagen", "Change image")}</span>
                    </button>
                  </div>
                )}

                {uploadError && <p className="text-xs text-red-500">{uploadError}</p>}

                {/* Usuario de Instagram opcional */}
                <div className="pt-1">
                  <label
                    htmlFor="ig-handle"
                    className="block text-xs uppercase tracking-[0.16em] text-muted-foreground font-medium mb-1"
                  >
                    {t("Tu usuario de Instagram (Opcional)", "Your Instagram handle (Optional)")}
                  </label>
                  <div className="relative max-w-xs">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-muted-foreground">
                      @
                    </span>
                    <input
                      id="ig-handle"
                      type="text"
                      value={handle}
                      onChange={(e) => setHandle(e.target.value.replace(/^@/, ""))}
                      placeholder="tu_cuenta"
                      className="w-full rounded-xl border border-border/80 pl-8 pr-3.5 py-2 text-xs text-foreground bg-background focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Botones de navegación Instagram */}
              <div className="pt-4 flex flex-col-reverse sm:flex-row items-center justify-between gap-4 border-t border-border/50">
                <button
                  type="button"
                  onClick={onBack}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-5 text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>{t("Volver a tus datos", "Back to your info")}</span>
                </button>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() =>
                      onComplete({
                        storyGenerated: false,
                        sharedVia: "skipped",
                        instagramHandle: handle.trim() || undefined,
                      })
                    }
                    className="text-xs text-muted-foreground hover:text-gold transition-colors underline underline-offset-4 py-2 order-2 sm:order-1"
                  >
                    {t("Omitir Story y pasar directo a la ruleta ›", "Skip Story & go directly to roulette ›")}
                  </button>

                  <button
                    type="submit"
                    onClick={handleNext}
                    disabled={!previewUrl}
                    className="btn-solid w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-8 text-xs uppercase tracking-[0.2em] font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs order-1 sm:order-2"
                  >
                    <Sparkles className="h-4 w-4 text-white" />
                    <span>{t("¡Ir a la Ruleta de Premios!", "Go to Prize Roulette!")}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </Reveal>
        </>
      )}
    </div>
  );
}
