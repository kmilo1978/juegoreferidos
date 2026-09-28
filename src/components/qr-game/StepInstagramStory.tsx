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
} from "lucide-react";
import logoHeader from "@/assets/logo-header.png";
import heroImg from "@/assets/hero-pistacho-cafe.jpg";

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
        ctx.fillText("@blisssoulbakery", width / 2, 1610);

        const dataUrl = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.download = `Story-Bliss-Soul-${participantName.replace(/\s+/g, "-")}.png`;
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

  const handleNext = () => {
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
              {t("Paso 2 · Instagram Story", "Step 2 · Instagram Story")}
            </span>
            <span className="h-px w-6 bg-gold" />
          </div>

          <h2 className="font-display text-2xl sm:text-3xl text-foreground font-normal tracking-tight">
            {t("Comparte tu Momento Bliss", "Share Your Bliss Moment")}
          </h2>

          <p className="mt-3 text-sm text-muted-foreground font-light leading-relaxed max-w-lg mx-auto">
            {t(
              "¡La foto es 100% libre! Comparte en tus historias de Instagram una foto de tu pedido, de tu mesa o del local mencionando a @blisssoulbakery, y sube la captura para desbloquear la ruleta.",
              "The photo is 100% free! Share a story on Instagram showing your food, table, or the space tagging @blisssoulbakery, and upload the screenshot to unlock the roulette.",
            )}
          </p>
        </div>
      </Reveal>

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

      {/* Tarjeta de Instrucciones y Mención Oficial */}
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
                  {t("Mención obligatoria:", "Required tag:")}{" "}
                  <span className="text-gold font-mono">@blisssoulbakery</span>
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
              href="https://instagram.com/blisssoulbakery"
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

          {/* Botones de navegación */}
          <div className="pt-4 flex flex-col-reverse sm:flex-row items-center justify-between gap-4 border-t border-border/50">
            <button
              type="button"
              onClick={onBack}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-5 text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{t("Volver a tus datos", "Back to your info")}</span>
            </button>

            <button
              type="submit"
              onClick={handleNext}
              disabled={!previewUrl}
              className="btn-solid w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-8 text-xs uppercase tracking-[0.2em] font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs"
            >
              <Sparkles className="h-4 w-4 text-white" />
              <span>{t("¡Ir a la Ruleta de Premios!", "Go to Prize Roulette!")}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
