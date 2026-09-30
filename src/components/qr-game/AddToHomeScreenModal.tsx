import { useState, useEffect } from "react";
import { X, Smartphone, Share, PlusSquare, Sparkles, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function AddToHomeScreenModal() {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detectar iOS
    if (typeof window !== "undefined") {
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
      setIsIOS(isIosDevice);

      // Detectar si ya está en modo standalone / PWA instalada
      if (
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true
      ) {
        setIsInstalled(true);
      }
    }

    // Escuchar evento PWA nativo (Android / Chrome)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === "accepted") {
          setIsInstalled(true);
        }
        setDeferredPrompt(null);
      } catch {
        setIsOpen(true);
      }
    } else {
      setIsOpen(true);
    }
  };

  if (isInstalled) {
    return (
      <div className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#0d2e1f] border border-[#10b981]/40 text-[#10b981] text-[11px] font-semibold">
        <CheckCircle2 className="h-3.5 w-3.5 text-[#10b981] shrink-0" />
        <span>{t("✓ Tarjeta guardada en tu pantalla de inicio", "✓ Card saved to your home screen")}</span>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={handleInstallClick}
        className="w-full inline-flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-[#1c1b1f] border border-[#f2be71]/40 hover:border-[#f2be71]/70 hover:bg-[#252429] text-[#f2be71] text-xs uppercase tracking-wider font-bold transition-all active:scale-98 cursor-pointer"
      >
        <Smartphone className="h-4 w-4 text-[#f2be71] shrink-0" />
        <span className="text-[#f2be71]">
          {t("Guardar Tarjeta en Pantalla de Inicio (1-Tap)", "Add Card to Home Screen (1-Tap)")}
        </span>
      </button>

      {/* Modal interactivo de instrucciones */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-sm rounded-3xl bg-card border-2 border-gold/40 p-6 shadow-2xl space-y-5 text-center">
            {/* Botón cerrar */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 h-7 w-7 rounded-full bg-muted/60 text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Encabezado */}
            <div className="space-y-1.5 pt-1">
              <div className="h-12 w-12 rounded-2xl bg-gold/15 text-gold flex items-center justify-center mx-auto border border-gold/30">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="font-display text-lg font-bold text-foreground">
                {t("Lleva tu Tarjeta Siempre Contigo", "Keep Your Card Always With You")}
              </h3>
              <p className="text-xs text-muted-foreground">
                {t(
                  "Sin descargar apps pesadas ni ocupar memoria. Accede en 1 toque desde tu celular.",
                  "No app store download or storage needed. 1-tap direct access from your phone."
                )}
              </p>
            </div>

            {/* Pasos según dispositivo */}
            <div className="space-y-3 text-left rounded-2xl bg-muted/40 p-4 border border-border text-xs">
              {isIOS ? (
                <>
                  <div className="flex items-start gap-3">
                    <span className="h-6 w-6 rounded-full bg-gold text-slate-950 font-bold flex items-center justify-center text-xs shrink-0">
                      1
                    </span>
                    <p className="leading-snug">
                      Toca el botón <strong>Compartir</strong> (
                      <Share className="h-3.5 w-3.5 inline mx-0.5 text-sky-600" />) en la barra inferior de Safari.
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="h-6 w-6 rounded-full bg-gold text-slate-950 font-bold flex items-center justify-center text-xs shrink-0">
                      2
                    </span>
                    <p className="leading-snug">
                      Desliza hacia abajo y pulsa en{" "}
                      <strong>
                        Agregar a inicio (
                        <PlusSquare className="h-3.5 w-3.5 inline mx-0.5 text-foreground" />)
                      </strong>
                      .
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="h-6 w-6 rounded-full bg-gold text-slate-950 font-bold flex items-center justify-center text-xs shrink-0">
                      3
                    </span>
                    <p className="leading-snug">
                      Toca <strong>"Agregar"</strong> arriba a la derecha. ¡Listo! Tu tarjeta aparecerá como una app en tu pantalla.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-3">
                    <span className="h-6 w-6 rounded-full bg-gold text-slate-950 font-bold flex items-center justify-center text-xs shrink-0">
                      1
                    </span>
                    <p className="leading-snug">
                      Toca los <strong>tres puntos (⋮)</strong> en la esquina superior derecha de tu navegador Chrome.
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="h-6 w-6 rounded-full bg-gold text-slate-950 font-bold flex items-center justify-center text-xs shrink-0">
                      2
                    </span>
                    <p className="leading-snug">
                      Selecciona la opción <strong>"Instalar aplicación"</strong> o{" "}
                      <strong>"Agregar a pantalla principal"</strong>.
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="h-6 w-6 rounded-full bg-gold text-slate-950 font-bold flex items-center justify-center text-xs shrink-0">
                      3
                    </span>
                    <p className="leading-snug">
                      ¡Listo! Ya tienes tu tarjeta de sellos guardada en tu teléfono para tus próximas visitas.
                    </p>
                  </div>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-full py-3 rounded-xl bg-gold text-slate-950 font-bold text-xs uppercase tracking-wider shadow-sm hover:opacity-90 transition-opacity"
            >
              {t("¡Entendido, gracias!", "Got it, thanks!")}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
